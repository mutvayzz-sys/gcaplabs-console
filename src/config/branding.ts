// GCAP Headmaster console branding.
// `logoUrl` can be a path to a file in /public (e.g. "/logo.svg") or an
// absolute URL; "" hides it. Replace with a real logo once the asset exists.
export const branding = {
  appName: "Headmaster",
  appShortName: "Headmaster",
  logoUrl: "",
  // Site-wide theme tokens — keep in sync with docs/theming/gcap-brand-tokens.ts
  theme: {
    primary: "#1a4d2e",
    primaryHover: "#143d25",
    gold: "#c9a96e",
    paper: "#f4f1ea",
    surface: "#faf7f2",
    ink: "#1a1814",
    muted: "#5e564a",
  },
} as const;