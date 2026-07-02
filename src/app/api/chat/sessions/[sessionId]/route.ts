import { headmasterAgent } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, readJson } from "@/lib/http";

export async function GET(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    await requireUser();
    // requireUser throws if not signed in
    const { sessionId } = await params;
    const session = await headmasterAgent.getSession(sessionId);
    return Response.json(session);
  } catch (e) {
    return handleError(e);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    await requireUser();
    // requireUser throws if not signed in
    const { sessionId } = await params;
    const body = await readJson<{ title?: string }>(request);
    if (!body.title) throw new ApiError(400, "invalid_request", "title is required");
    const result = await headmasterAgent.renameSession(sessionId, body.title);
    return Response.json(result);
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  try {
    await requireUser();
    // requireUser throws if not signed in
    const { sessionId } = await params;
    const result = await headmasterAgent.deleteSession(sessionId);
    return Response.json(result);
  } catch (e) {
    return handleError(e);
  }
}