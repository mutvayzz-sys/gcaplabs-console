import { redirect } from "next/navigation";
import { getSession, isConsoleAdmin } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const isAdmin = await isConsoleAdmin(user.id);
  return (
    <DashboardShell userEmail={user.email ?? "Signed in"} isAdmin={isAdmin}>
      {children}
    </DashboardShell>
  );
}
