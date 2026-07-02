import { listToolkits, type ToolkitSort } from '@/lib/composio';
import { requireUser } from '@/lib/auth';
import { handleError, json } from '@/lib/http';

const MIN_SEARCH = 3; // Composio 400s a non-empty query shorter than this

function parseSort(value: string | null): ToolkitSort {
  return value === 'alphabetically' ? 'alphabetically' : 'usage';
}

export async function GET(request: Request) {
  try {
    await requireUser();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim() || undefined;
    if (search && search.length < MIN_SEARCH) return json({ toolkits: [], nextCursor: null });

    const sortBy = parseSort(searchParams.get('sort'));
    const cursor = searchParams.get('cursor') || undefined;
    const { items, nextCursor } = await listToolkits({ search, sortBy, cursor });
    return json({ toolkits: items, nextCursor });
  } catch (e) {
    return handleError(e);
  }
}
