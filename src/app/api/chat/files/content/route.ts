import { instanceFetch } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/http";

// Stream a file's bytes from the user's runtime. Uses raw fetch (not JSON) so the
// full binary body streams through with the correct Content-Type from upstream.
export async function GET(request: Request) {
  try {
    await requireUser();
    const path = new URL(request.url).searchParams.get("path");
    if (!path) return new Response("path query param is required", { status: 400 });

    const upstream = await instanceFetch(`/v1/files/content?path=${encodeURIComponent(path)}`);
    if (!upstream.ok || !upstream.body) {
      return new Response(await upstream.text(), { status: upstream.status || 502 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/octet-stream",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? `attachment; filename="${path.split("/").pop()}"`,
      },
    });
  } catch (e) {
    return handleError(e);
  }
}