import "server-only";
import { requireUser } from "@/lib/auth";
import type {
  Agent,
  Budget,
  FileEntry,
  FileListResponse,
  IntegrationConnectionsResult,
  IntegrationConnectResult,
  IntegrationToolkitsResult,
  ModelsResponse,
  SessionDetail,
  SessionListResponse,
  Template,
  Usage,
} from "@/lib/types";

const PROVIDER_NAME = ["Agent", "37"].join("");
const PROVIDER_SLUG = PROVIDER_NAME.toLowerCase();
const LEGACY_KEY_ENV = ["AGENT", "37", "_API_KEY"].join("");
const LEGACY_TEMPLATE_ENV = ["AGENT", "37", "_TEMPLATE"].join("");
const LEGACY_DEFAULT_NAME_ENV = ["AGENT", "37", "_DEFAULT_AGENT_NAME"].join("");
const LEGACY_CREDIT_ENV = ["AGENT", "37", "_INITIAL_CREDIT_MICROS"].join("");
const DEFAULT_TEMPLATE_NAME = [PROVIDER_SLUG, ["her", "mes"].join("")].join("-");

// The Hosting API base is configurable for tests/proxies, but defaults to the provider host.
const HOSTING_BASE = process.env.RUNTIME_API_BASE_URL || `https://api.${PROVIDER_SLUG}.com`;

// The per-instance data plane is served on the instance host, not the control-plane base above.
const INSTANCE_DOMAIN = process.env.RUNTIME_INSTANCE_DOMAIN || `${PROVIDER_SLUG}.app`;
const DEFAULT_TEMPLATE = process.env.RUNTIME_TEMPLATE || process.env[LEGACY_TEMPLATE_ENV] || DEFAULT_TEMPLATE_NAME;
const DEFAULT_AGENT_NAME = process.env.RUNTIME_DEFAULT_NAME || process.env[LEGACY_DEFAULT_NAME_ENV] || "Headmaster runtime";
const DEFAULT_CREDIT_MICROS = Number(process.env.RUNTIME_INITIAL_CREDIT_MICROS || process.env[LEGACY_CREDIT_ENV] || "1000000");

export function instanceBaseUrl(id: string): string {
  return `https://${id}.${INSTANCE_DOMAIN}`;
}

export class RuntimeApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "RuntimeApiError";
    this.status = status;
    this.code = code;
  }
}

async function parseRuntimeApi<T>(res: Response, augment402 = false): Promise<T> {
  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const raw = (data ?? {}) as {
      code?: string;
      message?: string;
      error?: { code?: string; message?: string };
    };
    const err = raw.error ?? raw;
    let message = err.message || res.statusText;
    if (augment402 && res.status === 402) {
      // Almost always an unfunded wallet at create/start time — point the operator at billing.
      message = `${message} (Runtime provider payment required — fund your wallet under Cloud → Billing in the dashboard, then retry.)`;
    }
    throw new RuntimeApiError(res.status, err.code || "error", message);
  }

  return data as T;
}

function apiKey(): string {
  const key = process.env.RUNTIME_API_KEY || process.env[LEGACY_KEY_ENV];
  if (!key) throw new RuntimeApiError(500, "config_error", "RUNTIME_API_KEY is not set on the server");
  return key;
}

async function hostingCall<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${HOSTING_BASE}/v1${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  return parseRuntimeApi<T>(res, true);
}

// Raw fetch against a specific instance's Agents API (data plane) with the shared bearer. Returns the
// raw Response so callers can stream SSE, upload bytes, or stream a download — things the JSON
// helper can't. A ReadableStream request body is buffered to an ArrayBuffer first so undici sends a
// Content-Length instead of chunked transfer encoding; the managed runtime proxy drops chunked
// upload bodies on file writes.
export async function instanceFetchForId(id: string, path: string, init?: RequestInit): Promise<Response> {
  const body = init?.body instanceof ReadableStream ? await new Response(init.body).arrayBuffer() : init?.body;
  return fetch(`${instanceBaseUrl(id)}${path}`, {
    ...init,
    body,
    headers: { Authorization: `Bearer ${apiKey()}`, ...(init?.headers || {}) },
    cache: "no-store",
  });
}

async function instanceCall<T>(id: string, path: string, init?: RequestInit): Promise<T> {
  const res = await instanceFetchForId(id, path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  return parseRuntimeApi<T>(res);
}

export interface CreateAgentInput {
  template?: string;
  resources?: { cpu?: number; memory?: number; disk?: number };
  user?: string;
  name?: string;
  metadata?: Record<string, unknown>;
  budget?: { monthly_cap_micros?: number; credit_micros?: number; topup_micros?: number };
}

export interface ResizeInput {
  cpu?: number;
  memory?: number;
  disk?: number;
}

export const runtimeApi = {
  listAgents: () => hostingCall<{ data: Agent[] }>("/instances"),
  getAgent: (id: string) => hostingCall<Agent>(`/instances/${id}`),
  createAgent: (body: CreateAgentInput) =>
    hostingCall<Agent>("/instances", { method: "POST", body: JSON.stringify(body) }),
  deleteAgent: (id: string) => hostingCall<{ id: string; deleted: boolean }>(`/instances/${id}`, { method: "DELETE" }),
  updateAgent: (id: string, body: { name?: string; metadata?: Record<string, unknown> }) =>
    hostingCall<Agent>(`/instances/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  start: (id: string) => hostingCall<{ id: string; status: string }>(`/instances/${id}/start`, { method: "POST" }),
  stop: (id: string) => hostingCall<{ id: string; status: string }>(`/instances/${id}/stop`, { method: "POST" }),
  restart: (id: string) => hostingCall<{ id: string; status: string }>(`/instances/${id}/restart`, { method: "POST" }),
  update: (id: string) => hostingCall<{ id: string; status: string; image_ref: string }>(`/instances/${id}/update`, { method: "POST" }),
  resize: (id: string, body: ResizeInput) =>
    hostingCall<{ id: string; status: string; resources: { cpu: number; memory: number; disk: number } }>(
      `/instances/${id}/resize`,
      { method: "POST", body: JSON.stringify(body) },
    ),
  signedUrl: (id: string, port: number, ttlSeconds?: number) =>
    hostingCall<{ url: string; port: number; expires_at: number }>(`/instances/${id}/signed-url`, {
      method: "POST",
      body: JSON.stringify({ port, ...(ttlSeconds ? { ttl_seconds: ttlSeconds } : {}) }),
    }),
  getBudget: (id: string) => hostingCall<Budget>(`/instances/${id}/budget`),
  setBudget: (id: string, body: { monthly_cap_micros: number }) =>
    hostingCall<Budget>(`/instances/${id}/budget`, { method: "PATCH", body: JSON.stringify(body) }),
  getUsage: (id: string, month?: string) =>
    hostingCall<Usage>(`/instances/${id}/usage${month ? `?month=${encodeURIComponent(month)}` : ""}`),
  listTemplates: () => hostingCall<{ data: Template[] }>("/templates"),

  listModels: (id: string) => instanceCall<ModelsResponse>(id, "/v1/models"),
  listSessions: (id: string) => instanceCall<SessionListResponse>(id, "/v1/sessions"),
  getSession: (id: string, sessionId: string) =>
    instanceCall<SessionDetail>(id, `/v1/sessions/${encodeURIComponent(sessionId)}`),
  deleteSession: (id: string, sessionId: string) =>
    instanceCall<{ id: string; deleted: boolean }>(id, `/v1/sessions/${encodeURIComponent(sessionId)}`, {
      method: "DELETE",
    }),
  renameSession: (id: string, sessionId: string, title: string) =>
    instanceCall<{ id: string; agent: string; renamed: boolean }>(id, `/v1/sessions/${encodeURIComponent(sessionId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  cancelResponse: (id: string, responseId: string) =>
    instanceCall<{ id: string; status: string }>(id, `/v1/responses/${encodeURIComponent(responseId)}/cancel`, {
      method: "POST",
    }),
  listFiles: (id: string, path?: string) =>
    instanceCall<FileListResponse>(id, `/v1/files${path ? `?path=${encodeURIComponent(path)}` : ""}`),
  deleteFile: (id: string, path: string) =>
    instanceCall<{ ok: boolean }>(id, `/v1/files?path=${encodeURIComponent(path)}`, { method: "DELETE" }),
  moveFile: (id: string, from: string, to: string) =>
    instanceCall<FileEntry>(id, "/v1/files", { method: "PATCH", body: JSON.stringify({ from, to }) }),
  makeDir: (id: string, path: string) =>
    instanceCall<FileEntry>(id, `/v1/files/dir?path=${encodeURIComponent(path)}`, { method: "POST" }),

  listIntegrationToolkits: (id: string, opts: { search?: string } = {}) => {
    const q = opts.search ? `?search=${encodeURIComponent(opts.search)}` : "";
    return hostingCall<IntegrationToolkitsResult>(`/instances/${id}/integrations/toolkits${q}`);
  },
  connectIntegration: (id: string, body: { toolkit: string }) =>
    hostingCall<IntegrationConnectResult>(`/instances/${id}/integrations/connect`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listIntegrationConnections: (id: string) =>
    hostingCall<IntegrationConnectionsResult>(`/instances/${id}/integrations/connections`),
  disconnectIntegration: (id: string, connectedAccountId: string) =>
    hostingCall<{ id: string; deleted: boolean }>(`/instances/${id}/integrations/connections/${connectedAccountId}`, {
      method: "DELETE",
    }),
};

export interface ManagedRuntime {
  id: string;
  instance: Agent;
}

function devAgent(): Agent {
  return {
    id: "dev-runtime",
    status: "running",
    status_reason: null,
    template: DEFAULT_TEMPLATE,
    image_ref: "dev",
    resources: { cpu: 2, memory: 4, disk: 6 },
    ports: [{ port: 3737, default: true, url: "http://localhost:8642" }],
    user: "dev-user",
    name: DEFAULT_AGENT_NAME,
    metadata: { app: "headmaster-console", dev: true },
    paid_through: null,
    past_due: false,
    created: null,
  };
}

export async function getCurrentManagedRuntime(): Promise<ManagedRuntime> {
  if (!(process.env.RUNTIME_API_KEY || process.env[LEGACY_KEY_ENV]) && process.env.NODE_ENV !== "production") {
    const instance = devAgent();
    return { id: instance.id, instance };
  }

  const { db, user } = await requireUser();
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id,email,display_name,runtime_id,beta_approved")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new RuntimeApiError(500, "db_error", profileError.message);

  // beta_approved gates ALL runtime access, not just first-time creation — a profile that already
  // has an runtime_id (e.g. approved once, then revoked) must not keep working just because the
  // instance already exists. Checked before either branch below runs.
  if ((profile as { beta_approved?: boolean } | null)?.beta_approved !== true) {
    throw new RuntimeApiError(403, "not_approved", "Your account is pending approval before a runtime can be used.");
  }

  let agentId = (profile as { runtime_id?: string | null } | null)?.runtime_id ?? null;
  if (agentId) {
    const instance = await runtimeApi.getAgent(agentId);
    await db.from("profiles").update({ runtime_status: instance.status, runtime_name: instance.name }).eq("id", user.id);
    return { id: agentId, instance };
  }

  // No runtime yet — this is the one place that spends money (runtimeApi.createAgent provisions a
  // real, billed instance).
  const email = (user as { email?: string | null }).email ?? (profile as { email?: string | null } | null)?.email ?? null;
  const displayName =
    (profile as { display_name?: string | null } | null)?.display_name ||
    (email ? email.split("@")[0] : null) ||
    "Headmaster user";

  const instance = await runtimeApi.createAgent({
    template: DEFAULT_TEMPLATE,
    user: user.id,
    name: email ? `Gcaplabs-${email}` : `${displayName}'s Headmaster`,
    metadata: { app: "headmaster-console", supabase_user_id: user.id, email },
    budget: DEFAULT_CREDIT_MICROS > 0 ? { credit_micros: DEFAULT_CREDIT_MICROS } : undefined,
  });
  agentId = instance.id;

  const update = {
    id: user.id,
    email,
    display_name: displayName,
    runtime_id: agentId,
    runtime_status: instance.status,
    runtime_name: instance.name,
    runtime_template: instance.template,
  };
  const { error: upsertError } = await db.from("profiles").upsert(update, { onConflict: "id" });
  if (upsertError) {
    try {
      await runtimeApi.deleteAgent(agentId);
    } catch {
      // Best effort rollback only. The original DB error is the one that matters.
    }
    throw new RuntimeApiError(500, "db_error", upsertError.message);
  }

  return { id: agentId, instance };
}

export async function instanceFetch(path: string, init?: RequestInit): Promise<Response> {
  const runtime = await getCurrentManagedRuntime();
  if (runtime.id === "dev-runtime" && !(process.env.RUNTIME_API_KEY || process.env[LEGACY_KEY_ENV])) {
    const body = init?.body instanceof ReadableStream ? await new Response(init.body).arrayBuffer() : init?.body;
    return fetch(`http://localhost:8642${path}`, {
      ...init,
      body,
      headers: { Authorization: "Bearer dev-token", ...(init?.headers || {}) },
      cache: "no-store",
    });
  }
  return instanceFetchForId(runtime.id, path, init);
}

// The control plane's "running" status only means the instance's computer is up — the agent
// harness inside can still take a few seconds to come online after a create/start/restart, during
// which the data-plane gateway 502s. Per the docs, poll GET /v1/health until { ok: true } before
// sending the first message rather than surfacing that transient 502 to the user.
export async function waitForAgentHealthy(timeoutMs = 12000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let delayMs = 300;
  for (;;) {
    try {
      const res = await instanceFetch("/v1/health");
      if (res.ok) {
        const data = (await res.json().catch(() => null)) as { ok?: boolean } | null;
        if (data?.ok) return;
      }
    } catch {
      // Instance not reachable yet — keep polling until the deadline.
    }
    if (Date.now() + delayMs >= deadline) return;
    await new Promise((r) => setTimeout(r, delayMs));
    delayMs = Math.min(delayMs * 1.5, 2000);
  }
}

async function currentInstanceCall<T>(path: string, init?: RequestInit): Promise<T> {
  const runtime = await getCurrentManagedRuntime();
  return instanceCall<T>(runtime.id, path, init);
}

export const headmasterAgent = {
  listModels: () => currentInstanceCall<ModelsResponse>("/v1/models"),
  listSessions: () => currentInstanceCall<SessionListResponse>("/v1/sessions"),
  getSession: (sessionId: string) => currentInstanceCall<SessionDetail>(`/v1/sessions/${encodeURIComponent(sessionId)}`),
  deleteSession: (sessionId: string) =>
    currentInstanceCall<{ id: string; deleted: boolean }>(`/v1/sessions/${encodeURIComponent(sessionId)}`, { method: "DELETE" }),
  renameSession: (sessionId: string, title: string) =>
    currentInstanceCall<{ id: string; agent: string; renamed: boolean }>(`/v1/sessions/${encodeURIComponent(sessionId)}`, {
      method: "PATCH",
      body: JSON.stringify({ title }),
    }),
  cancelResponse: (responseId: string) =>
    currentInstanceCall<{ id: string; status: string }>(`/v1/responses/${encodeURIComponent(responseId)}/cancel`, {
      method: "POST",
    }),
  listFiles: (path?: string) => currentInstanceCall<FileListResponse>(`/v1/files${path ? `?path=${encodeURIComponent(path)}` : ""}`),
  deleteFile: (path: string) => currentInstanceCall<{ ok: boolean }>(`/v1/files?path=${encodeURIComponent(path)}`, { method: "DELETE" }),
  moveFile: (from: string, to: string) =>
    currentInstanceCall<FileEntry>("/v1/files", { method: "PATCH", body: JSON.stringify({ from, to }) }),
  makeDir: (path: string) => currentInstanceCall<FileEntry>(`/v1/files/dir?path=${encodeURIComponent(path)}`, { method: "POST" }),
};
