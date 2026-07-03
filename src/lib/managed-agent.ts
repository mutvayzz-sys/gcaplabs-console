import "server-only";
import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import type { Agent, MergedAgent, Template } from "@/lib/types";

// Stable UI alias for the user's single managed Agent37 instance. The actual
// Agent37 instance id is kept server-side in profiles.agent37_id so the browser
// never needs the shared AGENT37_API_KEY or any direct upstream access.
export const MANAGED_AGENT_ID = "headmaster-runtime";

// Compare the running instance's image_ref against the latest published image_ref
// for the same template. Returns true when the catalog's image_ref has moved past
// what the instance is running. Falls back to false on any catalog/lookup error
// (templates endpoint can be 5xx, the catalog might be empty, etc.) — the runtime
// is still usable; we just don't nag about an update we can't confirm.
export async function detectUpdateAvailable(instance: Agent): Promise<boolean> {
  if (!instance.template) return false;
  try {
    const { data: templates } = await agent37.listTemplates();
    const tpl: Template | undefined = templates.find((t) => t.name === instance.template);
    if (!tpl?.image_ref || !instance.image_ref) return false;
    return tpl.image_ref !== instance.image_ref;
  } catch {
    return false;
  }
}

export function agentFromInstance(instance: Agent, updateAvailable: boolean): MergedAgent {
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
    update_available: updateAvailable,
  };
}

export async function getManagedAgent(): Promise<{ agent: MergedAgent; instance: Agent; agent37Id: string }> {
  const runtime = await getCurrentAgent37Runtime();
  const updateAvailable = await detectUpdateAvailable(runtime.instance);
  return { agent: agentFromInstance(runtime.instance, updateAvailable), instance: runtime.instance, agent37Id: runtime.id };
}
