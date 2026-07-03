import { redirect } from "next/navigation";
import { getSession, isConsoleAdmin, isOrgAdmin } from "@/lib/auth";
import { DashboardShell } from "@/components/DashboardShell";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const [isAdmin, orgAdmin] = await Promise.all([isConsoleAdmin(user.id), isOrgAdmin(user.id)]);
  return (
    <DashboardShell userEmail={user.email ?? "Signed in"} isAdmin={isAdmin} isOrgAdmin={orgAdmin}>
      {children}
    </DashboardShell>
  );
}
