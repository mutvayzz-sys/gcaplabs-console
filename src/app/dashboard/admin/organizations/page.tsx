import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { OrganizationsTable } from "@/components/admin/OrganizationsTable";
import type { OrganizationWithCounts } from "@/app/api/admin/organizations/route";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationsPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const [{ data: orgs }, { data: counts }] = await Promise.all([
    db.from("organizations").select("*").order("created_at", { ascending: false }),
    db.from("profiles").select("organization_id").not("organization_id", "is", null),
  ]);

  const countByOrg = new Map<string, number>();
  for (const row of counts ?? []) {
    const id = row.organization_id as string;
    countByOrg.set(id, (countByOrg.get(id) ?? 0) + 1);
  }
  const organizations: OrganizationWithCounts[] = (orgs ?? []).map((org) => ({
    ...org,
    member_count: countByOrg.get(org.id) ?? 0,
  }));

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organizations</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Groups of users (e.g. a school) with their own org-scoped admin. Agent ownership stays
          per-user — organizations are for grouping and oversight only.
        </p>
      </div>
      <OrganizationsTable initialOrganizations={organizations} />
    </div>
  );
}
