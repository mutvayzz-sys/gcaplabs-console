# Headmaster Open WebUI integration

This directory is a branded working copy of the real Open WebUI source, not the previous custom Next.js Console clone.

## Integration decision

Current `gcaplabs-console/` is a Next.js Agent37 starter-kit app. Open WebUI is a SvelteKit + Python backend app. The clean integration path is therefore a fork/replacement app, not a component graft into the existing Next tree.

Options compared:

1. Replace `gcaplabs-console/` with this Open WebUI fork
   - Best if Console should literally become Open WebUI.
   - Keeps upstream Open WebUI structure intact.
   - Requires separate Agent37/data-plane adapter work if we want Open WebUI chat to talk directly to Agent37 rather than Open WebUI's own backend model plumbing.

2. Embed Open WebUI inside the current Next Console
   - Not recommended.
   - Cross-framework integration would fight SvelteKit routing/assets/runtime and still need backend compatibility work.

3. Keep both apps side by side
   - Useful temporarily for evaluation.
   - Not a final product shape.

Chosen for this pass: option 1 as a side-by-side working copy (`gcaplabs-console-openwebui/`) so the existing Console repo is not destructively replaced until the migration is explicitly accepted.

## Branding applied

Open WebUI attribution is intentionally retained because the Open WebUI license restricts removing or replacing its branding outside specific cases.

Touched source files:

- `backend/open_webui/env.py` — default visible name set to `Headmaster`, while Open WebUI suffix remains enforced.
- `src/lib/components/headmaster/HeadmasterMark.svelte` — Headmaster SVG mark.
- `src/app.css` — Headmaster palette, auth background, full-height auth panel, primary gradients, sidebar treatments.
- `src/routes/auth/+page.svelte` — full-height Headmaster auth surface with `Built on Open WebUI` attribution.
- `src/lib/components/layout/Sidebar.svelte` — expanded/collapsed chat sidebar Headmaster mark + lockup.
- `src/lib/components/app/AppSidebar.svelte` — app rail Headmaster mark.
- `src/lib/components/chat/Placeholder.svelte` — branded empty chat welcome with Open WebUI attribution.
- `scripts/headmaster-visual-mock-server.py` — tiny local mock API for visual QA of built static assets only.

## Verification performed

Open WebUI requires Node `>=18.13.0 <=22.x.x`; this machine's system Node is `v24.13.1`, so a temporary Node `v22.13.1` zip was used for verification and removed afterward.

Commands run:

```bash
npm ci
npm run check
npm run build
python scripts/headmaster-visual-mock-server.py
```

Results:

- `npm ci` with system Node 24 failed as expected with `EBADENGINE`.
- `npm ci` with Node 22.13.1 succeeded: `added 1120 packages`.
- `npm run check` failed on upstream Open WebUI baseline TypeScript/Svelte diagnostics (`9526 errors and 273 warnings in 376 files`), mostly pre-existing JS implicit-any/store typing issues. This is not a clean gate for this upstream snapshot.
- `npm run build` succeeded after branding changes. Final build ended with:

```text
✓ built in 5m 25s
Run npm run preview to preview your production build locally.
> Using @sveltejs/adapter-static
  Wrote site to "build"
  ✔ done
```

Visual QA:

- `/auth` showed a full-height Headmaster auth panel, not a centered card, with `Built on Open WebUI` attribution.
- Authenticated shell loaded against the mock API.
- App rail, collapsed chat sidebar, welcome mark, and placeholder copy use Headmaster branding.
- Footer still shows `Headmaster (Open WebUI) · v0.10.2`.

Generated cleanup performed afterward:

```bash
rm -rf node_modules build .svelte-kit static/pyodide
```

Rebuild requires reinstalling dependencies and using Node 22.x.
