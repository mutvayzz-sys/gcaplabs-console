import { runtimeApi, getCurrentManagedRuntime } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export async function POST(request: Request) {
  try {
    await requireUser();
    const body = await readJson<{ port?: number; ttl_seconds?: number }>(request);
    const port = Number(body.port);
    if (!Number.isInteger(port) || port <= 0 || port > 65535) {
      throw new ApiError(400, "invalid_request", "port must be a valid TCP port");
    }
    const ttlSeconds = body.ttl_seconds === undefined ? undefined : Number(body.ttl_seconds);
    if (ttlSeconds !== undefined && (!Number.isInteger(ttlSeconds) || ttlSeconds <= 0)) {
      throw new ApiError(400, "invalid_request", "ttl_seconds must be a positive integer");
    }

    const runtime = await getCurrentManagedRuntime();
    if (!runtime.instance.ports?.some((p) => p.port === port)) {
      throw new ApiError(404, "not_found", "That port is not exposed by the managed runtime");
    }
    return json(await runtimeApi.signedUrl(runtime.id, port, ttlSeconds));
  } catch (e) {
    return handleError(e);
  }
}
