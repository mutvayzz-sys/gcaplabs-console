import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { UsersTable } from "@/components/admin/UsersTable";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;
const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,runtime_id,runtime_status,created_at";

export default async function UsersPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const { data, count } = await db
    .from("profiles")
    .select(PROFILE_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(0, PAGE_SIZE - 1);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Signups don&apos;t get a managed runtime until you approve them here — that&apos;s the billing gate.
        </p>
      </div>
      <UsersTable initialUsers={(data ?? []) as AdminProfileRow[]} initialTotal={count ?? 0} pageSize={PAGE_SIZE} />
    </div>
  );
}
