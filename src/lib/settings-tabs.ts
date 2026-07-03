// The user-settings tab grammar, mirroring src/lib/dashboard-tabs.ts's shape for the per-agent
// tabs. Bound to the URL: /dashboard/settings/{tab}.

export const SETTINGS_TAB_IDS = ["profile", "security"] as const;

export type SettingsTab = (typeof SETTINGS_TAB_IDS)[number];

function isSettingsTab(value: string): value is SettingsTab {
  return (SETTINGS_TAB_IDS as readonly string[]).includes(value);
}

export function settingsTabPath(tab: SettingsTab): string {
  return `/dashboard/settings/${tab}`;
}

export function parseSettingsTab(segments?: string[]): SettingsTab | null {
  if (!segments || segments.length === 0) return "profile";
  if (segments.length === 1 && isSettingsTab(segments[0])) return segments[0];
  return null;
}
