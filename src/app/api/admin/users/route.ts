import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface AdminProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  beta_approved: boolean;
  agent37_id: string | null;
  agent37_status: string | null;
  created_at: string;
}

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    const { data, error } = await db
      .from("profiles")
      .select("id,email,display_name,beta_approved,agent37_id,agent37_status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ users: (data ?? []) as AdminProfileRow[] });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { db } = await requireConsoleAdmin();
    const body = await readJson<{ id?: string; beta_approved?: boolean }>(request);
    if (!body.id || typeof body.beta_approved !== "boolean") {
      throw new ApiError(400, "invalid_request", "id and beta_approved are required");
    }
    const { data, error } = await db
      .from("profiles")
      .update({ beta_approved: body.beta_approved })
      .eq("id", body.id)
      .select("id,email,display_name,beta_approved,agent37_id,agent37_status,created_at")
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "User not found");
    return json({ user: data as AdminProfileRow });
  } catch (e) {
    return handleError(e);
  }
}
