import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  created_by: string | null;
  created_at: string;
  active: boolean;
}

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    const { data, error } = await db.from("announcements").select("*").order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ announcements: (data ?? []) as AnnouncementRow[] });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(request: Request) {
  try {
    const { db, user } = await requireConsoleAdmin();
    const body = await readJson<{ title?: string; body?: string }>(request);
    const title = (body.title ?? "").trim();
    const text = (body.body ?? "").trim();
    if (!title || !text) throw new ApiError(400, "invalid_request", "title and body are required");

    const { data, error } = await db
      .from("announcements")
      .insert({ title, body: text, created_by: user.id })
      .select("*")
      .single();
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ announcement: data as AnnouncementRow });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { db } = await requireConsoleAdmin();
    const body = await readJson<{ id?: string; active?: boolean }>(request);
    if (!body.id || typeof body.active !== "boolean") {
      throw new ApiError(400, "invalid_request", "id and active are required");
    }
    const { data, error } = await db
      .from("announcements")
      .update({ active: body.active })
      .eq("id", body.id)
      .select("*")
      .maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    if (!data) throw new ApiError(404, "not_found", "Announcement not found");
    return json({ announcement: data as AnnouncementRow });
  } catch (e) {
    return handleError(e);
  }
}
