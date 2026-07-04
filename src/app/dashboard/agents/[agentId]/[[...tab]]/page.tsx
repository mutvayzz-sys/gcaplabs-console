import { notFound, redirect } from "next/navigation";
import { AgentWorkspace } from "@/components/AgentWorkspace";
import { Agent37Error } from "@/lib/agent37";
import { getSession, isConsoleAdmin, isOrgAdmin } from "@/lib/auth";
import { MANAGED_AGENT_ID, getManagedAgent } from "@/lib/managed-agent";
import { parseAgentTab } from "@/lib/dashboard-tabs";

export const dynamic = "force-dynamic";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ agentId: string; tab?: string[] }>;
}) {
  const { agentId, tab: segments } = await params;
  if (agentId !== MANAGED_AGENT_ID) notFound();

  const activeTab = parseAgentTab(segments);
  if (!activeTab) notFound();
  if (!segments?.length) redirect(`/dashboard/agents/${MANAGED_AGENT_ID}/chat`);

  try {
    const { user } = await getSession();
    const [{ agent }, admin, orgAdmin] = await Promise.all([
      getManagedAgent(),
      user ? isConsoleAdmin(user.id) : false,
      user ? isOrgAdmin(user.id) : false,
    ]);
    // Plain users (no console/org-admin nav) don't get DashboardShell's account menu — see
    // DashboardShell.tsx — so it lives here instead, in the sidebar they actually use.
    const showAccountMenu = !admin && !orgAdmin;
    return (
      <AgentWorkspace
        agent={agent}
        activeTab={activeTab}
        userEmail={showAccountMenu ? (user?.email ?? null) : null}
      />
    );
  } catch (e) {
    if (e instanceof Agent37Error && e.code === "not_approved") {
      return (
        <div className="mx-auto max-w-md space-y-3 py-16 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Your account is pending approval</h1>
          <p className="text-sm text-muted-foreground">
            An operator needs to approve your account before a runtime is created for you. Check back soon.
          </p>
        </div>
      );
    }
    throw e;
  }
}
