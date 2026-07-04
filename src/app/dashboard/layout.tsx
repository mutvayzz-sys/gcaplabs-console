import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

// Every user has exactly one agent (see MANAGED_AGENT_ID) and lands straight in its workspace,
// which has its own nav (tabs, chats rail, account menu) — so there's no fleet-level chrome here.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBanner />
      <main className="mx-auto w-full max-w-7xl flex-1 p-4 md:p-6">{children}</main>
    </div>
  );
}
