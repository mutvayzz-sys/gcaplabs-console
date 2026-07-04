// GCAP Headmaster console branding.
// `logoUrl` can be a path to a file in /public (e.g. "/logo.svg") or an
// absolute URL; "" hides it. Replace with a real logo once the asset exists.
export const branding = {
  appName: "Headmaster",
  appShortName: "Headmaster",
  logoUrl: "",
  // Site-wide theme tokens — keep in sync with src/app/globals.css.
  // v0.2.0, 2026-07-05: replaces the retired green/gold/parchment palette.
  // Source: owner-supplied Headmaster logo spec sheet + UI reference mockups.
  theme: {
    primary: "#2563ff",
    accent: "#7c3aed",
    ink: "#0d0f14",
    paper: "#ffffff",
    surface: "#f1f2f6",
    muted: "#5b6472",
    pillPriority: "#ff2d8f",
    pillWarning: "#ffb020",
  },
} as const;