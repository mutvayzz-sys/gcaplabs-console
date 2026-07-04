import { instanceFetch, waitForAgentHealthy } from "@/lib/managed-runtime";
import { requireUser } from "@/lib/auth";
import { ApiError, handleError, readJson } from "@/lib/http";
import { upstreamErrorMessage } from "../_helpers";

interface ResponsesBody {
  input?: string;
  session_id?: string;
  model?: string | null;
  provider?: string | null;
  reasoning_effort?: string | null;
  files?: string[];
}

// Run a chat turn and stream the agent's reply back as Server-Sent Events.
// Each user has one managed runtime,
// so we don't need an [id] param — instanceFetch resolves the user's runtime.
export async function POST(request: Request) {
  try {
    await requireUser(); // throws 401 if not signed in

    const body = await readJson<ResponsesBody>(request);
    const input = (body.input ?? "").trim();
    const files = Array.isArray(body.files) ? body.files.filter(Boolean) : [];
    if (!input && files.length === 0) {
      throw new ApiError(400, "invalid_request", "input is required");
    }
    const finalInput = input || "Please review the attached file(s).";

    const payload: Record<string, unknown> = { input: finalInput, stream: true };
    if (body.session_id) payload.session_id = body.session_id;
    if (body.model) {
      payload.model = body.model;
      if (body.provider) payload.provider = body.provider;
    }
    if (body.reasoning_effort) payload.reasoning_effort = body.reasoning_effort;
    if (files.length) payload.files = files;

    // See waitForAgentHealthy: "running" doesn't guarantee the harness is accepting requests yet.
    await waitForAgentHealthy();

    const upstream = await instanceFetch("/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify(payload),
    });

    if (!upstream.ok || !upstream.body) {
      const message = await upstreamErrorMessage(upstream, "chat/responses", "Chat request failed");
      throw new ApiError(upstream.status || 502, "upstream_error", message);
    }

    return new Response(upstream.body, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    return handleError(e);
  }
}

export const maxDuration = 300;