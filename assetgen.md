# assetgen — gcaplabs-console (GCAP Labs Console)

Scope: GCAP-original media only. This repo has exactly one media asset.

| Asset | Path | Description | Regen prompt |
|---|---|---|---|
| Demo recording | `screenshots/demo.gif` | Screen recording used in the README hero, showing the GCAP Labs Console dashboard and an agent workspace/chat in action. | **Not an image-gen candidate** — this is a real product screen capture, not an illustration. To "regenerate": re-record a fresh screen capture of the current dashboard + agent workspace (e.g. with a tool like ScreenToGif/Kap), 1280×800+, under ~15s, looping, showing: (1) the fleet/dashboard view, (2) opening a chat with an agent, (3) a file or integration action completing. Keep it silent/no-cursor-clutter and trim to the essential loop. |

## Notes
- No logo, favicon, or icon files exist in this repo currently (no `public/` directory with brand assets was found). There's no locked GCAP mark to build from yet either — only the color tokens in `gcaplabs-site/app/globals.css` (light backgrounds, forest-green `#1A4D2E` accent) are established; see `masterassets.md` at the repo root.
- This repo is the cloud console/BFF behind the Headmaster desktop app's managed-runtime cloud integration, not an unrelated side project. Once the console UI is stable, the demo recording above should show the real fleet/agent view, not a mockup.
