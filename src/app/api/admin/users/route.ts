import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface AdminProfileRow {
  id: string;
  email: string | null;
  display_name: string | null;
  beta_approved: boolean;
  is_admin: boolean;
  agent37_id: string | null;
  agent37_status: string | null;
  created_at: string;
}

const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";
const DEFAULT_PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const { db } = await requireConsoleAdmin();
    const url = new URL(request.url);
    const q = url.searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(url.searchParams.get("page") ?? "1") || 1);
    const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get("pageSize") ?? String(DEFAULT_PAGE_SIZE)) || DEFAULT_PAGE_SIZE));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // q is embedded into a PostgREST .or() filter string below — strip characters with
    // special meaning in that grammar (,()."*) so a search term can't inject extra filter
    // clauses (this route is admin-only, but don't rely on that alone).
    const safeQ = q.replace(/[,()."*]/g, "");
    let query = db.from("profiles").select(PROFILE_COLUMNS, { count: "exact" }).order("created_at", { ascending: false });
    if (safeQ) query = query.or(`email.ilike.%${safeQ}%,display_name.ilike.%${safeQ}%`);
    const { data, error, count } = await query.range(from, to);
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ users: (data ?? []) as AdminProfileRow[], total: count ?? 0, page, pageSize });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { db, user } = await requireConsoleAdmin();
    const body = await readJson<{ id?: string; beta_approved?: boolean; is_admin?: boolean }>(request);
    if (!body.id || (typeof body.beta_approved !== "boolean" && typeof body.is_admin !== "boolean")) {
      throw new ApiError(400, "invalid_request", "id and at least one of beta_approved/is_admin are required");
    }
    if (body.id === user.id && body.is_admin === false) {
      throw new ApiError(400, "invalid_request", "Cannot remove your own admin access");
    }
    const update: { beta_approved?: boolean; is_admin?: boolean } = {};
    if (typeof body.beta_approved === "boolean") update.beta_approved = body.beta_approved;
    if (typeof body.is_admin === "boolean") update.is_admin = body.is_admin;
    const { data, error } = await db
      .from("profiles")
      .update(update)
      .eq("id", body.id)
      .select(PROFILE_COLUMNS)
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "User not found");
    return json({ user: data as AdminProfileRow });
  } catch (e) {
    return handleError(e);
  }
}
