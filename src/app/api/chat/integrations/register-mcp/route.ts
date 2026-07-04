import { requireUser } from '@/lib/auth';
import { ApiError, handleError, json, readJson } from '@/lib/http';

// Runtime Provider integrations are attached to the instance by the Hosting API. There is no
// separate Headmaster-side MCP registration step anymore; this route remains as a
// harmless compatibility no-op for the client callback flow after OAuth redirects.
export async function POST(request: Request) {
  try {
    await requireUser();
    const { toolkit } = await readJson<{ toolkit?: string }>(request);
    if (!toolkit || typeof toolkit !== 'string') {
      throw new ApiError(400, 'invalid_request', 'toolkit is required');
    }
    return json({ ok: true, registered: true, provider: 'managed-runtime' });
  } catch (e) {
    return handleError(e);
  }
}
