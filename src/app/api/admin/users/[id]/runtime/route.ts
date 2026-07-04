import { requireConsoleAdmin } from "@/lib/auth";
import { agent37 } from "@/lib/agent37";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import type { Budget } from "@/lib/types";

async function getTargetAgentId(db: Awaited<ReturnType<typeof requireConsoleAdmin>>["db"], userId: string): Promise<string> {
  const { data, error } = await db.from("profiles").select("agent37_id").eq("id", userId).maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!data?.agent37_id) throw new ApiError(404, "not_found", "This user has no runtime yet");
  return data.agent37_id as string;
}

// Admin-only lifecycle + budget control over ANY user's runtime — distinct from the per-agent
// BFF under /api/agents/[id]/**, which is the owning user's own access path (gated by
// requireAgentAccess, currently unused since there's no live workspace/membership table).
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await requireConsoleAdmin();
    const { id } = await params;
    const agentId = await getTargetAgentId(db, id);
    const [instance, budget] = await Promise.all([
      agent37.getAgent(agentId),
      agent37.getBudget(agentId).catch(() => null as Budget | null),
    ]);
    return json({ instance, budget });
  } catch (e) {
    return handleError(e);
  }
}

const ACTIONS = ["start", "stop", "restart", "delete"] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await requireConsoleAdmin();
    const { id } = await params;
    const body = await readJson<{ action?: Action; monthly_cap_micros?: number }>(request);
    const agentId = await getTargetAgentId(db, id);

    if (body.action) {
      if (!ACTIONS.includes(body.action)) throw new ApiError(400, "invalid_request", `action must be one of ${ACTIONS.join(", ")}`);
      switch (body.action) {
        case "start":
          await agent37.start(agentId);
          break;
        case "stop":
          await agent37.stop(agentId);
          break;
        case "restart":
          await agent37.restart(agentId);
          break;
        case "delete":
          await agent37.deleteAgent(agentId);
          await db
            .from("profiles")
            .update({ agent37_id: null, agent37_status: null, agent37_name: null, agent37_template: null })
            .eq("id", id);
          return json({ ok: true, deleted: true });
      }
      const instance = await agent37.getAgent(agentId);
      await db.from("profiles").update({ agent37_status: instance.status }).eq("id", id);
      return json({ ok: true, instance });
    }

    if (typeof body.monthly_cap_micros === "number") {
      const budget = await agent37.setBudget(agentId, { monthly_cap_micros: body.monthly_cap_micros });
      return json({ ok: true, budget });
    }

    throw new ApiError(400, "invalid_request", "action or monthly_cap_micros is required");
  } catch (e) {
    return handleError(e);
  }
}
