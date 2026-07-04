import "server-only";
import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import type { Agent, MergedAgent, Template } from "@/lib/types";

// Stable UI alias for the user's single managed managed runtime. The actual
// managed runtime id is kept server-side in profiles.runtime_id so the browser
// never needs the shared RUNTIME_API_KEY or any direct upstream access.
export const MANAGED_AGENT_ID = "headmaster-runtime";

// Compare the running instance's image_ref against the latest published image_ref
// for the same template. Returns true when the catalog's image_ref has moved past
// what the instance is running. Templates are passed in (fetched concurrently with
// the instance itself) so this stays a pure comparison rather than its own round trip.
function updateAvailableFor(instance: Agent, templates: Template[]): boolean {
  if (!instance.template) return false;
  const tpl = templates.find((t) => t.name === instance.template);
  if (!tpl?.image_ref || !instance.image_ref) return false;
  return tpl.image_ref !== instance.image_ref;
}

export function agentFromInstance(instance: Agent, updateAvailable: boolean): MergedAgent {
  const createdAt = instance.created ? new Date(instance.created * 1000).toISOString() : new Date().toISOString();
  return {
    runtime_id: MANAGED_AGENT_ID,
    workspace_id: "managed-runtime",
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

export async function getManagedAgent(): Promise<{ agent: MergedAgent; instance: Agent; runtimeId: string }> {
  // Runs concurrently with the runtime lookup instead of after it — listTemplates() doesn't
  // depend on the instance, only the comparison below does. Falls back to [] on any
  // catalog/lookup error (templates endpoint can be 5xx, catalog might be empty, etc.) — the
  // runtime is still usable; we just don't nag about an update we can't confirm.
  const [runtime, templates] = await Promise.all([
    getCurrentManagedRuntime(),
    runtimeApi
      .listTemplates()
      .then(({ data }) => data)
      .catch(() => [] as Template[]),
  ]);
  const updateAvailable = updateAvailableFor(runtime.instance, templates);
  return { agent: agentFromInstance(runtime.instance, updateAvailable), instance: runtime.instance, runtimeId: runtime.id };
}
