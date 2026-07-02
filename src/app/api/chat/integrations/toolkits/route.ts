import { agent37, getCurrentAgent37Runtime } from '@/lib/agent37';
import { requireUser } from '@/lib/auth';
import { handleError, json } from '@/lib/http';

const MIN_SEARCH = 3;

export async function GET(request: Request) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || undefined;
    if (search && search.length < MIN_SEARCH) return json({ toolkits: [], nextCursor: null });

    const runtime = await getCurrentAgent37Runtime();
    const result = await agent37.listIntegrationToolkits(runtime.id, { search });
    return json({ toolkits: result.items ?? [], nextCursor: null });
  } catch (e) {
    return handleError(e);
  }
}
