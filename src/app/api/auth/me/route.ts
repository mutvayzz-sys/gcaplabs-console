import { getSession } from "@/lib/auth";
import { ApiError, handleError, json } from "@/lib/http";

function userName(user: { email?: string | null; id: string }) {
  return user.email ?? user.id;
}

export async function GET() {
  try {
    const { user } = await getSession();
    if (!user) throw new ApiError(401, "unauthorized", "Not authenticated");
    return json({ id: user.id, username: userName(user), role: "user" });
  } catch (e) {
    return handleError(e);
  }
}
