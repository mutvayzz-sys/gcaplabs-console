import "server-only";
import { getCurrentAgent37Runtime } from "@/lib/agent37";
import type { Agent, MergedAgent } from "@/lib/types";

// Stable UI alias for the user's single managed Agent37 instance. The actual
// Agent37 instance id is kept server-side in profiles.agent37_id so the browser
// never needs the shared AGENT37_API_KEY or any direct upstream access.
export const MANAGED_AGENT_ID = "headmaster-runtime";

export function agentFromInstance(instance: Agent): MergedAgent {
  const createdAt = instance.created ? new Date(instance.created * 1000).toISOString() : new Date().toISOString();
  return {
    agent37_id: MANAGED_AGENT_ID,
    workspace_id: "agent37",
    name: instance.name || "Headmaster runtime",
    status: instance.status,
    template: instance.template,
    cpu: instance.resources?.cpu ?? null,
    memory: instance.resources?.memory ?? null,
    disk: instance.resources?.disk ?? null,
    created_by: instance.user,
    created_at: createdAt,
    live_status: instance.status,
    status_reason: instance.status_reason,
    past_due: instance.past_due,
    ports: instance.ports ?? [],
    update_available: false,
  };
}

export async function getManagedAgent(): Promise<{ agent: MergedAgent; instance: Agent; agent37Id: string }> {
  const runtime = await getCurrentAgent37Runtime();
  return { agent: agentFromInstance(runtime.instance), instance: runtime.instance, agent37Id: runtime.id };
}
