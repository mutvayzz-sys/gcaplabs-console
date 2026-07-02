import { listToolkits } from "@/lib/composio";
import { requireUser } from "@/lib/auth";
import { handleError, json } from "@/lib/http";

const MIN_SEARCH = 3; // Composio 400s a non-empty query shorter than this

export async function GET(request: Request) {
  try {
    await requireUser();
    const search = new URL(request.url).searchParams.get("search")?.trim() || undefined;
    if (search && search.length < MIN_SEARCH) return json({ toolkits: [] });
    return json({ toolkits: await listToolkits(search) });
  } catch (e) {
    return handleError(e);
  }
}
