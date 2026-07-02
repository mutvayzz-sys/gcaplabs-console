import { notFound, redirect } from "next/navigation";
import { AgentWorkspace } from "@/components/AgentWorkspace";
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

  const { agent } = await getManagedAgent();
  return <AgentWorkspace agent={agent} activeTab={activeTab} />;
}
