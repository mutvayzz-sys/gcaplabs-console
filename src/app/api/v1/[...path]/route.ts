import { instanceFetch } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/http";

type Ctx = { params: Promise<{ path: string[] }> };

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
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch (e) {
    return handleError(e);
  }
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const maxDuration = 300;
