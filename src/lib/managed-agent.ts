import "server-only";
import { provisionForCurrentUser, type ProvisionResponse } from "@/lib/hermeshq";
import type { MergedAgent } from "@/lib/types";

export const MANAGED_AGENT_ID = "headmaster-runtime";
export const MANAGED_WORKSPACE_ID = "hermeshq";

export function agentFromProvision(provision: ProvisionResponse): MergedAgent {
  const createdAt = new Date().toISOString();
  const status = provision.runtime.base_url ? "running" : "provisioning";

  return {
    agent37_id: MANAGED_AGENT_ID,
    workspace_id: MANAGED_WORKSPACE_ID,
    name: provision.user.username ? `${provision.user.username}'s runtime` : "Headmaster runtime",
    status,
    template: provision.default_provider ?? "hermeshq",
    cpu: null,
    memory: null,
    disk: null,
    created_by: provision.user.id,
    created_at: createdAt,
    live_status: status,
    status_reason: provision.runtime.base_url
      ? null
      : {
          code: "provisioning",
          message: "HermesHQ has not returned a runtime URL yet.",
          operation: "provision",
          at: Date.now(),
        },
    past_due: false,
    ports: [],
    update_available: false,
  };
}

export async function getManagedAgent(): Promise<{ agent: MergedAgent; provision: ProvisionResponse }> {
  if (!process.env.HERMESHQ_URL && process.env.NODE_ENV !== "production") {
    const provision = devProvision();
    return { agent: agentFromProvision(provision), provision };
  }
  const provision = await provisionForCurrentUser();
  return { agent: agentFromProvision(provision), provision };
}

function devProvision(): ProvisionResponse {
  return {
    mode: "headmaster_remote",
    hermeshq_url: "http://localhost:8000",
    user: { id: "dev-user", username: "Dev", role: "admin" },
    capabilities: ["chat", "files", "integrations", "settings"],
    runtime: {
      base_url: "http://localhost:8642",
      api_base_path: "/v1",
      health_url: "http://localhost:8642/health",
      validate_url: "http://localhost:8642/v1/models",
      version_url: null,
      ttl_seconds: 3600,
    },
    cloud_container_config: {
      endpoint_url: "http://localhost:8642",
      container_id: "dev-runtime",
      forward_auth_token: "dev-token",
      forward_auth_expires_at: null,
    },
    session_namespace: "dev",
    providers: [],
    default_model: null,
    default_provider: "Headmaster",
  };
}
