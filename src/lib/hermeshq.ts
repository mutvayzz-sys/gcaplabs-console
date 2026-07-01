import "server-only";
import { headers, cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * HermesHQ client — the control plane (provisioning) + per-user runtime data plane.
 *
 * In Headmaster's beta model, each user has ONE provisioned runtime container.
 * - Control plane: `POST {HERMESHQ_URL}/api/desktop/provision` returns
 *   { runtime.base_url, cloud_container_config.forward_auth_token, ... }.
 * - Data plane: that container serves the /v1/responses, /v1/models, /v1/sessions,
 *   /v1/files APIs on its base_url, authenticated with the forward-auth token.
 *
 * We use Supabase as the identity source of truth and pass the user's Supabase JWT
 * to HermesHQ as the Bearer token on the provision call. HermesHQ verifies it
 * against SUPABASE_JWKS_URL.
 */

// ---------- Provision ----------

export interface ProvisionResponse {
  mode: "headmaster_local" | "headmaster_remote" | "headmaster_plus_thin";
  hermeshq_url: string;
  user: { id: string; username: string; role: string };
  capabilities: string[];
  runtime: {
    base_url: string | null;
    api_base_path: string;
    health_url: string | null;
    validate_url: string;
    version_url: string | null;
    ttl_seconds: number;
  };
  cloud_container_config: {
    endpoint_url: string | null;
    container_id: string;
    forward_auth_token: string | null;
    forward_auth_expires_at: string | null;
  } | null;
  session_namespace: string | null;
  providers: Array<{
    slug: string;
    name: string;
    runtime_provider: string;
    base_url: string | null;
    default_model: string | null;
    available_models: string[];
  }>;
  default_model: string | null;
  default_provider: string | null;
}

export class HermesHQError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HermesHQError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Call HermesHQ's provision API for the current Supabase-authenticated user.
 * Returns the full provision response including the runtime URL + forward-auth token.
 */
export async function provisionForCurrentUser(): Promise<ProvisionResponse> {
  const url = process.env.HERMESHQ_URL;
  if (!url) {
    throw new HermesHQError(500, "config_error", "HERMESHQ_URL is not set on the server");
  }

  // Get the user's Supabase access token from the request cookies.
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
      },
    },
  );
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new HermesHQError(401, "unauthorized", "No active Supabase session");
  }

  const res = await fetch(`${url}/api/desktop/provision`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client: "gcap-console",
      version: "0.1.0",
      platform: "web",
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new HermesHQError(res.status, "provision_failed", `HermesHQ provision failed: ${res.status} ${text}`);
  }

  return (await res.json()) as ProvisionResponse;
}

/**
 * Get the user's runtime connection (base_url + forward_auth_token).
 * Throws if the user has no provisioned runtime (mode != headmaster_remote).
 */
export async function getUserRuntime(): Promise<{
  baseUrl: string;
  forwardAuthToken: string;
  containerId: string;
  provision: ProvisionResponse;
}> {
  const provision = await provisionForCurrentUser();
  if (provision.mode !== "headmaster_remote" || !provision.runtime.base_url || !provision.cloud_container_config?.forward_auth_token) {
    throw new HermesHQError(409, "no_runtime", "No remote runtime provisioned for this user. Contact your administrator.");
  }
  return {
    baseUrl: provision.runtime.base_url,
    forwardAuthToken: provision.cloud_container_config.forward_auth_token,
    containerId: provision.cloud_container_config.container_id,
    provision,
  };
}

// ---------- Per-instance data plane (proxy to /v1/*) ----------

/**
 * Raw fetch against the user's runtime data plane.
 * Returns the raw Response so callers can stream SSE, upload bytes, etc.
 */
export async function instanceFetch(path: string, init?: RequestInit): Promise<Response> {
  const runtime = await getUserRuntime();
  const body = init?.body instanceof ReadableStream
    ? await new Response(init.body).arrayBuffer()
    : init?.body;
  return fetch(`${runtime.baseUrl}${path}`, {
    ...init,
    body,
    headers: {
      Authorization: `Bearer ${runtime.forwardAuthToken}`,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
}

/**
 * JSON helper against the runtime data plane. Returns the typed response.
 * Throws HermesHQError on non-2xx.
 */
export async function instanceCall<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await instanceFetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = JSON.parse(text);
      const err = (data as { error?: { message?: string }; message?: string }).error
        ?? (data as { message?: string });
      message = err.message || message;
    } catch {
      message = text || message;
    }
    throw new HermesHQError(res.status, "instance_error", message);
  }
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ---------- Convenience helpers (match the data-plane API) ----------

export const hermeshq = {
  // /v1/models
  listModels: () => instanceCall<{ default_model: string | null; default_provider: string | null; data: unknown[] }>("/v1/models"),
  // /v1/sessions
  listSessions: () => instanceCall<{ data: unknown[] }>("/v1/sessions"),
  getSession: (sessionId: string) =>
    instanceCall<{ id: string; agent: string; history: unknown[] }>(`/v1/sessions/${encodeURIComponent(sessionId)}`),
  deleteSession: (sessionId: string) =>
    instanceCall<{ id: string; deleted: boolean }>(
      `/v1/sessions/${encodeURIComponent(sessionId)}`,
      { method: "DELETE" },
    ),
  renameSession: (sessionId: string, title: string) =>
    instanceCall<{ id: string; agent: string; renamed: boolean }>(
      `/v1/sessions/${encodeURIComponent(sessionId)}`,
      { method: "PATCH", body: JSON.stringify({ title }) },
    ),
  cancelResponse: (responseId: string) =>
    instanceCall<{ id: string; status: string }>(
      `/v1/responses/${encodeURIComponent(responseId)}/cancel`,
      { method: "POST" },
    ),
  // /v1/files
  listFiles: (path?: string) =>
    instanceCall<{ path: string; parentPath: string | null; entries: unknown[]; truncated: boolean }>(
      `/v1/files${path ? `?path=${encodeURIComponent(path)}` : ""}`,
    ),
  deleteFile: (path: string) =>
    instanceCall<{ ok: boolean }>(`/v1/files?path=${encodeURIComponent(path)}`, { method: "DELETE" }),
  moveFile: (from: string, to: string) =>
    instanceCall<{ name: string; path: string }>("/v1/files", {
      method: "PATCH",
      body: JSON.stringify({ from, to }),
    }),
  makeDir: (path: string) =>
    instanceCall<{ name: string; path: string }>(`/v1/files/dir?path=${encodeURIComponent(path)}`, {
      method: "POST",
    }),
};

// Re-export for routes that need to import Supabase server client
export { createServerClient };

// Headers helper (for API routes that need to read the request auth header)
export { headers };