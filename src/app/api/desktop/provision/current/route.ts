import { getCurrentManagedRuntime, headmasterAgent } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";
import type { AgentModel } from "@/lib/types";

function bearerFrom(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1] ?? null;
}

// The desktop app's provider list (readProvisionedProviders in
// useModelProviderList.ts) expects one entry per provider with its available
// model ids grouped underneath, but /v1/models returns a flat per-model list
// tagged with a provider — group them back up here.
function groupModelsByProvider(models: AgentModel[]) {
  const byProvider = new Map<string, { name: string; available_models: string[] }>();
  for (const model of models) {
    const key = model.provider || model.owned_by || "default";
    if (!byProvider.has(key)) byProvider.set(key, { name: key, available_models: [] });
    byProvider.get(key)!.available_models.push(model.id);
  }
  return Array.from(byProvider.entries()).map(([slug, { name, available_models }]) => ({
    slug,
    name,
    runtime_provider: slug,
    base_url: "",
    available_models,
    enabled: true,
  }));
}

export async function GET(request: Request) {
  try {
    const { user } = await requireUser();
    const runtime = await getCurrentManagedRuntime();
    const origin = new URL(request.url).origin;
    const bearer = bearerFrom(request);
    // Best-effort: a freshly-started instance may 502 here (see waitForAgentHealthy in
    // managed-runtime.ts) — provisioning still succeeds, just without a model list yet, and the
    // desktop app's own model-selection fallback handles an empty provider list gracefully.
    const models = await headmasterAgent.listModels().catch(() => null);
    return json({
      mode: "headmaster_remote",
      backend: "managed-runtime",
      user: { id: user.id, username: user.email ?? user.id, role: "user" },
      capabilities: ["chat", "files", "integrations", "model_selection"],
      runtime: {
        base_url: origin,
        api_base_path: "/api/v1",
        health_url: `${origin}/api/v1/health`,
        validate_url: `${origin}/api/desktop/runtime/validate`,
        version_url: `${origin}/api/v1/version`,
        ttl_seconds: 3600,
      },
      cloud_container_config: {
        endpoint_url: origin,
        container_id: runtime.id,
        forward_auth_token: bearer,
        forward_auth_expires_at: null,
      },
      session_namespace: `headmaster:${user.id}`,
      providers: models ? groupModelsByProvider(models.data) : [],
      default_model: models?.default_model ?? null,
      default_provider: models?.default_provider ?? null,
      app_settings: {
        app_name: "Headmaster",
        app_short_name: "Headmaster",
        theme_mode: "dark",
        default_locale: "en",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}
