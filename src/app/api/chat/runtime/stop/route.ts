// POST /api/chat/runtime/stop — stop the headmaster-runtime singleton.

import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function POST() {
  try {
    await requireUser();
    const runtime = await getCurrentManagedRuntime();
    return json(await runtimeApi.stop(runtime.id));
  } catch (e) {
    return handleError(e);
  }
}
