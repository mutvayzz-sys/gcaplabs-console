"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, LayoutGrid, Settings, SlidersHorizontal, Users } from "lucide-react";
import { branding } from "@/config/branding";
import { AccountMenu } from "@/components/AccountMenu";
import { cn } from "@/lib/utils";

// Visible to every signed-in user, admin or not.
const USER_NAV = [
  { href: "/dashboard", label: "Agent", icon: LayoutGrid, exact: true },
  { href: "/dashboard/settings", label: "Account", icon: Settings, exact: false },
];

// Additive: rendered as a separate labeled section below USER_NAV, only for console admins
// (profiles.is_admin) — distinct from beta_approved, see src/lib/auth.ts.
const ADMIN_NAV = [
  { href: "/dashboard/admin/users", label: "Users", icon: Users, exact: false },
  { href: "/dashboard/admin/organizations", label: "Organizations", icon: Building2, exact: false },
  { href: "/dashboard/admin/config", label: "Config", icon: SlidersHorizontal, exact: false },
];

// Additive: only for a user whose own org_role is 'admin' in their organization — distinct from
// isAdmin (site-wide across every org), see isOrgAdmin() in src/lib/auth.ts.
const ORG_NAV = [{ href: "/dashboard/org", label: "My Organization", icon: Building2, exact: false }];

export function DashboardShell({
  children,
  userEmail,
  isAdmin,
  isOrgAdmin,
}: {
  children: React.ReactNode;
  userEmail: string;
  isAdmin: boolean;
  isOrgAdmin: boolean;
}) {
  const pathname = usePathname();

  function renderNavItems(items: typeof USER_NAV) {
    return items.map((item) => {
      const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
      const Icon = item.icon;
      return (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            active ? "bg-secondary text-secondary-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-60 shrink-0 flex-col border-r bg-card p-4">
        <div className="flex items-center gap-2 px-2 py-1">
          {branding.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.logoUrl} alt="" className="h-6 w-6 rounded" />
          ) : null}
          <span className="truncate font-semibold">{branding.appName}</span>
        </div>

        <nav className="mt-6 flex flex-col gap-1">{renderNavItems(USER_NAV)}</nav>

        {isOrgAdmin ? (
          <div className="mt-4">
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Organization</div>
            <nav className="flex flex-col gap-1">{renderNavItems(ORG_NAV)}</nav>
          </div>
        ) : null}

        {isAdmin ? (
          <div className="mt-4">
            <div className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Admin</div>
            <nav className="flex flex-col gap-1">{renderNavItems(ADMIN_NAV)}</nav>
          </div>
        ) : null}

        {/* Account + workspace switcher, pinned to the bottom near the user's identity. */}
        <div className="mt-auto border-t pt-3">
          <AccountMenu userEmail={userEmail} />
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-7xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
