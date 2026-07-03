import { requireConsoleAdmin } from "@/lib/auth";
import { listMessagesWithSenderEmail } from "@/lib/messages";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export interface MessageRow {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_by_admin: boolean;
  sender_email: string | null;
}

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    return json({ messages: await listMessagesWithSenderEmail(db) });
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    const { db } = await requireConsoleAdmin();
    const body = await readJson<{ id?: string }>(request);
    if (!body.id) throw new ApiError(400, "invalid_request", "id is required");
    const { error } = await db.from("messages").update({ read_by_admin: true }).eq("id", body.id);
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
