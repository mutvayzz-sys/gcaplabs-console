import { getSession } from "@/lib/auth";
import { ApiError, handleError, json } from "@/lib/http";

function bearerFrom(request: Request): string | null {
  const auth = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(.+)$/i.exec(auth);
  return match?.[1] ?? null;
}

export async function POST(request: Request) {
  try {
    const { user } = await getSession();
    const token = bearerFrom(request);
    if (!user || !token) throw new ApiError(401, "unauthorized", "Not authenticated");
    // Desktop compatibility: Supabase access-token refresh requires a refresh
    // token, but the legacy client only persisted the bearer access token. Return
    // the still-valid token; expired tokens fail getSession and force login.
    return json({ access_token: token, token_type: "bearer", expires_in: 3600 });
  } catch (e) {
    return handleError(e);
  }
}
