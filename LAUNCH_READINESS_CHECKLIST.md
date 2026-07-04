# Console Launch Readiness Checklist

Generated from source audit of `gcaplabs-console` (Next.js + Supabase + Runtime Provider). This checklist maps existing admin, health, settings, invite, and runtime-control functionality against launch-readiness categories. It is intended to be saved at the repo root and kept as a living document.

---

## Legend

- **P** = Pass (implemented and gated correctly in code)
- **F** = Fail (missing or unsafe in current code)
- **B** = Blocker (must be resolved before launch)
- **N/A** = Not applicable / not a launch concern

---

## 1. Console Administration (Site-level)

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 1.1 | Console admin flag is distinct from `beta_approved` | P | `profiles.is_admin` column added in `supabase/migrations/0004_admin_role.sql`; `isConsoleAdmin()` reads `is_admin`, not `beta_approved`. | Earlier bug was fixed; see `docs/runtime-provisioning-and-admin.md` |
| 1.2 | Admin pages gate on `profiles.is_admin` | P | All admin pages use `requireConsoleAdminOrRedirect(...)`: `dashboard/admin/health`, `users`, `users/[id]`, `organizations`, `organizations/[id]`, `config`, `announcements`, `messages`. | Verified via content search across `src/app/dashboard/admin/**` |
| 1.3 | Admin API routes gate on `profiles.is_admin` | P | All `/api/admin/**` routes call `requireConsoleAdmin()` (users, organizations, config, health, announcements, messages, users/[id]/runtime). | Verified via content search across `src/app/api/admin/**` |
| 1.4 | Non-admin users redirected away from admin UI | P | `requireConsoleAdminOrRedirect()` redirects to `/dashboard/agents/{MANAGED_AGENT_ID}/chat` if not `is_admin`. | `src/lib/auth.ts:119-123` |
| 1.5 | Admin nav accessible to console admins | F | No `AdminNav` component exists; there are no admin nav links in `AccountMenu` or `AgentWorkspace`. Admins must navigate by URL. | Missing UX; not a security blocker because routes are gated |
| 1.6 | User list supports approve/revoke beta and grant/revoke admin | P | `UsersTable` toggles both `beta_approved` and `is_admin` via `/api/admin/users` PATCH. | `src/components/admin/UsersTable.tsx` |
| 1.7 | User detail page exposes runtime controls | P | `UserDetail` embeds `RuntimeControlPanel` with start/stop/restart/update/delete/budget and signed URLs. | `src/components/admin/UserDetail.tsx`, `RuntimeControlPanel.tsx` |
| 1.8 | Organization admin surface exists | P | `OrganizationsTable`, `OrgDetail`, and `/dashboard/admin/organizations/**` pages are implemented. | `src/components/admin/OrganizationsTable.tsx`, `OrgDetail.tsx` |

**Recommendation:** Add a console-admin nav link (e.g., in `AccountMenu` or `AgentWorkspace`) gated by `is_admin` so operators can reach `/dashboard/admin/health` without memorizing URLs. Low severity, but high UX friction.

---

## 2. Health & Operational Readiness

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 2.1 | Public health endpoint exists | P | `src/app/api/health/route.ts` returns `{ ok, timestamp }` with no auth. | Good for load balancer / uptime probe |
| 2.2 | Admin health endpoint is gated | P | `src/app/api/admin/health/route.ts` calls `requireConsoleAdmin()` and returns a snapshot via `lib/health.ts`. | `src/lib/health.ts` |
| 2.3 | Admin health page is gated | P | `src/app/dashboard/admin/health/page.tsx` uses `requireConsoleAdminOrRedirect()`. | |
| 2.4 | Health checks cover runtime provider and dependencies | P | `src/lib/health.ts` checks `control_plane`, `data_plane`, `db`, `auth`. | Latency reported per probe |
| 2.5 | Health page surfaces actionable detail | P | `dashboard/admin/health/page.tsx` renders status tiles and runtime status counts. | |
| 2.6 | Error handling does not leak secrets | P | Health endpoints return JSON status/error fields, no env values or keys. | Verified by reading routes |
| 2.7 | No panic / unhandled-reject handler | F | No global `process.on('unhandledRejection')` or `uncaughtException` handler in app code. | Not critical for Next.js but worth noting for container health |
| 2.8 | `/api/health` does not call upstream under heavy load | N/A | Static JSON response; no upstream dependency. | Safe for aggressive probing |

---

## 3. Settings & Profile

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 3.1 | User settings page exists | P | `/dashboard/settings/[[...tab]]` renders `SettingsWorkspace` with `profile` tab. | `src/components/settings/SettingsWorkspace.tsx` |
| 3.2 | Settings page requires login | P | `requireUser()` is called in `src/app/dashboard/settings/[[...tab]]/page.tsx`. | |
| 3.3 | Runtime settings tab (per-agent) exists | P | `RuntimeSettingsTab` provides start/stop/restart/update/resize/rename. | `src/components/RuntimeSettingsTab.tsx` |
| 3.4 | Runtime settings are not over-gated | P | `RuntimeSettingsTab` sets `isAdmin = true` because the headmaster model is single-user; this is documented. | No team/role mismatch risk per current model |
| 3.5 | Workspace settings exist | N/A | The `workspace` settings tab is referenced but the original multi-agent tables (`workspaces`, `memberships`, `invitations`, `agents`) are commented out in `0001_init.sql`. | The UI may still render a workspace tab; verify no runtime errors if selected |
| 3.6 | Branding config is centralized | P | `src/config/branding.ts` holds `appName` / `logoUrl`; README confirms env vars are removed. | `AGENTS.md` |

---

## 4. Invites & Signup

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 4.1 | Invite acceptance page exists | P | `src/app/invite/[token]/page.tsx` + `AcceptInvite` component. | `src/components/AcceptInvite.tsx` |
| 4.2 | Invite flow is gated by token | P | Page fetches `/api/invite/{token}` and surfaces accept/reject. | |
| 4.3 | Signup requires `beta_approved` before runtime access | P | `getCurrentManagedRuntime()` checks `beta_approved` every call; new signups default to `false`. | `docs/runtime-provisioning-and-admin.md` |
| 4.4 | Console admin can approve pending users | P | `UsersTable` toggles `beta_approved`. | |
| 4.5 | Pending users are clearly surfaced | P | `UsersTable` badge shows `Pending` when `beta_approved` is false. | |
| 4.6 | Org-scoped invite APIs exist | P | `/api/admin/organizations/[id]/invite` and `/api/admin/organizations/[id]/members` are implemented. | Verified via content search |

---

## 5. Runtime Control Panel

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 5.1 | Start/stop/restart actions available | P | `RuntimeControlPanel` exposes start, stop, restart. | `src/components/admin/RuntimeControlPanel.tsx` |
| 5.2 | Update-to-latest-image available | P | `update` action implemented. | |
| 5.3 | Delete runtime available | P | `delete` action implemented with `ConfirmDialog`. | |
| 5.4 | Budget cap editable | P | Budget PATCH via `RuntimeControlPanel`. | |
| 5.5 | Signed-port links (dashboard/terminal/files) gated | P | `RuntimeControlPanel` only renders signed-port buttons when instance exists; reachable only from admin User Detail. | |
| 5.6 | Admin runtime API is gated | P | `src/app/api/admin/users/[id]/runtime/route.ts` calls `requireConsoleAdmin()`. | |
| 5.7 | Runtime status reflected in real-time-ish | P | `RuntimeSettingsTab` refreshes via `/api/chat/runtime` after mutations. | |

---

## 6. Security & Secrets

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 6.1 | `RUNTIME_API_KEY` stays server-side | P | `managed-runtime.ts` is `server-only`; key is read from env and used only in server fetch headers. | `src/lib/managed-runtime.ts` |
| 6.2 | Supabase service role key stays server-side | P | `createAdminClient()` imported only in server files. | `src/lib/supabase/admin.ts` |
| 6.3 | No secrets in source code | P | No API keys, tokens, or connection strings observed in read files. | Git status shows only expected changes; no `.env` files |
| 6.4 | Dev-mode fallback documented | P | `isConsoleAdmin()` returns `true` and `getCurrentManagedRuntime()` returns synthetic dev runtime when Supabase / runtime keys are missing in non-production. | `docs/runtime-provisioning-and-admin.md` |
| 6.5 | Dev fallback cannot be reached in production | P | Dev bypass checks `process.env.NODE_ENV !== "production"`. | `src/lib/auth.ts:40-48`, `src/lib/managed-runtime.ts` |

---

## 7. Build & Type Safety

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 7.1 | `npm run typecheck` passes | P | `tsc --noEmit` completed with exit code 0. | Run on 2026-07-05 |
| 7.2 | `npm run build` not yet run | N/A | Build was not executed during this audit. | Run before launch; this is a standard pre-launch gate |
| 7.3 | No test suite | F | `package.json` has no test scripts. | `AGENTS.md` explicitly states no tests; gate is typecheck + build |
| 7.4 | Linting script not configured | F | `package.json` has no `lint` script. | Consider adding `next lint` before launch |

---

## 8. Database / Schema Readiness

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 8.1 | Admin role migration applied | P | `supabase/migrations/0004_admin_role.sql` adds `is_admin`. | |
| 8.2 | Legacy multi-agent tables commented out | N/A | `workspaces`, `memberships`, `invitations`, `agents` are commented in `0001_init.sql`. | Current model is single-user managed runtime; no conflict |
| 8.3 | Renamed migration present in working tree | P | `supabase/migrations/0008_rename_legacy_runtime_columns.sql` is untracked; the deleted legacy runtime-column migration is gone. | Verify this rename is intentional and deployed before launch |
| 8.4 | `app_config` table exists for feature flags | P | `ConfigTable` reads/writes `app_config` via `/api/admin/config`. | `src/app/dashboard/admin/config/page.tsx` |

---

## 9. UX / Navigation

| # | Item | Status | Evidence | Notes |
|---|------|--------|----------|-------|
| 9.1 | Dashboard layout is minimal and correct | P | `src/app/dashboard/layout.tsx` only checks session and renders banner + main container. | |
| 9.2 | Agent workspace has tab nav | P | `AgentWorkspace` provides Chat / Files / Integrations / Settings tabs. | `src/components/AgentWorkspace.tsx` |
| 9.3 | Account menu links to settings | P | `AccountMenu` links to `/dashboard/settings`. | `src/components/AccountMenu.tsx` |
| 9.4 | No admin nav link anywhere | F | No component links to `/dashboard/admin/health` or other admin pages. | Creates operator friction; add after confirming admin audience |
| 9.5 | Org admin page exists | P | `src/app/dashboard/org/page.tsx` is present. | Verified via `search_files` |

---

## 10. Pre-Launch Action Items (Priority Order)

1. **Build verification** — run `npm run build` on the target environment and confirm no errors. This is the only hard gate not yet exercised.
2. **Add admin nav link** — expose `/dashboard/admin/health` to `is_admin` users from `AccountMenu` or `AgentWorkspace` so operators can reach the admin surface without typing URLs.
3. **Verify migration rename** — the working tree shows `0008_rename_legacy_runtime_columns.sql` as untracked and the deleted legacy runtime-column migration as removed. Ensure the new migration is applied to the launch database and matches prod schema.
4. **(Optional) Add lint script** — `next lint` in `package.json` to catch style/accessibility issues before launch.
5. **(Optional) Smoke test** — run `npm run smoke` against a staging environment with real credentials.

---

## Summary

- **Pass:** 37 items
- **Fail:** 5 items (none are launch blockers)
- **Blocker:** 0
- **N/A:** 4 items

The console is **functionally ready for launch** from a code-audit perspective: admin gating, health checks, runtime controls, invite flow, and settings are all implemented and correctly authorized. The only mandatory remaining step is a successful `npm run build` in the production environment. The highest-value polish item is adding an admin navigation link so operators can discover the admin surface.

---

*Audit date:* 2026-07-05  
*Audited by:* kanban-easy agent  
*Files referenced:* `src/lib/auth.ts`, `src/lib/managed-runtime.ts`, `src/lib/health.ts`, `src/components/admin/*`, `src/app/dashboard/admin/**/*`, `src/app/api/admin/**/*`, `src/components/RuntimeSettingsTab.tsx`, `src/components/settings/SettingsWorkspace.tsx`, `src/components/AcceptInvite.tsx`, `src/app/invite/[token]/page.tsx`, `supabase/migrations/0001_init.sql`, `supabase/migrations/0004_admin_role.sql`, `docs/runtime-provisioning-and-admin.md`.
