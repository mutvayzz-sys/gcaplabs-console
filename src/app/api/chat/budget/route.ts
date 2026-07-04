import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function GET() {
  try {
    await requireUser();
    const runtime = await getCurrentManagedRuntime();
    return json(await runtimeApi.getBudget(runtime.id));
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser();
    const body = await readJson<{ monthly_cap_micros?: number }>(request);
    if (typeof body.monthly_cap_micros !== "number" || body.monthly_cap_micros < 0) {
      throw new ApiError(400, "invalid_request", "monthly_cap_micros must be a non-negative number");
    }
    const runtime = await getCurrentManagedRuntime();
    return json(await runtimeApi.setBudget(runtime.id, { monthly_cap_micros: Math.round(body.monthly_cap_micros) }));
  } catch (e) {
    return handleError(e);
  }
}
