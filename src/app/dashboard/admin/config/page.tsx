import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { ConfigTable } from "@/components/admin/ConfigTable";
import type { AppConfigRow } from "@/app/api/admin/config/route";

export const dynamic = "force-dynamic";

export default async function AdminConfigPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const { data } = await db.from("app_config").select("*").order("key", { ascending: true });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Config</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generic app-wide settings and feature flags. Add a key ad hoc as real config needs arise.
        </p>
      </div>
      <ConfigTable initialConfig={(data ?? []) as AppConfigRow[]} />
    </div>
  );
}
