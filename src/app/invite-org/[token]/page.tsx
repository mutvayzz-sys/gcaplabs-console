import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcceptOrgInvite } from "@/components/AcceptOrgInvite";
import { branding } from "@/config/branding";

export default async function InviteOrgPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { user } = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/invite-org/${token}`)}`);

  const db = createAdminClient();
  const { data: invite } = await db
    .from("org_invitations")
    .select("token,org_role,expires_at,used_at,organizations(name)")
    .eq("token", token)
    .maybeSingle();

  if (!invite) return <Message text="This invitation is invalid or no longer exists." />;
  if (invite.used_at) return <Message text="This invitation has already been used." />;
  if (new Date(invite.expires_at) < new Date()) return <Message text="This invitation has expired." />;

  const orgName = (invite.organizations as unknown as { name: string } | null)?.name ?? "an organization";
  return <AcceptOrgInvite token={token} organizationName={orgName} orgRole={invite.org_role} />;
}

function Message({ text }: { text: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 text-center">
      <div className="max-w-sm space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">{branding.appName}</h1>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </main>
  );
}
