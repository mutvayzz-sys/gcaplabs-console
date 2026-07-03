import { cache } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import type { AgentRow, Role } from "@/lib/types";

// `db` is the privileged service-role client (RLS bypassed). All table access in this app goes
// through it, which makes the helpers below the authorization boundary — they replace what RLS used
// to enforce. The user's IDENTITY still comes only from their verified session cookie (the
// anon/SSR client in getSession), never from `db`; `db` is used purely to run the query once the
// session-derived user id has been checked against the memberships table.
export type DB = ReturnType<typeof createAdminClient>;

// getSession()/isConsoleAdmin() below are wrapped in React's per-request cache() — a single page
// render calls each of these from the layout, the page, and requireUser() independently, and
// without memoization every one of those is a separate round trip to Supabase (Auth + profiles),
// which is in ap-south-1 while this app runs in iad1. cache() collapses repeat calls within the
// same request down to one.
export const getSession = cache(async function getSession() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && anonKey) {
    const auth = (await headers()).get("authorization") ?? "";
    const match = /^Bearer\s+(.+)$/i.exec(auth);
    if (match) {
      const supabase = createSupabaseJsClient(url, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const {
        data: { user },
      } = await supabase.auth.getUser(match[1]);
      return { user };
    }
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV !== "production") {
      return {
        user: {
          id: "dev-user",
          email: "dev@headmaster.local",
        },
      };
    }
    return { user: null };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { user };
});

export async function requireUser() {
  const { user } = await getSession();
  if (!user) throw new ApiError(401, "unauthorized", "Sign in required");
  return { db: createAdminClient(), user };
}

export async function getRole(db: DB, workspaceId: string, userId: string): Promise<Role | null> {
  const { data } = await db
    .from("memberships")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  return (data?.role as Role) ?? null;
}

// 404 (not 403) so we don't leak whether the workspace exists.
export async function requireMember(db: DB, workspaceId: string, userId: string): Promise<Role> {
  const role = await getRole(db, workspaceId, userId);
  if (!role) throw new ApiError(404, "not_found", "Workspace not found");
  return role;
}

export async function requireAdmin(db: DB, workspaceId: string, userId: string): Promise<void> {
  const role = await getRole(db, workspaceId, userId);
  if (role !== "admin") throw new ApiError(403, "forbidden", "Admin role required");
}

export async function getAgentRow(db: DB, agent37Id: string): Promise<AgentRow> {
  const { data } = await db.from("agents").select("*").eq("agent37_id", agent37Id).maybeSingle();
  if (!data) throw new ApiError(404, "not_found", "Agent not found");
  return data as AgentRow;
}

// The auth + ownership preamble every per-agent BFF route repeats: require a signed-in user,
// resolve the agent's mirror row, then gate on the workspace role — "member" for reads, "admin"
// for mutations. Returns the privileged client, user, and row so the handler can get on with its
// work (and run its DB writes through `db`).
export async function requireAgentAccess(agent37Id: string, access: "member" | "admin" = "member") {
  const { db, user } = await requireUser();
  const row = await getAgentRow(db, agent37Id);
  if (access === "admin") await requireAdmin(db, row.workspace_id, user.id);
  else await requireMember(db, row.workspace_id, user.id);
  return { db, user, row };
}

// Gates the console's own admin surfaces (Agents list, Members, Settings) — distinct from
// per-agent capabilities, and distinct from `beta_approved` (which only gates whether a
// signup gets its own Agent37 runtime). Source of truth is `profiles.is_admin`. Mirrors
// getSession()'s dev-mode shortcut so local dev without Supabase configured isn't locked out.
export const isConsoleAdmin = cache(async function isConsoleAdmin(userId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").select("is_admin").eq("id", userId).maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  return data?.is_admin === true;
});

// Whether the user is an org admin for their own organization — used by DashboardShell to decide
// whether to show the "Org" nav item. Distinct from isConsoleAdmin (site-wide).
export const isOrgAdmin = cache(async function isOrgAdmin(userId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return false;
  }
  const db = createAdminClient();
  const { data, error } = await db.from("profiles").select("organization_id,org_role").eq("id", userId).maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  return Boolean(data?.organization_id) && data?.org_role === "admin";
});

// Call at the top of a server component/page that should only render for console admins.
// Redirects everyone else to `redirectTo` (typically the caller's agent workspace).
export async function requireConsoleAdminOrRedirect(redirectTo: string): Promise<void> {
  const { user } = await getSession();
  if (!user) redirect("/login");
  if (!(await isConsoleAdmin(user.id))) redirect(redirectTo);
}

// API-route counterpart of requireConsoleAdminOrRedirect — throws instead of redirecting, for BFF
// routes (e.g. approving another user's beta_approved flag) rather than page components.
export async function requireConsoleAdmin(): Promise<{ db: DB; user: { id: string; email?: string | null } }> {
  const { db, user } = await requireUser();
  if (!(await isConsoleAdmin(user.id))) throw new ApiError(403, "forbidden", "Console admin required");
  return { db, user };
}

// Gates org-scoped admin surfaces (e.g. /dashboard/org) — distinct from `is_admin` (site-wide,
// across every org). An org admin manages only their own organization's members. Returns the
// caller's organization_id so callers can scope subsequent queries to it.
export async function requireOrgAdmin(): Promise<{ db: DB; user: { id: string }; organizationId: string }> {
  const { db, user } = await requireUser();
  const { data, error } = await db
    .from("profiles")
    .select("organization_id,org_role")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new ApiError(500, "db_error", error.message);
  if (!data?.organization_id || data.org_role !== "admin") {
    throw new ApiError(403, "forbidden", "Organization admin required");
  }
  return { db, user, organizationId: data.organization_id as string };
}

// Page-component counterpart of requireOrgAdmin — redirects instead of throwing.
export async function requireOrgAdminOrRedirect(redirectTo: string): Promise<{ db: DB; organizationId: string }> {
  const { user } = await getSession();
  if (!user) redirect("/login");
  const db = createAdminClient();
  const { data } = await db.from("profiles").select("organization_id,org_role").eq("id", user.id).maybeSingle();
  if (!data?.organization_id || data.org_role !== "admin") redirect(redirectTo);
  return { db, organizationId: data.organization_id as string };
}
