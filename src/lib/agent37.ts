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

// The Hosting API base (control plane). A code constant, not an env var — there's no
// per-deployment reason to change it (point it elsewhere only for local API work, by editing here).
const HOSTING_BASE = "https://api.agent37.com";

// The per-instance Agents API (data plane — chat /v1/responses, /v1/models, /v1/sessions,
// /v1/files) is served on the instance host, not the control-plane base above.
const INSTANCE_DOMAIN = "agent37.app";
const DEFAULT_TEMPLATE = process.env.AGENT37_TEMPLATE || "agent37-hermes";
const DEFAULT_AGENT_NAME = process.env.AGENT37_DEFAULT_AGENT_NAME || "Headmaster runtime";
const DEFAULT_CREDIT_MICROS = Number(process.env.AGENT37_INITIAL_CREDIT_MICROS || "1000000");

export function instanceBaseUrl(id: string): string {
  return `https://${id}.${INSTANCE_DOMAIN}`;
}

export class Agent37Error extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "Agent37Error";
    this.status = status;
    this.code = code;
  }
}

async function parseAgent37<T>(res: Response, augment402 = false): Promise<T> {
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
      message = `${message} (Agent37 payment required — fund your wallet under Cloud → Billing in the dashboard, then retry.)`;
    }
    throw new Agent37Error(res.status, err.code || "error", message);
  }

  return data as T;
}

function apiKey(): string {
  const key = process.env.AGENT37_API_KEY;
  if (!key) throw new Agent37Error(500, "config_error", "AGENT37_API_KEY is not set on the server");
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
  return parseAgent37<T>(res, true);
}

// Raw fetch against a specific instance's Agents API (data plane) with the shared bearer. Returns the
// raw Response so callers can stream SSE, upload bytes, or stream a download — things the JSON
// helper can't. A ReadableStream request body is buffered to an ArrayBuffer first so undici sends a
// Content-Length instead of chunked transfer encoding; the Agent37 instance proxy drops chunked
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
  return parseAgent37<T>(res);
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

export const agent37 = {
  listAgents: () => hostingCall<{ data: Agent[] }>("/instances"),
  getAgent: (id: string) => hostingCall<Agent>(`/instances/${id}`),
  createAgent: (body: CreateAgentInput) =>
    hostingCall<Agent>("/instances", { method: "POST", body: JSON.stringify(body) }),
  deleteAgent: (id: string) => hostingCall<{ id: string; deleted: boolean }>(`/instances/${id}`, { method: "DELETE" }),
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

export async function getCurrentAgent37Runtime(): Promise<ManagedRuntime> {
  if (!process.env.AGENT37_API_KEY && process.env.NODE_ENV !== "production") {
    const instance = devAgent();
    return { id: instance.id, instance };
  }

  const { db, user } = await requireUser();
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("id,email,display_name,agent37_id")
    .eq("id", user.id)
    .maybeSingle();
  if (profileError) throw new Agent37Error(500, "db_error", profileError.message);

  let agentId = (profile as { agent37_id?: string | null } | null)?.agent37_id ?? null;
  if (agentId) {
    const instance = await agent37.getAgent(agentId);
    await db.from("profiles").update({ agent37_status: instance.status, agent37_name: instance.name }).eq("id", user.id);
    return { id: agentId, instance };
  }

  const email = (user as { email?: string | null }).email ?? (profile as { email?: string | null } | null)?.email ?? null;
  const displayName =
    (profile as { display_name?: string | null } | null)?.display_name ||
    (email ? email.split("@")[0] : null) ||
    "Headmaster user";

  const instance = await agent37.createAgent({
    template: DEFAULT_TEMPLATE,
    user: user.id,
    name: `${displayName}'s Headmaster`,
    metadata: { app: "headmaster-console", supabase_user_id: user.id, email },
    budget: DEFAULT_CREDIT_MICROS > 0 ? { credit_micros: DEFAULT_CREDIT_MICROS } : undefined,
  });
  agentId = instance.id;

  const update = {
    id: user.id,
    email,
    display_name: displayName,
    agent37_id: agentId,
    agent37_status: instance.status,
    agent37_name: instance.name,
    agent37_template: instance.template,
  };
  const { error: upsertError } = await db.from("profiles").upsert(update, { onConflict: "id" });
  if (upsertError) {
    try {
      await agent37.deleteAgent(agentId);
    } catch {
      // Best effort rollback only. The original DB error is the one that matters.
    }
    throw new Agent37Error(500, "db_error", upsertError.message);
  }

  return { id: agentId, instance };
}

export async function instanceFetch(path: string, init?: RequestInit): Promise<Response> {
  const runtime = await getCurrentAgent37Runtime();
  if (runtime.id === "dev-runtime" && !process.env.AGENT37_API_KEY) {
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

async function currentInstanceCall<T>(path: string, init?: RequestInit): Promise<T> {
  const runtime = await getCurrentAgent37Runtime();
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
