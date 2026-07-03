// POST /api/chat/runtime/resize — change the headmaster-runtime's compute shape.
// Body: { cpu?: number; memory?: number; disk?: number }.
//
// All fields optional; missing fields keep their current value. The shape picker
// in the settings tab sends full triples; admins wanting to bump just one
// dimension can call directly with partial input.

import { agent37, getCurrentAgent37Runtime } from "@/lib/agent37";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await readJson<{ cpu?: number; memory?: number; disk?: number }>(request);

    const cpu = body.cpu;
    const memory = body.memory;
    const disk = body.disk;
    if (cpu != null && (!Number.isFinite(cpu) || cpu <= 0)) {
      throw new ApiError(400, "invalid_request", "cpu must be a positive number");
    }
    if (memory != null && (!Number.isFinite(memory) || memory <= 0)) {
      throw new ApiError(400, "invalid_request", "memory must be a positive number");
    }
    if (disk != null && (!Number.isFinite(disk) || disk <= 0)) {
      throw new ApiError(400, "invalid_request", "disk must be a positive number");
    }
    if (cpu == null && memory == null && disk == null) {
      throw new ApiError(400, "invalid_request", "at least one of cpu/memory/disk is required");
    }

    const runtime = await getCurrentAgent37Runtime();
    return json(
      await agent37.resize(runtime.id, {
        ...(cpu != null ? { cpu } : {}),
        ...(memory != null ? { memory } : {}),
        ...(disk != null ? { disk } : {}),
      })
    );
  } catch (e) {
    return handleError(e);
  }
}
