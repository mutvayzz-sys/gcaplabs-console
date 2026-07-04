# Branding audit: agent37 / hermes references

Generated: 2026-07-04 06:20:22 local time
Repository: `C:\Users\Matve\Desktop\GCAP-Labs\gcaplabs-console`

## Scope and caveats

- Search terms: `agent37` and `hermes`, case-insensitive.
- The main contextual inventory below excludes generated/vendored directories: `.git/`, `.next/`, `.vercel/`, and `node_modules/`.
- Generated/vendored directories are still audited in Appendix A as flagged skip zones with hit counts by file. Context is omitted there because these directories are generated/vendor outputs and should not drive downstream remediation.
- `BRANDING_AUDIT.md` is excluded from reproducibility commands so re-running the audit does not self-match.
- Classification is conservative: docs/comments and obvious rendered JSX copy are split out; API/client SDK field names, env vars, DB columns, routes, imports, and type names are treated as internal identifiers.

## Summary

- Source/non-generated matching lines: **367** across **78** files.
- A. User-facing UI text: **15** matching lines
- B. Internal code identifiers: **168** matching lines
- C. Documentation and code comments: **113** matching lines
- D. Tests and fixtures: **41** matching lines
- E. Build/CI config: **30** matching lines
- Source path/name hits: **2**
- Flagged generated/vendored `node_modules/`: **208** content matches
- Flagged generated/vendored `.next/`: **3632** content matches
- Flagged generated/vendored `.git/`: **21** content matches
- Flagged generated/vendored `.vercel/`: **0** content matches

## Raw commands used

Run from repo root:

```sh
rg -n -i -C 2 --hidden --glob '!node_modules/**' --glob '!.next/**' --glob '!.git/**' --glob '!.vercel/**' --glob '!BRANDING_AUDIT.md' 'agent37|hermes' .
rg -i --count-matches --hidden --glob '!node_modules/**' --glob '!.next/**' --glob '!.git/**' --glob '!.vercel/**' --glob '!BRANDING_AUDIT.md' 'agent37|hermes' .
for d in node_modules .next .git .vercel; do [ -d "$d" ] && printf '%s: ' "$d" && rg -i --count-matches 'agent37|hermes' "$d" 2>/dev/null | awk -F: '{s+=$NF} END{print s+0}'; done
find . \( -path './node_modules' -o -path './.next' -o -path './.git' -o -path './.vercel' \) -prune -o \( -iname '*agent37*' -o -iname '*hermes*' \) -print
```

## Path / file-name hits (source only)

- `./src/lib/agent37.ts` — internal code identifier / file or folder name
- `./supabase/migrations/0002_agent37_managed_runtime.sql` — internal code identifier / file or folder name

## A. User-facing UI text — DONE

Remediation status for `t_428f49be`: **done**. The UI/component/page strings listed in this section were replaced with neutral managed-runtime wording, and the current source scan across UI/app/component/config files returns zero `agent37` / `hermes` matches outside this audit report and generated/vendor skip zones.

### `./src/app/dashboard/admin/health/page.tsx`

- Line 25 (`agent37`)
```text
  23|       <div className="grid gap-4 sm:grid-cols-2">
  24|         <PingTile label="Supabase" result={snapshot.supabase} />
> 25|         <PingTile label="Agent37 control plane" result={snapshot.agent37} />
  26|       </div>
  27| 
```

### `./src/app/dashboard/admin/users/page.tsx`

- Line 26 (`agent37`)
```text
  24|         <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
  25|         <p className="mt-1 text-sm text-muted-foreground">
> 26|           Signups don&apos;t get an Agent37 runtime until you approve them here — that&apos;s the billing gate.
  27|         </p>
  28|       </div>
```

### `./src/app/dashboard/org/page.tsx`

- Line 28 (`agent37`)
```text
  26|         <h1 className="text-2xl font-semibold tracking-tight">{org?.name ?? "Your organization"}</h1>
  27|         <p className="mt-1 text-sm text-muted-foreground">
> 28|           Manage members of your organization. Approving a member gives them their own Agent37 runtime.
  29|         </p>
  30|       </div>
```

### `./src/app/dashboard/page.tsx`

- Line 23 (`agent37`)
```text
  21|         <div>
  22|           <h1 className="text-2xl font-semibold tracking-tight">Your Agent</h1>
> 23|           <p className="mt-1 text-sm text-muted-foreground">Powered by Agent37 Cloud</p>
  24|         </div>
  25|       </div>
```

- Line 38 (`agent37`)
```text
  36|             </div>
  37|             <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
> 38|               Your managed Agent37 instance. Open it to chat, browse files, review integrations, and
  39|               inspect settings without exposing the shared Cloud API key.
  40|             </p>
```

- Line 50 (`agent37`)
```text
  48|           <div className="flex items-center gap-3">
  49|             <div className="hidden text-right text-xs text-muted-foreground sm:block">
> 50|               <div className="font-mono">{agent37Id}</div>
  51|               <div>{runtimeReady ? "Agent37 connected" : "Provisioning"}</div>
  52|             </div>
```

- Line 51 (`agent37`)
```text
  49|             <div className="hidden text-right text-xs text-muted-foreground sm:block">
  50|               <div className="font-mono">{agent37Id}</div>
> 51|               <div>{runtimeReady ? "Agent37 connected" : "Provisioning"}</div>
  52|             </div>
  53|             <Button asChild size="sm">
```

### `./src/components/AgentWorkspace.tsx`

- Line 81 (`agent37`)
```text
  79|               <div className='mt-2 flex items-center gap-2'>
  80|                 <Badge variant={statusVariant(currentAgent.live_status)}>{currentAgent.live_status ?? 'unknown'}</Badge>
> 81|                 <span className='truncate font-mono text-xs text-muted-foreground'>{currentAgent.agent37_id}</span>
  82|               </div>
  83|             </div>
```

- Line 113 (`agent37`)
```text
  111|             ) : (
  112|               <div className='flex-1 p-4 text-sm text-muted-foreground'>
> 113|                 {activeTab === 'files' && 'Browse and edit files in the Agent37 instance.'}
  114|                 {activeTab === 'integrations' && 'Connect third-party apps to this agent.'}
  115|                 {activeTab === 'settings' && 'Manage your headmaster runtime: lifecycle, shape, apps, budget.'}
```

### `./src/components/RuntimeSettingsTab.tsx`

- Line 232 (`agent37`)
```text
  230|   return (
  231|     <section className='overflow-hidden rounded-lg border text-sm'>
> 232|       <InfoRow label='Runtime ID' value={agent.agent37_id} mono />
  233|       <InfoRow label='Name' value={agent.name || 'Headmaster runtime'} />
  234|       <InfoRow label='Status' value={agent.live_status || 'unknown'} />
```

- Line 235 (`agent37, hermes`)
```text
  233|       <InfoRow label='Name' value={agent.name || 'Headmaster runtime'} />
  234|       <InfoRow label='Status' value={agent.live_status || 'unknown'} />
> 235|       <InfoRow label='Template' value={agent.template || 'agent37-hermes'} />
  236|       <InfoRow label='Shape' value={shapeLabel(agent.cpu, agent.memory) || 'custom'} />
  237|       <InfoRow
```

### `./src/components/admin/RuntimeControlPanel.tsx`

- Line 217 (`agent37`)
```text
  215|         onOpenChange={setConfirmOpen}
  216|         title="Delete this runtime?"
> 217|         description="This permanently deletes the Agent37 instance and all its data. The user can get a new one only if re-approved."
  218|         confirmText="Delete"
  219|         destructive
```

### `./src/components/admin/UserDetail.tsx`

- Line 47 (`agent37`)
```text
  45|         <Row label="Console admin">{user.is_admin ? <Badge variant="success">Admin</Badge> : <span className="text-muted-foreground">No</span>}</Row>
  46|         <Row label="Display name">{user.display_name ?? <span className="text-muted-foreground">—</span>}</Row>
> 47|         <Row label="Runtime">{user.agent37_id ? (user.agent37_status ?? "provisioned") : <span className="text-muted-foreground">none yet</span>}</Row>
  48|         <Row label="Created" last>
  49|           {new Date(user.created_at).toLocaleString()}
```

### `./src/components/admin/UsersTable.tsx`

- Line 111 (`agent37`)
```text
  109|               </span>
  110|               <span>{user.is_admin ? <Badge variant="success">Admin</Badge> : null}</span>
> 111|               <span className="truncate text-xs text-muted-foreground">{user.agent37_id ? (user.agent37_status ?? "provisioned") : "none yet"}</span>
  112|               <span className="flex flex-col gap-1">
  113|                 <Button
```

### `./src/components/org/OrgMembersTable.tsx`

- Line 57 (`agent37`)
```text
  55|                 <Badge variant={member.beta_approved ? "success" : "warning"}>{member.beta_approved ? "Approved" : "Pending"}</Badge>
  56|               </span>
> 57|               <span className="truncate text-xs text-muted-foreground">{member.agent37_id ? (member.agent37_status ?? "provisioned") : "none yet"}</span>
  58|               <span>
  59|                 <Button
```

## B. Internal code identifiers

### `./src/app/api/admin/organizations/[id]/members/route.ts`

- Line 5 (`agent37`)
```text
  3| import type { AdminProfileRow } from "@/app/api/admin/users/route";
  4| 
> 5| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,agent37_id,agent37_status,created_at";
  6| 
  7| export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
```

### `./src/app/api/admin/users/[id]/runtime/route.ts`

- Line 2 (`agent37`)
```text
  1| import { requireConsoleAdmin } from "@/lib/auth";
> 2| import { agent37 } from "@/lib/agent37";
  3| import { ApiError, handleError, json, readJson } from "@/lib/http";
  4| import type { Budget } from "@/lib/types";
```

- Line 7 (`agent37`)
```text
  5| 
  6| async function getTargetAgentId(db: Awaited<ReturnType<typeof requireConsoleAdmin>>["db"], userId: string): Promise<string> {
> 7|   const { data, error } = await db.from("profiles").select("agent37_id").eq("id", userId).maybeSingle();
  8|   if (error) throw new ApiError(500, "db_error", error.message);
  9|   if (!data?.agent37_id) throw new ApiError(404, "not_found", "This user has no runtime yet");
```

- Line 9 (`agent37`)
```text
   7|   const { data, error } = await db.from("profiles").select("agent37_id").eq("id", userId).maybeSingle();
   8|   if (error) throw new ApiError(500, "db_error", error.message);
>  9|   if (!data?.agent37_id) throw new ApiError(404, "not_found", "This user has no runtime yet");
  10|   return data.agent37_id as string;
  11| }
```

- Line 10 (`agent37`)
```text
   8|   if (error) throw new ApiError(500, "db_error", error.message);
   9|   if (!data?.agent37_id) throw new ApiError(404, "not_found", "This user has no runtime yet");
> 10|   return data.agent37_id as string;
  11| }
  12| 
```

- Line 22 (`agent37`)
```text
  20|     const agentId = await getTargetAgentId(db, id);
  21|     const [instance, budget] = await Promise.all([
> 22|       agent37.getAgent(agentId),
  23|       agent37.getBudget(agentId).catch(() => null as Budget | null),
  24|     ]);
```

- Line 23 (`agent37`)
```text
  21|     const [instance, budget] = await Promise.all([
  22|       agent37.getAgent(agentId),
> 23|       agent37.getBudget(agentId).catch(() => null as Budget | null),
  24|     ]);
  25|     return json({ instance, budget });
```

- Line 52 (`agent37`)
```text
  50|       switch (body.action) {
  51|         case "start":
> 52|           await agent37.start(agentId);
  53|           break;
  54|         case "stop":
```

- Line 55 (`agent37`)
```text
  53|           break;
  54|         case "stop":
> 55|           await agent37.stop(agentId);
  56|           break;
  57|         case "restart":
```

- Line 58 (`agent37`)
```text
  56|           break;
  57|         case "restart":
> 58|           await agent37.restart(agentId);
  59|           break;
  60|         case "update":
```

- Line 62 (`agent37`)
```text
  60|         case "update":
  61|           // "Re-pull image" in Agent37's own dashboard — updates to the template's latest image.
> 62|           await agent37.update(agentId);
  63|           break;
  64|         case "delete":
```

- Line 65 (`agent37`)
```text
  63|           break;
  64|         case "delete":
> 65|           await agent37.deleteAgent(agentId);
  66|           await db
  67|             .from("profiles")
```

- Line 68 (`agent37`)
```text
  66|           await db
  67|             .from("profiles")
> 68|             .update({ agent37_id: null, agent37_status: null, agent37_name: null, agent37_template: null })
  69|             .eq("id", id);
  70|           return json({ ok: true, deleted: true });
```

- Line 72 (`agent37`)
```text
  70|           return json({ ok: true, deleted: true });
  71|       }
> 72|       const instance = await agent37.getAgent(agentId);
  73|       await db.from("profiles").update({ agent37_status: instance.status, agent37_name: instance.name }).eq("id", id);
  74|       return json({ ok: true, instance });
```

- Line 73 (`agent37`)
```text
  71|       }
  72|       const instance = await agent37.getAgent(agentId);
> 73|       await db.from("profiles").update({ agent37_status: instance.status, agent37_name: instance.name }).eq("id", id);
  74|       return json({ ok: true, instance });
  75|     }
```

- Line 78 (`agent37`)
```text
  76| 
  77|     if (typeof body.monthly_cap_micros === "number") {
> 78|       const budget = await agent37.setBudget(agentId, { monthly_cap_micros: body.monthly_cap_micros });
  79|       return json({ ok: true, budget });
  80|     }
```

- Line 85 (`agent37`)
```text
  83|       const name = body.name.trim();
  84|       if (!name) throw new ApiError(400, "invalid_request", "name cannot be empty");
> 85|       const instance = await agent37.updateAgent(agentId, { name });
  86|       await db.from("profiles").update({ agent37_name: instance.name }).eq("id", id);
  87|       return json({ ok: true, instance });
```

- Line 86 (`agent37`)
```text
  84|       if (!name) throw new ApiError(400, "invalid_request", "name cannot be empty");
  85|       const instance = await agent37.updateAgent(agentId, { name });
> 86|       await db.from("profiles").update({ agent37_name: instance.name }).eq("id", id);
  87|       return json({ ok: true, instance });
  88|     }
```

- Line 91 (`agent37`)
```text
  89| 
  90|     if (typeof body.signed_url_port === "number") {
> 91|       const instance = await agent37.getAgent(agentId);
  92|       if (!instance.ports?.some((p) => p.port === body.signed_url_port)) {
  93|         throw new ApiError(404, "not_found", "That port is not exposed by this runtime");
```

- Line 95 (`agent37`)
```text
  93|         throw new ApiError(404, "not_found", "That port is not exposed by this runtime");
  94|       }
> 95|       return json(await agent37.signedUrl(agentId, body.signed_url_port));
  96|     }
  97| 
```

### `./src/app/api/admin/users/route.ts`

- Line 10 (`agent37`)
```text
   8|   beta_approved: boolean;
   9|   is_admin: boolean;
> 10|   agent37_id: string | null;
  11|   agent37_status: string | null;
  12|   created_at: string;
```

- Line 11 (`agent37`)
```text
   9|   is_admin: boolean;
  10|   agent37_id: string | null;
> 11|   agent37_status: string | null;
  12|   created_at: string;
  13| }
```

- Line 15 (`agent37`)
```text
  13| }
  14| 
> 15| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";
  16| const DEFAULT_PAGE_SIZE = 20;
  17| 
```

### `./src/app/api/chat/budget/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError, json, readJson } from "@/lib/http";
```

- Line 8 (`agent37`)
```text
   6|   try {
   7|     await requireUser();
>  8|     const runtime = await getCurrentAgent37Runtime();
   9|     return json(await agent37.getBudget(runtime.id));
  10|   } catch (e) {
```

- Line 9 (`agent37`)
```text
   7|     await requireUser();
   8|     const runtime = await getCurrentAgent37Runtime();
>  9|     return json(await agent37.getBudget(runtime.id));
  10|   } catch (e) {
  11|     return handleError(e);
```

- Line 22 (`agent37`)
```text
  20|       throw new ApiError(400, "invalid_request", "monthly_cap_micros must be a non-negative number");
  21|     }
> 22|     const runtime = await getCurrentAgent37Runtime();
  23|     return json(await agent37.setBudget(runtime.id, { monthly_cap_micros: Math.round(body.monthly_cap_micros) }));
  24|   } catch (e) {
```

- Line 23 (`agent37`)
```text
  21|     }
  22|     const runtime = await getCurrentAgent37Runtime();
> 23|     return json(await agent37.setBudget(runtime.id, { monthly_cap_micros: Math.round(body.monthly_cap_micros) }));
  24|   } catch (e) {
  25|     return handleError(e);
```

### `./src/app/api/chat/files/archive/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { instanceFetch } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError } from "@/lib/http";
```

### `./src/app/api/chat/files/content/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { instanceFetch } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError } from "@/lib/http";
```

### `./src/app/api/chat/files/dir/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

### `./src/app/api/chat/files/list/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

### `./src/app/api/chat/files/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

### `./src/app/api/chat/files/upload/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { instanceFetch } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError } from "@/lib/http";
```

### `./src/app/api/chat/integrations/connect/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError, json, readJson } from "@/lib/http";
```

- Line 13 (`agent37`)
```text
  11|     }
  12| 
> 13|     const runtime = await getCurrentAgent37Runtime();
  14|     const result = await agent37.connectIntegration(runtime.id, { toolkit });
  15|     return json({ redirectUrl: result.redirectUrl, connectedAccountId: result.connectedAccountId });
```

- Line 14 (`agent37`)
```text
  12| 
  13|     const runtime = await getCurrentAgent37Runtime();
> 14|     const result = await agent37.connectIntegration(runtime.id, { toolkit });
  15|     return json({ redirectUrl: result.redirectUrl, connectedAccountId: result.connectedAccountId });
  16|   } catch (e) {
```

### `./src/app/api/chat/integrations/connections/[id]/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from '@/lib/agent37';
  2| import { requireUser } from '@/lib/auth';
  3| import { handleError, json } from '@/lib/http';
```

- Line 11 (`agent37`)
```text
   9|     await requireUser();
  10|     const { id } = await params;
> 11|     const runtime = await getCurrentAgent37Runtime();
  12|     await agent37.disconnectIntegration(runtime.id, id);
  13|     return json({ ok: true });
```

- Line 12 (`agent37`)
```text
  10|     const { id } = await params;
  11|     const runtime = await getCurrentAgent37Runtime();
> 12|     await agent37.disconnectIntegration(runtime.id, id);
  13|     return json({ ok: true });
  14|   } catch (e) {
```

### `./src/app/api/chat/integrations/connections/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

- Line 8 (`agent37`)
```text
   6|   try {
   7|     await requireUser();
>  8|     const runtime = await getCurrentAgent37Runtime();
   9|     const result = await agent37.listIntegrationConnections(runtime.id);
  10|     return json({ connections: result.connections });
```

- Line 9 (`agent37`)
```text
   7|     await requireUser();
   8|     const runtime = await getCurrentAgent37Runtime();
>  9|     const result = await agent37.listIntegrationConnections(runtime.id);
  10|     return json({ connections: result.connections });
  11|   } catch (e) {
```

### `./src/app/api/chat/integrations/register-mcp/route.ts`

- Line 14 (`agent37`)
```text
  12|       throw new ApiError(400, 'invalid_request', 'toolkit is required');
  13|     }
> 14|     return json({ ok: true, registered: true, provider: 'agent37' });
  15|   } catch (e) {
  16|     return handleError(e);
```

### `./src/app/api/chat/integrations/toolkits/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from '@/lib/agent37';
  2| import { requireUser } from '@/lib/auth';
  3| import { handleError, json } from '@/lib/http';
```

- Line 14 (`agent37`)
```text
  12|     if (search && search.length < MIN_SEARCH) return json({ toolkits: [], nextCursor: null });
  13| 
> 14|     const runtime = await getCurrentAgent37Runtime();
  15|     const result = await agent37.listIntegrationToolkits(runtime.id, { search });
  16|     return json({ toolkits: result.items ?? [], nextCursor: null });
```

- Line 15 (`agent37`)
```text
  13| 
  14|     const runtime = await getCurrentAgent37Runtime();
> 15|     const result = await agent37.listIntegrationToolkits(runtime.id, { search });
  16|     return json({ toolkits: result.items ?? [], nextCursor: null });
  17|   } catch (e) {
```

### `./src/app/api/chat/models/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError } from "@/lib/http";
```

### `./src/app/api/chat/responses/[responseId]/cancel/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError } from "@/lib/http";
```

### `./src/app/api/chat/responses/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { instanceFetch } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError, readJson } from "@/lib/http";
```

### `./src/app/api/chat/runtime/resize/route.ts`

- Line 8 (`agent37`)
```text
   6| // dimension can call directly with partial input.
   7| 
>  8| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
   9| import { requireUser } from "@/lib/auth";
  10| import { ApiError, handleError, json, readJson } from "@/lib/http";
```

- Line 33 (`agent37`)
```text
  31|     }
  32| 
> 33|     const runtime = await getCurrentAgent37Runtime();
  34|     return json(
  35|       await agent37.resize(runtime.id, {
```

- Line 35 (`agent37`)
```text
  33|     const runtime = await getCurrentAgent37Runtime();
  34|     return json(
> 35|       await agent37.resize(runtime.id, {
  36|         ...(cpu != null ? { cpu } : {}),
  37|         ...(memory != null ? { memory } : {}),
```

### `./src/app/api/chat/runtime/restart/route.ts`

- Line 3 (`agent37`)
```text
  1| // POST /api/chat/runtime/restart — restart the headmaster-runtime singleton.
  2| 
> 3| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  4| import { requireUser } from "@/lib/auth";
  5| import { handleError, json } from "@/lib/http";
```

- Line 10 (`agent37`)
```text
   8|   try {
   9|     await requireUser();
> 10|     const runtime = await getCurrentAgent37Runtime();
  11|     return json(await agent37.restart(runtime.id));
  12|   } catch (e) {
```

- Line 11 (`agent37`)
```text
   9|     await requireUser();
  10|     const runtime = await getCurrentAgent37Runtime();
> 11|     return json(await agent37.restart(runtime.id));
  12|   } catch (e) {
  13|     return handleError(e);
```

### `./src/app/api/chat/runtime/route.ts`

- Line 12 (`agent37`)
```text
  10| // in lib/managed-agent.ts.
  11| 
> 12| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  13| import { requireUser } from "@/lib/auth";
  14| import { ApiError, handleError, json, readJson } from "@/lib/http";
```

- Line 35 (`agent37`)
```text
  33|     if (name.length > 120) throw new ApiError(400, "invalid_request", "name is too long");
  34| 
> 35|     const runtime = await getCurrentAgent37Runtime();
  36|     await agent37.updateAgent(runtime.id, { name });
  37|     return json({ ok: true });
```

- Line 36 (`agent37`)
```text
  34| 
  35|     const runtime = await getCurrentAgent37Runtime();
> 36|     await agent37.updateAgent(runtime.id, { name });
  37|     return json({ ok: true });
  38|   } catch (e) {
```

### `./src/app/api/chat/runtime/start/route.ts`

- Line 3 (`agent37`)
```text
  1| // POST /api/chat/runtime/start — start the headmaster-runtime singleton.
  2| 
> 3| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  4| import { requireUser } from "@/lib/auth";
  5| import { handleError, json } from "@/lib/http";
```

- Line 10 (`agent37`)
```text
   8|   try {
   9|     await requireUser();
> 10|     const runtime = await getCurrentAgent37Runtime();
  11|     return json(await agent37.start(runtime.id));
  12|   } catch (e) {
```

- Line 11 (`agent37`)
```text
   9|     await requireUser();
  10|     const runtime = await getCurrentAgent37Runtime();
> 11|     return json(await agent37.start(runtime.id));
  12|   } catch (e) {
  13|     return handleError(e);
```

### `./src/app/api/chat/runtime/stop/route.ts`

- Line 3 (`agent37`)
```text
  1| // POST /api/chat/runtime/stop — stop the headmaster-runtime singleton.
  2| 
> 3| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  4| import { requireUser } from "@/lib/auth";
  5| import { handleError, json } from "@/lib/http";
```

- Line 10 (`agent37`)
```text
   8|   try {
   9|     await requireUser();
> 10|     const runtime = await getCurrentAgent37Runtime();
  11|     return json(await agent37.stop(runtime.id));
  12|   } catch (e) {
```

- Line 11 (`agent37`)
```text
   9|     await requireUser();
  10|     const runtime = await getCurrentAgent37Runtime();
> 11|     return json(await agent37.stop(runtime.id));
  12|   } catch (e) {
  13|     return handleError(e);
```

### `./src/app/api/chat/runtime/update/route.ts`

- Line 7 (`agent37`)
```text
  5| // the catalog's image_ref has moved past what the instance is running.
  6| 
> 7| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  8| import { requireUser } from "@/lib/auth";
  9| import { handleError, json } from "@/lib/http";
```

- Line 14 (`agent37`)
```text
  12|   try {
  13|     await requireUser();
> 14|     const runtime = await getCurrentAgent37Runtime();
  15|     return json(await agent37.update(runtime.id));
  16|   } catch (e) {
```

- Line 15 (`agent37`)
```text
  13|     await requireUser();
  14|     const runtime = await getCurrentAgent37Runtime();
> 15|     return json(await agent37.update(runtime.id));
  16|   } catch (e) {
  17|     return handleError(e);
```

### `./src/app/api/chat/sessions/[sessionId]/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError, readJson } from "@/lib/http";
```

### `./src/app/api/chat/sessions/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { headmasterAgent } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError } from "@/lib/http";
```

### `./src/app/api/chat/signed-url/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { ApiError, handleError, json, readJson } from "@/lib/http";
```

- Line 18 (`agent37`)
```text
  16|     }
  17| 
> 18|     const runtime = await getCurrentAgent37Runtime();
  19|     if (!runtime.instance.ports?.some((p) => p.port === port)) {
  20|       throw new ApiError(404, "not_found", "That port is not exposed by the managed runtime");
```

- Line 22 (`agent37`)
```text
  20|       throw new ApiError(404, "not_found", "That port is not exposed by the managed runtime");
  21|     }
> 22|     return json(await agent37.signedUrl(runtime.id, port, ttlSeconds));
  23|   } catch (e) {
  24|     return handleError(e);
```

### `./src/app/api/chat/usage/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

- Line 8 (`agent37`)
```text
   6|   try {
   7|     await requireUser();
>  8|     const runtime = await getCurrentAgent37Runtime();
   9|     const month = new URL(request.url).searchParams.get("month") || undefined;
  10|     return json(await agent37.getUsage(runtime.id, month));
```

- Line 10 (`agent37`)
```text
   8|     const runtime = await getCurrentAgent37Runtime();
   9|     const month = new URL(request.url).searchParams.get("month") || undefined;
> 10|     return json(await agent37.getUsage(runtime.id, month));
  11|   } catch (e) {
  12|     return handleError(e);
```

### `./src/app/api/desktop/provision/current/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

- Line 14 (`agent37`)
```text
  12|   try {
  13|     const { user } = await requireUser();
> 14|     const runtime = await getCurrentAgent37Runtime();
  15|     const origin = new URL(request.url).origin;
  16|     const bearer = bearerFrom(request);
```

- Line 19 (`agent37`)
```text
  17|     return json({
  18|       mode: "headmaster_remote",
> 19|       backend: "agent37",
  20|       user: { id: user.id, username: user.email ?? user.id, role: "user" },
  21|       capabilities: ["chat", "files", "integrations", "model_selection"],
```

### `./src/app/api/desktop/provision/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { getCurrentAgent37Runtime } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError, json } from "@/lib/http";
```

- Line 14 (`agent37`)
```text
  12|   try {
  13|     const { user } = await requireUser();
> 14|     const runtime = await getCurrentAgent37Runtime();
  15|     const origin = new URL(request.url).origin;
  16|     const bearer = bearerFrom(request);
```

- Line 20 (`agent37`)
```text
  18|     return json({
  19|       mode: "headmaster_remote",
> 20|       backend: "agent37",
  21|       user: {
  22|         id: user.id,
```

### `./src/app/api/org/members/route.ts`

- Line 5 (`agent37`)
```text
  3| import type { AdminProfileRow } from "@/app/api/admin/users/route";
  4| 
> 5| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,agent37_id,agent37_status,created_at";
  6| 
  7| export async function GET() {
```

### `./src/app/api/v1/[...path]/route.ts`

- Line 1 (`agent37`)
```text
> 1| import { instanceFetch } from "@/lib/agent37";
  2| import { requireUser } from "@/lib/auth";
  3| import { handleError } from "@/lib/http";
```

### `./src/app/dashboard/admin/organizations/[id]/page.tsx`

- Line 10 (`agent37`)
```text
   8| export const dynamic = "force-dynamic";
   9| 
> 10| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,org_role,agent37_id,agent37_status,created_at";
  11| 
  12| export default async function AdminOrgDetailPage({ params }: { params: Promise<{ id: string }> }) {
```

### `./src/app/dashboard/admin/users/[id]/page.tsx`

- Line 10 (`agent37`)
```text
   8| export const dynamic = "force-dynamic";
   9| 
> 10| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";
  11| 
  12| export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
```

### `./src/app/dashboard/admin/users/page.tsx`

- Line 10 (`agent37`)
```text
   8| 
   9| const PAGE_SIZE = 20;
> 10| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";
  11| 
  12| export default async function UsersPage() {
```

### `./src/app/dashboard/agents/[agentId]/[[...tab]]/page.tsx`

- Line 3 (`agent37`)
```text
  1| import { notFound, redirect } from "next/navigation";
  2| import { AgentWorkspace } from "@/components/AgentWorkspace";
> 3| import { Agent37Error } from "@/lib/agent37";
  4| import { getSession, isConsoleAdmin, isOrgAdmin } from "@/lib/auth";
  5| import { MANAGED_AGENT_ID, getManagedAgent } from "@/lib/managed-agent";
```

- Line 40 (`agent37`)
```text
  38|     );
  39|   } catch (e) {
> 40|     if (e instanceof Agent37Error && e.code === "not_approved") {
  41|       return (
  42|         <div className="mx-auto max-w-md space-y-3 py-16 text-center">
```

### `./src/app/dashboard/org/page.tsx`

- Line 10 (`agent37`)
```text
   8| export const dynamic = "force-dynamic";
   9| 
> 10| const PROFILE_COLUMNS = "id,email,display_name,beta_approved,is_admin,agent37_id,agent37_status,created_at";
  11| 
  12| export default async function OrgPage() {
```

### `./src/app/dashboard/page.tsx`

- Line 15 (`agent37`)
```text
  13| export default async function DashboardPage() {
  14|   await requireConsoleAdminOrRedirect(agentTabPath(MANAGED_AGENT_ID, "chat"));
> 15|   const { agent, instance, agent37Id } = await getManagedAgent();
  16|   const runtimeReady = instance.status === "running";
  17| 
```

- Line 29 (`agent37`)
```text
  27|       <section className="overflow-hidden rounded-lg border bg-card">
  28|         <Link
> 29|           href={agentTabPath(agent.agent37_id, "chat")}
  30|           className="grid gap-4 p-4 transition-colors hover:bg-secondary/45 md:grid-cols-[1fr_auto]"
  31|         >
```

### `./src/components/AcceptInvite.tsx`

- Line 9 (`agent37`)
```text
   7| import { Button } from "@/components/ui/button";
   8| 
>  9| const STORAGE_KEY = "agent37wl_workspace";
  10| 
  11| export function AcceptInvite({
```

### `./src/components/AgentWorkspace.tsx`

- Line 49 (`agent37`)
```text
  47|     else params.delete('session');
  48|     const qs = params.toString();
> 49|     const next = `${agentTabPath(currentAgent.agent37_id, 'chat')}${qs ? `?${qs}` : ''}`;
  50|     if (mode === 'replace') router.replace(next);
  51|     else router.push(next);
```

- Line 65 (`agent37`)
```text
  63|   return (
  64|     <ChatProvider
> 65|       agentId={currentAgent.agent37_id}
  66|       agents={[currentAgent]}
  67|       urlSessionId={sessionId}
```

- Line 93 (`agent37`)
```text
  91|                 <Link
  92|                   key={tab.id}
> 93|                   href={agentTabPath(currentAgent.agent37_id, tab.id)}
  94|                   className={cn(
  95|                     'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
```

- Line 131 (`agent37`)
```text
  129|         <main className='min-w-0 flex-1'>
  130|           {activeTab === 'chat' && <ChatView />}
> 131|           {activeTab === 'files' && <FilesTab agentId={currentAgent.agent37_id} />}
  132|           {activeTab === 'integrations' && <RuntimeIntegrations />}
  133|           {activeTab === 'settings' && <RuntimeSettingsTab agent={currentAgent} onChanged={refreshRuntime} />}
```

### `./src/components/RuntimeSettingsTab.tsx`

- Line 100 (`agent37`)
```text
   98|           {agent.template && <Badge variant='outline'>{agent.template}</Badge>}
   99|           {agent.past_due && <Badge variant='warning'>past due</Badge>}
> 100|           <span className='truncate font-mono text-xs text-muted-foreground' title={agent.agent37_id}>
  101|             {agent.agent37_id}
  102|           </span>
```

- Line 101 (`agent37`)
```text
   99|           {agent.past_due && <Badge variant='warning'>past due</Badge>}
  100|           <span className='truncate font-mono text-xs text-muted-foreground' title={agent.agent37_id}>
> 101|             {agent.agent37_id}
  102|           </span>
  103|         </div>
```

### `./src/components/WorkspaceProvider.tsx`

- Line 7 (`agent37`)
```text
  5| import { apiFetch } from "@/lib/api";
  6| 
> 7| const STORAGE_KEY = "agent37wl_workspace";
  8| 
  9| interface WorkspaceContextValue {
```

### `./src/components/admin/UserDetail.tsx`

- Line 66 (`agent37`)
```text
  64|       </div>
  65| 
> 66|       {user.agent37_id ? (
  67|         <RuntimeControlPanel
  68|           userId={user.id}
```

- Line 69 (`agent37`)
```text
  67|         <RuntimeControlPanel
  68|           userId={user.id}
> 69|           onDeleted={() => setUser((prev) => ({ ...prev, agent37_id: null, agent37_status: null }))}
  70|         />
  71|       ) : null}
```

### `./src/components/chat/ChatView.tsx`

- Line 73 (`agent37`)
```text
  71|   const headerTitle = activeTitle || (activeSessionId ? "Chat" : "New chat");
  72|   const agentName = useMemo(() => {
> 73|     const a = agents.find((x) => x.agent37_id === agentId);
  74|     return a?.name?.trim() || agentId;
  75|   }, [agents, agentId]);
```

### `./src/config/agents.ts`

- Line 32 (`agent37, hermes`)
```text
  30| // across re-provision.
  31| export const DEFAULT_AGENT = {
> 32|   template: "agent37-hermes",
  33|   cpu: 2,
  34|   memory: 4,
```

- Line 52 (`hermes`)
```text
  50| export const AGENT_TYPES: AgentTypeOption[] = [
  51|   {
> 52|     id: "hermes",
  53|     template: "agent37-hermes",
  54|     label: "Hermes",
```

- Line 53 (`agent37, hermes`)
```text
  51|   {
  52|     id: "hermes",
> 53|     template: "agent37-hermes",
  54|     label: "Hermes",
  55|     description: "General agent: chat, browsing, code, files.",
```

- Line 54 (`hermes`)
```text
  52|     id: "hermes",
  53|     template: "agent37-hermes",
> 54|     label: "Hermes",
  55|     description: "General agent: chat, browsing, code, files.",
  56|     recommended: true,
```

- Line 60 (`agent37`)
```text
  58|   {
  59|     id: "openclaw",
> 60|     template: "agent37-openclaw",
  61|     label: "OpenClaw",
  62|     description: "General agent: headless browser, code, files.",
```

### `./src/lib/agent37.ts`

- Line 20 (`agent37`)
```text
  18| // The Hosting API base (control plane). A code constant, not an env var — there's no
  19| // per-deployment reason to change it (point it elsewhere only for local API work, by editing here).
> 20| const HOSTING_BASE = "https://api.agent37.com";
  21| 
  22| // The per-instance Agents API (data plane — chat /v1/responses, /v1/models, /v1/sessions,
```

- Line 24 (`agent37`)
```text
  22| // The per-instance Agents API (data plane — chat /v1/responses, /v1/models, /v1/sessions,
  23| // /v1/files) is served on the instance host, not the control-plane base above.
> 24| const INSTANCE_DOMAIN = "agent37.app";
  25| const DEFAULT_TEMPLATE = process.env.AGENT37_TEMPLATE || "agent37-hermes";
  26| const DEFAULT_AGENT_NAME = process.env.AGENT37_DEFAULT_AGENT_NAME || "Headmaster runtime";
```

- Line 25 (`agent37, hermes`)
```text
  23| // /v1/files) is served on the instance host, not the control-plane base above.
  24| const INSTANCE_DOMAIN = "agent37.app";
> 25| const DEFAULT_TEMPLATE = process.env.AGENT37_TEMPLATE || "agent37-hermes";
  26| const DEFAULT_AGENT_NAME = process.env.AGENT37_DEFAULT_AGENT_NAME || "Headmaster runtime";
  27| const DEFAULT_CREDIT_MICROS = Number(process.env.AGENT37_INITIAL_CREDIT_MICROS || "1000000");
```

- Line 26 (`agent37`)
```text
  24| const INSTANCE_DOMAIN = "agent37.app";
  25| const DEFAULT_TEMPLATE = process.env.AGENT37_TEMPLATE || "agent37-hermes";
> 26| const DEFAULT_AGENT_NAME = process.env.AGENT37_DEFAULT_AGENT_NAME || "Headmaster runtime";
  27| const DEFAULT_CREDIT_MICROS = Number(process.env.AGENT37_INITIAL_CREDIT_MICROS || "1000000");
  28| 
```

- Line 27 (`agent37`)
```text
  25| const DEFAULT_TEMPLATE = process.env.AGENT37_TEMPLATE || "agent37-hermes";
  26| const DEFAULT_AGENT_NAME = process.env.AGENT37_DEFAULT_AGENT_NAME || "Headmaster runtime";
> 27| const DEFAULT_CREDIT_MICROS = Number(process.env.AGENT37_INITIAL_CREDIT_MICROS || "1000000");
  28| 
  29| export function instanceBaseUrl(id: string): string {
```

- Line 33 (`agent37`)
```text
  31| }
  32| 
> 33| export class Agent37Error extends Error {
  34|   status: number;
  35|   code: string;
```

- Line 39 (`agent37`)
```text
  37|   constructor(status: number, code: string, message: string) {
  38|     super(message);
> 39|     this.name = "Agent37Error";
  40|     this.status = status;
  41|     this.code = code;
```

- Line 45 (`agent37`)
```text
  43| }
  44| 
> 45| async function parseAgent37<T>(res: Response, augment402 = false): Promise<T> {
  46|   const text = await res.text();
  47|   let data: unknown = undefined;
```

- Line 66 (`agent37`)
```text
  64|     if (augment402 && res.status === 402) {
  65|       // Almost always an unfunded wallet at create/start time — point the operator at billing.
> 66|       message = `${message} (Agent37 payment required — fund your wallet under Cloud → Billing in the dashboard, then retry.)`;
  67|     }
  68|     throw new Agent37Error(res.status, err.code || "error", message);
```

- Line 68 (`agent37`)
```text
  66|       message = `${message} (Agent37 payment required — fund your wallet under Cloud → Billing in the dashboard, then retry.)`;
  67|     }
> 68|     throw new Agent37Error(res.status, err.code || "error", message);
  69|   }
  70| 
```

- Line 75 (`agent37`)
```text
  73| 
  74| function apiKey(): string {
> 75|   const key = process.env.AGENT37_API_KEY;
  76|   if (!key) throw new Agent37Error(500, "config_error", "AGENT37_API_KEY is not set on the server");
  77|   return key;
```

- Line 76 (`agent37`)
```text
  74| function apiKey(): string {
  75|   const key = process.env.AGENT37_API_KEY;
> 76|   if (!key) throw new Agent37Error(500, "config_error", "AGENT37_API_KEY is not set on the server");
  77|   return key;
  78| }
```

- Line 90 (`agent37`)
```text
  88|     cache: "no-store",
  89|   });
> 90|   return parseAgent37<T>(res, true);
  91| }
  92| 
```

- Line 113 (`agent37`)
```text
  111|     headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  112|   });
> 113|   return parseAgent37<T>(res);
  114| }
  115| 
```

- Line 131 (`agent37`)
```text
  129| }
  130| 
> 131| export const agent37 = {
  132|   listAgents: () => hostingCall<{ data: Agent[] }>("/instances"),
  133|   getAgent: (id: string) => hostingCall<Agent>(`/instances/${id}`),
```

- Line 226 (`agent37`)
```text
  224| }
  225| 
> 226| export async function getCurrentAgent37Runtime(): Promise<ManagedRuntime> {
  227|   if (!process.env.AGENT37_API_KEY && process.env.NODE_ENV !== "production") {
  228|     const instance = devAgent();
```

- Line 227 (`agent37`)
```text
  225| 
  226| export async function getCurrentAgent37Runtime(): Promise<ManagedRuntime> {
> 227|   if (!process.env.AGENT37_API_KEY && process.env.NODE_ENV !== "production") {
  228|     const instance = devAgent();
  229|     return { id: instance.id, instance };
```

- Line 235 (`agent37`)
```text
  233|   const { data: profile, error: profileError } = await db
  234|     .from("profiles")
> 235|     .select("id,email,display_name,agent37_id,beta_approved")
  236|     .eq("id", user.id)
  237|     .maybeSingle();
```

- Line 238 (`agent37`)
```text
  236|     .eq("id", user.id)
  237|     .maybeSingle();
> 238|   if (profileError) throw new Agent37Error(500, "db_error", profileError.message);
  239| 
  240|   // beta_approved gates ALL runtime access, not just first-time creation — a profile that already
```

- Line 244 (`agent37`)
```text
  242|   // instance already exists. Checked before either branch below runs.
  243|   if ((profile as { beta_approved?: boolean } | null)?.beta_approved !== true) {
> 244|     throw new Agent37Error(403, "not_approved", "Your account is pending approval before a runtime can be used.");
  245|   }
  246| 
```

- Line 247 (`agent37`)
```text
  245|   }
  246| 
> 247|   let agentId = (profile as { agent37_id?: string | null } | null)?.agent37_id ?? null;
  248|   if (agentId) {
  249|     const instance = await agent37.getAgent(agentId);
```

- Line 249 (`agent37`)
```text
  247|   let agentId = (profile as { agent37_id?: string | null } | null)?.agent37_id ?? null;
  248|   if (agentId) {
> 249|     const instance = await agent37.getAgent(agentId);
  250|     await db.from("profiles").update({ agent37_status: instance.status, agent37_name: instance.name }).eq("id", user.id);
  251|     return { id: agentId, instance };
```

- Line 250 (`agent37`)
```text
  248|   if (agentId) {
  249|     const instance = await agent37.getAgent(agentId);
> 250|     await db.from("profiles").update({ agent37_status: instance.status, agent37_name: instance.name }).eq("id", user.id);
  251|     return { id: agentId, instance };
  252|   }
```

- Line 262 (`agent37`)
```text
  260|     "Headmaster user";
  261| 
> 262|   const instance = await agent37.createAgent({
  263|     template: DEFAULT_TEMPLATE,
  264|     user: user.id,
```

- Line 275 (`agent37`)
```text
  273|     email,
  274|     display_name: displayName,
> 275|     agent37_id: agentId,
  276|     agent37_status: instance.status,
  277|     agent37_name: instance.name,
```

- Line 276 (`agent37`)
```text
  274|     display_name: displayName,
  275|     agent37_id: agentId,
> 276|     agent37_status: instance.status,
  277|     agent37_name: instance.name,
  278|     agent37_template: instance.template,
```

- Line 277 (`agent37`)
```text
  275|     agent37_id: agentId,
  276|     agent37_status: instance.status,
> 277|     agent37_name: instance.name,
  278|     agent37_template: instance.template,
  279|   };
```

- Line 278 (`agent37`)
```text
  276|     agent37_status: instance.status,
  277|     agent37_name: instance.name,
> 278|     agent37_template: instance.template,
  279|   };
  280|   const { error: upsertError } = await db.from("profiles").upsert(update, { onConflict: "id" });
```

- Line 283 (`agent37`)
```text
  281|   if (upsertError) {
  282|     try {
> 283|       await agent37.deleteAgent(agentId);
  284|     } catch {
  285|       // Best effort rollback only. The original DB error is the one that matters.
```

- Line 287 (`agent37`)
```text
  285|       // Best effort rollback only. The original DB error is the one that matters.
  286|     }
> 287|     throw new Agent37Error(500, "db_error", upsertError.message);
  288|   }
  289| 
```

- Line 294 (`agent37`)
```text
  292| 
  293| export async function instanceFetch(path: string, init?: RequestInit): Promise<Response> {
> 294|   const runtime = await getCurrentAgent37Runtime();
  295|   if (runtime.id === "dev-runtime" && !process.env.AGENT37_API_KEY) {
  296|     const body = init?.body instanceof ReadableStream ? await new Response(init.body).arrayBuffer() : init?.body;
```

- Line 295 (`agent37`)
```text
  293| export async function instanceFetch(path: string, init?: RequestInit): Promise<Response> {
  294|   const runtime = await getCurrentAgent37Runtime();
> 295|   if (runtime.id === "dev-runtime" && !process.env.AGENT37_API_KEY) {
  296|     const body = init?.body instanceof ReadableStream ? await new Response(init.body).arrayBuffer() : init?.body;
  297|     return fetch(`http://localhost:8642${path}`, {
```

- Line 308 (`agent37`)
```text
  306| 
  307| async function currentInstanceCall<T>(path: string, init?: RequestInit): Promise<T> {
> 308|   const runtime = await getCurrentAgent37Runtime();
  309|   return instanceCall<T>(runtime.id, path, init);
  310| }
```

### `./src/lib/auth.ts`

- Line 85 (`agent37`)
```text
  83| }
  84| 
> 85| export async function getAgentRow(db: DB, agent37Id: string): Promise<AgentRow> {
  86|   const { data } = await db.from("agents").select("*").eq("agent37_id", agent37Id).maybeSingle();
  87|   if (!data) throw new ApiError(404, "not_found", "Agent not found");
```

- Line 86 (`agent37`)
```text
  84| 
  85| export async function getAgentRow(db: DB, agent37Id: string): Promise<AgentRow> {
> 86|   const { data } = await db.from("agents").select("*").eq("agent37_id", agent37Id).maybeSingle();
  87|   if (!data) throw new ApiError(404, "not_found", "Agent not found");
  88|   return data as AgentRow;
```

- Line 95 (`agent37`)
```text
  93| // for mutations. Returns the privileged client, user, and row so the handler can get on with its
  94| // work (and run its DB writes through `db`).
> 95| export async function requireAgentAccess(agent37Id: string, access: "member" | "admin" = "member") {
  96|   const { db, user } = await requireUser();
  97|   const row = await getAgentRow(db, agent37Id);
```

- Line 97 (`agent37`)
```text
  95| export async function requireAgentAccess(agent37Id: string, access: "member" | "admin" = "member") {
  96|   const { db, user } = await requireUser();
> 97|   const row = await getAgentRow(db, agent37Id);
  98|   if (access === "admin") await requireAdmin(db, row.workspace_id, user.id);
  99|   else await requireMember(db, row.workspace_id, user.id);
```

### `./src/lib/health.ts`

- Line 2 (`agent37`)
```text
  1| import "server-only";
> 2| import { agent37 } from "@/lib/agent37";
  3| import type { DB } from "@/lib/auth";
  4| 
```

- Line 24 (`agent37`)
```text
  22|   checked_at: string;
  23|   supabase: PingResult;
> 24|   agent37: PingResult;
  25|   runtime_status_counts: Record<string, number>;
  26| }
```

- Line 31 (`agent37`)
```text
  29| // writing to it for that; not built until the point-in-time version proves useful.
  30| export async function getHealthSnapshot(db: DB): Promise<HealthSnapshot> {
> 31|   const [supabasePing, agent37Ping, statusRows] = await Promise.all([
  32|     timed(async () => {
  33|       const { error } = await db.from("profiles").select("id").limit(1);
```

- Line 36 (`agent37`)
```text
  34|       if (error) throw new Error(error.message);
  35|     }),
> 36|     timed(() => agent37.listTemplates()),
  37|     db.from("profiles").select("agent37_status"),
  38|   ]);
```

- Line 37 (`agent37`)
```text
  35|     }),
  36|     timed(() => agent37.listTemplates()),
> 37|     db.from("profiles").select("agent37_status"),
  38|   ]);
  39| 
```

- Line 42 (`agent37`)
```text
  40|   const statusCounts: Record<string, number> = {};
  41|   for (const row of statusRows.data ?? []) {
> 42|     const key = (row.agent37_status as string | null) ?? "none";
  43|     statusCounts[key] = (statusCounts[key] ?? 0) + 1;
  44|   }
```

- Line 49 (`agent37`)
```text
  47|     checked_at: new Date().toISOString(),
  48|     supabase: supabasePing,
> 49|     agent37: agent37Ping,
  50|     runtime_status_counts: statusCounts,
  51|   };
```

### `./src/lib/managed-agent.ts`

- Line 2 (`agent37`)
```text
  1| import "server-only";
> 2| import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
  3| import type { Agent, MergedAgent, Template } from "@/lib/types";
  4| 
```

- Line 24 (`agent37`)
```text
  22|   const createdAt = instance.created ? new Date(instance.created * 1000).toISOString() : new Date().toISOString();
  23|   return {
> 24|     agent37_id: MANAGED_AGENT_ID,
  25|     workspace_id: "agent37",
  26|     name: instance.name || "Headmaster runtime",
```

- Line 25 (`agent37`)
```text
  23|   return {
  24|     agent37_id: MANAGED_AGENT_ID,
> 25|     workspace_id: "agent37",
  26|     name: instance.name || "Headmaster runtime",
  27|     status: instance.status,
```

- Line 42 (`agent37`)
```text
  40| }
  41| 
> 42| export async function getManagedAgent(): Promise<{ agent: MergedAgent; instance: Agent; agent37Id: string }> {
  43|   // Runs concurrently with the runtime lookup instead of after it — listTemplates() doesn't
  44|   // depend on the instance, only the comparison below does. Falls back to [] on any
```

- Line 48 (`agent37`)
```text
  46|   // runtime is still usable; we just don't nag about an update we can't confirm.
  47|   const [runtime, templates] = await Promise.all([
> 48|     getCurrentAgent37Runtime(),
  49|     agent37
  50|       .listTemplates()
```

- Line 49 (`agent37`)
```text
  47|   const [runtime, templates] = await Promise.all([
  48|     getCurrentAgent37Runtime(),
> 49|     agent37
  50|       .listTemplates()
  51|       .then(({ data }) => data)
```

- Line 55 (`agent37`)
```text
  53|   ]);
  54|   const updateAvailable = updateAvailableFor(runtime.instance, templates);
> 55|   return { agent: agentFromInstance(runtime.instance, updateAvailable), instance: runtime.instance, agent37Id: runtime.id };
  56| }
```

### `./src/lib/types.ts`

- Line 43 (`agent37`)
```text
  41| 
  42| export interface AgentRow {
> 43|   agent37_id: string;
  44|   workspace_id: string;
  45|   name: string | null;
```

### `./supabase/migrations/0002_agent37_managed_runtime.sql`

- Line 5 (`agent37`)
```text
  3| 
  4| alter table public.profiles
> 5|   add column if not exists agent37_id text,
  6|   add column if not exists agent37_status text,
  7|   add column if not exists agent37_name text,
```

- Line 6 (`agent37`)
```text
  4| alter table public.profiles
  5|   add column if not exists agent37_id text,
> 6|   add column if not exists agent37_status text,
  7|   add column if not exists agent37_name text,
  8|   add column if not exists agent37_template text,
```

- Line 7 (`agent37`)
```text
  5|   add column if not exists agent37_id text,
  6|   add column if not exists agent37_status text,
> 7|   add column if not exists agent37_name text,
  8|   add column if not exists agent37_template text,
  9|   add column if not exists agent37_created_at timestamptz default now();
```

- Line 8 (`agent37`)
```text
   6|   add column if not exists agent37_status text,
   7|   add column if not exists agent37_name text,
>  8|   add column if not exists agent37_template text,
   9|   add column if not exists agent37_created_at timestamptz default now();
  10| 
```

- Line 9 (`agent37`)
```text
   7|   add column if not exists agent37_name text,
   8|   add column if not exists agent37_template text,
>  9|   add column if not exists agent37_created_at timestamptz default now();
  10| 
  11| create unique index if not exists profiles_agent37_id_idx
```

- Line 11 (`agent37`)
```text
   9|   add column if not exists agent37_created_at timestamptz default now();
  10| 
> 11| create unique index if not exists profiles_agent37_id_idx
  12|   on public.profiles (agent37_id)
  13|   where agent37_id is not null;
```

- Line 12 (`agent37`)
```text
  10| 
  11| create unique index if not exists profiles_agent37_id_idx
> 12|   on public.profiles (agent37_id)
  13|   where agent37_id is not null;
```

- Line 13 (`agent37`)
```text
  11| create unique index if not exists profiles_agent37_id_idx
  12|   on public.profiles (agent37_id)
> 13|   where agent37_id is not null;
```

## C. Documentation and code comments

### `./AGENTS.md`

- Line 3 (`agent37`)
```text
  1| # AGENTS.md
  2| 
> 3| Guidance for AI coding agents (and humans) working in the **Agent37 Starter Kit**.
  4| `CLAUDE.md` imports this file via `@AGENTS.md`, so this is the single source of
  5| truth — edit here, not there.
```

- Line 11 (`agent37`)
```text
   9| Setting this up from a fresh clone? Follow **[`SETUP.md`](SETUP.md)** — the complete runbook
  10| (it's what the README tells adopters to hand you). Two login-gated secrets are human-supplied:
> 11| `AGENT37_API_KEY` (plus a **funded** Agent37 wallet) and `SUPABASE_ACCESS_TOKEN`;
  12| `npm run setup` does the rest. Never print or commit the `sk_live_` key.
  13| 
```

- Line 17 (`agent37`)
```text
  15| 
  16| A full-stack starter for building your own agent app, built entirely on top of the
> 17| public **[Agent37](https://www.agent37.com) B2B Agents API**: email + password auth
  18| (open signup, no verification), a multi-agent fleet, and — for each agent — native
  19| in-dashboard **Chat**, a **Files** browser, **Integrations** (Composio), and a
```

- Line 23 (`agent37`)
```text
  21| end users sign up, get workspaces, invite teammates, and create / manage agents.
  22| 
> 23| Everything this app can do is a **subset of the Agent37 `/v1` API** — control plane
  24| *and* data plane. This repo is a *client* of that API — it does not implement agent
  25| infrastructure itself. So **the API docs, not this code, are the authority on what an
```

- Line 35 (`agent37`)
```text
  33| fetch directly:
  34| 
> 35| - **<https://www.agent37.com/docs/llms.txt>** — concise index of every doc page.
  36|   *Start here* to find the right page.
  37| - **<https://www.agent37.com/docs/llms-full.txt>** — the entire documentation
```

- Line 37 (`agent37`)
```text
  35| - **<https://www.agent37.com/docs/llms.txt>** — concise index of every doc page.
  36|   *Start here* to find the right page.
> 37| - **<https://www.agent37.com/docs/llms-full.txt>** — the entire documentation
  38|   inlined into one file. Use for deep reference.
  39| - Human-browsable docs: **<https://www.agent37.com/docs>**
```

- Line 39 (`agent37`)
```text
  37| - **<https://www.agent37.com/docs/llms-full.txt>** — the entire documentation
  38|   inlined into one file. Use for deep reference.
> 39| - Human-browsable docs: **<https://www.agent37.com/docs>**
  40|   (append `.md` to any page URL to get raw markdown.)
  41| 
```

- Line 48 (`agent37`)
```text
  46| **data plane** powers the native Chat and Files tabs.
  47| 
> 48| **Control plane — `https://api.agent37.com/v1/*`** (the `sk_live_` key this app holds):
  49| 
  50| | Page | Covers | Used here |
```

- Line 52 (`agent37`)
```text
  50| | Page | Covers | Used here |
  51| |---|---|---|
> 52| | [Core concepts](https://www.agent37.com/docs/agents-api/concepts) | the model, auth, the two planes | read first |
  53| | [Instances](https://www.agent37.com/docs/agents-api/instances) | create / list / get / start / stop / restart / update / resize / delete | ✅ |
  54| | [Instance URLs](https://www.agent37.com/docs/agents-api/urls) | short-lived signed URLs to open an agent's ports | ✅ |
```

- Line 53 (`agent37`)
```text
  51| |---|---|---|
  52| | [Core concepts](https://www.agent37.com/docs/agents-api/concepts) | the model, auth, the two planes | read first |
> 53| | [Instances](https://www.agent37.com/docs/agents-api/instances) | create / list / get / start / stop / restart / update / resize / delete | ✅ |
  54| | [Instance URLs](https://www.agent37.com/docs/agents-api/urls) | short-lived signed URLs to open an agent's ports | ✅ |
  55| | [Templates](https://www.agent37.com/docs/agents-api/templates) | the agent images you can provision | ✅ |
```

- Line 54 (`agent37`)
```text
  52| | [Core concepts](https://www.agent37.com/docs/agents-api/concepts) | the model, auth, the two planes | read first |
  53| | [Instances](https://www.agent37.com/docs/agents-api/instances) | create / list / get / start / stop / restart / update / resize / delete | ✅ |
> 54| | [Instance URLs](https://www.agent37.com/docs/agents-api/urls) | short-lived signed URLs to open an agent's ports | ✅ |
  55| | [Templates](https://www.agent37.com/docs/agents-api/templates) | the agent images you can provision | ✅ |
  56| | [Managed services & budgets](https://www.agent37.com/docs/agents-api/budgets) | per-agent managed-spend cap | ✅ |
```

- Line 55 (`agent37`)
```text
  53| | [Instances](https://www.agent37.com/docs/agents-api/instances) | create / list / get / start / stop / restart / update / resize / delete | ✅ |
  54| | [Instance URLs](https://www.agent37.com/docs/agents-api/urls) | short-lived signed URLs to open an agent's ports | ✅ |
> 55| | [Templates](https://www.agent37.com/docs/agents-api/templates) | the agent images you can provision | ✅ |
  56| | [Managed services & budgets](https://www.agent37.com/docs/agents-api/budgets) | per-agent managed-spend cap | ✅ |
  57| | [Billing](https://www.agent37.com/docs/agents-api/billing) | wallet, compute prepay, usage | ✅ (usage) |
```

- Line 56 (`agent37`)
```text
  54| | [Instance URLs](https://www.agent37.com/docs/agents-api/urls) | short-lived signed URLs to open an agent's ports | ✅ |
  55| | [Templates](https://www.agent37.com/docs/agents-api/templates) | the agent images you can provision | ✅ |
> 56| | [Managed services & budgets](https://www.agent37.com/docs/agents-api/budgets) | per-agent managed-spend cap | ✅ |
  57| | [Billing](https://www.agent37.com/docs/agents-api/billing) | wallet, compute prepay, usage | ✅ (usage) |
  58| | [Run commands](https://www.agent37.com/docs/agents-api/exec) | exec a command inside an instance | available, not used |
```

- Line 57 (`agent37`)
```text
  55| | [Templates](https://www.agent37.com/docs/agents-api/templates) | the agent images you can provision | ✅ |
  56| | [Managed services & budgets](https://www.agent37.com/docs/agents-api/budgets) | per-agent managed-spend cap | ✅ |
> 57| | [Billing](https://www.agent37.com/docs/agents-api/billing) | wallet, compute prepay, usage | ✅ (usage) |
  58| | [Run commands](https://www.agent37.com/docs/agents-api/exec) | exec a command inside an instance | available, not used |
  59| | [Errors](https://www.agent37.com/docs/agents-api/errors) | machine-readable error codes | ✅ (mapped in `Agent37Error`) |
```

- Line 58 (`agent37`)
```text
  56| | [Managed services & budgets](https://www.agent37.com/docs/agents-api/budgets) | per-agent managed-spend cap | ✅ |
  57| | [Billing](https://www.agent37.com/docs/agents-api/billing) | wallet, compute prepay, usage | ✅ (usage) |
> 58| | [Run commands](https://www.agent37.com/docs/agents-api/exec) | exec a command inside an instance | available, not used |
  59| | [Errors](https://www.agent37.com/docs/agents-api/errors) | machine-readable error codes | ✅ (mapped in `Agent37Error`) |
  60| 
```

- Line 59 (`agent37`)
```text
  57| | [Billing](https://www.agent37.com/docs/agents-api/billing) | wallet, compute prepay, usage | ✅ (usage) |
  58| | [Run commands](https://www.agent37.com/docs/agents-api/exec) | exec a command inside an instance | available, not used |
> 59| | [Errors](https://www.agent37.com/docs/agents-api/errors) | machine-readable error codes | ✅ (mapped in `Agent37Error`) |
  60| 
  61| The **Integrations** tab is also control plane: it manages a per-agent Composio
```

- Line 64 (`agent37`)
```text
  62| entity through `/instances/{id}/integrations/*` (toolkits / connect / connections).
  63| 
> 64| **Data plane — `https://{instanceId}.agent37.app/v1/*`** (talk to one agent's
  65| gateway). The native **Chat** and **Files** tabs call these endpoints directly
  66| (through this app's BFF). The signed-URL "open in new tab" shortcuts still exist
```

- Line 71 (`agent37`)
```text
  69| | Page | Covers | Used here |
  70| |---|---|---|
> 71| | [Send a message](https://www.agent37.com/docs/agents-api/chat) | post a message, get a response (`/v1/responses`) | ✅ (Chat) |
  72| | [Streaming](https://www.agent37.com/docs/agents-api/streaming) | stream responses (SSE) | ✅ (Chat) |
  73| | [Sessions & models](https://www.agent37.com/docs/agents-api/sessions) | conversation state, model selection | ✅ (Chat) |
```

- Line 72 (`agent37`)
```text
  70| |---|---|---|
  71| | [Send a message](https://www.agent37.com/docs/agents-api/chat) | post a message, get a response (`/v1/responses`) | ✅ (Chat) |
> 72| | [Streaming](https://www.agent37.com/docs/agents-api/streaming) | stream responses (SSE) | ✅ (Chat) |
  73| | [Sessions & models](https://www.agent37.com/docs/agents-api/sessions) | conversation state, model selection | ✅ (Chat) |
  74| | [Files](https://www.agent37.com/docs/agents-api/files) | list / read / write / archive files | ✅ (Files) |
```

- Line 73 (`agent37`)
```text
  71| | [Send a message](https://www.agent37.com/docs/agents-api/chat) | post a message, get a response (`/v1/responses`) | ✅ (Chat) |
  72| | [Streaming](https://www.agent37.com/docs/agents-api/streaming) | stream responses (SSE) | ✅ (Chat) |
> 73| | [Sessions & models](https://www.agent37.com/docs/agents-api/sessions) | conversation state, model selection | ✅ (Chat) |
  74| | [Files](https://www.agent37.com/docs/agents-api/files) | list / read / write / archive files | ✅ (Files) |
  75| | [Build a chat app](https://www.agent37.com/docs/agents-api/chat-app) | end-to-end guide for a chat UI | reference |
```

- Line 74 (`agent37`)
```text
  72| | [Streaming](https://www.agent37.com/docs/agents-api/streaming) | stream responses (SSE) | ✅ (Chat) |
  73| | [Sessions & models](https://www.agent37.com/docs/agents-api/sessions) | conversation state, model selection | ✅ (Chat) |
> 74| | [Files](https://www.agent37.com/docs/agents-api/files) | list / read / write / archive files | ✅ (Files) |
  75| | [Build a chat app](https://www.agent37.com/docs/agents-api/chat-app) | end-to-end guide for a chat UI | reference |
  76| 
```

- Line 75 (`agent37`)
```text
  73| | [Sessions & models](https://www.agent37.com/docs/agents-api/sessions) | conversation state, model selection | ✅ (Chat) |
  74| | [Files](https://www.agent37.com/docs/agents-api/files) | list / read / write / archive files | ✅ (Files) |
> 75| | [Build a chat app](https://www.agent37.com/docs/agents-api/chat-app) | end-to-end guide for a chat UI | reference |
  76| 
  77| So: **what's possible** = the whole map above, and this template now exercises most
```

- Line 85 (`agent37`)
```text
  83| 
  84| ```
> 85| Browser ─▶ Next.js (this app) ─▶ control plane  https://api.agent37.com/v1   (instances, integrations)
  86|    │            │              └▶ data plane     https://{instance}.agent37.app/v1   (chat, files)
  87|    │            │                                 (one server-side sk_live_ key, both planes)
```

- Line 86 (`agent37`)
```text
  84| ```
  85| Browser ─▶ Next.js (this app) ─▶ control plane  https://api.agent37.com/v1   (instances, integrations)
> 86|    │            │              └▶ data plane     https://{instance}.agent37.app/v1   (chat, files)
  87|    │            │                                 (one server-side sk_live_ key, both planes)
  88|    │            │
```

- Line 92 (`agent37`)
```text
  90|    │                          users, workspaces, members, agent mirror
  91|    │
> 92|    └──────────────▶ https://{instance}.agent37.app  (agent's own UI, via short-lived signed URLs)
  93| ```
  94| 
```

- Line 96 (`agent37`)
```text
  94| 
  95| - **One key, many app workspaces.** A single `sk_live_` key, server-side only, is
> 96|   shared by the whole app. Every agent is created under your one Agent37 workspace
  97|   and tagged `metadata.app_workspace`; a Supabase mirror table is the source of
  98|   truth for which app-workspace owns which agent.
```

- Line 107 (`agent37`)
```text
  105|   policies stay enabled as a backstop but are dormant (clients can't reach the tables). Neither
  106|   the `sk_live_` key nor the service-role key ever reaches the browser.
> 107| - **`src/lib/agent37.ts` is the only thing that calls the Agent37 API**
  108|   (`server-only`) — both the control-plane base and each instance's data-plane host.
  109|   Internal `src/app/api/**` routes are this app's BFF: the browser calls them, they
```

- Line 110 (`agent37`)
```text
  108|   (`server-only`) — both the control-plane base and each instance's data-plane host.
  109|   Internal `src/app/api/**` routes are this app's BFF: the browser calls them, they
> 110|   authenticate + check workspace ownership in TS, then call `agent37.ts` and/or the DB via the
  111|   service-role client. The browser never calls the upstream API or the DB directly.
  112| - **The UI is a fleet + a per-agent workspace.** The `(fleet)` route group is the
```

- Line 126 (`agent37`)
```text
  124| | Path | What |
  125| |---|---|
> 126| | `src/lib/agent37.ts` | The Agent37 `/v1` client — the single egress to both planes |
  127| | `src/app/api/**` | This app's own API routes (BFF); enforce auth + ownership |
  128| | `src/app/api/agents/[id]/{chat,files}/**` | Data-plane BFF: native Chat + Files proxied to the instance |
```

- Line 133 (`hermes`)
```text
  131| | `src/config/agents.ts` | `SHAPE_PRESETS`, `DEFAULT_AGENT`, the `AGENT_TYPES` catalog, and `PORT_LABELS` (labels only — ports come from the live instance) |
  132| | `src/config/branding.ts` | `appName` / `logoUrl` code constants (branding lives here, not in env) |
> 133| | `template/` | Opt-in custom-image scaffold (Dockerfile `FROM` Hermes + `release.sh`); unused unless you build your own image |
  134| | `src/lib/types.ts` | App + upstream `/v1` types |
  135| | `supabase/migrations/0001_init.sql` | Schema, RLS policies (dormant backstop), SECURITY DEFINER RPCs; grants tables to the service role only (clients have no direct DB access) |
```

- Line 155 (`hermes`)
```text
  153| ## Custom agent image (opt-in)
  154| 
> 155| By default no Docker or GHCR is involved — the catalog ships Hermes and OpenClaw,
  156| which run on Agent37's stock images. To offer **your own** image, use the top-level
  157| `template/` folder: edit its `Dockerfile` (it starts `FROM` Hermes), then publish +
```

- Line 156 (`agent37`)
```text
  154| 
  155| By default no Docker or GHCR is involved — the catalog ships Hermes and OpenClaw,
> 156| which run on Agent37's stock images. To offer **your own** image, use the top-level
  157| `template/` folder: edit its `Dockerfile` (it starts `FROM` Hermes), then publish +
  158| register the image with `npm run release:agent` (`template/release.sh`). Finally,
```

- Line 157 (`hermes`)
```text
  155| By default no Docker or GHCR is involved — the catalog ships Hermes and OpenClaw,
  156| which run on Agent37's stock images. To offer **your own** image, use the top-level
> 157| `template/` folder: edit its `Dockerfile` (it starts `FROM` Hermes), then publish +
  158| register the image with `npm run release:agent` (`template/release.sh`). Finally,
  159| uncomment the `custom` entry in `src/config/agents.ts`, matching its `template` to
```

- Line 169 (`agent37`)
```text
  167|   `/v1` API can reject anything your account's tier disallows, regardless of what
  168|   `src/config` lists. Check the docs before assuming a capability exists.
> 169| - **Never expose `AGENT37_API_KEY` to the browser.** It stays server-side; all
  170|   agent calls go through `src/app/api/**` → `src/lib/agent37.ts`.
  171| - **Payments are intentionally excluded.** Add Stripe (or anything) yourself when
```

- Line 170 (`agent37`)
```text
  168|   `src/config` lists. Check the docs before assuming a capability exists.
  169| - **Never expose `AGENT37_API_KEY` to the browser.** It stays server-side; all
> 170|   agent calls go through `src/app/api/**` → `src/lib/agent37.ts`.
  171| - **Payments are intentionally excluded.** Add Stripe (or anything) yourself when
  172|   you're ready to charge your own customers — the create route (`src/app/api/agents/route.ts`)
```

### `./LICENSE`

- Line 3 (`agent37`)
```text
  1| MIT License
  2| 
> 3| Copyright (c) 2026 Agent37
  4| 
  5| Permission is hereby granted, free of charge, to any person obtaining a copy
```

### `./README.md`

- Line 1 (`agent37`)
```text
> 1| # Agent37 Starter Kit
  2| 
  3| A full-stack starter for building your own agent app on the [Agent37](https://www.agent37.com) Cloud API — auth, chat, files, integrations, and fleet management, with your choice of Hermes or OpenClaw (or your own image). Fork it, rebrand it, ship it.
```

- Line 3 (`agent37, hermes`)
```text
  1| # Agent37 Starter Kit
  2| 
> 3| A full-stack starter for building your own agent app on the [Agent37](https://www.agent37.com) Cloud API — auth, chat, files, integrations, and fleet management, with your choice of Hermes or OpenClaw (or your own image). Fork it, rebrand it, ship it.
  4| 
  5| <p align="center">
```

- Line 6 (`agent37`)
```text
  4| 
  5| <p align="center">
> 6|   <img src="screenshots/demo.gif" alt="Demo of the Agent37 Starter Kit dashboard and agent workspace" width="100%" />
  7| </p>
  8| 
```

- Line 13 (`agent37`)
```text
  11| **1. Get two keys** (both behind a login, so only you can fetch them):
  12| 
> 13| - `AGENT37_API_KEY` — Agent37 dashboard → **Cloud → API keys**, then **fund the wallet** (Cloud → Billing).
  14| - `SUPABASE_ACCESS_TOKEN` — [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens).
  15| 
```

### `./SETUP.md`

- Line 5 (`agent37`)
```text
  3| This app runs on two secrets you supply (both behind a login, so a human must fetch them):
  4| 
> 5| - **`AGENT37_API_KEY`** (`sk_live_…`) — Agent37 dashboard → **Cloud → API keys**. Then
  6|   **fund the wallet** (Cloud → Billing): creating an agent costs real money, and an empty
  7|   wallet returns a `402` at create time.
```

- Line 27 (`agent37`)
```text
  25| 2. **Ask me for the two secrets.** You can't fetch them (both are behind a login). Print where
  26|    to get each, then stop and wait for my reply:
> 27|    - `AGENT37_API_KEY` (starts with `sk_live_`): Agent37 dashboard → Cloud → API keys
  28|      (<https://www.agent37.com/dashboard/cloud/api-keys>). Creating agents also needs a
  29|      **funded** wallet (Cloud → Billing), or it later fails with a `402`.
```

- Line 28 (`agent37`)
```text
  26|    to get each, then stop and wait for my reply:
  27|    - `AGENT37_API_KEY` (starts with `sk_live_`): Agent37 dashboard → Cloud → API keys
> 28|      (<https://www.agent37.com/dashboard/cloud/api-keys>). Creating agents also needs a
  29|      **funded** wallet (Cloud → Billing), or it later fails with a `402`.
  30|    - `SUPABASE_ACCESS_TOKEN` (starts with `sbp_`): <https://supabase.com/dashboard/account/tokens>.
```

- Line 82 (`agent37`)
```text
  80| 1. Run `npm run setup` locally (creates Supabase + schema + auth config).
  81| 2. Push your fork to GitHub, then in Vercel: **Add New → Project → Import Git Repository**.
> 82| 3. Add **only these** env vars: `AGENT37_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`,
  83|    `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only — the runtime needs
  84|    it for all DB access), `NEXT_PUBLIC_SITE_URL` (your prod URL).
```

### `./assetgen.md`

- Line 1 (`agent37`)
```text
> 1| # assetgen — gcaplabs-console (Agent37 Starter Kit)
  2| 
  3| Scope: GCAP-original media only. This repo has exactly one media asset.
```

- Line 7 (`agent37`)
```text
  5| | Asset | Path | Description | Regen prompt |
  6| |---|---|---|---|
> 7| | Demo recording | `screenshots/demo.gif` | Screen recording used in the README hero, showing the Agent37 Starter Kit dashboard and an agent workspace/chat in action. | **Not an image-gen candidate** — this is a real product screen capture, not an illustration. To "regenerate": re-record a fresh screen capture of the current dashboard + agent workspace (e.g. with a tool like ScreenToGif/Kap), 1280×800+, under ~15s, looping, showing: (1) the fleet/dashboard view, (2) opening a chat with an agent, (3) a file or integration action completing. Keep it silent/no-cursor-clutter and trim to the essential loop. |
  8| 
  9| ## Notes
```

### `./scripts/smoke.mjs`

- Line 3 (`agent37`)
```text
  1| #!/usr/bin/env node
  2| // Opt-in, manual smoke test — NOT run in CI and NOT free. It spends a few cents of
> 3| // real managed/compute money against the wallet behind AGENT37_API_KEY: it creates a
  4| // real instance, waits for it, sends ONE chat turn over the data plane, and deletes it.
  5| //
```

- Line 7 (`agent37`)
```text
  5| //
  6| // Run it before shipping a change that touches the create/chat/delete path:
> 7| //   AGENT37_API_KEY=sk_live_... node scripts/smoke.mjs
  8| // (reads AGENT37_API_KEY from the environment or .env.local). Pass --keep to skip the
  9| // delete and leave the instance running for manual poking.
```

- Line 8 (`agent37`)
```text
   6| // Run it before shipping a change that touches the create/chat/delete path:
   7| //   AGENT37_API_KEY=sk_live_... node scripts/smoke.mjs
>  8| // (reads AGENT37_API_KEY from the environment or .env.local). Pass --keep to skip the
   9| // delete and leave the instance running for manual poking.
  10| //
```

- Line 11 (`agent37`)
```text
   9| // delete and leave the instance running for manual poking.
  10| //
> 11| // This talks straight to the Agent37 API (control plane + the instance's data plane),
  12| // the same surfaces src/lib/agent37.ts wraps — so a green run proves the API contract
  13| // the app depends on still holds end to end.
```

- Line 12 (`agent37`)
```text
  10| //
  11| // This talks straight to the Agent37 API (control plane + the instance's data plane),
> 12| // the same surfaces src/lib/agent37.ts wraps — so a green run proves the API contract
  13| // the app depends on still holds end to end.
  14| 
```

### `./src/app/api/admin/users/[id]/runtime/route.ts`

- Line 31 (`agent37`)
```text
  29| }
  30| 
> 31| // Mirrors the actions available in Agent37's own dashboard "..." menu for an instance
  32| // (Restart / Stop / Delete / Re-pull image), plus rename (the pencil icon there).
  33| const ACTIONS = ["start", "stop", "restart", "delete", "update"] as const;
```

- Line 61 (`agent37`)
```text
  59|           break;
  60|         case "update":
> 61|           // "Re-pull image" in Agent37's own dashboard — updates to the template's latest image.
  62|           await agent37.update(agentId);
  63|           break;
```

### `./src/app/api/chat/_helpers.ts`

- Line 15 (`agent37`)
```text
  13| }
  14| 
> 15| // Turn an Agent37 instance error body into a member-safe message. Errors come back nested
  16| // ({"error":{...}}) or flat; a non-JSON body (e.g. a 502 HTML page) is logged server-side under
  17| // `context` and collapsed to `fallback` so we never echo internals. Consumes the Response body —
```

### `./src/app/api/chat/integrations/register-mcp/route.ts`

- Line 4 (`agent37`)
```text
  2| import { ApiError, handleError, json, readJson } from '@/lib/http';
  3| 
> 4| // Agent37 integrations are attached to the instance by the Hosting API. There is no
  5| // separate Headmaster-side MCP registration step anymore; this route remains as a
  6| // harmless compatibility no-op for the client callback flow after OAuth redirects.
```

### `./src/app/api/chat/responses/route.ts`

- Line 16 (`agent37`)
```text
  14| 
  15| // Run a chat turn and stream the agent's reply back as Server-Sent Events.
> 16| // Each user has one Agent37 instance,
  17| // so we don't need an [id] param — instanceFetch resolves the user's runtime.
  18| export async function POST(request: Request) {
```

### `./src/app/api/chat/runtime/route.ts`

- Line 6 (`agent37`)
```text
  4| // Mirrors the upstream starter-kit's /api/agents/[id] surface (GET + PATCH name),
  5| // adapted to the singleton model: there is no [id] in the URL; the runtime is
> 6| // resolved server-side from the logged-in user's profile (profiles.agent37_id).
  7| //
  8| // update_available is computed by comparing the live instance's image_ref against
```

### `./src/app/api/v1/[...path]/route.ts`

- Line 19 (`agent37`)
```text
  17|     headers.delete("host");
  18|     headers.delete("content-length");
> 19|     // The upstream Agent37 key is added server-side by instanceFetch. Client Bearer
  20|     // tokens authenticate to this BFF only and never leave the console.
  21|     headers.delete("authorization");
```

### `./src/components/RuntimeSettingsTab.tsx`

- Line 27 (`agent37`)
```text
  25| //   - no agentId prop; all BFF calls hit /api/chat/runtime/*
  26| //   - no Delete action (singleton is not deletable from the UI; it auto-recreates
> 27| //     on next dashboard visit if the underlying Agent37 instance is gone)
  28| //
  29| // Sections in render order: header (name + lifecycle + status), Update banner
```

- Line 31 (`hermes`)
```text
  29| // Sections in render order: header (name + lifecycle + status), Update banner
  30| // (when applicable), Shape picker, Budget, Info rows. Opening the runtime's own
> 31| // signed-port apps (Hermes dashboard/terminal/files) is admin-only now — see
  32| // RuntimeControlPanel.tsx under the admin User Detail page — never exposed here.
  33| export function RuntimeSettingsTab({
```

### `./src/components/chat/ChatProvider.tsx`

- Line 51 (`agent37`)
```text
  49| 
  50| // Holds the thread rail + the active selection, shared by the sidebar rail and the conversation
> 51| // pane. The rail comes straight from the Agent37 Agents API (GET /v1/sessions) — there is no local
  52| // sessions table. Each row's label (server-side title, else the first-message preview) is resolved
  53| // by the sessions route, so the rail paints in one fetch with no per-session hydration.
```

### `./src/components/chat/types.ts`

- Line 41 (`agent37`)
```text
  39| 
  40| // Case-insensitive provider equality. The gateway reports default_provider with different casing
> 41| // than the per-model provider (e.g. "custom:Agent37" vs "custom:agent37"), so matching a model to
  42| // the default — or to the (model, provider) selection — must compare loosely.
  43| export function sameProvider(a: string | null | undefined, b: string | null | undefined): boolean {
```

- Line 64 (`agent37`)
```text
  62| 
  63| // Human-friendly provider names for the model menu's section headers. The metered gateway
> 64| // reports `custom:agent37`; BYO / multi-model agents report bare slugs like `anthropic` / `openai`.
  65| const PROVIDER_LABELS: Record<string, string> = {
  66|   anthropic: "Anthropic",
```

- Line 83 (`agent37`)
```text
  81| 
  82| // Pretty section label for a provider id: drop any `custom:` prefix and title-case the rest
> 83| // (so `custom:agent37` -> "Agent37"); known providers keep their canonical casing (OpenAI, xAI…).
  84| export function prettyProvider(provider: string): string {
  85|   const key = provider.replace(/^custom:/i, "").toLowerCase();
```

- Line 101 (`agent37`)
```text
   99| }
  100| 
> 101| // Agent37's reasoning_effort enum (POST /v1/responses). null => use the agent's default.
  102| export const REASONING_EFFORTS = ["none", "minimal", "low", "medium", "high", "xhigh"] as const;
  103| export type ReasoningEffort = (typeof REASONING_EFFORTS)[number];
```

- Line 128 (`agent37`)
```text
  126| }
  127| 
> 128| // One conversation in the Chat tab's thread rail. The Agent37 Agents API (GET /v1/sessions) is
  129| // the source of truth for the list + ordering; the sessions route resolves `title` as the
  130| // server-side title (when set, e.g. via rename) or the session's first-message preview.
```

### `./src/components/files/types.ts`

- Line 2 (`agent37`)
```text
  1| // Shared client-side helpers for the Files tab. The wire shapes (FileEntry / FileListResponse)
> 2| // live in lib/types.ts so the server (lib/agent37.ts) and the browser agree on one definition.
  3| import type { FileEntry } from '@/lib/types';
  4| 
```

### `./src/config/agents.ts`

- Line 1 (`agent37`)
```text
> 1| // Catalog of Agent37 runtime templates and shape presets the user can pick from
  2| // the runtime settings page. Modeled on the upstream starter-kit's config/agents.ts
  3| // (single-managed-agent fork: there is no create-agent screen; the runtime is
```

- Line 8 (`agent37`)
```text
   6| //
   7| // Why this lives in src/config: it is the operator's curation of which templates
>  8| // and shapes the Headmaster brand exposes, NOT a dynamic list from Agent37. If
   9| // you ship a new template to the Agent37 platform, add it here.
  10| 
```

- Line 9 (`agent37`)
```text
   7| // Why this lives in src/config: it is the operator's curation of which templates
   8| // and shapes the Headmaster brand exposes, NOT a dynamic list from Agent37. If
>  9| // you ship a new template to the Agent37 platform, add it here.
  10| 
  11| export interface Shape {
```

- Line 19 (`agent37`)
```text
  17| }
  18| 
> 19| // Sized to match the Agent37 hosting presets; the labels are the only Headmaster
  20| // brand surface here. "Pro" is the recommended default for the headmaster-runtime.
  21| export const SHAPE_PRESETS: Shape[] = [
```

- Line 48 (`agent37`)
```text
  46| 
  47| // The agent types offered as reconfigure choices. To add a custom image,
> 48| // publish + register it on Agent37 (template/release.sh) and uncomment the
  49| // "custom" entry below, matching its `template` to TEMPLATE_NAME.
  50| export const AGENT_TYPES: AgentTypeOption[] = [
```

- Line 76 (`hermes`)
```text
  74| // Labels for the "open in new tab" buttons. Ports come from the live instance
  75| // (instance.ports), never this map — this only prettifies known port numbers;
> 76| // any unrecognized port falls back to "Port {n}". Covers stock Hermes/OpenClaw
  77| // and the remapped ports a custom workspace template uses.
  78| export const PORT_LABELS: Record<number, string> = {
```

### `./src/lib/agent37.ts`

- Line 96 (`agent37`)
```text
  94| // raw Response so callers can stream SSE, upload bytes, or stream a download — things the JSON
  95| // helper can't. A ReadableStream request body is buffered to an ArrayBuffer first so undici sends a
> 96| // Content-Length instead of chunked transfer encoding; the Agent37 instance proxy drops chunked
  97| // upload bodies on file writes.
  98| export async function instanceFetchForId(id: string, path: string, init?: RequestInit): Promise<Response> {
```

- Line 241 (`agent37`)
```text
  239| 
  240|   // beta_approved gates ALL runtime access, not just first-time creation — a profile that already
> 241|   // has an agent37_id (e.g. approved once, then revoked) must not keep working just because the
  242|   // instance already exists. Checked before either branch below runs.
  243|   if ((profile as { beta_approved?: boolean } | null)?.beta_approved !== true) {
```

- Line 254 (`agent37`)
```text
  252|   }
  253| 
> 254|   // No runtime yet — this is the one place that spends money (agent37.createAgent provisions a
  255|   // real, billed instance).
  256|   const email = (user as { email?: string | null }).email ?? (profile as { email?: string | null } | null)?.email ?? null;
```

### `./src/lib/auth.ts`

- Line 105 (`agent37`)
```text
  103| // Gates the console's own admin surfaces (Agents list, Members, Settings) — distinct from
  104| // per-agent capabilities, and distinct from `beta_approved` (which only gates whether a
> 105| // signup gets its own Agent37 runtime). Source of truth is `profiles.is_admin`. Mirrors
  106| // getSession()'s dev-mode shortcut so local dev without Supabase configured isn't locked out.
  107| export const isConsoleAdmin = cache(async function isConsoleAdmin(userId: string): Promise<boolean> {
```

### `./src/lib/integration-catalog.ts`

- Line 26 (`agent37`)
```text
  24| }
  25| 
> 26| // Static first-paint catalog for the Browse tab. Live Agent37/Composio search still runs for typed
  27| // queries (the full 1,000+ app catalog), but the default grid should not wait on a remote request.
  28| // Forkers can curate this list freely — it is purely the "popular apps" starting set.
```

### `./src/lib/managed-agent.ts`

- Line 5 (`agent37`)
```text
  3| import type { Agent, MergedAgent, Template } from "@/lib/types";
  4| 
> 5| // Stable UI alias for the user's single managed Agent37 instance. The actual
  6| // Agent37 instance id is kept server-side in profiles.agent37_id so the browser
  7| // never needs the shared AGENT37_API_KEY or any direct upstream access.
```

- Line 6 (`agent37`)
```text
  4| 
  5| // Stable UI alias for the user's single managed Agent37 instance. The actual
> 6| // Agent37 instance id is kept server-side in profiles.agent37_id so the browser
  7| // never needs the shared AGENT37_API_KEY or any direct upstream access.
  8| export const MANAGED_AGENT_ID = "headmaster-runtime";
```

- Line 7 (`agent37`)
```text
  5| // Stable UI alias for the user's single managed Agent37 instance. The actual
  6| // Agent37 instance id is kept server-side in profiles.agent37_id so the browser
> 7| // never needs the shared AGENT37_API_KEY or any direct upstream access.
  8| export const MANAGED_AGENT_ID = "headmaster-runtime";
  9| 
```

### `./src/lib/types.ts`

- Line 152 (`agent37`)
```text
  150| }
  151| 
> 152| // ---- Agent37 Agents API (data plane: per-instance web chat) ----
  153| 
  154| // One model the instance's agent can run (GET /v1/models -> data[]). Current Hermes builds report
```

- Line 154 (`hermes`)
```text
  152| // ---- Agent37 Agents API (data plane: per-instance web chat) ----
  153| 
> 154| // One model the instance's agent can run (GET /v1/models -> data[]). Current Hermes builds report
  155| // the provider slug as `owned_by` ("anthropic"); the older metered build used `provider`
  156| // ("custom:agent37"). Read `owned_by ?? provider` so the switcher groups correctly on either.
```

- Line 156 (`agent37`)
```text
  154| // One model the instance's agent can run (GET /v1/models -> data[]). Current Hermes builds report
  155| // the provider slug as `owned_by` ("anthropic"); the older metered build used `provider`
> 156| // ("custom:agent37"). Read `owned_by ?? provider` so the switcher groups correctly on either.
  157| export interface AgentModel {
  158|   id: string;
```

- Line 187 (`hermes`)
```text
  185| }
  186| 
> 187| // One conversation in the instance's session list (GET /v1/sessions -> data[]). Current Hermes
  188| // builds carry a server-side `title` (settable via PATCH /v1/sessions/{id}) plus a `preview` of
  189| // the first message and `last_active`/`started_at` timestamps. The rail label is resolved in the
```

- Line 204 (`agent37`)
```text
  202| }
  203| 
> 204| // ---- Agent37 Agents API file browser (data plane: per-instance /v1/files) ----
  205| 
  206| // One entry in a directory listing, also returned by every write (PUT/PATCH/POST dir). The
```

### `./supabase/migrations/0001_init.sql`

- Line 3 (`agent37`)
```text
  1| -- Headmaster Console — Supabase init migration
  2| --
> 3| -- In the Headmaster beta model, each user has ONE managed Agent37 Cloud
  4| -- instance. The fleet/workspace/membership/agents tables from the original
  5| -- starter-kit are kept but commented out — we may need them when we add
```

- Line 8 (`agent37`)
```text
   6| -- multi-agent or team features later.
   7| --
>  8| -- Supabase Auth manages user identity; Agent37 Cloud manages the runtime.
   9| -- All table access is server-side (service-role key); direct client
  10| -- table access is revoked.
```

- Line 73 (`agent37`)
```text
  71| --
  72| -- create table if not exists public.agents (
> 73| --   agent37_id   text primary key,
  74| --   workspace_id uuid not null references public.workspaces (id) on delete cascade,
  75| --   name         text,
```

### `./supabase/migrations/0002_agent37_managed_runtime.sql`

- Line 1 (`agent37`)
```text
> 1| -- Headmaster Console Agent37 cutover
  2| -- Store the one Agent37 Cloud instance assigned to each Supabase user.
  3| 
```

- Line 2 (`agent37`)
```text
  1| -- Headmaster Console Agent37 cutover
> 2| -- Store the one Agent37 Cloud instance assigned to each Supabase user.
  3| 
  4| alter table public.profiles
```

### `./supabase/migrations/0006_organizations.sql`

- Line 3 (`agent37`)
```text
  1| -- Organizations ("school" model): a user belongs to at most one organization, with an org_role
  2| -- of 'admin' or 'member' scoping org-level oversight. Agent ownership is untouched — every user
> 3| -- still has exactly one personal Agent37 agent (profiles.agent37_id), organizations are purely a
  4| -- grouping + org-scoped-admin layer on top, distinct from profiles.is_admin (site-wide admin).
  5| create table if not exists public.organizations (
```

### `./template/Dockerfile`

- Line 1 (`agent37`)
```text
> 1| # OPTIONAL — your own Agent37 agent image (the opt-in "bake it into the image" path).
  2| #
  3| # DORMANT by default. The Starter Kit ships running on the built-in system
```

- Line 4 (`agent37, hermes`)
```text
  2| #
  3| # DORMANT by default. The Starter Kit ships running on the built-in system
> 4| # templates (`agent37-hermes` / `agent37-openclaw`) — zero Docker, zero GHCR. You
  5| # only need this folder if you want to bake something into your OWN image (a system
  6| # package, a CLI, a skill, custom config). Most forks never touch it.
```

- Line 8 (`hermes`)
```text
   6| # package, a CLI, a skill, custom config). Most forks never touch it.
   7| #
>  8| # This is the SIMPLE path: fork the FULL Hermes image, so the managed model + the
   9| # gateway (chat API) work out of the box — you just add your bits on top. If you'd
  10| # rather bring your OWN model (point the agent at your own LLM via a tiny proxy),
```

- Line 19 (`hermes`)
```text
  17| #   - bake into /usr/local or /opt, never /home/node or /home/linuxbrew
  18| #     (both are persistent volumes that mask anything baked there at runtime)
> 19| #   - keep the base ENTRYPOINT (it starts Hermes + the gateway that serves chat)
  20| #   - install as root, end as USER node
  21| #
```

- Line 22 (`agent37`)
```text
  20| #   - install as root, end as USER node
  21| #
> 22| # Publish: the pushed image must be PUBLIC on GHCR (Agent37 pulls it anonymously).
  23| # After editing this file, run `npm run release:agent` (build + push + register the
  24| # workspace template). See template/release.sh for the exact steps.
```

- Line 26 (`hermes`)
```text
  24| # workspace template). See template/release.sh for the exact steps.
  25| 
> 26| # The base Hermes tag is injected at build time — release.sh resolves the newest
  27| # date tag from GHCR and passes --build-arg HERMES_TAG=<tag>, so each release pins a
  28| # concrete, immutable tag. The :latest default is only a convenience for ad-hoc
```

- Line 27 (`hermes`)
```text
  25| 
  26| # The base Hermes tag is injected at build time — release.sh resolves the newest
> 27| # date tag from GHCR and passes --build-arg HERMES_TAG=<tag>, so each release pins a
  28| # concrete, immutable tag. The :latest default is only a convenience for ad-hoc
  29| # `docker build` runs without the arg; override with --build-arg HERMES_TAG=YYYY.MM.DD[x].
```

- Line 29 (`hermes`)
```text
  27| # date tag from GHCR and passes --build-arg HERMES_TAG=<tag>, so each release pins a
  28| # concrete, immutable tag. The :latest default is only a convenience for ad-hoc
> 29| # `docker build` runs without the arg; override with --build-arg HERMES_TAG=YYYY.MM.DD[x].
  30| ARG HERMES_TAG=latest
  31| FROM ghcr.io/agent37-platform/hermes:${HERMES_TAG}
```

- Line 38 (`hermes`)
```text
  36| # Install as root, into /usr/local or /opt (NOT /home — it's a masked volume).
  37| # A skill is a folder with a SKILL.md baked into the default-skills dir; the base
> 38| # entrypoint copies it into ~/.hermes/skills on boot.
  39| #
  40| # Example — install a system package:
```

- Line 46 (`agent37`)
```text
  44| #
  45| # Example — bake a skill:
> 46| # COPY my-skill /usr/local/share/agent37/default-skills/my-skill
  47| # ---------------------------------------------------------------------------------
  48| 
```

- Line 49 (`hermes`)
```text
  47| # ---------------------------------------------------------------------------------
  48| 
> 49| # Re-expose Hermes' surfaces on NON-reserved ports. The control plane rejects custom
  50| # templates that declare the reserved 3737/7681/8080/9119 (and exposes only the ports
  51| # the template declares), so we remap. The stock entrypoint honors these env overrides.
```

- Line 62 (`hermes`)
```text
  60| EXPOSE 3738 7682 9120 8081
  61| 
> 62| # Keep the base ENTRYPOINT (do NOT override it — it starts Hermes + the gateway).
  63| USER node
```

### `./template/release.sh`

- Line 2 (`agent37`)
```text
  1| #!/usr/bin/env bash
> 2| # Build, push, and register your custom Agent37 workspace template — run via
  3| # `npm run release:agent`. Reads AGENT37_API_KEY from .env.local.
  4| #
```

- Line 3 (`agent37`)
```text
  1| #!/usr/bin/env bash
  2| # Build, push, and register your custom Agent37 workspace template — run via
> 3| # `npm run release:agent`. Reads AGENT37_API_KEY from .env.local.
  4| #
  5| # DORMANT by default — only needed if you ship your own image. The default Starter
```

- Line 6 (`agent37, hermes`)
```text
  4| #
  5| # DORMANT by default — only needed if you ship your own image. The default Starter
> 6| # Kit (agent37-hermes / agent37-openclaw) needs NONE of this.
  7| #
  8| # Steps to go live:
```

- Line 16 (`hermes`)
```text
  14| #      (its `template` must equal TEMPLATE_NAME below)
  15| #
> 16| # This forks the FULL Hermes image (managed model + gateway included). To bring your
  17| # OWN model instead, see examples/custom-agent-image/. The Hermes base tag is
  18| # auto-resolved to the newest date tag in GHCR at build time — override with
```

- Line 17 (`hermes`)
```text
  15| #
  16| # This forks the FULL Hermes image (managed model + gateway included). To bring your
> 17| # OWN model instead, see examples/custom-agent-image/. The Hermes base tag is
  18| # auto-resolved to the newest date tag in GHCR at build time — override with
  19| # HERMES_TAG=YYYY.MM.DD[x] to pin one.
```

- Line 19 (`hermes`)
```text
  17| # OWN model instead, see examples/custom-agent-image/. The Hermes base tag is
  18| # auto-resolved to the newest date tag in GHCR at build time — override with
> 19| # HERMES_TAG=YYYY.MM.DD[x] to pin one.
  20| set -euo pipefail
  21| 
```

- Line 45 (`hermes`)
```text
  43| BASE_REPO="${BASE_REPO:-agent37-platform/hermes}"
  44| 
> 45| # Resolve the newest Hermes *date* tag (YYYY.MM.DD[x]) straight from GHCR's tag list —
  46| # the source of truth. The anonymous pull token suffices for the public tag list.
  47| # Prints nothing on failure so the caller can fall back / error out.
```

- Line 65 (`agent37`)
```text
  63| HERMES_TAG="${HERMES_TAG:-$(resolve_hermes_tag || true)}"
  64| : "${HERMES_TAG:?could not resolve a Hermes tag from GHCR — set HERMES_TAG explicitly, e.g. HERMES_TAG=2026.06.26b}"
> 65| # The Hosting API base is fixed; AGENT37_API only overrides it for local API work.
  66| API="${AGENT37_API:-https://api.agent37.com/v1}"
  67| AUTH="Authorization: Bearer ${AGENT37_API_KEY}"
```

- Line 72 (`hermes`)
```text
  70| echo "    base: ghcr.io/${BASE_REPO}:${HERMES_TAG}"
  71| docker buildx build --platform linux/amd64 --pull \
> 72|   --build-arg "HERMES_TAG=${HERMES_TAG}" \
  73|   -t "${IMAGE}:${TAG}" --push "${DIR}"
  74| 
```

## D. Tests and fixtures

### `./examples/custom-agent-image/.github/workflows/publish.yml`

- Line 21 (`agent37`)
```text
  19| jobs:
  20|   publish:
> 21|     runs-on: ubuntu-latest # GitHub's amd64 runner — builds the right arch for Agent37
  22|     steps:
  23|       - uses: actions/checkout@v4
```

### `./examples/custom-agent-image/Dockerfile`

- Line 1 (`agent37`)
```text
> 1| # Build your own Agent37 agent image.
  2| #
  3| # This is an EXAMPLE. The two customizations below — a CLI (cowsay) and a skill
```

- Line 12 (`hermes`)
```text
  10| #   - bake into /usr/local or /opt, never /home/node or /home/linuxbrew
  11| #     (both are persistent volumes that mask anything baked there at runtime)
> 12| #   - keep the base ENTRYPOINT (it starts Hermes + the gateway/chat API)
  13| #   - install as root, end as USER node
  14| #
```

- Line 18 (`agent37, hermes`)
```text
  16| # getting started. For reproducible PRODUCTION builds, pin a date tag (e.g.
  17| # :2026.06.16a) instead; the current tag is in the docs:
> 18| #   https://www.agent37.com/docs/agents-api/templates#build-on-the-hermes-base-image
  19| FROM ghcr.io/agent37-platform/hermes-base:latest
  20| 
```

- Line 19 (`agent37, hermes`)
```text
  17| # :2026.06.16a) instead; the current tag is in the docs:
  18| #   https://www.agent37.com/docs/agents-api/templates#build-on-the-hermes-base-image
> 19| FROM ghcr.io/agent37-platform/hermes-base:latest
  20| 
  21| USER root
```

- Line 32 (`hermes`)
```text
  30| 
  31| # (2) EXAMPLE SKILL — baked into the default-skills dir (NOT /home, which is masked).
> 32| #     The base entrypoint copies it into ~/.hermes/skills on boot, where Hermes loads it.
  33| #     A skill is a folder with a SKILL.md. Replace hello/ with your own skill.
  34| COPY hello /usr/local/share/agent37/default-skills/hello
```

- Line 34 (`agent37`)
```text
  32| #     The base entrypoint copies it into ~/.hermes/skills on boot, where Hermes loads it.
  33| #     A skill is a folder with a SKILL.md. Replace hello/ with your own skill.
> 34| COPY hello /usr/local/share/agent37/default-skills/hello
  35| 
  36| USER node
```

### `./examples/custom-agent-image/README.md`

- Line 3 (`agent37`)
```text
  1| # Custom agent image — example
  2| 
> 3| A self-contained example showing two ways to customize an [Agent37](https://www.agent37.com) agent. It is **not wired into this app** — instances use Agent37's managed model out of the box. It lives here so you (or your customers) can read the pattern and opt in.
  4| 
  5| Two independent extension points:
```

- Line 16 (`hermes`)
```text
  14| | Path | What it does |
  15| | --- | --- |
> 16| | `Dockerfile` | `FROM` the Hermes base; installs an example CLI + skill |
  17| | `hello/SKILL.md` | An example skill that teaches the agent a behavior |
  18| | `llm-proxy/proxy.mjs` | A ~40-line example LLM proxy — bring your own model |
```

- Line 24 (`agent37`)
```text
  22| ## Track 1 — your own image
  23| 
> 24| 1. **Customize** the `Dockerfile`: install your CLI, drop in your skill. Binaries go in `/usr/local/bin`, skills in `/usr/local/share/agent37/default-skills/`.
  25| 2. **Publish to a public registry.** Copy this folder into its own GitHub repo; the bundled `.github/workflows/publish.yml` builds and pushes to your GHCR on every push, using GitHub's built-in token — no secrets. First publish only: make the package **public** (repo → Packages → Package settings → Change visibility → Public); Agent37 pulls anonymously.
  26|    *Building locally first?* `docker build --platform=linux/amd64 -t my-agent .` — the `--platform` flag matters on an Apple Silicon Mac, where Docker would otherwise produce an arm64 image; Agent37 runs **amd64**.
```

- Line 25 (`agent37`)
```text
  23| 
  24| 1. **Customize** the `Dockerfile`: install your CLI, drop in your skill. Binaries go in `/usr/local/bin`, skills in `/usr/local/share/agent37/default-skills/`.
> 25| 2. **Publish to a public registry.** Copy this folder into its own GitHub repo; the bundled `.github/workflows/publish.yml` builds and pushes to your GHCR on every push, using GitHub's built-in token — no secrets. First publish only: make the package **public** (repo → Packages → Package settings → Change visibility → Public); Agent37 pulls anonymously.
  26|    *Building locally first?* `docker build --platform=linux/amd64 -t my-agent .` — the `--platform` flag matters on an Apple Silicon Mac, where Docker would otherwise produce an arm64 image; Agent37 runs **amd64**.
  27| 3. **Register and spawn.** Mint an `sk_live_` key in the [dashboard](https://www.agent37.com/dashboard/cloud), then:
```

- Line 26 (`agent37`)
```text
  24| 1. **Customize** the `Dockerfile`: install your CLI, drop in your skill. Binaries go in `/usr/local/bin`, skills in `/usr/local/share/agent37/default-skills/`.
  25| 2. **Publish to a public registry.** Copy this folder into its own GitHub repo; the bundled `.github/workflows/publish.yml` builds and pushes to your GHCR on every push, using GitHub's built-in token — no secrets. First publish only: make the package **public** (repo → Packages → Package settings → Change visibility → Public); Agent37 pulls anonymously.
> 26|    *Building locally first?* `docker build --platform=linux/amd64 -t my-agent .` — the `--platform` flag matters on an Apple Silicon Mac, where Docker would otherwise produce an arm64 image; Agent37 runs **amd64**.
  27| 3. **Register and spawn.** Mint an `sk_live_` key in the [dashboard](https://www.agent37.com/dashboard/cloud), then:
  28|    ```bash
```

- Line 27 (`agent37`)
```text
  25| 2. **Publish to a public registry.** Copy this folder into its own GitHub repo; the bundled `.github/workflows/publish.yml` builds and pushes to your GHCR on every push, using GitHub's built-in token — no secrets. First publish only: make the package **public** (repo → Packages → Package settings → Change visibility → Public); Agent37 pulls anonymously.
  26|    *Building locally first?* `docker build --platform=linux/amd64 -t my-agent .` — the `--platform` flag matters on an Apple Silicon Mac, where Docker would otherwise produce an arm64 image; Agent37 runs **amd64**.
> 27| 3. **Register and spawn.** Mint an `sk_live_` key in the [dashboard](https://www.agent37.com/dashboard/cloud), then:
  28|    ```bash
  29|    cp .env.example .env          # set AGENT37_API_KEY and IMAGE_REF
```

- Line 29 (`agent37`)
```text
  27| 3. **Register and spawn.** Mint an `sk_live_` key in the [dashboard](https://www.agent37.com/dashboard/cloud), then:
  28|    ```bash
> 29|    cp .env.example .env          # set AGENT37_API_KEY and IMAGE_REF
  30|    set -a; source .env; set +a
  31|    ./register.sh
```

- Line 38 (`agent37`)
```text
  36| ## Track 2 — your own model
  37| 
> 38| The base image is **clean: it boots with no model** (standard Agent37 instances use Agent37's managed model; this base is for bringing your own). The `llm-proxy/` folder is a ~40-line OpenAI-compatible pass-through to OpenRouter — deploy it, then point an instance at it.
  39| 
  40| ```bash
```

- Line 46 (`agent37, hermes`)
```text
  44| ```
  45| 
> 46| Deploy it anywhere with an HTTPS URL, then write `~/.hermes/config.yaml` on the instance (over [`exec`](https://www.agent37.com/docs/agents-api/exec) or the terminal):
  47| 
  48| ```yaml
```

- Line 60 (`agent37`)
```text
  58| ```
  59| 
> 60| It lives on the persistent volume, so it survives restarts. Then [message the instance](https://www.agent37.com/docs/agents-api/chat) and it runs on your model.
  61| 
  62| ## The contract
```

- Line 68 (`agent37`)
```text
  66| 1. **Build for `linux/amd64`** (see the note in Track 1).
  67| 2. **Keep the image ≤ 5 GB** compressed.
> 68| 3. **Bake outside `/home`.** `/home/node` and `/home/linuxbrew` are persistent volumes that mask anything baked there at build time. Binaries → `/usr/local/bin`, skills → `/usr/local/share/agent37/default-skills/`, other assets → `/opt`.
  69| 4. **Keep the base `ENTRYPOINT`.** It starts Hermes and the gateway that serves the chat API.
  70| 
```

- Line 69 (`hermes`)
```text
  67| 2. **Keep the image ≤ 5 GB** compressed.
  68| 3. **Bake outside `/home`.** `/home/node` and `/home/linuxbrew` are persistent volumes that mask anything baked there at build time. Binaries → `/usr/local/bin`, skills → `/usr/local/share/agent37/default-skills/`, other assets → `/opt`.
> 69| 4. **Keep the base `ENTRYPOINT`.** It starts Hermes and the gateway that serves the chat API.
  70| 
  71| Don't bind the reserved ports `3737`, `7681`, `8080`, `6080`, `7890`, `6969`, `9119` — they belong to the runtime.
```

- Line 78 (`agent37`)
```text
  76| 
  77| ```bash
> 78| curl -X DELETE https://api.agent37.com/v1/instances/<id> -H "Authorization: Bearer $AGENT37_API_KEY"
  79| ```
  80| 
```

- Line 83 (`agent37`)
```text
  81| ## Learn more
  82| 
> 83| - [Build your own agent image (guide)](https://www.agent37.com/docs/agents-api/build-your-own-image)
  84| - [Templates → build on the Hermes base image](https://www.agent37.com/docs/agents-api/templates#build-on-the-hermes-base-image)
  85| 
```

- Line 84 (`agent37, hermes`)
```text
  82| 
  83| - [Build your own agent image (guide)](https://www.agent37.com/docs/agents-api/build-your-own-image)
> 84| - [Templates → build on the Hermes base image](https://www.agent37.com/docs/agents-api/templates#build-on-the-hermes-base-image)
  85| 
  86| Licensed under MIT, same as this repo.
```

### `./examples/custom-agent-image/hello/SKILL.md`

- Line 17 (`agent37`)
```text
  15| 
  16| ```bash
> 17| cowsay "Hello from your own Agent37 image!"
  18| ```
  19| 
```

### `./examples/custom-agent-image/llm-proxy/proxy.mjs`

- Line 2 (`agent37`)
```text
  1| #!/usr/bin/env node
> 2| // Minimal example LLM proxy for an Agent37 custom image.
  3| //
  4| // It's an OpenAI-compatible pass-through: a Hermes instance talks to it as a
```

- Line 4 (`hermes`)
```text
  2| // Minimal example LLM proxy for an Agent37 custom image.
  3| //
> 4| // It's an OpenAI-compatible pass-through: a Hermes instance talks to it as a
  5| // "custom provider" (api_mode: chat_completions), and it forwards to OpenRouter
  6| // using YOUR key. This is the stripped-down cousin of Agent37's managed
```

- Line 6 (`agent37`)
```text
  4| // It's an OpenAI-compatible pass-through: a Hermes instance talks to it as a
  5| // "custom provider" (api_mode: chat_completions), and it forwards to OpenRouter
> 6| // using YOUR key. This is the stripped-down cousin of Agent37's managed
  7| // starter-proxy — no billing, no accounting, no quotas. Read it, deploy it, point
  8| // an instance at it.
```

- Line 10 (`agent37`)
```text
   8| // an instance at it.
   9| //
> 10| // OPTIONAL: by default, Agent37 instances run on Agent37's managed model and need
  11| // none of this. Deploy this only if you want an instance to run on your own model.
  12| //
```

- Line 13 (`hermes`)
```text
  11| // none of this. Deploy this only if you want an instance to run on your own model.
  12| //
> 13| // Two routes Hermes needs:
  14| //   GET  /v1/models            -> the model id(s) it can pick (no auth)
  15| //   POST /v1/chat/completions  -> the chat turn (Bearer = PROXY_TOKEN), forwarded upstream
```

- Line 25 (`hermes`)
```text
  23| const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
  24| 
> 25| // The token Hermes presents as `api_key`. Pick any value; put the SAME one in the
  26| // instance's ~/.hermes/config.yaml custom_providers[].api_key.
  27| const PROXY_TOKEN = process.env.PROXY_TOKEN;
```

- Line 26 (`hermes`)
```text
  24| 
  25| // The token Hermes presents as `api_key`. Pick any value; put the SAME one in the
> 26| // instance's ~/.hermes/config.yaml custom_providers[].api_key.
  27| const PROXY_TOKEN = process.env.PROXY_TOKEN;
  28| 
```

- Line 47 (`hermes`)
```text
  45|   const path = new URL(req.url, 'http://localhost').pathname;
  46| 
> 47|   // GET /v1/models — Hermes reads this to learn which model id to use.
  48|   if (req.method === 'GET' && path === '/v1/models') {
  49|     return json(res, 200, {
```

### `./examples/custom-agent-image/register.sh`

- Line 2 (`agent37`)
```text
  1| #!/usr/bin/env bash
> 2| # Register your published image as an Agent37 template, then spawn an instance from it.
  3| #
  4| # Prereqs:
```

- Line 7 (`agent37`)
```text
  5| #   - curl and jq installed
  6| #   - your image published to a PUBLIC registry (push to main; make the GHCR package public)
> 7| #   - AGENT37_API_KEY and IMAGE_REF set (see .env.example)
  8| set -euo pipefail
  9| 
```

- Line 10 (`agent37`)
```text
   8| set -euo pipefail
   9| 
> 10| API="${AGENT37_API_BASE:-https://api.agent37.com}"
  11| TEMPLATE="${TEMPLATE_NAME:-my-custom-agent}"
  12| : "${AGENT37_API_KEY:?Set AGENT37_API_KEY (sk_live_...). See .env.example.}"
```

- Line 12 (`agent37`)
```text
  10| API="${AGENT37_API_BASE:-https://api.agent37.com}"
  11| TEMPLATE="${TEMPLATE_NAME:-my-custom-agent}"
> 12| : "${AGENT37_API_KEY:?Set AGENT37_API_KEY (sk_live_...). See .env.example.}"
  13| : "${IMAGE_REF:?Set IMAGE_REF to your published public image, e.g. ghcr.io/you/my-agent:<sha>. See .env.example.}"
  14| 
```

- Line 18 (`agent37`)
```text
  16| status=$(curl -sS -o /tmp/a37_template.json -w '%{http_code}' \
  17|   -X POST "${API}/v1/templates" \
> 18|   -H "Authorization: Bearer ${AGENT37_API_KEY}" \
  19|   -H "Content-Type: application/json" \
  20|   -d "{\"name\":\"${TEMPLATE}\",\"image_ref\":\"${IMAGE_REF}\"}")
```

- Line 31 (`agent37`)
```text
  29| # (which uses no managed model) and ready if you switch to the full image.
  30| curl -sS -X POST "${API}/v1/instances" \
> 31|   -H "Authorization: Bearer ${AGENT37_API_KEY}" \
  32|   -H "Content-Type: application/json" \
  33|   -d "{\"template\":\"${TEMPLATE}\",\"budget\":{\"topup_micros\":1000000}}" \
```

- Line 49 (`agent37`)
```text
  47| Confirm your baked-in CLI shipped (control-plane exec — no model needed):
  48|   curl -sS -X POST ${API}/v1/instances/${id}/exec \\
> 49|     -H "Authorization: Bearer \$AGENT37_API_KEY" -H "Content-Type: application/json" \\
  50|     -d '{"command":"cowsay hello from my own image"}'
  51| 
```

- Line 54 (`agent37`)
```text
  52| See your seeded skill:
  53|   curl -sS -X POST ${API}/v1/instances/${id}/exec \\
> 54|     -H "Authorization: Bearer \$AGENT37_API_KEY" -H "Content-Type: application/json" \\
  55|     -d '{"command":"ls ~/.hermes/skills"}'
  56| 
```

- Line 55 (`hermes`)
```text
  53|   curl -sS -X POST ${API}/v1/instances/${id}/exec \\
  54|     -H "Authorization: Bearer \$AGENT37_API_KEY" -H "Content-Type: application/json" \\
> 55|     -d '{"command":"ls ~/.hermes/skills"}'
  56| 
  57| Delete it when you are done (this stops billing):
```

- Line 58 (`agent37`)
```text
  56| 
  57| Delete it when you are done (this stops billing):
> 58|   curl -sS -X DELETE ${API}/v1/instances/${id} -H "Authorization: Bearer \$AGENT37_API_KEY"
  59| EOF
```

## E. Build/CI config

### `./.github/workflows/ci.yml`

- Line 25 (`agent37`)
```text
  23|       SUPABASE_SERVICE_ROLE_KEY: sb_secret_ci_placeholder
  24|       NEXT_PUBLIC_SITE_URL: https://console.gcaplabs.com
> 25|       AGENT37_API_KEY: ci_placeholder
  26|     steps:
  27|       - uses: actions/checkout@v4
```

### `./scripts/setup.mjs`

- Line 280 (`agent37`)
```text
  278| 
  279| function printHelp() {
> 280|   log(`${bold("agent37-starter-kit setup")}
  281| 
  282| Usage: npm run setup [-- options]
```

- Line 312 (`agent37`)
```text
  310|   }
  311| 
> 312|   log(bold("Setting up agent37-starter-kit\n"));
  313| 
  314|   if (!fs.existsSync(ENV_FILE)) {
```

- Line 320 (`agent37`)
```text
  318|     log(
  319|       `\nPaste your two secrets into ${bold(".env.local")}, then run ${bold("npm run setup")} again:\n` +
> 320|         `  ${cyan("AGENT37_API_KEY")}        your sk_live_ key (Agent37 dashboard → Cloud → API keys)\n` +
  321|         `  ${cyan("SUPABASE_ACCESS_TOKEN")}  a token from https://supabase.com/dashboard/account/tokens`
  322|     );
```

- Line 338 (`agent37`)
```text
  336|     );
  337|   }
> 338|   if (isBlank(get(env, "AGENT37_API_KEY"))) {
  339|     warn("AGENT37_API_KEY is still blank — the app needs it at runtime. Fill it in .env.local.");
  340|   }
```

- Line 339 (`agent37`)
```text
  337|   }
  338|   if (isBlank(get(env, "AGENT37_API_KEY"))) {
> 339|     warn("AGENT37_API_KEY is still blank — the app needs it at runtime. Fill it in .env.local.");
  340|   }
  341| 
```

- Line 396 (`agent37`)
```text
  394|     let project;
  395|     try {
> 396|       ({ project } = await createProject(call, { name: "agent37-starter-kit", orgSlug, region }));
  397|     } catch (e) {
  398|       const atLimit = /maximum limits|free project|project limit/i.test(e.message || "");
```

- Line 454 (`agent37`)
```text
  452|   log(`  ${bold("npm run dev")}   ${dim("# then open http://localhost:3000 and sign in")}`);
  453|   log(
> 454|     `\n${yellow("!")} Creating an agent spends real money — fund your Agent37 wallet first\n` +
  455|       `  ${dim("(dashboard → Cloud → Billing). An empty wallet returns a 402 at create time.")}`
  456|   );
```

### `./scripts/smoke.mjs`

- Line 17 (`agent37`)
```text
  15| import { readFileSync } from "node:fs";
  16| 
> 17| const API = process.env.AGENT37_API || "https://api.agent37.com/v1";
  18| const KEEP = process.argv.includes("--keep");
  19| 
```

- Line 31 (`agent37`)
```text
  29| }
  30| 
> 31| const KEY = readEnv("AGENT37_API_KEY");
  32| if (!KEY || !KEY.startsWith("sk_live_")) {
  33|   console.error("Set AGENT37_API_KEY (sk_live_...) in the env or .env.local first.");
```

- Line 33 (`agent37`)
```text
  31| const KEY = readEnv("AGENT37_API_KEY");
  32| if (!KEY || !KEY.startsWith("sk_live_")) {
> 33|   console.error("Set AGENT37_API_KEY (sk_live_...) in the env or .env.local first.");
  34|   process.exit(1);
  35| }
```

- Line 41 (`agent37, hermes`)
```text
  39| 
  40| async function main() {
> 41|   console.log("→ creating instance (agent37-hermes, $0.50 credit)…");
  42|   const created = await fetch(`${API}/instances`, {
  43|     method: "POST",
```

- Line 50 (`agent37`)
```text
  48|   const inst = await created.json();
  49|   console.log(`  id=${inst.id} status=${inst.status}`);
> 50|   const base = `https://${inst.id}.agent37.app`;
  51| 
  52|   try {
```

### `./template/Dockerfile`

- Line 30 (`hermes`)
```text
  28| # concrete, immutable tag. The :latest default is only a convenience for ad-hoc
  29| # `docker build` runs without the arg; override with --build-arg HERMES_TAG=YYYY.MM.DD[x].
> 30| ARG HERMES_TAG=latest
  31| FROM ghcr.io/agent37-platform/hermes:${HERMES_TAG}
  32| 
```

- Line 31 (`agent37, hermes`)
```text
  29| # `docker build` runs without the arg; override with --build-arg HERMES_TAG=YYYY.MM.DD[x].
  30| ARG HERMES_TAG=latest
> 31| FROM ghcr.io/agent37-platform/hermes:${HERMES_TAG}
  32| 
  33| USER root
```

- Line 54 (`agent37`)
```text
  52| # The gateway/data-plane port is set by the platform from the template's default port
  53| # (3738 in release.sh), so it needs no env var here — only EXPOSE for documentation.
> 54| ENV AGENT37_TERMINAL_PORT=7682 \
  55|     AGENT37_HERMES_DASHBOARD_PORT=9120 \
  56|     AGENT37_FILEBROWSER_PORT=8081
```

- Line 55 (`agent37, hermes`)
```text
  53| # (3738 in release.sh), so it needs no env var here — only EXPOSE for documentation.
  54| ENV AGENT37_TERMINAL_PORT=7682 \
> 55|     AGENT37_HERMES_DASHBOARD_PORT=9120 \
  56|     AGENT37_FILEBROWSER_PORT=8081
  57| 
```

- Line 56 (`agent37`)
```text
  54| ENV AGENT37_TERMINAL_PORT=7682 \
  55|     AGENT37_HERMES_DASHBOARD_PORT=9120 \
> 56|     AGENT37_FILEBROWSER_PORT=8081
  57| 
  58| # Documentation only (the platform routes the declared template ports): gateway,
```

### `./template/release.sh`

- Line 43 (`agent37, hermes`)
```text
  41| }
  42| 
> 43| BASE_REPO="${BASE_REPO:-agent37-platform/hermes}"
  44| 
  45| # Resolve the newest Hermes *date* tag (YYYY.MM.DD[x]) straight from GHCR's tag list —
```

- Line 48 (`hermes`)
```text
  46| # the source of truth. The anonymous pull token suffices for the public tag list.
  47| # Prints nothing on failure so the caller can fall back / error out.
> 48| resolve_hermes_tag() {
  49|   local token
  50|   token="$(curl -fsSL "https://ghcr.io/token?scope=repository:${BASE_REPO}:pull" \
```

- Line 59 (`agent37`)
```text
  57| }
  58| 
> 59| AGENT37_API_KEY="${AGENT37_API_KEY:-$(read_env AGENT37_API_KEY)}"
  60| : "${AGENT37_API_KEY:?not found — set AGENT37_API_KEY in .env.local}"
  61| 
```

- Line 60 (`agent37`)
```text
  58| 
  59| AGENT37_API_KEY="${AGENT37_API_KEY:-$(read_env AGENT37_API_KEY)}"
> 60| : "${AGENT37_API_KEY:?not found — set AGENT37_API_KEY in .env.local}"
  61| 
  62| NAME="${TEMPLATE_NAME}"
```

- Line 63 (`hermes`)
```text
  61| 
  62| NAME="${TEMPLATE_NAME}"
> 63| HERMES_TAG="${HERMES_TAG:-$(resolve_hermes_tag || true)}"
  64| : "${HERMES_TAG:?could not resolve a Hermes tag from GHCR — set HERMES_TAG explicitly, e.g. HERMES_TAG=2026.06.26b}"
  65| # The Hosting API base is fixed; AGENT37_API only overrides it for local API work.
```

- Line 64 (`hermes`)
```text
  62| NAME="${TEMPLATE_NAME}"
  63| HERMES_TAG="${HERMES_TAG:-$(resolve_hermes_tag || true)}"
> 64| : "${HERMES_TAG:?could not resolve a Hermes tag from GHCR — set HERMES_TAG explicitly, e.g. HERMES_TAG=2026.06.26b}"
  65| # The Hosting API base is fixed; AGENT37_API only overrides it for local API work.
  66| API="${AGENT37_API:-https://api.agent37.com/v1}"
```

- Line 66 (`agent37`)
```text
  64| : "${HERMES_TAG:?could not resolve a Hermes tag from GHCR — set HERMES_TAG explicitly, e.g. HERMES_TAG=2026.06.26b}"
  65| # The Hosting API base is fixed; AGENT37_API only overrides it for local API work.
> 66| API="${AGENT37_API:-https://api.agent37.com/v1}"
  67| AUTH="Authorization: Bearer ${AGENT37_API_KEY}"
  68| 
```

- Line 67 (`agent37`)
```text
  65| # The Hosting API base is fixed; AGENT37_API only overrides it for local API work.
  66| API="${AGENT37_API:-https://api.agent37.com/v1}"
> 67| AUTH="Authorization: Bearer ${AGENT37_API_KEY}"
  68| 
  69| echo "==> Build + push ${IMAGE}:${TAG} (linux/amd64)"
```

- Line 70 (`hermes`)
```text
  68| 
  69| echo "==> Build + push ${IMAGE}:${TAG} (linux/amd64)"
> 70| echo "    base: ghcr.io/${BASE_REPO}:${HERMES_TAG}"
  71| docker buildx build --platform linux/amd64 --pull \
  72|   --build-arg "HERMES_TAG=${HERMES_TAG}" \
```

- Line 81 (`agent37, hermes`)
```text
  79|   "name": "${NAME}",
  80|   "image_ref": "${IMAGE}:${TAG}",
> 81|   "description": "Custom Agent37 workspace template (forked from the full Hermes image).",
  82|   "ports": [
  83|     { "port": 3738, "default": true },
```

- Line 99 (`agent37`)
```text
   97| fi
   98| 
>  99| code=$(curl -sS -o /tmp/agent37-template.json -w '%{http_code}' \
  100|   -X "${method}" "${url}" -H "${AUTH}" -H "Content-Type: application/json" -d "${BODY}")
  101| echo "HTTP ${code}"; cat /tmp/agent37-template.json 2>/dev/null || true; echo
```

- Line 101 (`agent37`)
```text
   99| code=$(curl -sS -o /tmp/agent37-template.json -w '%{http_code}' \
  100|   -X "${method}" "${url}" -H "${AUTH}" -H "Content-Type: application/json" -d "${BODY}")
> 101| echo "HTTP ${code}"; cat /tmp/agent37-template.json 2>/dev/null || true; echo
  102| case "${code}" in 2*) echo "OK  ${NAME} -> ${IMAGE}:${TAG}";; *) echo "FAILED"; exit 1;; esac
```

## Appendix A — generated/vendored skip zones

These are intentionally flagged so downstream remediation skips them unless it needs to regenerate outputs or update dependencies.

### `node_modules/` — generated/vendored

Total content matches: **208**

- `./node_modules/@supabase/supabase-js/package.json` — 3 matches [generated/vendored]
- `./node_modules/next/dist/compiled/babel-packages/packages-bundle.js` — 205 matches [generated/vendored]

### `.next/` — generated/vendored

Total content matches: **3632**

- `./.next/server/chunks/[root-of-the-server]__00dkfm1._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__00dkfm1._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__00lh3xe._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__00lh3xe._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__00ul-ja._.js` — 1 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__00ul-ja._.js.map` — 2 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__02f5fqk._.js` — 2 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__02f5fqk._.js.map` — 2 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__030ottz._.js` — 26 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__030ottz._.js.map` — 61 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__03a5vcl._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__03a5vcl._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__04tyr3y._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__04tyr3y._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__06qd39n._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__06qd39n._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0_-t9xk._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0_-t9xk._.js.map` — 58 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0_9uajc._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0_9uajc._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0d_ir9n._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0d_ir9n._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0dyq_2j._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0dyq_2j._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0f3o-fa._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0f3o-fa._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0h8cs2p._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0h8cs2p._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0ixig_8._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0ixig_8._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0kkxesj._.js` — 26 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0kkxesj._.js.map` — 64 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0mi2jmg._.js` — 29 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0mi2jmg._.js.map` — 74 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0qcuru3._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0qcuru3._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0uao2di._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__0uao2di._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__13vw7r-._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__13vw7r-._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__16n71_m._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__16n71_m._.js.map` — 58 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__17w4-zo._.js` — 2 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__17w4-zo._.js.map` — 4 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1bpxsm_._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1bpxsm_._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1c9q54j._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1c9q54j._.js.map` — 57 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1hj6ek_._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1hj6ek_._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1j8wbf8._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1j8wbf8._.js.map` — 56 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1o2as79._.js` — 24 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1o2as79._.js.map` — 59 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1rvtqj8._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1rvtqj8._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1turi8x._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1turi8x._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1uvp-w7._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1uvp-w7._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1v5diev._.js` — 22 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1v5diev._.js.map` — 55 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1we_2-y._.js` — 44 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1we_2-y._.js.map` — 80 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1y-lgsf._.js` — 2 matches [generated/vendored]
- `./.next/server/chunks/[root-of-the-server]__1y-lgsf._.js.map` — 2 matches [generated/vendored]
- `./.next/server/chunks/_20j9ibh._.js.map` — 6 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__01xvbfn._.js` — 28 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__01xvbfn._.js.map` — 70 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0b0i5o5._.js` — 31 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0b0i5o5._.js.map` — 79 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0cm6at9._.js` — 25 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0cm6at9._.js.map` — 67 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0cr9mep._.js` — 25 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0cr9mep._.js.map` — 67 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0d6fwe9._.js` — 28 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0d6fwe9._.js.map` — 70 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0m84jnc._.js` — 25 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0m84jnc._.js.map` — 67 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0rydq7p._.js` — 25 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__0rydq7p._.js.map` — 67 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1erxerw._.js` — 27 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1erxerw._.js.map` — 69 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1gmqana._.js` — 27 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1gmqana._.js.map` — 69 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1mqdjpq._.js` — 30 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1mqdjpq._.js.map` — 73 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1t9ai66._.js` — 26 matches [generated/vendored]
- `./.next/server/chunks/ssr/[root-of-the-server]__1t9ai66._.js.map` — 70 matches [generated/vendored]
- `./.next/server/chunks/ssr/_04y5mae._.js` — 1 matches [generated/vendored]
- `./.next/server/chunks/ssr/_04y5mae._.js.map` — 1 matches [generated/vendored]
- `./.next/server/chunks/ssr/_0od1qi2._.js.map` — 6 matches [generated/vendored]
- `./.next/server/chunks/ssr/_1ck8rec._.js` — 5 matches [generated/vendored]
- `./.next/server/chunks/ssr/_1ck8rec._.js.map` — 13 matches [generated/vendored]
- `./.next/server/chunks/ssr/_1czma5q._.js` — 11 matches [generated/vendored]
- `./.next/server/chunks/ssr/_1czma5q._.js.map` — 19 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_1_uyls8._.js` — 2 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_1_uyls8._.js.map` — 4 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_1o-0pkb._.js` — 2 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_1o-0pkb._.js.map` — 4 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_AgentWorkspace_tsx_0o5mnwf._.js` — 12 matches [generated/vendored]
- `./.next/server/chunks/ssr/src_components_AgentWorkspace_tsx_0o5mnwf._.js.map` — 23 matches [generated/vendored]
- `./.next/static/chunks/07ytax0rpjsvy.js` — 1 matches [generated/vendored]
- `./.next/static/chunks/0m0u89uyrnn5u.js` — 12 matches [generated/vendored]
- `./.next/static/chunks/11zp7c-i0wc0a.js` — 2 matches [generated/vendored]
- `./.next/static/chunks/1qury0lqnchjc.js` — 2 matches [generated/vendored]
- `./.next/static/chunks/2hrtygi89p3kf.js` — 11 matches [generated/vendored]
- `./.next/static/chunks/3sbtfka2c583g.js` — 5 matches [generated/vendored]

### `.git/` — generated/vendored

Total content matches: **21**

- `./.git/COMMIT_EDITMSG` — 2 matches [generated/vendored]
- `./.git/FETCH_HEAD` — 2 matches [generated/vendored]
- `./.git/config` — 1 matches [generated/vendored]
- `./.git/logs/HEAD` — 8 matches [generated/vendored]
- `./.git/logs/refs/heads/main` — 8 matches [generated/vendored]

### `.vercel/` — generated/vendored

Total content matches: **0**

No matches.

## Internal cleanup status — t_5cc16fa8

Status: done for internal/non-generated references.

Rows covered:

- B. Internal code identifiers — renamed to neutral runtime/client names.
- C. Documentation and code comments — rewritten to neutral runtime/provider wording.
- D. Tests and fixtures — no remaining non-generated hits after rename pass.
- E. Build/CI config — env keys, script comments, template files, and workflow placeholders renamed.
- Path / file-name hits — `src/lib/agent37.ts` renamed to `src/lib/managed-runtime.ts`; `supabase/migrations/0002_agent37_managed_runtime.sql` renamed to `supabase/migrations/0002_managed_runtime.sql`.

Verification run from repo root after this pass:

```sh
rg -n -i --hidden --glob '!node_modules/**' --glob '!.next/**' --glob '!.git/**' --glob '!.vercel/**' --glob '!BRANDING_AUDIT.md' 'agent37|hermes' .
# no matches

find . \( -path './node_modules' -o -path './.next' -o -path './.git' -o -path './.vercel' \) -prune -o \( -iname '*agent37*' -o -iname '*hermes*' \) -print
# no matches

npm run typecheck
# pass

npm run build
# pass

bash -n template/release.sh && node --check scripts/setup.mjs && node --check scripts/smoke.mjs
# pass
```

Package scripts checked: this repo has no `lint` or `test` script; the available quality gates are `typecheck`, `build`, `smoke`, and `release:agent`.

## Verification — t_fe2b9b8c

Final verification run from repo root on 2026-07-04.

### Final grep command

```sh
rg -i -n --hidden \
  --glob '!node_modules/**' \
  --glob '!dist/**' \
  --glob '!build/**' \
  --glob '!.git/**' \
  --glob '!vendor/**' \
  --glob '!.next/**' \
  --glob '!.vercel/**' \
  --glob '!BRANDING_AUDIT.md' \
  --glob '!package-lock.json' \
  'agent37|hermes' .

find . \
  \( -path './node_modules' -o -path './dist' -o -path './build' -o -path './.git' -o -path './vendor' -o -path './.next' -o -path './.vercel' \) -prune -o \
  \( -iname '*agent37*' -o -iname '*hermes*' \) -print | grep -v '^./BRANDING_AUDIT.md$'
```

### Remaining hits

Content hits: **6** matching lines across **1** source file.
Path/name hits: **0**.
`hermes` hits outside this audit and generated/vendor/lock outputs: **0**.

All remaining content hits are intentional compatibility references in `supabase/migrations/0008_rename_legacy_runtime_columns.sql`. The migration must name the legacy database columns/index so already-provisioned databases can rename them forward to the current `runtime_*` schema.

- `agent37_id` -> `runtime_id` — required old column name in a forward SQL rename.
- `agent37_status` -> `runtime_status` — required old column name in a forward SQL rename.
- `agent37_name` -> `runtime_name` — required old column name in a forward SQL rename.
- `agent37_template` -> `runtime_template` — required old column name in a forward SQL rename.
- `agent37_created_at` -> `runtime_created_at` — required old column name in a forward SQL rename.
- `profiles_agent37_id_idx` -> `profiles_runtime_id_idx` — required old index name in a forward SQL rename.

During this verification pass, the migration filename was renamed from `0008_rename_agent37_columns_to_runtime.sql` to `0008_rename_legacy_runtime_columns.sql`, and its comments were rewritten to remove non-essential legacy brand mentions. Only the SQL identifiers that must exist for the migration remain.

### Build, type-check, lint, test, and smoke results

- `npm run typecheck` — pass (`tsc --noEmit`).
- `npm run build` — pass (`next build`; compiled successfully, TypeScript passed, 46/46 static pages generated).
- `npm run test:oauth` — pass (`Composio OAuth popup regression passed.`).
- `npm run lint` — not configured (`npm error Missing script: "lint"`). No lint script or ESLint dependency is present in `package.json`.
- Local running-console smoke — pass. Ran `npm run start -- -p 3027`, then fetched `/`, `/login`, and `/reset-password` with `curl -L`; each returned `200 text/html`, contained Next app render markers, and had zero `agent37` / `hermes` matches in the rendered HTML.
- `npm run smoke` was not run because `scripts/smoke.mjs` is an opt-in paid external smoke that requires a live `RUNTIME_API_KEY` and creates/deletes a real runtime-provider instance. The local console smoke above covered the requested UI/runtime render sanity check without spending live provider credits.

