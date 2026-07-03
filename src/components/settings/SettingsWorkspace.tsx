"use client";

import Link from "next/link";
import { KeyRound, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { settingsTabPath, type SettingsTab } from "@/lib/settings-tabs";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SecurityTab } from "@/components/settings/SecurityTab";
import type { AccountProfile } from "@/app/api/account/route";

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof User }> = [
  { id: "profile", label: "Profile", icon: User },
  { id: "security", label: "Security", icon: KeyRound },
];

export function SettingsWorkspace({ profile, activeTab }: { profile: AccountProfile; activeTab: SettingsTab }) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile and account security.</p>
      </div>

      <nav className="flex gap-1 border-b">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={settingsTabPath(tab.id)}
              className={cn(
                "flex items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>

      {activeTab === "profile" ? <ProfileForm profile={profile} /> : <SecurityTab />}
    </div>
  );
}
