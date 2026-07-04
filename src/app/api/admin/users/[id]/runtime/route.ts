import { requireConsoleAdmin } from "@/lib/auth";
import { runtimeApi } from "@/lib/managed-runtime";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import type { Budget } from "@/lib/types";

async function getTargetAgentId(db: Awaited<ReturnType<typeof requireConsoleAdmin>>["db"], userId: string): Promise<string> {
  const { data, error } = await db.from("profiles").select("runtime_id").eq("id", userId).maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!data?.runtime_id) throw new ApiError(404, "not_found", "This user has no runtime yet");
  return data.runtime_id as string;
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
      runtimeApi.getAgent(agentId),
      runtimeApi.getBudget(agentId).catch(() => null as Budget | null),
    ]);
    return json({ instance, budget });
  } catch (e) {
    return handleError(e);
  }
}

// Mirrors the actions available in Runtime Provider's own dashboard "..." menu for an instance
// (Restart / Stop / Delete / Re-pull image), plus rename (the pencil icon there).
const ACTIONS = ["start", "stop", "restart", "delete", "update"] as const;
type Action = (typeof ACTIONS)[number];

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await requireConsoleAdmin();
    const { id } = await params;
    const body = await readJson<{
      action?: Action;
      monthly_cap_micros?: number;
      name?: string;
      signed_url_port?: number;
    }>(request);
    const agentId = await getTargetAgentId(db, id);

    if (body.action) {
      if (!ACTIONS.includes(body.action)) throw new ApiError(400, "invalid_request", `action must be one of ${ACTIONS.join(", ")}`);
      switch (body.action) {
        case "start":
          await runtimeApi.start(agentId);
          break;
        case "stop":
          await runtimeApi.stop(agentId);
          break;
        case "restart":
          await runtimeApi.restart(agentId);
          break;
        case "update":
          // "Re-pull image" in Runtime Provider's own dashboard — updates to the template's latest image.
          await runtimeApi.update(agentId);
          break;
        case "delete":
          await runtimeApi.deleteAgent(agentId);
          await db
            .from("profiles")
            .update({ runtime_id: null, runtime_status: null, runtime_name: null, runtime_template: null })
            .eq("id", id);
          return json({ ok: true, deleted: true });
      }
      const instance = await runtimeApi.getAgent(agentId);
      await db.from("profiles").update({ runtime_status: instance.status, runtime_name: instance.name }).eq("id", id);
      return json({ ok: true, instance });
    }

    if (typeof body.monthly_cap_micros === "number") {
      const budget = await runtimeApi.setBudget(agentId, { monthly_cap_micros: body.monthly_cap_micros });
      return json({ ok: true, budget });
    }

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) throw new ApiError(400, "invalid_request", "name cannot be empty");
      const instance = await runtimeApi.updateAgent(agentId, { name });
      await db.from("profiles").update({ runtime_name: instance.name }).eq("id", id);
      return json({ ok: true, instance });
    }

    if (typeof body.signed_url_port === "number") {
      const instance = await runtimeApi.getAgent(agentId);
      if (!instance.ports?.some((p) => p.port === body.signed_url_port)) {
        throw new ApiError(404, "not_found", "That port is not exposed by this runtime");
      }
      return json(await runtimeApi.signedUrl(agentId, body.signed_url_port));
    }

    throw new ApiError(400, "invalid_request", "action, monthly_cap_micros, name, or signed_url_port is required");
  } catch (e) {
    return handleError(e);
  }
}
