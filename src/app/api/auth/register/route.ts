import { createClient as createSupabaseJsClient } from "@supabase/supabase-js";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import { MIN_PASSWORD } from "@/config/auth";

type Body = { email?: string; password?: string };

export async function POST(request: Request) {
  try {
    const { email, password } = await readJson<Body>(request);
    const mail = (email || "").trim();
    if (!mail || !password) throw new ApiError(400, "invalid_request", "email and password are required");
    if (password.length < MIN_PASSWORD) {
      throw new ApiError(400, "invalid_request", `Password must be at least ${MIN_PASSWORD} characters.`);
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) throw new ApiError(500, "config_error", "Supabase auth is not configured");

    const supabase = createSupabaseJsClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.auth.signUp({ email: mail, password });
    if (error) {
      const status = error.code === "user_already_exists" ? 409 : 400;
      throw new ApiError(status, error.code || "signup_failed", error.message);
    }

    // Email confirmation is off by default for this project, so signUp returns a session
    // immediately. This branch only triggers if confirmation gets re-enabled — there's no
    // session until the emailed link is used.
    if (!data.session) {
      return json({ confirmation_required: true, user: data.user });
    }

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
