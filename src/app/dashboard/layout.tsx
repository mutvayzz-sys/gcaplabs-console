import { redirect } from "next/navigation";
import { getSession, isConsoleAdmin, isOrgAdmin } from "@/lib/auth";
import { unreadMessageCount } from "@/lib/messages";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const [isAdmin, orgAdmin] = await Promise.all([isConsoleAdmin(user.id), isOrgAdmin(user.id)]);
  // Only admins see the Messages nav item, so only bother counting when it'll actually be shown.
  const unreadMessages = isAdmin ? await unreadMessageCount() : 0;
  return (
    <DashboardShell userEmail={user.email ?? "Signed in"} isAdmin={isAdmin} isOrgAdmin={orgAdmin} unreadMessages={unreadMessages}>
      {children}
    </DashboardShell>
  );
}
