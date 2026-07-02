import { headmasterAgent } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function DELETE(request: Request) {
  try {
    await requireUser();
    const path = new URL(request.url).searchParams.get("path");
    if (!path) return new Response(JSON.stringify({ error: { message: "path query param is required" } }), { status: 400, headers: { "Content-Type": "application/json" } });
    return json(await headmasterAgent.deleteFile(path));
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireUser();
    const body = (await request.json()) as { from?: string; to?: string };
    if (!body.from || !body.to) {
      return new Response(JSON.stringify({ error: { message: "from and to are required" } }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    return json(await headmasterAgent.moveFile(body.from, body.to));
  } catch (e) {
    return handleError(e);
  }
}