import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json } from "@/lib/http";

export async function POST(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const { db, user } = await requireUser();

    const { data: invite, error: inviteError } = await db
      .from("org_invitations")
      .select("token,organization_id,org_role,expires_at,used_at")
      .eq("token", token)
      .maybeSingle();
    if (inviteError) throw new ApiError(500, "db_error", inviteError.message);
    if (!invite) throw new ApiError(404, "not_found", "Invitation not found");
    if (invite.used_at) throw new ApiError(400, "invalid_request", "This invitation has already been used");
    if (new Date(invite.expires_at) < new Date()) throw new ApiError(400, "invalid_request", "This invitation has expired");

    const { error: updateError } = await db
      .from("profiles")
      .update({ organization_id: invite.organization_id, org_role: invite.org_role })
      .eq("id", user.id);
    if (updateError) throw new ApiError(500, "db_error", updateError.message);

    await db.from("org_invitations").update({ used_at: new Date().toISOString() }).eq("token", token);

    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
