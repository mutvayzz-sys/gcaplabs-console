// POST /api/chat/runtime/update — re-pull the latest image for the running
// template and restart the headmaster-runtime singleton.
//
// Surfaces in the settings tab as an amber "Update to latest image" button when
// the catalog's image_ref has moved past what the instance is running.

import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function POST() {
  try {
    await requireUser();
    const runtime = await getCurrentAgent37Runtime();
    return json(await agent37.update(runtime.id));
  } catch (e) {
    return handleError(e);
  }
}
