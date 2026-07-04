import { runtimeApi, getCurrentManagedRuntime } from '@/lib/managed-runtime';
import { requireUser } from '@/lib/auth';
import { handleError, json } from '@/lib/http';

const MIN_SEARCH = 3;
// Matches the Hosting API's own clamp (1-24, default 12) — clamp here too so an out-of-range
// value from a client doesn't get forwarded and rejected upstream with a 400.
const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 24;

export async function GET(request: Request) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || undefined;
    if (search && search.length < MIN_SEARCH) return json({ toolkits: [], nextCursor: null });

    const cursor = searchParams.get('cursor')?.trim() || undefined;
    const rawLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(Math.trunc(rawLimit), MAX_LIMIT) : DEFAULT_LIMIT;

    const runtime = await getCurrentManagedRuntime();
    const result = await runtimeApi.listIntegrationToolkits(runtime.id, { search, cursor, limit });
    return json({ toolkits: result.items ?? [], nextCursor: result.nextCursor ?? null });
  } catch (e) {
    return handleError(e);
  }
}
