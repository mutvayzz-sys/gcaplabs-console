# GCAP Artifact Board Finish Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Convert every actionable open item from `gcaplabs-home/claudeartifact/*` into concrete repo work, while explicitly skipping hardware/manual/live-credential tasks the user told us to skip.

**Architecture:** Treat the Claude artifact board as the cross-repo backlog, then execute by repo affinity to avoid file conflicts: docs repo first, marketing site second, console linkage third, desktop polish/cleanup fourth, cross-project tracker refresh last. Existing dirty work in `gcaplabs-docs` and `gcaplabs-site` is probably already partial implementation of these lists, so the first step is to preserve and review it, not overwrite it.

**Tech Stack:** Electron + Vite + React + TypeScript + Bun (`gcaplabs-headmasterUI`), Next.js 16 + React 19 (`gcaplabs-console`, `gcaplabs-site`), Mintlify docs (`gcaplabs-docs`), Git/Bash on Windows.

---

## Scope from the artifacts

Read inputs:
- `gcaplabs-home/claudeartifact/mastertodo.html`
- `gcaplabs-home/claudeartifact/mastertodo-status-board.md`
- `gcaplabs-home/claudeartifact/kanban-workflow-summary.md`
- `gcaplabs-headmasterUI/mastertodo.md`
- `gcaplabs-headmasterUI/masterlog.md`
- `gcaplabs-docs/DOCS-OVERHAUL-PLAN.md`
- `gcaplabs-site/rewrite.md`
- `gcaplabs-site/assetgen.md`

Doable work from all tabs:
1. Finish/verify docs-site overhaul already sitting dirty in `gcaplabs-docs`.
2. Finish/verify marketing-site rewrite and screenshot-truthiness work already sitting dirty in `gcaplabs-site`.
3. Add console-to-docs links for the pending-approval/account/admin flows once docs slugs exist.
4. Apply the confirmed Headmaster/GCAP visual direction to the desktop UI polish pass.
5. Audit/delete optional desktop `hermeshq/` vendored tree only if proven unused.
6. Refresh cross-project trackers/artifacts after repo work lands.
7. Keep STT disabled until a runtime contract exists; only audit that it stays fail-closed.
8. Treat HeadmasterCore as a separate long-horizon architecture track; do not silently mix it into docs/site cleanup.

Skipped / blocked by user instruction or environment:
- iOS build/auth verification: needs Mac/Xcode; skip.
- Manual desktop smoke: needs human login / approved saved-login session; skip.
- Console live launch/admin/security clickthrough: needs safe live admin + pending-user credentials; skip.
- HermesHQ VPS teardown: owner-owned manual infra; skip.
- Full STT enablement: blocked until `/api/stt`, `/api/stt/stream`, or Agent37-native STT contract exists.

---

## Critical notes for implementer

### Branch / dirty-state precheck

The monorepo root `C:\Users\Matve\Desktop\GCAP-Labs` is not a git repo. Work per repo.

Current snapshot at plan time:

- `gcaplabs-headmasterUI`
  - branch: `main`
  - head: `2db90b317e05c591f7b2f5ced4e8496d1f3b9255 docs: record kanban push verification`
  - status: clean vs `origin/main`
- `gcaplabs-console`
  - branch: `main`
  - head: `33a879ff466dabad005eed709a6036bfd7166006 fix: allow desktop runtime CORS preflights`
  - status: clean vs `origin/main`
- `gcaplabs-docs`
  - branch: `main`
  - head: `57f06f2c8e8224f630434baf24251d4cdc2eb732 Merge pull request #1 from mutvayzz-sys/claude/magical-turing-kanam4`
  - status: dirty: 14 modified files, 19 untracked files/images.
  - DEFAULT: treat dirty state as in-progress docs overhaul; review, validate, then commit/push. Do not stash/delete unless user says so.
- `gcaplabs-site`
  - branch: `main`
  - head: `59aec5cb44a670a8cf6c088dd28bc548b99774d6 Update .gitignore`
  - status: dirty: 45 modified files, 8 untracked files.
  - DEFAULT: treat dirty state as in-progress marketing rewrite; review, validate, then commit/push. Do not overwrite blindly.

Phase 0 must rerun this before editing:

```bash
for d in gcaplabs-headmasterUI gcaplabs-console gcaplabs-docs gcaplabs-site; do
  echo "=== $d ==="
  cd "C:/Users/Matve/Desktop/GCAP-Labs/$d" || exit 1
  git branch --show-current
  git log -1 --pretty='%H %s'
  git status --short --branch
  cd - >/dev/null
 done
```

### Repo-specific warnings

From `gcaplabs-site/AGENTS.md`:

> This is NOT the Next.js you know. This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Apply the same caution to `gcaplabs-console` because it also uses Next 16.

White-label rules:
- Public UI must say GCAP Labs / Headmaster, not AionUi, AionCore, aionrs, Cowork, or user-visible Hermes.
- Hermes is allowed only where it is internal/runtime-facing: `HERMES_HOME`, `HERMES_DESKTOP_*`, `hermes-media://`, Python venv path, `hermes dashboard`, internal env/config/IPC names.
- For marketing/docs re-skins, run a grep audit before deploy.

---

## Execution mode

Recommended: checkpointed in-context execution, because two repos already have dirty work and should not be handed to parallel subagents without first reviewing ownership of those diffs.

If the user wants speed after Phase 0, split into subagents by repo only:
- Worker A: `gcaplabs-docs`
- Worker B: `gcaplabs-site`
- Worker C: `gcaplabs-console` link follow-up
- Worker D: `gcaplabs-headmasterUI` polish/cleanup

Do not run two workers in the same repo at the same time.

---

# Phase 0 — Preserve baseline and classify dirty work

### Task 0.1: Capture per-repo baseline

**Objective:** Make sure execution starts from known branch/commit state.

**Files:** none.

**Steps:**
1. Run the branch/status command from the Critical Notes section.
2. Save the output in the task notes or final report.
3. If `gcaplabs-docs` or `gcaplabs-site` has changed since this plan, inspect `git diff --stat` before touching files.

**Verification:** No repo is accidentally on a feature branch unless the user intentionally switched it.

**Commit:** none.

### Task 0.2: Review dirty docs/site diffs before editing

**Objective:** Treat current uncommitted docs/site work as first-class work, not disposable scratch.

**Files:**
- Read: `gcaplabs-docs` dirty/untracked set
- Read: `gcaplabs-site` dirty/untracked set

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
git diff --stat
git ls-files --others --exclude-standard

cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
git diff --stat
git ls-files --others --exclude-standard
```

**Verification:** Write down which artifact-board items are already implemented in dirty state.

**Commit:** none.

---

# Phase 1 — Finish `gcaplabs-docs` overhaul

Current finding: `gcaplabs-docs` already has the Account & Web Console and Admin Guide pages added in `docs.json`, plus untracked MDX pages and generated diagrams. This is likely partial/near-complete implementation of the docs tab.

### Task 1.1: Validate docs navigation and page coverage

**Objective:** Ensure every new page listed in `docs.json` exists and has frontmatter.

**Files:**
- Modify if needed: `gcaplabs-docs/docs.json`
- Modify if needed: `gcaplabs-docs/console.mdx`
- Modify if needed: `gcaplabs-docs/signing-up-and-approval.mdx`
- Modify if needed: `gcaplabs-docs/account-settings.mdx`
- Modify if needed: `gcaplabs-docs/organizations.mdx`
- Modify if needed: `gcaplabs-docs/your-agent-runtime.mdx`
- Modify if needed: `gcaplabs-docs/admin-approving-users.mdx`
- Modify if needed: `gcaplabs-docs/admin-organizations.mdx`
- Modify if needed: `gcaplabs-docs/admin-runtime-control.mdx`
- Modify if needed: `gcaplabs-docs/admin-health.mdx`
- Modify if needed: `gcaplabs-docs/admin-announcements-messages.mdx`
- Modify if needed: `gcaplabs-docs/admin-config.mdx`
- Modify if needed: `gcaplabs-docs/admin-permission-model.mdx`

**Steps:**
1. Parse `docs.json` with Node.
2. Check every page in `navigation.pages[*].pages` maps to `<slug>.mdx`.
3. Check every new `.mdx` has `title` and `description` frontmatter.
4. Fix missing frontmatter or missing nav entries.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
node -e "const fs=require('fs'); const j=JSON.parse(fs.readFileSync('docs.json','utf8')); const missing=[]; for (const g of j.navigation.pages) for (const p of g.pages||[]) if(!fs.existsSync(p+'.mdx')) missing.push(p); if(missing.length){console.error(missing); process.exit(1)} console.log('docs nav ok')"
```

**Expected:** `docs nav ok`.

**Commit:** later, after Phase 1 validation passes.

### Task 1.2: Verify docs content matches current architecture

**Objective:** Remove stale “local-first only / bring an API key” framing where it contradicts current managed Agent37 Cloud flow.

**Files:**
- Modify: `gcaplabs-docs/index.mdx`
- Modify: `gcaplabs-docs/introduction.mdx`
- Modify: `gcaplabs-docs/getting-started.mdx`
- Modify: `gcaplabs-docs/the-local-runtime.mdx`
- Modify: `gcaplabs-docs/runtime-settings.mdx`

**Required truth:**
- Current primary flow: sign up on Console → pending approval → admin approves `beta_approved` → managed Agent37 Cloud runtime provisions/loads.
- Local runtime is fallback/dev/local-machine mode, not the default user path.
- Desktop/iOS/Console share Supabase identity and `profiles.agent37_id`.

**Verification grep:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
grep -RniE 'local-first|API key|bring.*key|self-hosted|HermesHQ|hq\.gcaplabs|AionUi|aionui' *.mdx || true
```

Expected: any remaining hits are either historical/internal context or rewritten accurately.

### Task 1.3: Verify diagrams and image references

**Objective:** Ensure generated diagrams are committed and referenced only from pages that explain them.

**Files:**
- Keep: `gcaplabs-docs/images/architecture-diagram.png`
- Keep: `gcaplabs-docs/images/signup-journey.png`
- Keep: `gcaplabs-docs/images/permission-model.png`
- Optional keep/remove depending usage: `gcaplabs-docs/images/permission-model.svg`
- Optional keep/remove depending usage: `gcaplabs-docs/images/signup-journey.svg`
- Modify if needed: `gcaplabs-docs/introduction.mdx`
- Modify if needed: `gcaplabs-docs/signing-up-and-approval.mdx`
- Modify if needed: `gcaplabs-docs/your-agent-runtime.mdx`
- Modify if needed: `gcaplabs-docs/admin-permission-model.mdx`

**Steps:**
1. Grep for `architecture-diagram`, `signup-journey`, `permission-model`.
2. Confirm referenced filenames exist.
3. Remove unused `.svg` sources only if they are not useful as editable source assets; otherwise keep them intentionally.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
grep -RniE 'architecture-diagram|signup-journey|permission-model' *.mdx docs.json images || true
```

### Task 1.4: Docs white-label and broken-link audit

**Objective:** Catch upstream names, stale hosts, and missing links before commit.

**Files:** docs repo only.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
grep -RniE 'AionUi|AionCore|aionui|Cowork|HermesHQ|hq\.gcaplabs|hermeshq|docs-mintlify|Mintlify placeholder|Paperclip|SOC 2|GDPR' . --include='*.mdx' --include='*.json' --include='*.svg' || true
node -e "JSON.parse(require('fs').readFileSync('docs.json','utf8')); console.log('docs.json ok')"
```

**Expected:** No user-facing stale names except intentional/internal runtime references.

### Task 1.5: Commit docs overhaul

**Objective:** Save the completed docs tab work cleanly.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
git status --short
git add docs.json *.mdx images logo favicon.svg DOCS-OVERHAUL-PLAN.md assetgen.md
git commit -m "docs: document console account and admin flows"
```

**Push:** only if user has said to push; otherwise stop at commit.

---

# Phase 2 — Finish `gcaplabs-site` marketing rewrite

Current finding: `gcaplabs-site` already has a huge dirty rewrite: 45 modified files and 8 untracked audit/manifest files. Work should review/finish that diff, not start over.

### Task 2.1: Confirm the site positioning spine

**Objective:** Lock site copy to the real product: Headmaster desktop + optional cloud console, not fabricated enterprise SaaS.

**Files:**
- Modify: `gcaplabs-site/app/page.tsx`
- Modify: `gcaplabs-site/components/HeroSection.tsx`
- Modify: `gcaplabs-site/components/ProductPillars.tsx`
- Modify: `gcaplabs-site/components/WorkEvidenceTrack.tsx`
- Modify: `gcaplabs-site/components/FinalCTA.tsx`
- Modify: `gcaplabs-site/src/data/productPillars.ts`
- Modify: `gcaplabs-site/src/data/useCases.ts`
- Keep/reference: `gcaplabs-site/rewrite.md`
- Keep/reference: `gcaplabs-site/MARKETING-POSITIONING-AUDIT.md`

**Required truth:**
- Headmaster is real and installable.
- Headmaster is a white-label of Hermes Agent, but public positioning should say Headmaster/GCAP, not lead with Hermes.
- Real app nav/features: Chat, Memory, Agents/Specialists, Automations, Kanban, Deliverables, Settings, Council, Activity, Documents, Workflows, Browser.
- 7 confirmed messaging platforms unless source proves more: Slack, Discord, Telegram, Lark, DingTalk, WeCom, WeiXin.
- TayX is coming soon; no benchmark claims.
- HQ is concept/future unless a real product repo is identified.

**Verification grep:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
grep -RniE 'Book a Demo|SOC 2|GDPR|205 issues|1302 commits|321 community|hours/week|hours saved|beta pilot|300\+|14 messaging|Approvals queue|Model Stack|Analytics dashboard|RBAC|workspace' app components src --include='*.tsx' --include='*.ts' --include='*.mdx' || true
```

Expected: hits are removed, softened, or intentionally documented in audit docs only.

### Task 2.2: Resolve `/products/hq`

**Objective:** Stop presenting invented HQ/Paperclip UI as shipped product reality.

**Files:**
- Modify: `gcaplabs-site/app/products/hq/page.tsx`
- Modify if needed: `gcaplabs-site/components/SiteNav.tsx`
- Modify if needed: `gcaplabs-site/app/docs/overview.mdx`
- Modify if needed: `gcaplabs-site/app/docs/page.tsx`

**Preferred default:** Keep the route but label it as concept / future research, with no fake screenshots, fake org chart, or fake budget widgets. If that page is too thin or still misleading, remove it from nav while preserving route text as a future-product placeholder.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
grep -RniE 'Paperclip|budget|org chart|CEO|Ops|Research|Comms|white-labeled from' app/products/hq app/docs components || true
```

### Task 2.3: Replace fictional screenshots with truthful placeholders/manifest

**Objective:** Remove fake dashboard screenshots from product-facing copy and wire the real-screen plan/placeholder path until real captures exist.

**Files:**
- Modify: `gcaplabs-site/src/data/productScreenshots.ts`
- Modify: `gcaplabs-site/src/data/realScreenshotPlan.ts`
- Modify: `gcaplabs-site/components/ProductShot.tsx`
- Modify: `gcaplabs-site/components/RealScreenshotPlaceholder.tsx`
- Modify: `gcaplabs-site/components/PinnedScrollSection.tsx`
- Modify: `gcaplabs-site/components/PinnedSplitSection.tsx`
- Keep/reference: `gcaplabs-site/SCREENSHOT-REPLACEMENT-MANIFEST.md`
- Keep/reference: `gcaplabs-site/docs/real-screenshot-inventory.md`
- Keep/reference: `gcaplabs-site/assetgen.md`

**Steps:**
1. Ensure old fake images in `gcap_headmaster_interface_images/*` are not used as if real.
2. Ensure placeholders are labeled as capture plan / real screen inventory, not product screenshots.
3. Ensure copy does not mention nonexistent Dashboard, Approvals queue, Analytics, Model Stack screens.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
grep -RniE 'gcap_headmaster_interface_images|generated/mockups|headmaster-laptop|Approvals|Analytics|Model Stack|Dashboard' app components src --include='*.tsx' --include='*.ts' --include='*.mdx' || true
```

Expected: old image references are either removed or quarantined in audit/manifest docs.

### Task 2.4: Purge fabricated security/changelog/use-case claims

**Objective:** Remove fake compliance badges, fake release history, fake user metrics, and fake benchmarks.

**Files:**
- Modify: `gcaplabs-site/app/security/page.tsx`
- Modify: `gcaplabs-site/components/BetaTrustRing.tsx`
- Modify: `gcaplabs-site/components/TrustControl.tsx`
- Modify: `gcaplabs-site/app/changelog/page.tsx`
- Modify: `gcaplabs-site/app/use-cases/page.tsx`
- Modify: `gcaplabs-site/app/use-cases/[vertical]/page.tsx`
- Modify: `gcaplabs-site/components/UseCases.tsx`
- Modify or delete if unused: `gcaplabs-site/components/TayX.tsx`
- Modify or delete if unused: `gcaplabs-site/components/FAQ.tsx`

**Default:** Delete unused dead components only after confirming zero imports. If uncertain, keep but remove fabricated claims.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
grep -RniE 'from .*/TayX|<TayX|from .*/FAQ|<FAQ' app components src || true
grep -RniE 'SOC 2|GDPR|AES-256|audit trail|MMLU|GPQA|SWE-bench|context length|205 issues|1302 commits|321 community|hours saved|hrs/week|beta pilot' app components src --include='*.tsx' --include='*.ts' --include='*.mdx' || true
```

### Task 2.5: Apply confirmed GCAP/Headmaster visual direction where appropriate

**Objective:** Align site branding with the confirmed logo spec sheets without inventing assets.

**Files:**
- Modify: `gcaplabs-site/app/layout.tsx`
- Modify: `gcaplabs-site/components/SiteNav.tsx`
- Modify: `gcaplabs-site/public/images/logo.svg`
- Modify if applicable: `gcaplabs-site/public/favicon.svg`
- Modify if applicable: `gcaplabs-site/app/favicon.ico`
- Reference: `C:/Users/Matve/Desktop/GCAP-Labs/gcap-labs/brand-logos/gcaplabs-logo-specsheet.png`
- Reference: `C:/Users/Matve/Desktop/GCAP-Labs/gcap-labs/brand-logos/headmaster-logo-specsheet.png`

**Required palette:**
- Black `#0D0F14`
- Blue `#2563FF`
- Purple `#7C3AED`
- Pink `#FF2D8F`
- Orange `#FFB020`
- Grey `#E5E7EB`

**Verification:** visual browser QA after build; grep for retired forest/green/parchment if the site has been intentionally moved to the new confirmed palette.

### Task 2.6: Site white-label grep audit

**Objective:** Mandatory scrub audit before deploy for a re-skinned site.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
grep -RniE 'AionUi|AionCore|aionui|aionrs|Cowork|Nous Research|Hermes Agent|HermesHQ|hermeshq|hq\.gcaplabs|Paperclip|SOC 2|GDPR|run_agent|Termux|BlueBubbles|QQBot|Camofox|Honcho|v0\.[0-9]+\.[0-9]+' app components src content public --include='*.tsx' --include='*.ts' --include='*.mdx' --include='*.md' --include='*.json' --include='*.svg' || true
```

Expected: only allowed/internal/reference hits remain, and each remaining public hit is justified.

### Task 2.7: Build and commit marketing rewrite

**Objective:** Prove site compiles after the copy/media cleanup.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
npm run lint
npm run build
git status --short
git add app components src public docs MARKETING-POSITIONING-AUDIT.md SCREENSHOT-REPLACEMENT-MANIFEST.md dark-ops-campaign-memo.md rewrite.md assetgen.md
git commit -m "site: align marketing with real Headmaster product"
```

**Expected:** lint and Next build pass.

---

# Phase 3 — Console follow-up links to docs

This is not the live credential clickthrough. This is code that can be done without credentials once docs pages exist.

### Task 3.1: Add user-facing Docs link in console shell

**Objective:** Make the docs discoverable from the console UI.

**Files:**
- Modify: `gcaplabs-console/src/components/DashboardShell.tsx` if present, otherwise locate the current dashboard shell/layout.
- Search candidates found: `gcaplabs-console/src/lib/dashboard-tabs.ts`, `gcaplabs-console/src/components/RuntimeSettingsTab.tsx`, `gcaplabs-console/src/app/dashboard/agents/[agentId]/[[...tab]]/page.tsx`.

**Steps:**
1. Search for the dashboard nav/sidebar component.
2. Add a `Docs` link to `https://docs.gcaplabs.com` in the account/footer area, not as an admin-only tab.
3. Keep it external and non-mutating.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-console
grep -Rni 'docs.gcaplabs.com' src || true
npm run typecheck
npm run build
```

### Task 3.2: Link pending-approval screen to docs

**Objective:** When a pending user is gated, send them to the explanation page instead of leaving them guessing.

**Files:**
- Modify: `gcaplabs-console/src/app/dashboard/agents/[agentId]/[[...tab]]/page.tsx`
- Modify if found elsewhere: the component/string rendering `pending approval`.

**Expected link:** `https://docs.gcaplabs.com/signing-up-and-approval`

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-console
grep -RniE 'pending approval|signing-up-and-approval|docs.gcaplabs.com' src
npm run typecheck
npm run build
```

### Task 3.3: Commit console docs-link follow-up

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-console
git add src
git commit -m "feat: link console states to docs"
```

---

# Phase 4 — Headmaster Desktop UI polish from confirmed mockups

This is the actionable desktop item from the Headmaster Desktop tab: “UI reference mockups received — future redesign, not started.” The goal is a polished first pass, not a total rewrite of every page.

### Task 4.1: Inventory current chat/sidebar structure

**Objective:** Confirm actual file boundaries before editing.

**Files to read first:**
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/layout/Sider/index.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/layout/Sider/SiderItem.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/layout/Sider/SiderFooter.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/layout/Sider/TeamSiderSection.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/layout/Sider/SiderNav/GatewayStatusIndicator.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/pages/conversation/components/ChatLayout/index.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/components/chat/SendBox/index.tsx`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/styles/layout.css`

**Verification:** Produce a short implementation note listing which files actually own sidebar, hero/empty state, composer/send button, and status footer.

### Task 4.2: Add Headmaster design tokens

**Objective:** Add reusable tokens for the confirmed blue→purple→pink→orange brand direction.

**Files likely to modify:**
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/styles/layout.css`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/styles/arco-override.css`
- `gcaplabs-headmasterUI/packages/desktop/src/renderer/pages/settings/AppearanceSettings/presets/default.css`

**Tokens to introduce or map:**
- `--hm-bg: #0D0F14`
- `--hm-blue: #2563FF`
- `--hm-purple: #7C3AED`
- `--hm-pink: #FF2D8F`
- `--hm-orange: #FFB020`
- `--hm-grey: #E5E7EB`
- `--hm-gradient-brand: linear-gradient(135deg, #2563FF 0%, #7C3AED 40%, #FF2D8F 72%, #FFB020 100%)`

**Verification:** `bunx tsc --noEmit` should still pass; no visual changes required yet if tokens only added.

### Task 4.3: Sidebar polish pass

**Objective:** Match the mockup direction: account row, New Chat/Search/Chat/Memory/Apps nav, Council section, app/version/green status footer.

**Files likely to modify:**
- `packages/desktop/src/renderer/components/layout/Sider/index.tsx`
- `packages/desktop/src/renderer/components/layout/Sider/SiderItem.tsx`
- `packages/desktop/src/renderer/components/layout/Sider/SiderFooter.tsx`
- `packages/desktop/src/renderer/components/layout/Sider/TeamSiderSection.tsx`
- `packages/desktop/src/renderer/components/layout/Sider/SiderNav/GatewayStatusIndicator.tsx`
- locale JSON under `packages/desktop/src/renderer/services/i18n/locales/` if strings are localized.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
bunx tsc --noEmit
grep -RniE 'AionUi|aionui|Cowork|"Hermes"' packages/desktop/src/renderer --include='*.tsx' --include='*.ts' --include='*.json' || true
```

Expected: no new user-visible upstream names.

### Task 4.4: Chat hero and composer polish pass

**Objective:** Implement the visible “Hi, what’s your plan for today?” hero with soft blurred gradient glow and gradient send/New Chat buttons.

**Files likely to modify:**
- `packages/desktop/src/renderer/pages/conversation/components/ChatLayout/index.tsx`
- `packages/desktop/src/renderer/pages/conversation/components/ChatConversation.tsx`
- `packages/desktop/src/renderer/components/chat/SendBox/index.tsx`
- Any colocated CSS/module files discovered in Task 4.1.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
bunx tsc --noEmit
bunx vitest run tests/unit/common-adapter/httpBridge.test.ts --reporter=dot
```

### Task 4.5: Status pill components / styling

**Objective:** Add reusable status-pill styling for High Priority, Processing, Connected, Warning where existing badges/status chips exist.

**Files to locate/read first:**
- Search for existing badge/status components in `packages/desktop/src/renderer`.
- Likely areas: Activity page, Kanban cards, Gateway status, team/council banners.

**Command:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
grep -RniE 'Badge|Pill|status|priority|processing|connected|warning' packages/desktop/src/renderer --include='*.tsx' --include='*.ts'
```

**Verification:** typecheck; visual smoke if user allows desktop dev run.

### Task 4.6: Desktop build verification

**Objective:** Prove desktop still compiles after UI polish.

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
bunx tsc --noEmit
bunx electron-vite build --config packages/desktop/electron.vite.config.ts
```

Optional quick runnable build if requested:

```bash
node scripts/build-with-builder.js auto --win --dir
```

**Commit:**

```bash
git add packages/desktop/src
git commit -m "feat: apply Headmaster desktop UI polish"
```

---

# Phase 5 — Desktop housekeeping: optional `hermeshq/` vendored tree removal

Artifact status: low priority, doable only if proven unused.

### Task 5.1: Audit references to vendored `hermeshq/`

**Objective:** Make deletion safe.

**Files/dirs:**
- Audit: `gcaplabs-headmasterUI/hermeshq/`
- Audit: `gcaplabs-headmasterUI/electron-builder.yml` if present
- Audit: `gcaplabs-headmasterUI/scripts/`
- Audit: `gcaplabs-headmasterUI/packages/desktop/src/process/`

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
grep -RniE 'hermeshq/|hermeshq\\|bundled-hermeshq|HermesHQ|hq\.gcaplabs|hermeshq' package.json electron-builder.yml scripts packages --exclude-dir=node_modules || true
```

**Decision:**
- If active build/runtime code still references `hermeshq/`, do not delete; write `hermeshq-removal-audit.md` update with blockers.
- If only docs/historical references remain, delete the tree and update audit doc.

### Task 5.2: Verify after optional deletion

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
bunx tsc --noEmit
bunx electron-vite build --config packages/desktop/electron.vite.config.ts
```

**Commit:**

```bash
git add .
git commit -m "chore: remove unused vendored HermesHQ tree"
```

If deletion is not safe:

```bash
git add hermeshq-removal-audit.md
git commit -m "docs: record HermesHQ vendored tree audit"
```

---

# Phase 6 — STT stays disabled, but verify fail-closed behavior

Artifact status: deliberately disabled by design. Do not enable.

### Task 6.1: Audit STT call sites

**Objective:** Ensure no UI path calls dead STT endpoints while `isSttAvailable()` is false.

**Files:**
- Read/modify only if needed: `packages/desktop/src/common/adapter/httpBridge.ts`
- Read/modify only if needed: `packages/desktop/src/common/adapter/hermesChatAdapter.ts`
- Read/modify only if needed: `packages/desktop/src/renderer/services/SpeechToTextService.ts`
- Read/modify only if needed: `packages/desktop/src/renderer/services/speech/SpeechStreamClient.ts`
- Read/modify only if needed: `packages/desktop/src/renderer/components/settings/SettingsModal/contents/SystemModalContent/VoiceInputSection/index.tsx`

**Commands:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
grep -RniE 'isSttAvailable|/api/stt|stt/stream|SpeechToText|SpeechStream' packages/desktop/src tests --include='*.ts' --include='*.tsx'
```

**Expected:** STT availability predicate remains false unless a real endpoint contract is introduced.

**Commit:** only if audit finds and fixes a leak.

---

# Phase 7 — HeadmasterCore long-horizon track, separated from finish-batch

This is on the artifact board, but it is not a small cleanup item. Do not bury it inside docs/site commits.

### Task 7.1: Write a dedicated HeadmasterCore implementation plan

**Objective:** Convert the roadmap into a separate plan before touching code.

**Files:**
- Create: `gcaplabs-headmasterUI/.hermes/plans/<timestamp>-headmastercore-roadmap.md`
- Read: `_support/upstream/aioncore/` manifests and crates
- Read: `gcaplabs-headmasterUI/packages/desktop/src/renderer/pages/team/`
- Read: `gcaplabs-headmasterUI/packages/desktop/src/renderer/pages/conversation/Preview/` if present
- Read: `gcaplabs-headmasterUI/packages/desktop/src/renderer/pages/conversation/Workspace/`
- Read: `gcaplabs-headmasterUI/packages/desktop/src/common/adapter/backendUrl.ts`

**Plan must cover:**
1. Collapse desktop remote mode onto `/v1` transport only; preserve local dashboard fallback until explicitly removed.
2. Fork/vendor AionCore into HeadmasterCore without editing `_support/upstream/aioncore` directly.
3. Rebrand user-visible AionCore/OfficeCLI/Council names.
4. Expose shell/file/office/team capabilities over MCP with explicit user consent.
5. Register HeadmasterCore tools in remote Hermes/Agent37 sessions via forward auth.
6. Re-home Preview, OfficeCLI, and Councils.

**Verification for this task:** plan file exists; no production code changed.

---

# Phase 8 — Cross-project tracker/artifact refresh

Do after code/docs/site commits, not before.

### Task 8.1: Refresh `gcaplabs-home` status docs

**Objective:** Make the cross-project hub reflect what actually landed.

**Files:**
- Modify: `gcaplabs-home/state/cross-project-status.md` if present
- Modify: `gcaplabs-home/trackers/*.md` as needed
- Modify: `gcaplabs-home/notebooklm/STATUS.md` if source sync state changes
- Modify: `gcaplabs-home/claudeartifact/mastertodo-status-board.md`
- Modify: `gcaplabs-home/claudeartifact/kanban-workflow-summary.md`
- Modify if maintaining interactive artifact source: `gcaplabs-home/claudeartifact/mastertodo.html`

**Steps:**
1. Mark docs overhaul done only after docs commit passes validation.
2. Mark marketing rewrite/screenshot placeholder done only after site build passes.
3. Leave iOS/manual smoke/live credential checks explicitly on hold.
4. Do not re-open duplicate-send or remote-mode endpoint noise; they are already fixed.
5. Record HeadmasterCore as a separate long-horizon plan, not part of the cleanup batch.

**Verification:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-home
grep -RniE 'duplicate-send|remote-mode|docs overhaul|marketing|screenshots|iOS|manual smoke|HeadmasterCore' claudeartifact state trackers || true
git diff --stat
```

### Task 8.2: Optional NotebookLM bundle refresh

**Objective:** Refresh NotebookLM sources only if the CLI/auth is available and the user wants it.

**Files/scripts:**
- `gcaplabs-home/notebooklm/scripts/regenerate-bundles.ps1`
- `gcaplabs-home/notebooklm/scripts/upload-bundles.ps1`
- `gcaplabs-home/notebooklm/scripts/audit-notebooks.ps1`

**Note:** AGENTS lists PowerShell commands, but this Hermes terminal is Bash/MSYS. If executing from Hermes, either invoke `powershell.exe -ExecutionPolicy Bypass -File ...` explicitly or ask the user to run the scripts in PowerShell.

**Commands from Bash:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-home/notebooklm/scripts
powershell.exe -ExecutionPolicy Bypass -File ./regenerate-bundles.ps1
powershell.exe -ExecutionPolicy Bypass -File ./upload-bundles.ps1
powershell.exe -ExecutionPolicy Bypass -File ./audit-notebooks.ps1
```

**Commit:**

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-home
git add state trackers notebooklm claudeartifact
git commit -m "docs: refresh cross-project status board"
```

---

# Phase 9 — Final verification matrix

Run only the relevant rows for repos touched.

## `gcaplabs-docs`

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-docs
node -e "JSON.parse(require('fs').readFileSync('docs.json','utf8')); console.log('docs.json ok')"
grep -RniE 'AionUi|AionCore|Cowork|HermesHQ|hq\.gcaplabs|docs-mintlify|Mintlify placeholder' . --include='*.mdx' --include='*.json' --include='*.svg' || true
git status --short
```

## `gcaplabs-site`

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-site
npm run lint
npm run build
grep -RniE 'SOC 2|GDPR|205 issues|1302 commits|321 community|hours saved|beta pilot|AionUi|HermesHQ|Paperclip|Approvals queue|Model Stack' app components src content --include='*.tsx' --include='*.ts' --include='*.mdx' --include='*.md' || true
git status --short
```

## `gcaplabs-console`

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-console
npm run typecheck
npm run build
grep -Rni 'docs.gcaplabs.com' src || true
git status --short
```

## `gcaplabs-headmasterUI`

```bash
cd C:/Users/Matve/Desktop/GCAP-Labs/gcaplabs-headmasterUI
bunx tsc --noEmit
bunx electron-vite build --config packages/desktop/electron.vite.config.ts
grep -RniE '"AionUi|"aionui|"aionrs|"Cowork|"Hermes"' packages/desktop/src/renderer --include='*.tsx' --include='*.ts' --include='*.json' || true
git status --short
```

---

# Done when

This plan is complete when:

1. `gcaplabs-docs` docs overhaul is validated and committed, or explicitly marked already complete with evidence.
2. `gcaplabs-site` marketing rewrite/screenshot-truthiness work builds cleanly and is committed.
3. `gcaplabs-console` links users to docs for console/pending states, if docs URLs are live/known.
4. `gcaplabs-headmasterUI` has either a committed first-pass desktop UI polish or a scoped follow-up if the user defers UI work.
5. Optional `hermeshq/` deletion is either done with build proof or documented as unsafe.
6. STT remains fail-closed with no dead endpoint calls.
7. iOS/manual smoke/live credential tasks remain explicitly on hold, not forgotten.
8. `gcaplabs-home/claudeartifact` and related status docs are refreshed after the real repo commits land.

---

## Open questions / defaults

- DEFAULT: Commit locally after each repo validates. Push only if the user says “push” or “full send.”
- DEFAULT: Keep dirty `gcaplabs-docs` and `gcaplabs-site` changes and finish them; do not stash.
- DEFAULT: `/products/hq` becomes future/concept, not deleted, unless the user says to remove it entirely.
- DEFAULT: Real screenshots are represented by truthful placeholders/manifest until a runnable sanitized desktop session exists.
- DEFAULT: HeadmasterCore gets its own dedicated plan/spike before code; it is too large and risky to sneak into this finish batch.
