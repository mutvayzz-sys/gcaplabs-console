// GET  /api/chat/runtime — current state of the headmaster-runtime singleton.
// PATCH /api/chat/runtime — rename the runtime instance. Body: { name: string }.
//
// Mirrors the upstream starter-kit's /api/agents/[id] surface (GET + PATCH name),
// adapted to the singleton model: there is no [id] in the URL; the runtime is
// resolved server-side from the logged-in user's profile (profiles.agent37_id).
//
// update_available is computed by comparing the live instance's image_ref against
// the latest published image_ref for its template — see getManagedAgent()
// in lib/managed-agent.ts.

import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import { getManagedAgent } from "@/lib/managed-agent";

export async function GET() {
  try {
    await requireUser();
    const { agent } = await getManagedAgent();
    return json(agent);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser();
    const body = await readJson<{ name?: string }>(request);
    const name = (body.name ?? "").trim();
    if (!name) throw new ApiError(400, "invalid_request", "name is required");
    if (name.length > 120) throw new ApiError(400, "invalid_request", "name is too long");

    const runtime = await getCurrentAgent37Runtime();
    await agent37.updateAgent(runtime.id, { name });
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
