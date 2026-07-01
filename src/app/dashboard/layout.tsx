import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

// Headmaster console dashboard layout — simplified.
// No workspace/fleet indirection. Just auth gate + render children.
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getSession();
  if (!user) redirect("/login");
  return <>{children}</>;
}