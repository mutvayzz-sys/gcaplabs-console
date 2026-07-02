import { instanceFetch } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/http";

// Stream an archive of a directory from the user's runtime.
export async function GET(request: Request) {
  try {
    await requireUser();
    const path = new URL(request.url).searchParams.get("path") || "";
    const upstream = await instanceFetch(`/v1/files/archive?path=${encodeURIComponent(path)}`);
    if (!upstream.ok || !upstream.body) {
      return new Response(await upstream.text(), { status: upstream.status || 502 });
    }
    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": upstream.headers.get("Content-Type") ?? "application/zip",
        "Content-Disposition": upstream.headers.get("Content-Disposition") ?? "attachment",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}