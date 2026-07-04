import { instanceFetch } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/http";

type Ctx = { params: Promise<{ path: string[] }> };

const ALLOWED_CORS_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "file://",
  "null",
]);

const ALLOWED_CORS_HEADERS = [
  "Authorization",
  "Content-Type",
  "X-Hermes-Session-Key",
  "X-Hermes-Session-Token",
].join(", ");

function corsHeaders(request: Request): Headers {
  const headers = new Headers();
  const origin = request.headers.get("origin") ?? "";
  if (ALLOWED_CORS_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", ALLOWED_CORS_HEADERS);
  headers.set("Access-Control-Max-Age", "600");
  return headers;
}

function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of corsHeaders(request)) {
    headers.set(key, value);
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

async function proxy(request: Request, { params }: Ctx) {
  try {
    await requireUser();
    const { path } = await params;
    const url = new URL(request.url);
    const suffix = path.map(encodeURIComponent).join("/");
    const query = url.search || "";
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.arrayBuffer();

    const headers = new Headers(request.headers);
    headers.delete("host");
    headers.delete("content-length");
    // The upstream Runtime Provider key is added server-side by instanceFetch. Client Bearer
    // tokens authenticate to this BFF only and never leave the console.
    headers.delete("authorization");

    const upstream = await instanceFetch(`/v1/${suffix}${query}`, {
      method: request.method,
      headers,
      body,
    });

    const responseHeaders = new Headers(upstream.headers);
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");
    return withCors(request, new Response(upstream.body, { status: upstream.status, headers: responseHeaders }));
  } catch (e) {
    return withCors(request, handleError(e));
  }
}

export function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const maxDuration = 300;
