import { headmasterAgent } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError } from "@/lib/http";

export async function GET() {
  try {
    await requireUser();
    // requireUser throws if not signed in
    const models = await headmasterAgent.listModels();
    return Response.json(models);
  } catch (e) {
    return handleError(e);
  }
}