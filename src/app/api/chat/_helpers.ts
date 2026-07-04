// Shared helpers for the chat/data-plane BFF routes. This is NOT a Next.js route (only
// `route.ts` files are endpoints), just a private module the route handlers in this tree import —
// it keeps the streaming/byte-proxy error handling DRY without growing the app-wide `@/lib/http`.

import { ApiError } from "@/lib/http";

// Trim a user-supplied string and reject empty input with a 400 — the shape every create/rename/
// move/delete handler that takes a `path`/`from`/`to`/`title` needs.
export function requireTrimmed(value: string | null | undefined, message: string): string {
  const trimmed = (value ?? "").trim();
  if (!trimmed) throw new ApiError(400, "invalid_request", message);
  return trimmed;
}

// Turn an managed runtime error body into a member-safe message. Errors come back nested
// ({"error":{...}}) or flat; a non-JSON body (e.g. a 502 HTML page) is logged server-side under
// `context` and collapsed to `fallback` so we never echo internals. Consumes the Response body —
// call only on the failure path (the success path keeps `upstream.body` intact).
export async function upstreamErrorMessage(upstream: Response, context: string, fallback: string): Promise<string> {
  const text = await upstream.text().catch(() => "");
  try {
    const j = JSON.parse(text) as { error?: { message?: string }; message?: string };
    return j.error?.message || j.message || fallback;
  } catch {
    if (text) console.error(`[${context}] non-JSON upstream`, upstream.status, text.slice(0, 500));
    return fallback;
  }
}