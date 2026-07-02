import { requireUser } from "@/lib/auth";
import { handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireUser();
    const body: { requested_capability?: string } = await readJson<{ requested_capability?: string }>(request).catch(() => ({}));
    const capabilities = ["chat", "files", "integrations", "model_selection"];
    const requested = body.requested_capability;
    return json({
      allowed: !requested || capabilities.includes(requested),
      capabilities,
      role: "user",
      ttl_seconds: 300,
    });
  } catch (e) {
    return handleError(e);
  }
}
