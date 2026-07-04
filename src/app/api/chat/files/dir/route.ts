import { headmasterAgent } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireUser();
    const path = new URL(request.url).searchParams.get("path");
    if (!path) return new Response(JSON.stringify({ error: { message: "path query param is required" } }), { status: 400, headers: { "Content-Type": "application/json" } });
    return json(await headmasterAgent.makeDir(path));
  } catch (e) {
    return handleError(e);
  }
}