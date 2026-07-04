import { notFound } from "next/navigation";
import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { OrgDetail } from "@/components/admin/OrgDetail";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export const dynamic = "force-dynamic";

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,agent37_id,agent37_status,created_at";

export default async function AdminOrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { id } = await params;
  const { db } = await requireUser();

  const { data: org } = await db.from("organizations").select("id,name").eq("id", id).maybeSingle();
  if (!org) notFound();

  const { data: members } = await db
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("organization_id", id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{org.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Members and invitations for this organization.</p>
      </div>
      <OrgDetail organizationId={org.id} initialMembers={(members ?? []) as AdminProfileRow[]} />
    </div>
  );
}
