import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

// Site-admin variant of POST /api/org/invite — can create an invite for any organization, not
// just the caller's own (a site admin may not belong to any organization at all).
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db, user } = await requireConsoleAdmin();
    const { id } = await params;
    const body = await readJson<{ org_role?: "admin" | "member" }>(request);
    const orgRole = body.org_role === "admin" ? "admin" : "member";

    const { data: org } = await db.from("organizations").select("id").eq("id", id).maybeSingle();
    if (!org) throw new ApiError(404, "not_found", "Organization not found");

    const { data, error } = await db
      .from("org_invitations")
      .insert({ organization_id: id, org_role: orgRole, created_by: user.id })
      .select("token,org_role,expires_at")
      .single();
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ invitation: data });
  } catch (e) {
    return handleError(e);
  }
}
