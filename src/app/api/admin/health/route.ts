import { requireConsoleAdmin } from "@/lib/auth";
import { getHealthSnapshot } from "@/lib/health";
import { handleError, json } from "@/lib/http";

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    return json(await getHealthSnapshot(db));
  } catch (e) {
    return handleError(e);
  }
}
