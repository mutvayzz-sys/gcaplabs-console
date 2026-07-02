import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function GET() {
  try {
    await requireUser();
    const runtime = await getCurrentAgent37Runtime();
    const result = await agent37.listIntegrationConnections(runtime.id);
    return json({ connections: result.connections });
  } catch (e) {
    return handleError(e);
  }
}
