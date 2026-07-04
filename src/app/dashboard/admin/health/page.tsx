import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { getHealthSnapshot } from "@/lib/health";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const snapshot = await getHealthSnapshot(db);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Health</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Point-in-time snapshot, checked {new Date(snapshot.checked_at).toLocaleTimeString()}. Reload the page to refresh.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <PingTile label="Supabase" result={snapshot.supabase} />
        <PingTile label="Runtime control plane" result={snapshot.runtimeApi} />
      </div>

      <div>
        <h2 className="text-sm font-semibold mb-2">Runtime status counts</h2>
        <div className="overflow-hidden rounded-lg border text-sm">
          {Object.entries(snapshot.runtime_status_counts).length === 0 ? (
            <div className="px-4 py-6 text-muted-foreground">No signups yet.</div>
          ) : (
            Object.entries(snapshot.runtime_status_counts).map(([status, count], i, arr) => (
              <div key={status} className={`grid grid-cols-[1fr_80px] gap-4 px-4 py-3 ${i === arr.length - 1 ? "" : "border-b"}`}>
                <div className="text-muted-foreground">{status}</div>
                <div className="font-medium">{count}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function PingTile({ label, result }: { label: string; result: { ok: boolean; latency_ms: number; error?: string } }) {
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <Badge variant={result.ok ? "success" : "destructive"}>{result.ok ? "Healthy" : "Down"}</Badge>
      </div>
      <p className="text-2xl font-semibold tabular-nums">{result.latency_ms}ms</p>
      {result.error ? <p className="text-xs text-destructive">{result.error}</p> : null}
    </div>
  );
}
