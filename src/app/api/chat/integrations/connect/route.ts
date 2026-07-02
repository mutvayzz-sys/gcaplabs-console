import { initiateConnection } from "@/lib/composio";
import { requireUser } from "@/lib/auth";
import { agentTabPath } from "@/lib/dashboard-tabs";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import { MANAGED_AGENT_ID } from "@/lib/managed-agent";

export async function POST(request: Request) {
  try {
    const { user } = await requireUser();
    const { toolkit } = await readJson<{ toolkit?: string }>(request);
    if (!toolkit || typeof toolkit !== "string") {
      throw new ApiError(400, "invalid_request", "toolkit is required");
    }

    const callbackUrl = `${new URL(request.url).origin}${agentTabPath(MANAGED_AGENT_ID, "integrations")}`;
    const result = await initiateConnection({ toolkitSlug: toolkit, userId: user.id, callbackUrl });
    return json({ redirectUrl: result.redirectUrl, connectedAccountId: result.connectedAccountId });
  } catch (e) {
    return handleError(e);
  }
}
