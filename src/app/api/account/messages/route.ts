import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const { db, user } = await requireUser();
    const body = await readJson<{ body?: string }>(request);
    const text = (body.body ?? "").trim();
    if (!text) throw new ApiError(400, "invalid_request", "body is required");
    if (text.length > 4000) throw new ApiError(400, "invalid_request", "Message is too long");

    const { error } = await db.from("messages").insert({ sender_id: user.id, body: text });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
