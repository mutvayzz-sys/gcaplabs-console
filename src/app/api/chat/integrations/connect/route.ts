import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireUser();
    const { toolkit } = await readJson<{ toolkit?: string }>(request);
    if (!toolkit || typeof toolkit !== "string") {
      throw new ApiError(400, "invalid_request", "toolkit is required");
    }

    const runtime = await getCurrentManagedRuntime();
    const result = await runtimeApi.connectIntegration(runtime.id, { toolkit });
    return json({ redirectUrl: result.redirectUrl, connectedAccountId: result.connectedAccountId });
  } catch (e) {
    return handleError(e);
  }
}
