import { findOrCreateManagedAuthConfigId, ensureComposioMcpForUser } from '@/lib/composio';
import { hermeshq } from '@/lib/hermeshq';
import { requireUser } from '@/lib/auth';
import { ApiError, handleError, json, readJson } from '@/lib/http';

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const { toolkit } = await readJson<{ toolkit?: string }>(request);
    if (!toolkit || typeof toolkit !== 'string') {
      throw new ApiError(400, 'invalid_request', 'toolkit is required');
    }

    // 1. Find the (now-connected) auth config for this toolkit.
    const authConfigId = await findOrCreateManagedAuthConfigId(toolkit);

    // 2. Create/update the shared Composio MCP server + per-user instance.
    const { mcpUrl } = await ensureComposioMcpForUser({ authConfigId, userId: user.id });

    // 3. Register the MCP URL on the user's runtime gateway → config.yaml.
    try {
      await hermeshq.registerMcpServer('composio', mcpUrl);
    } catch (e) {
      // If the gateway is unreachable (container not provisioned), don't fail the
      // whole connect flow — the connection is still valid on Composio's side.
      // The MCP registration can be retried. Log but proceed.
      console.warn('[register-mcp] Failed to register on gateway:', e instanceof Error ? e.message : e);
    }

    return json({ ok: true, mcpUrl });
  } catch (e) {
    return handleError(e);
  }
}