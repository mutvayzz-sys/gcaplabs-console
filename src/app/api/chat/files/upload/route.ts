import { instanceFetch } from "@/lib/hermeshq";
import { requireUser } from "@/lib/auth";
import { handleError } from "@/lib/http";

// Upload a file to the user's runtime filesystem.
// Expects multipart/form-data with a "file" field.
// Returns { path: string } — the absolute path on the instance.
export async function POST(request: Request) {
  try {
    await requireUser();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return new Response(JSON.stringify({ error: { message: "file field is required" } }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const upstream = await instanceFetch("/v1/files/content", {
      method: "PUT",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Path": file.name,
      },
      body: await file.arrayBuffer(),
    });

    if (!upstream.ok) {
      const text = await upstream.text();
      return new Response(text, { status: upstream.status || 502 });
    }

    const data = await upstream.json();
    return Response.json(data);
  } catch (e) {
    return handleError(e);
  }
}