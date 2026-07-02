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
async function findOrCreateManagedAuthConfigId(toolkitSlug: string): Promise<string> {
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
