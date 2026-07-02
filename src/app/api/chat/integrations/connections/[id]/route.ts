import { disconnectAccount, listConnectedAccounts } from "@/lib/composio";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json } from "@/lib/http";

type Ctx = { params: Promise<{ id: string }> };

// Connections are private per console user (scoped by Supabase user id, unlike the old
// starter-kit's shared-team-agent model) — so this is an ownership check, not an admin gate:
// confirm the connection belongs to the caller before letting them disconnect it.
export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    const { user } = await requireUser();
    const { id } = await params;
    const owned = await listConnectedAccounts(user.id);
    if (!owned.some((c) => c.id === id)) {
      throw new ApiError(404, "not_found", "Connection not found.");
    }
    await disconnectAccount(id);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
