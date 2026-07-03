import { requireConsoleAdminOrRedirect, requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";
import { listMessagesWithSenderEmail } from "@/lib/messages";
import { MessagesInbox } from "@/components/admin/MessagesInbox";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  const { db } = await requireUser();
  const messages = await listMessagesWithSenderEmail(db);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">Messages sent to you from users.</p>
      </div>
      <MessagesInbox initialMessages={messages} />
    </div>
  );
}
