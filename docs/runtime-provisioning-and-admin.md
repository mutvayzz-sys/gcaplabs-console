# Console Runtime Provisioning & Admin Model

Internal reference for the `gcaplabs-console` runtime lifecycle and authorization model. The source of truth is `src/lib/managed-runtime.ts` and `src/lib/auth.ts`.

## 1. Self-service runtime provisioning

`getCurrentManagedRuntime()` is the single entry point. Every BFF route or server action that needs the caller's runtime calls it, so provisioning is **lazy and 1:1**.

Flow:

1. Resolve current user via `requireUser()`.
2. Fetch `profiles` row for `id, email, display_name, runtime_id, beta_approved`.
3. Check `beta_approved` first. If false, throw `403 not_approved` **before** looking at or creating any runtime. This means a user whose approval was later revoked can no longer use their runtime even though it still exists upstream.
4. If `runtime_id` exists, fetch the live instance from the Runtime Provider, refresh `runtime_status` and `runtime_name` in the mirror, and return it.
5. If no `runtime_id`, provision one:
   - Template: `DEFAULT_TEMPLATE` from `src/config/agents.ts`.
   - User identifier: `user.id`.
   - Name: `Gcaplabs-${email}` when email is available; otherwise `"${displayName}'s Headmaster"`.
   - Metadata: `app: "headmaster-console"`, `supabase_user_id`, `email`.
   - Budget: `DEFAULT_CREDIT_MICROS` when positive.
6. Upsert the resulting `runtime_id`, `runtime_status`, `runtime_name`, `runtime_template` into `profiles`.
7. If the upsert fails, best-effort delete the just-created runtime so we don't leave orphaned instances. The original DB error is still raised.

Important: this is the only code path that creates a billed upstream instance. Every other runtime access goes through this helper.

## 2. `beta_approved` gating

`beta_approved` lives on `public.profiles` and defaults to `false`. It is checked on **every** call to `getCurrentManagedRuntime()`, not only the first one. Consequences:

- A pending user cannot chat, use files, or open agent URLs until approved.
- Revoking approval for a user with an existing runtime immediately blocks that user's access, even though the upstream instance is not deleted.
- It does **not** grant any admin powers; it only gates runtime access.

Approval/revocation is exposed in:
- `/api/admin/users` PATCH (console admins)
- `/api/org/members` PATCH (org admins, if the UI is wired to call it)
- `UsersTable`, `UserDetail`, and `OrgDetail` admin UI components.

## 3. Two separate admin axes

| Axis | Field / function | Scope | What it controls |
|---|---|---|---|
| Site console admin | `profiles.is_admin` | Whole app | `isConsoleAdmin()`, `requireConsoleAdmin()`, `requireConsoleAdminOrRedirect()`. Sees `/dashboard/admin`, lists all users, approves/revokes `beta_approved`, grants/revokes `is_admin`. |
| Organization admin | `profiles.org_role = 'admin'` plus `organization_id` | One org | `requireOrgAdmin()`, `requireOrgAdminOrRedirect()`. Manages members of their own organization only. |

These are independent. A user can be:
- a console admin without belonging to any org,
- an org admin without being a console admin,
- both, or neither.

Migration `supabase/migrations/0004_admin_role.sql` added `is_admin` precisely because earlier code incorrectly treated `beta_approved` as the admin flag.

## 4. Dev fallback

If `RUNTIME_API_KEY` (or the legacy env var) is missing and `NODE_ENV !== "production"`, `getCurrentManagedRuntime()` returns a synthetic `dev-runtime` pointing at `http://localhost:8642`. `isConsoleAdmin()` also short-circuits to `true` when Supabase is not configured, so local development is not locked out.

## 5. Edge cases

- **Approval revoked after provisioning:** `getCurrentManagedRuntime()` rejects the request before touching the live instance. The upstream runtime remains but is inaccessible to that user.
- **DB upsert fails during provisioning:** the new runtime is deleted as a best-effort rollback; the profile row stays empty, so the next call will retry provisioning.
- **No email at sign-up:** display name falls back to `"Headmaster user"`, and the runtime name uses the display-name fallback instead of `Gcaplabs-${email}`.
- **Local dev without keys:** synthetic dev runtime and dev-mode admin bypass apply.

## 6. Files to read when changing this

- `src/lib/managed-runtime.ts` — provisioning and data-plane proxy.
- `src/lib/auth.ts` — `requireUser`, `requireConsoleAdmin`, `requireOrgAdmin`, `isConsoleAdmin`.
- `src/app/api/admin/users/route.ts` — console admin user management.
- `src/app/api/org/members/route.ts` — org-scoped member management.
- `supabase/migrations/0001_init.sql` and `0004_admin_role.sql` — schema.
- `src/components/admin/UsersTable.tsx`, `UserDetail.tsx`, `OrgDetail.tsx` — admin UI surfaces.
