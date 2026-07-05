import { notFound, redirect } from "next/navigation";
import { AgentWorkspace } from "@/components/AgentWorkspace";
import { RuntimeApiError } from "@/lib/managed-runtime";
import { getSession, isConsoleAdmin } from "@/lib/auth";
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
    const [{ user }, { agent }] = await Promise.all([getSession(), getManagedAgent()]);
    const isAdmin = user ? await isConsoleAdmin(user.id) : false;
    return <AgentWorkspace agent={agent} activeTab={activeTab} userEmail={user?.email ?? null} isAdmin={isAdmin} />;
  } catch (e) {
    if (e instanceof RuntimeApiError && e.code === "not_approved") {
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
