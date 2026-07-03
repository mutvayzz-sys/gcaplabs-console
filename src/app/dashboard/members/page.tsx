import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { UsersTable } from "@/components/admin/UsersTable";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const { data } = await db
    .from("profiles")
    .select("id,email,display_name,beta_approved,agent37_id,agent37_status,created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signups don&apos;t get an Agent37 runtime until you approve them here — that&apos;s the billing gate.
        </p>
      </div>
      <UsersTable initialUsers={(data ?? []) as AdminProfileRow[]} />
    </div>
  );
}
