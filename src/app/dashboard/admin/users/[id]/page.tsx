import { notFound } from "next/navigation";
import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { UserDetail } from "@/components/admin/UserDetail";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export const dynamic = "force-dynamic";

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { id } = await params;
  const { db } = await requireUser();
  const { data } = await db.from("profiles").select(PROFILE_COLUMNS).eq("id", id).maybeSingle();
  if (!data) notFound();

  return <UserDetail initialUser={data as AdminProfileRow} />;
}
