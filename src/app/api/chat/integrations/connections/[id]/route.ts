import { agent37, getCurrentAgent37Runtime } from '@/lib/agent37';
import { requireUser } from '@/lib/auth';
import { handleError, json } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requireUser();
    const { id } = await params;
    const runtime = await getCurrentAgent37Runtime();
    await agent37.disconnectIntegration(runtime.id, id);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
