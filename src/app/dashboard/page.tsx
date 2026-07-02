import Link from "next/link";
import { ArrowRight, Files, MessageSquare, Plug, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { branding } from "@/config/branding";
import { requireConsoleAdminOrRedirect } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { statusVariant } from "@/lib/format";
import { getManagedAgent, MANAGED_AGENT_ID } from "@/lib/managed-agent";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { agent, provision } = await getManagedAgent();
  const runtimeReady = !!provision.runtime.base_url;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agents</h1>
          <p className="mt-1 text-sm text-muted-foreground">Managed by {branding.appName} HQ</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border bg-card">
        <Link
          href={agentTabPath(agent.agent37_id, "chat")}
          className="grid gap-4 p-4 transition-colors hover:bg-secondary/45 md:grid-cols-[1fr_auto]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-base font-semibold">{agent.name || "Headmaster runtime"}</h2>
              <Badge variant={statusVariant(agent.live_status)}>{agent.live_status ?? "unknown"}</Badge>
            </div>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Your provisioned runtime. Open it to chat, browse files, review integrations, and
              inspect settings without exposing backend provisioning controls.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <Feature icon={MessageSquare} label="Chats" />
              <Feature icon={Files} label="Files" />
              <Feature icon={Plug} label="Integrations" />
              <Feature icon={Settings} label="Settings" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              <div className="font-mono">{agent.agent37_id}</div>
              <div>{runtimeReady ? "Runtime connected" : "Provisioning"}</div>
            </div>
            <Button asChild size="sm">
              <span>
                Open agent
                <ArrowRight className="h-4 w-4" />
              </span>
            </Button>
          </div>
        </Link>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: typeof MessageSquare; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-2.5 py-1">
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}
