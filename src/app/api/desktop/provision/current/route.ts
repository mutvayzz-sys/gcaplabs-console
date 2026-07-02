import { getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

function bearerFrom(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1] ?? null;
}

export async function GET(request: Request) {
  try {
    const { user } = await requireUser();
    const runtime = await getCurrentAgent37Runtime();
    const origin = new URL(request.url).origin;
    const bearer = bearerFrom(request);
    return json({
      mode: "headmaster_remote",
      backend: "agent37",
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
      providers: [],
      default_model: null,
      default_provider: null,
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
