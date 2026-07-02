import { listConnectedAccounts } from "@/lib/composio";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

export async function GET() {
  try {
    const { user } = await requireUser();
    return json({ connections: await listConnectedAccounts(user.id) });
  } catch (e) {
    return handleError(e);
  }
}
