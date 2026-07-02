import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { ApiError } from "@/lib/http";
import { MANAGED_WORKSPACE_ID } from "@/lib/managed-agent";
import type { AgentRow, Role } from "@/lib/types";

// `db` is the privileged service-role client (RLS bypassed). All table access in this app goes
// through it, which makes the helpers below the authorization boundary — they replace what RLS used
// to enforce. The user's IDENTITY still comes only from their verified session cookie (the
// anon/SSR client in getSession), never from `db`; `db` is used purely to run the query once the
// session-derived user id has been checked against the memberships table.
export type DB = ReturnType<typeof createAdminClient>;

export async function getSession() {
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
}

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
// per-agent capabilities. Source of truth is the `memberships` role for the single managed
// workspace, same table `requireAgentAccess` checks. Mirrors getSession()'s dev-mode shortcut so
// local dev without Supabase configured isn't locked out.
export async function isConsoleAdmin(userId: string): Promise<boolean> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return true;
  }
  const db = createAdminClient();
  const role = await getRole(db, MANAGED_WORKSPACE_ID, userId);
  return role === "admin";
}

// Call at the top of a server component/page that should only render for console admins.
// Redirects everyone else to `redirectTo` (typically the caller's agent workspace).
export async function requireConsoleAdminOrRedirect(redirectTo: string): Promise<void> {
  const { user } = await getSession();
  if (!user) redirect("/login");
  if (!(await isConsoleAdmin(user.id))) redirect(redirectTo);
}
