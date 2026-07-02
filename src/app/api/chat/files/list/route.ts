import { headmasterAgent } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

// List one directory level of the user's runtime filesystem for the Files tab.
// `path` is optional — omitting it lists the default workspace dir.
export async function GET(request: Request) {
  try {
    await requireUser();
    const path = new URL(request.url).searchParams.get("path") || undefined;
    return json(await headmasterAgent.listFiles(path));
  } catch (e) {
    return handleError(e);
  }
}