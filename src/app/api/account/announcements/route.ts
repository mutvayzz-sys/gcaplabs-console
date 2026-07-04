import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface UnreadAnnouncement {
  id: string;
  title: string;
  body: string;
  created_at: string;
}

// Active announcements the caller hasn't dismissed yet — used for the banner in the dashboard layout.
export async function GET() {
  try {
    const { db, user } = await requireUser();
    const { data: active, error } = await db
      .from("announcements")
      .select("id,title,body,created_at")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);

    const { data: reads } = await db.from("announcement_reads").select("announcement_id").eq("user_id", user.id);
    const readIds = new Set((reads ?? []).map((r) => r.announcement_id));

    const unread = (active ?? []).filter((a) => !readIds.has(a.id)) as UnreadAnnouncement[];
    return json({ unread });
  } catch (e) {
    return handleError(e);
  }
}

// Mark one announcement as read/dismissed for the caller only.
export async function POST(request: Request) {
  try {
    const { db, user } = await requireUser();
    const body = await readJson<{ announcement_id?: string }>(request);
    if (!body.announcement_id) throw new ApiError(400, "invalid_request", "announcement_id is required");
    const { error } = await db
      .from("announcement_reads")
      .upsert({ announcement_id: body.announcement_id, user_id: user.id }, { onConflict: "announcement_id,user_id" });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
