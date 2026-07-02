import 'server-only';
import { ApiError } from '@/lib/http';

/**
 * Composio client — connects third-party apps (Gmail, Slack, GitHub, ...) to the managed agent.
 *
 * This calls Composio's REST API directly (https://backend.composio.dev/api/v3), NOT through
 * Agent37 Cloud — GCAP Labs self-hosts its own Agent37 gateway (third_party/agent37/gateway in
 * gcaplabs-hermeshq) with no Composio dependency, so the console talks to Composio itself.
 *
 * Auth configs (how a toolkit authenticates) are created lazily and reused: on first connect for
 * a toolkit we ask Composio for a Composio-managed OAuth app so users never need to bring their
 * own client id/secret. `connected_accounts` are scoped by `user_id`, which we set to the
 * Supabase user id so each console user's connections are private to them.
 */

const BASE_URL = 'https://backend.composio.dev/api/v3';

// handleError() (src/lib/http.ts) only recognizes ApiError/RuntimeError — anything else gets
// collapsed to a generic "Internal server error" 500, hiding the actual cause. Throw ApiError
// directly so Composio failures (bad key, disabled toolkit, etc.) surface their real message.
export class ComposioError extends ApiError {
  constructor(status: number, message: string) {
    super(status, 'composio_error', message);
    this.name = 'ComposioError';
  }
}

function apiKey(): string {
  // .trim() guards against a trailing newline/space from pasting into a dashboard env-var field —
  // a real cause of "invalid API key" even when the key itself is correct.
  const key = process.env.COMPOSIO_API_KEY?.trim();
  if (!key) throw new ComposioError(500, 'COMPOSIO_API_KEY is not configured on the server.');
  return key;
}

async function composioFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'x-api-key': apiKey(),
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ComposioError(
        res.status,
        `Composio returned a non-JSON response (${res.status}): ${text.slice(0, 300)}`
      );
    }
  }
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string }; message?: string })?.error?.message ??
      (data as { message?: string })?.message ??
      res.statusText;
    throw new ComposioError(res.status, message);
  }
  return data as T;
}

export interface ComposioToolkit {
  slug: string;
  name: string;
  auth_schemes: string[];
  composio_managed_auth_schemes: string[];
  meta?: { logo?: string; description?: string };
}

export interface ComposioConnectedAccount {
  id: string;
  toolkit: { slug: string };
  user_id: string;
  status: string; // INITIALIZING | INITIATED | ACTIVE | FAILED | EXPIRED | ...
  created_at: string;
  updated_at: string;
}

export type ToolkitSort = 'usage' | 'alphabetically';

export async function listToolkits(params: {
  search?: string;
  sortBy?: ToolkitSort;
  cursor?: string;
}): Promise<{ items: ComposioToolkit[]; nextCursor: string | null }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  qs.set('sort_by', params.sortBy ?? 'usage');
  qs.set('limit', '30');
  if (params.cursor) qs.set('cursor', params.cursor);
  const result = await composioFetch<{ items: ComposioToolkit[]; next_cursor: string | null }>(
    `/toolkits?${qs.toString()}`
  );
  return { items: result.items ?? [], nextCursor: result.next_cursor ?? null };
}

export async function listConnectedAccounts(userId: string): Promise<ComposioConnectedAccount[]> {
  const qs = new URLSearchParams();
  qs.set('user_ids', userId);
  const result = await composioFetch<{ items: ComposioConnectedAccount[] }>(`/connected_accounts?${qs.toString()}`);
  return result.items ?? [];
}

export async function disconnectAccount(connectedAccountId: string): Promise<void> {
  await composioFetch(`/connected_accounts/${encodeURIComponent(connectedAccountId)}`, { method: 'DELETE' });
}

// Composio-managed auth configs are per-toolkit, not per-user — reuse an existing one if the
// project already created it (e.g. a prior connect for any user) instead of minting duplicates.
export async function findOrCreateManagedAuthConfigId(toolkitSlug: string): Promise<string> {
  const existing = await composioFetch<{ items: Array<{ id: string }> }>(
    `/auth_configs?toolkit_slug=${encodeURIComponent(toolkitSlug)}&is_composio_managed=true&limit=1`
  );
  if (existing.items?.[0]?.id) return existing.items[0].id;

  const created = await composioFetch<{ auth_config: { id: string } }>('/auth_configs', {
    method: 'POST',
    body: JSON.stringify({
      toolkit: { slug: toolkitSlug },
      auth_config: { type: 'use_composio_managed_auth', name: `${toolkitSlug}-managed` },
    }),
  });
  return created.auth_config.id;
}

export async function initiateConnection(params: {
  toolkitSlug: string;
  userId: string;
  callbackUrl: string;
}): Promise<{ redirectUrl: string; connectedAccountId: string }> {
  const authConfigId = await findOrCreateManagedAuthConfigId(params.toolkitSlug);
  const link = await composioFetch<{ redirect_url: string; connected_account_id: string }>('/connected_accounts/link', {
    method: 'POST',
    body: JSON.stringify({
      auth_config_id: authConfigId,
      user_id: params.userId,
      callback_url: params.callbackUrl,
    }),
  });
  return { redirectUrl: link.redirect_url, connectedAccountId: link.connected_account_id };
}

// ── Composio MCP server management ──────────────────────────────────────────
//
// Composio has a first-class MCP server product separate from the toolkit
// connection API. A "server" binds one or more auth_config_ids (i.e. connected
// toolkits) and is instantiated per-user to produce a connectable MCP URL.
//
// We use a SINGLE shared MCP server per console project (name: "headmaster-shared"),
// and PATCH new auth_config_ids onto it as users connect more toolkits. Each user
// gets their own instance (user_id = Supabase user id) so tool access is scoped.

const SHARED_MCP_SERVER_NAME = 'headmaster-shared';

// Composio's MCP server endpoints are on v3.1, not v3 (the v3 MCP API is deprecated).
const MCP_BASE_URL = 'https://backend.composio.dev/api/v3.1';

async function mcpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const key = apiKey();
  const res = await fetch(`${MCP_BASE_URL}${path}`, {
    ...init,
    headers: {
      'x-api-key': key,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  });
  const text = await res.text();
  let data: unknown = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new ComposioError(res.status, `Composio MCP returned non-JSON (${res.status}): ${text.slice(0, 300)}`);
    }
  }
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string }; message?: string })?.error?.message ??
      (data as { message?: string })?.message ??
      res.statusText;
    throw new ComposioError(res.status, message);
  }
  return data as T;
}

interface ComposioMcpServer {
  id: string;
  name: string;
  auth_config_ids: string[];
  mcp_url?: string;
}

interface ComposioMcpInstance {
  id: string;
  server_id: string;
  user_id: string;
  connect_url: string;
}

async function findSharedMcpServer(): Promise<ComposioMcpServer | null> {
  const result = await mcpFetch<{ items: ComposioMcpServer[] }>(`/mcp/servers?limit=100`);
  return result.items?.find((s) => s.name === SHARED_MCP_SERVER_NAME) ?? null;
}

async function createSharedMcpServer(authConfigId: string): Promise<ComposioMcpServer> {
  const created = await mcpFetch<{ id: string; name: string; auth_config_ids: string[] }>('/mcp/servers', {
    method: 'POST',
    body: JSON.stringify({
      name: SHARED_MCP_SERVER_NAME,
      auth_config_ids: [authConfigId],
    }),
  });
  return created;
}

async function patchSharedMcpServer(serverId: string, authConfigIds: string[]): Promise<ComposioMcpServer> {
  const patched = await mcpFetch<{ id: string; name: string; auth_config_ids: string[] }>(`/mcp/servers/${serverId}`, {
    method: 'PATCH',
    body: JSON.stringify({ auth_config_ids: authConfigIds }),
  });
  return patched;
}

async function findExistingInstance(serverId: string, userId: string): Promise<ComposioMcpInstance | null> {
  try {
    const result = await mcpFetch<{ items: Array<{ id: string; server_id: string; user_id: string }> }>(
      `/mcp/servers/${serverId}/instances?limit=100`
    );
    return result.items?.find((i) => i.user_id === userId) as ComposioMcpInstance | null ?? null;
  } catch {
    return null;
  }
}

async function createMcpInstance(serverId: string, userId: string): Promise<ComposioMcpInstance> {
  try {
    const created = await mcpFetch<{ id: string; server_id: string; user_id: string; connect_url?: string }>(`/mcp/servers/${serverId}/instances`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
    const connectUrl = created.connect_url ?? `https://backend.composio.dev/v3/mcp/${serverId}?user_id=${userId}`;
    return { ...created, connect_url: connectUrl };
  } catch (err) {
    // If the instance already exists (duplicate), construct the URL ourselves —
    // we know the server ID and user ID, so we can build the standard Composio MCP URL.
    if (err instanceof ComposioError && err.status === 400 && /already exists|duplicate/i.test(err.message)) {
      const connectUrl = `https://backend.composio.dev/v3/mcp/${serverId}?user_id=${userId}`;
      return { id: 'existing', server_id: serverId, user_id: userId, connect_url: connectUrl };
    }
    throw err;
  }
}

/**
 * Ensure a Composio MCP server exists with the given auth_config_id, and create
 * a per-user instance. Returns the connectable MCP URL.
 *
 * Called after a successful Composio OAuth connection completes — the console
 * then POSTs this URL to the user's gateway /api/mcp/servers to register it
 * with the running Hermes agent.
 */
export async function ensureComposioMcpForUser(params: {
  authConfigId: string;
  userId: string;
}): Promise<{ mcpUrl: string; serverId: string; apiKey: string }> {
  // 1. Find or create the shared MCP server, with this auth_config_id included.
  let server = await findSharedMcpServer();
  if (!server) {
    server = await createSharedMcpServer(params.authConfigId);
  } else {
    // Ensure the auth_config_id is in the server's list (PATCH to append).
    if (!server.auth_config_ids.includes(params.authConfigId)) {
      server = await patchSharedMcpServer(server.id, [...server.auth_config_ids, params.authConfigId]);
    }
  }

  // 2. Find an existing per-user instance, or create a new one. Composio only
  //    allows one instance per user per server — re-creating throws "Cannot
  //    create duplicate MCP server instance". The lookup below is best-effort
  //    (it silently returns null on any failure, e.g. pagination/rate-limit),
  //    so treat that specific error from create as confirmation an instance
  //    already exists and recover it, rather than surfacing the error.
  let instance = await findExistingInstance(server.id, params.userId);
  if (!instance) {
    try {
      instance = await createMcpInstance(server.id, params.userId);
    } catch (e) {
      if (e instanceof ComposioError && /duplicate/i.test(e.message)) {
        instance = await findExistingInstance(server.id, params.userId);
      }
      if (!instance) throw e;
    }
  }

  // 3. Return the API key too — Composio's MCP requires an x-api-key header
  // when require_mcp_api_key is enabled (default for new orgs). The gateway
  // needs this to pass as a header when Hermes connects to the MCP URL.
  return { mcpUrl: instance.connect_url, serverId: server.id, apiKey: apiKey() };
}

/**
 * Remove an auth_config_id from the shared MCP server when a user disconnects
 * a toolkit. If no auth_config_ids remain, the server is deleted.
 */
export async function removeToolkitFromSharedMcp(params: {
  authConfigId: string;
}): Promise<void> {
  const server = await findSharedMcpServer();
  if (!server) return;
  const remaining = server.auth_config_ids.filter((id) => id !== params.authConfigId);
  if (remaining.length === 0) {
    await mcpFetch(`/mcp/servers/${server.id}`, { method: 'DELETE' });
  } else {
    await patchSharedMcpServer(server.id, remaining);
  }
}
