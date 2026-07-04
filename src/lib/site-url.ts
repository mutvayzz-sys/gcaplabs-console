const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);
const PROTOCOL_RE = /^[a-z][a-z0-9+.-]*:\/\//i;

// Canonicalise `console.gcaplabs.com` → `www.console.gcaplabs.com`. The bare
// apex 308s at the Vercel edge and the cross-host follow-up drops
// Authorization headers under Node fetch (the desktop sees 401 "Sign in
// required" right after a successful login). Anywhere we return a site
// origin to the client should go through this so we never hand back the
// apex by accident — even if NEXT_PUBLIC_SITE_URL is stale.
function canonicaliseGcaplabsHost(origin: string): string {
  try {
    const url = new URL(origin);
    if (url.hostname === "console.gcaplabs.com") {
      url.hostname = "www.console.gcaplabs.com";
    }
    return url.toString().replace(/\/+$/, "");
  } catch {
    return origin;
  }
}

function withDefaultProtocol(value: string): string {
  if (PROTOCOL_RE.test(value)) return value;

  const host = value.split(/[/?#]/, 1)[0]?.replace(/:\d+$/, "").replace(/^\[|\]$/g, "");
  const protocol = host && LOCAL_HOSTNAMES.has(host) ? "http" : "https";
  return `${protocol}://${value}`;
}

export function normalizeOrigin(value?: string | null): string | null {
  const trimmed = value?.trim().replace(/\/+$/, "");
  if (!trimmed) return null;

  try {
    const url = new URL(withDefaultProtocol(trimmed));
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isLocalOrigin(origin: string): boolean {
  try {
    return LOCAL_HOSTNAMES.has(new URL(origin).hostname);
  } catch {
    return false;
  }
}

// Open-redirect guard for `?next=` params: only internal absolute paths (`/foo`) are
// allowed — never protocol-relative (`//evil.com`) or absolute URLs. Falls back to
// /dashboard. Shared by the login page and the /auth/callback route so the two can't drift.
export function safeNextPath(raw?: string | null): string {
  return raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
}

export function publicSiteOrigin(fallbackOrigin?: string | null): string {
  const configured = normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  const fallback = normalizeOrigin(fallbackOrigin);

  const pick = (origin: string | null) => {
    if (!origin) return null;
    if (isLocalOrigin(origin)) return origin;
    return canonicaliseGcaplabsHost(origin);
  };

  const configuredCanonical = pick(configured);
  const fallbackCanonical = pick(fallback);

  if (configuredCanonical && !(isLocalOrigin(configuredCanonical) && fallbackCanonical && !isLocalOrigin(fallbackCanonical))) {
    return configuredCanonical;
  }

  return fallbackCanonical || configuredCanonical || "http://localhost:3000";
}
