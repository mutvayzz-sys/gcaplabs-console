import "server-only";
import { agent37 } from "@/lib/agent37";
import type { DB } from "@/lib/auth";

export interface PingResult {
  ok: boolean;
  latency_ms: number;
  error?: string;
}

async function timed(fn: () => Promise<unknown>): Promise<PingResult> {
  const start = Date.now();
  try {
    await fn();
    return { ok: true, latency_ms: Date.now() - start };
  } catch (e) {
    return { ok: false, latency_ms: Date.now() - start, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

export interface HealthSnapshot {
  checked_at: string;
  supabase: PingResult;
  agent37: PingResult;
  runtime_status_counts: Record<string, number>;
}

// Point-in-time only — no history/charts yet. Would need a health_snapshots table + a cron job
// writing to it for that; not built until the point-in-time version proves useful.
export async function getHealthSnapshot(db: DB): Promise<HealthSnapshot> {
  const [supabasePing, agent37Ping, statusRows] = await Promise.all([
    timed(async () => {
      const { error } = await db.from("profiles").select("id").limit(1);
      if (error) throw new Error(error.message);
    }),
    timed(() => agent37.listTemplates()),
    db.from("profiles").select("agent37_status"),
  ]);

  const statusCounts: Record<string, number> = {};
  for (const row of statusRows.data ?? []) {
    const key = (row.agent37_status as string | null) ?? "none";
    statusCounts[key] = (statusCounts[key] ?? 0) + 1;
  }

  return {
    checked_at: new Date().toISOString(),
    supabase: supabasePing,
    agent37: agent37Ping,
    runtime_status_counts: statusCounts,
  };
}
