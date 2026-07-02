import { disconnectAccount, listConnectedAccounts, findOrCreateManagedAuthConfigId, removeToolkitFromSharedMcp } from '@/lib/composio';
import { hermeshq } from '@/lib/hermeshq';
import { requireUser } from '@/lib/auth';
import { ApiError, handleError, json } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

// Connections are private per console user (scoped by Supabase user id, unlike the old
// starter-kit's shared-team-agent model) — so this is an ownership check, not an admin gate:
// confirm the connection belongs to the caller before letting them disconnect it.
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { user } = await requireUser();
    const { id } = await params;
    const owned = await listConnectedAccounts(user.id);
    const conn = owned.find((c) => c.id === id);
    if (!conn) {
      throw new ApiError(404, 'not_found', 'Connection not found.');
    }

    // 1. Disconnect on Composio's side.
    await disconnectAccount(id);

    // 2. Remove this toolkit's auth_config from the shared MCP server.
    try {
      const authConfigId = await findOrCreateManagedAuthConfigId(conn.toolkit.slug);
      await removeToolkitFromSharedMcp({ authConfigId });
    } catch {
      // Best-effort — the connection is already disconnected on Composio's side.
    }

    // 3. If the user has no remaining active connections, remove the MCP server
    //    from the gateway. (If other connections remain, the shared MCP server
    //    still has their auth_config_ids and the instance URL is unchanged.)
    const remaining = owned.filter((c) => c.id !== id && c.status.toUpperCase() === 'ACTIVE');
    if (remaining.length === 0) {
      try {
        await hermeshq.removeMcpServer('composio');
      } catch {
        // Best-effort — gateway may be unreachable.
      }
    }

    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}