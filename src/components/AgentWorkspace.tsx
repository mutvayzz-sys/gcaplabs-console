"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Files, MessageSquare, Plug, Settings, XCircle } from "lucide-react";
import { ChatProvider } from "@/components/chat/ChatProvider";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { ChatView } from "@/components/chat/ChatView";
import { FilesTab } from "@/components/files/FilesTab";
import { ComposioApps } from "@/components/integrations/ComposioApps";
import { Badge } from "@/components/ui/badge";
import { apiFetch } from "@/lib/api";
import { agentTabPath, type AgentTab } from "@/lib/dashboard-tabs";
import { statusVariant } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MergedAgent } from "@/lib/types";
import type { IntegrationsResponse } from "@/app/api/chat/integrations/route";

const TABS: Array<{ id: AgentTab; label: string; icon: typeof MessageSquare }> = [
  { id: "chat", label: "Chat", icon: MessageSquare },
  { id: "files", label: "Files", icon: Files },
  { id: "integrations", label: "Integrations", icon: Plug },
  { id: "settings", label: "Settings", icon: Settings },
];

export function AgentWorkspace({
  agent,
  activeTab,
}: {
  agent: MergedAgent;
  activeTab: AgentTab;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionId = activeTab === "chat" ? searchParams.get("session") : null;

  function navigateToSession(nextSessionId: string | null, mode: "push" | "replace" = "push") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSessionId) params.set("session", nextSessionId);
    else params.delete("session");
    const qs = params.toString();
    const next = `${agentTabPath(agent.agent37_id, "chat")}${qs ? `?${qs}` : ""}`;
    if (mode === "replace") router.replace(next);
    else router.push(next);
  }

  return (
    <ChatProvider
      agentId={agent.agent37_id}
      agents={[agent]}
      urlSessionId={sessionId}
      onChatTab={activeTab === "chat"}
      navigateToSession={navigateToSession}
    >
      <div className="flex h-[calc(100vh-3rem)] min-h-[640px] overflow-hidden rounded-lg border bg-background">
        <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
          <div className="border-b p-4">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground">
              Agents
            </Link>
            <div className="mt-2 min-w-0">
              <h1 className="truncate text-base font-semibold">{agent.name || "Headmaster runtime"}</h1>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant={statusVariant(agent.live_status)}>{agent.live_status ?? "unknown"}</Badge>
                <span className="truncate font-mono text-xs text-muted-foreground">{agent.agent37_id}</span>
              </div>
            </div>
          </div>

          <nav className="border-b p-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={agentTabPath(agent.agent37_id, tab.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          {activeTab === "chat" ? (
            <ChatSidebar />
          ) : (
            <div className="flex-1 p-4 text-sm text-muted-foreground">
              {activeTab === "files" && "Browse and edit files in the provisioned runtime."}
              {activeTab === "integrations" && "Connectors are managed by HermesHQ for this runtime."}
              {activeTab === "settings" && "Runtime details and connection status."}
            </div>
          )}
        </aside>

        <main className="min-w-0 flex-1">
          {activeTab === "chat" && <ChatView />}
          {activeTab === "files" && <FilesTab agentId={agent.agent37_id} />}
          {activeTab === "integrations" && <RuntimeIntegrations />}
          {activeTab === "settings" && <RuntimeSettings agent={agent} currentPath={pathname} />}
        </main>
      </div>
    </ChatProvider>
  );
}

function RuntimeIntegrations() {
  const [data, setData] = useState<IntegrationsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<IntegrationsResponse>("/api/chat/integrations")
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Connect third-party apps to this agent, plus runtime-level connectors (MCP servers, Google).
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-medium">Third-party apps</h2>
        <div className="mt-2">
          <ComposioApps />
        </div>
      </section>

      {error ? (
        <div className="mt-6 rounded-lg border border-dashed p-6 text-sm text-destructive">{error}</div>
      ) : !data ? (
        <div className="mt-6 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">Loading…</div>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <h2 className="text-sm font-medium">Google (runtime)</h2>
            <div className="mt-2 flex items-center gap-2 rounded-lg border p-4 text-sm">
              {data.google.connected ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <XCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
              <span className="text-muted-foreground">
                {data.google.connected
                  ? `Connected${data.google.account ? ` as ${data.google.account}` : ""}`
                  : (data.google.message ?? "Not connected")}
              </span>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-medium">MCP servers</h2>
            {data.mcpServers.length === 0 ? (
              <div className="mt-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                No MCP servers configured for this runtime yet.
              </div>
            ) : (
              <div className="mt-2 overflow-hidden rounded-lg border text-sm">
                {data.mcpServers.map((server, i) => (
                  <div
                    key={String(server.id ?? server.name ?? i)}
                    className={cn(
                      "flex items-center justify-between gap-4 px-4 py-3",
                      i < data.mcpServers.length - 1 && "border-b"
                    )}
                  >
                    <span className="min-w-0 truncate font-medium">
                      {String(server.name ?? server.id ?? "Unnamed server")}
                    </span>
                    <Badge variant={server.enabled === false ? "outline" : "default"}>
                      {server.enabled === false ? "disabled" : "enabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function RuntimeSettings({ agent, currentPath }: { agent: MergedAgent; currentPath: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Runtime settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read-only details for the HermesHQ-provisioned agent runtime.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border text-sm">
        <InfoRow label="Agent ID" value={agent.agent37_id} mono />
        <InfoRow label="Name" value={agent.name || "Headmaster runtime"} />
        <InfoRow label="Status" value={agent.live_status || "unknown"} />
        <InfoRow label="Template" value={agent.template || "HermesHQ"} />
        <InfoRow label="Route" value={currentPath} mono last />
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div className={cn("grid grid-cols-[160px_1fr] gap-4 px-4 py-3", !last && "border-b")}>
      <div className="text-muted-foreground">{label}</div>
      <div className={cn("min-w-0 truncate", mono && "font-mono text-xs")}>{value}</div>
    </div>
  );
}
