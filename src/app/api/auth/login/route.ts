import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { ApiError, handleError, json, readJson } from "@/lib/http";

type Body = { username?: string; email?: string; password?: string };

export async function POST(request: Request) {
  try {
    const { username, email, password } = await readJson<Body>(request);
    const login = (email || username || "").trim();
    if (!login || !password) throw new ApiError(400, "invalid_request", "email/username and password are required");

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new ApiError(500, "config_error", "Supabase auth is not configured");

    const supabase = createSupabaseJsClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.signInWithPassword({ email: login, password });
    if (error || !data.session) throw new ApiError(401, "invalid_credentials", error?.message || "Invalid credentials");

    return json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      token_type: "bearer",
      expires_in: data.session.expires_in,
      user: data.user,
    });
  } catch (e) {
    return handleError(e);
  }
}
