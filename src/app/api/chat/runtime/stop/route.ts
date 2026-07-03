// POST /api/chat/runtime/stop — stop the headmaster-runtime singleton.

import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function POST() {
  try {
    await requireUser();
    const runtime = await getCurrentAgent37Runtime();
    return json(await agent37.stop(runtime.id));
  } catch (e) {
    return handleError(e);
  }
}
