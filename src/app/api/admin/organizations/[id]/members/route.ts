import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,runtime_id,runtime_status,created_at";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await requireConsoleAdmin();
    const { id } = await params;
    const { data, error } = await db
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("organization_id", id)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ users: (data ?? []) as AdminProfileRow[] });
  } catch (e) {
    return handleError(e);
  }
}

// Site-admin variant of PATCH /api/org/members — can also change org_role (promote/demote an
// org admin) or remove a member from the org entirely (organization_id: null), unlike the
// org-admin-scoped route which can only toggle beta_approved for its own org's members.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { db } = await requireConsoleAdmin();
    const { id } = await params;
    const body = await readJson<{ user_id?: string; beta_approved?: boolean; org_role?: "admin" | "member" | null }>(request);
    if (!body.user_id) throw new ApiError(400, "invalid_request", "user_id is required");

    const update: { beta_approved?: boolean; org_role?: "admin" | "member" | null; organization_id?: null } = {};
    if (typeof body.beta_approved === "boolean") update.beta_approved = body.beta_approved;
    if (body.org_role !== undefined) {
      if (body.org_role === null) {
        update.org_role = null;
        update.organization_id = null;
      } else {
        update.org_role = body.org_role;
      }
    }
    if (Object.keys(update).length === 0) throw new ApiError(400, "invalid_request", "Nothing to update");

    const { data, error } = await db
      .from("profiles")
      .update(update)
      .eq("id", body.user_id)
      .eq("organization_id", id)
      .select(PROFILE_COLUMNS)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "User not found in this organization");
    return json({ user: data as AdminProfileRow });
  } catch (e) {
    return handleError(e);
  }
}
