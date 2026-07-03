import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ApiError } from "@/lib/http";
import { parseSettingsTab } from "@/lib/settings-tabs";
import { SettingsWorkspace } from "@/components/settings/SettingsWorkspace";
import type { AccountProfile } from "@/app/api/account/route";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ tab?: string[] }> }) {
  const { tab: segments } = await params;
  const activeTab = parseSettingsTab(segments);
  if (!activeTab) notFound();
  if (!segments?.length) redirect("/dashboard/settings/profile");

  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("profiles")
    .select("id,email,display_name,is_admin,beta_approved")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!data) throw new ApiError(404, "not_found", "Profile not found");

  return <SettingsWorkspace profile={data as AccountProfile} activeTab={activeTab} />;
}
