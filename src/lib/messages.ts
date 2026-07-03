import "server-only";
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { DB } from "@/lib/auth";
import type { MessageRow } from "@/app/api/admin/messages/route";

// Count of messages no admin has read yet — feeds the badge on the Messages nav item. Cached
// per-request like getSession()/isConsoleAdmin() since DashboardLayout and the admin Messages
// page can both call it in the same render.
export const unreadMessageCount = cache(async function unreadMessageCount(): Promise<number> {
  const db = createAdminClient();
  const { count } = await db.from("messages").select("id", { count: "exact", head: true }).eq("read_by_admin", false);
  return count ?? 0;
});

// messages.sender_id references auth.users, not public.profiles, so PostgREST can't auto-embed
// profiles for the sender's email — fetch separately and merge (profiles.id === auth.users.id).
export async function listMessagesWithSenderEmail(db: DB): Promise<MessageRow[]> {
  const { data, error } = await db
    .from("messages")
    .select("id,sender_id,body,created_at,read_by_admin")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const senderIds = [...new Set((data ?? []).map((row) => row.sender_id))];
  const { data: senders } = senderIds.length
    ? await db.from("profiles").select("id,email").in("id", senderIds)
    : { data: [] as { id: string; email: string | null }[] };
  const emailById = new Map((senders ?? []).map((s) => [s.id, s.email]));

  return (data ?? []).map((row) => ({ ...row, sender_email: emailById.get(row.sender_id) ?? null }));
}
