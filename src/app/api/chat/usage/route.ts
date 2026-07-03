import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function GET(request: Request) {
  try {
    await requireUser();
    const runtime = await getCurrentAgent37Runtime();
    const month = new URL(request.url).searchParams.get("month") || undefined;
    return json(await agent37.getUsage(runtime.id, month));
  } catch (e) {
    return handleError(e);
  }
}
