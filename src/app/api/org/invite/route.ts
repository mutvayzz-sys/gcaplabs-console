import { requireOrgAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { db, user, organizationId } = await requireOrgAdmin();
    const body = await readJson<{ org_role?: "admin" | "member" }>(request);
    const orgRole = body.org_role === "admin" ? "admin" : "member";

    const { data, error } = await db
      .from("org_invitations")
      .insert({ organization_id: organizationId, org_role: orgRole, created_by: user.id })
      .select("token,org_role,expires_at")
      .single();
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ invitation: data });
  } catch (e) {
    return handleError(e);
  }
}
