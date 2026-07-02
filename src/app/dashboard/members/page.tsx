import { getSession, requireConsoleAdminOrRedirect } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";

export const dynamic = "force-dynamic";

export default async function MembersPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { user } = await getSession();

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Members</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Team membership is managed by the HermesHQ backend for this console.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_120px] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Email</span>
          <span>Role</span>
        </div>
        <div className="grid grid-cols-[1fr_120px] px-4 py-3 text-sm">
          <span className="truncate font-medium">{user?.email ?? "Signed in user"}</span>
          <span className="text-muted-foreground">Admin</span>
        </div>
      </div>
    </div>
  );
}
