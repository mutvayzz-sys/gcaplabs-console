import { requireOrgAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,runtime_id,runtime_status,created_at";

export async function GET() {
  try {
    const { db, organizationId } = await requireOrgAdmin();
    const { data, error } = await db
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ users: (data ?? []) as AdminProfileRow[] });
  } catch (e) {
    return handleError(e);
  }
}

// An org admin can only approve/revoke members of their own org — never promote to site-wide
// is_admin, and never touch a profile outside their organization_id. Promoting org admins or
// site admins stays a site-admin-only action via /api/admin/users.
export async function PATCH(request: Request) {
  try {
    const { db, organizationId } = await requireOrgAdmin();
    const body = await readJson<{ id?: string; beta_approved?: boolean }>(request);
    if (!body.id || typeof body.beta_approved !== "boolean") {
      throw new ApiError(400, "invalid_request", "id and beta_approved are required");
    }
    const { data, error } = await db
      .from("profiles")
      .update({ beta_approved: body.beta_approved })
      .eq("id", body.id)
      .eq("organization_id", organizationId)
      .select(PROFILE_COLUMNS)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "User not found in your organization");
    return json({ user: data as AdminProfileRow });
  } catch (e) {
    return handleError(e);
  }
}
