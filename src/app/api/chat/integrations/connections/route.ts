import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function GET() {
  try {
    await requireUser();
    const runtime = await getCurrentManagedRuntime();
    const result = await runtimeApi.listIntegrationConnections(runtime.id);
    return json({ connections: result.connections });
  } catch (e) {
    return handleError(e);
  }
}
