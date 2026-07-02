import { hermeshq } from "@/lib/hermeshq";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export interface IntegrationsResponse {
  mcpServers: Array<Record<string, unknown>>;
  google: { connected: boolean; account?: string; message?: string };
}

// Aggregates the runtime's connector state for the Integrations tab. Each upstream call is
// independent (MCP servers vs. Google auth) — a failure in one shouldn't blank the whole tab, so
// each degrades to an empty/disconnected state on error rather than failing the request.
export async function GET() {
  try {
    await requireUser();

    const [mcpServers, google] = await Promise.all([
      hermeshq
        .listMcpServers()
        .then((r) => r.servers ?? [])
        .catch(() => [] as Array<Record<string, unknown>>),
      hermeshq
        .googleAuthStatus()
        .then((r) => ({ connected: r.success, account: r.data?.account, message: r.msg }))
        .catch(() => ({ connected: false, message: "Google auth is not available on this runtime." })),
    ]);

    return json<IntegrationsResponse>({ mcpServers, google });
  } catch (e) {
    return handleError(e);
  }
}
