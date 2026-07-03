import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { AnnouncementsPanel } from "@/components/admin/AnnouncementsPanel";
import type { AnnouncementRow } from "@/app/api/admin/announcements/route";

export const dynamic = "force-dynamic";

export default async function AdminAnnouncementsPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const { data } = await db.from("announcements").select("*").order("created_at", { ascending: false });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Announcements</h1>
        <p className="mt-1 text-sm text-muted-foreground">Broadcast a banner to every signed-in user.</p>
      </div>
      <AnnouncementsPanel initialAnnouncements={(data ?? []) as AnnouncementRow[]} />
    </div>
  );
}
