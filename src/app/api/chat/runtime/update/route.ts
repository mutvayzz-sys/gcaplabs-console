// POST /api/chat/runtime/update — re-pull the latest image for the running
// template and restart the headmaster-runtime singleton.
//
// Surfaces in the settings tab as an amber "Update to latest image" button when
// the catalog's image_ref has moved past what the instance is running.

import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function POST() {
  try {
    await requireUser();
    const runtime = await getCurrentManagedRuntime();
    return json(await runtimeApi.update(runtime.id));
  } catch (e) {
    return handleError(e);
  }
}
