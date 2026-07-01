import { hermeshq } from "@/lib/hermeshq";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError } from "@/lib/http";

export async function POST(_request: Request, { params }: { params: Promise<{ responseId: string }> }) {
  try {
    await requireUser();
    // requireUser throws if not signed in
    const { responseId } = await params;
    const result = await hermeshq.cancelResponse(responseId);
    return Response.json(result);
  } catch (e) {
    return handleError(e);
  }
}