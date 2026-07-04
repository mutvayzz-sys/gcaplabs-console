import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function GET(request: Request) {
  try {
    await requireUser();
    const runtime = await getCurrentManagedRuntime();
    const month = new URL(request.url).searchParams.get("month") || undefined;
    return json(await runtimeApi.getUsage(runtime.id, month));
  } catch (e) {
    return handleError(e);
  }
}
