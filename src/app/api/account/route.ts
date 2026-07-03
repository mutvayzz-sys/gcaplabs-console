import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface AccountProfile {
  id: string;
  email: string | null;
  display_name: string | null;
  is_admin: boolean;
  beta_approved: boolean;
}

export async function GET() {
  try {
    const { db, user } = await requireUser();
    const { data, error } = await db
      .from("profiles")
      .select("id,email,display_name,is_admin,beta_approved")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Profile not found");
    return json({ profile: data as AccountProfile });
  } catch (e) {
    return handleError(e);
  }
}

// Self-service profile edit — scoped to the caller's own row. Only display_name is editable
// here; email changes go through Supabase Auth's own confirmation-email flow from the browser
// client instead (a different code path, not this route).
export async function PATCH(request: Request) {
  try {
    const { db, user } = await requireUser();
    const body = await readJson<{ display_name?: string }>(request);
    const displayName = (body.display_name ?? "").trim();
    if (!displayName) throw new ApiError(400, "invalid_request", "display_name is required");
    if (displayName.length > 120) throw new ApiError(400, "invalid_request", "display_name is too long");

    const { data, error } = await db
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", user.id)
      .select("id,email,display_name,is_admin,beta_approved")
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Profile not found");
    return json({ profile: data as AccountProfile });
  } catch (e) {
    return handleError(e);
  }
}
