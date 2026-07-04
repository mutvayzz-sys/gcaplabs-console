import { runtimeApi, getCurrentManagedRuntime } from '@/lib/managed-runtime';
import { requireUser } from '@/lib/auth';
import { handleError, json } from '@/lib/http';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, { params }: Ctx) {
  try {
    await requireUser();
    const { id } = await params;
    const runtime = await getCurrentManagedRuntime();
    await runtimeApi.disconnectIntegration(runtime.id, id);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
