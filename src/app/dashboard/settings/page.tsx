import { branding } from "@/config/branding";
import { requireConsoleAdminOrRedirect } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Console settings for the HermesHQ-backed Headmaster runtime.
        </p>
      </div>
      <div className="overflow-hidden rounded-lg border text-sm">
        <InfoRow label="App" value={branding.appName} />
        <InfoRow label="Backend" value="HermesHQ" />
        <InfoRow label="Provisioning" value="Backend managed" last />
      </div>
    </div>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`grid grid-cols-[160px_1fr] gap-4 px-4 py-3 ${last ? "" : "border-b"}`}>
      <div className="text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  );
}
