import { requireOrgAdminOrRedirect } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { OrgMembersTable } from "@/components/org/OrgMembersTable";
import { InviteMemberForm } from "@/components/org/InviteMemberForm";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export const dynamic = "force-dynamic";

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,runtime_id,runtime_status,created_at";

export default async function OrgPage() {
  const { db, organizationId } = await requireOrgAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const [{ data: org }, { data: members }] = await Promise.all([
    db.from("organizations").select("name").eq("id", organizationId).maybeSingle(),
    db
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{org?.name ?? "Your organization"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage members of your organization. Approving a member gives them their own managed runtime.
        </p>
      </div>
      <InviteMemberForm />
      <OrgMembersTable initialMembers={(members ?? []) as AdminProfileRow[]} />
    </div>
  );
}
