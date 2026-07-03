import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";

export type ConfigValueType = "string" | "number" | "boolean" | "enum" | "json";

export interface AppConfigRow {
  key: string;
  value: unknown;
  value_type: ConfigValueType;
  description: string | null;
  updated_at: string;
  updated_by: string | null;
}

const VALUE_TYPES: ConfigValueType[] = ["string", "number", "boolean", "enum", "json"];

function validateValue(value: unknown, valueType: ConfigValueType) {
  switch (valueType) {
    case "string":
    case "enum":
      if (typeof value !== "string") throw new ApiError(400, "invalid_request", `value must be a string for value_type "${valueType}"`);
      return;
    case "number":
      if (typeof value !== "number") throw new ApiError(400, "invalid_request", "value must be a number for value_type \"number\"");
      return;
    case "boolean":
      if (typeof value !== "boolean") throw new ApiError(400, "invalid_request", "value must be a boolean for value_type \"boolean\"");
      return;
    case "json":
      return; // any JSON-serializable value is valid
  }
}

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    const { data, error } = await db.from("app_config").select("*").order("key", { ascending: true });
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ config: (data ?? []) as AppConfigRow[] });
  } catch (e) {
    return handleError(e);
  }
}

// Upsert one key. A brand-new key requires value_type; updating an existing key can omit it
// (keeps the existing type) but the new value is still validated against it.
export async function PATCH(request: Request) {
  try {
    const { db, user } = await requireConsoleAdmin();
    const body = await readJson<{ key?: string; value?: unknown; value_type?: ConfigValueType; description?: string }>(request);
    const key = (body.key ?? "").trim();
    if (!key) throw new ApiError(400, "invalid_request", "key is required");
    if (key.length > 200) throw new ApiError(400, "invalid_request", "key is too long");

    let valueType = body.value_type;
    if (valueType && !VALUE_TYPES.includes(valueType)) {
      throw new ApiError(400, "invalid_request", `value_type must be one of ${VALUE_TYPES.join(", ")}`);
    }
    const { data: existing } = await db.from("app_config").select("value_type").eq("key", key).maybeSingle();
    if (!existing && body.value === undefined) {
      throw new ApiError(400, "invalid_request", "value is required when creating a new key");
    }
    if (!valueType) valueType = (existing?.value_type as ConfigValueType | undefined) ?? "string";
    if (body.value !== undefined) validateValue(body.value, valueType);

    const update: Partial<AppConfigRow> & { updated_by: string } = {
      key,
      value_type: valueType,
      updated_by: user.id,
    };
    if (body.value !== undefined) update.value = body.value;
    if (body.description !== undefined) update.description = body.description;

    const { data, error } = await db.from("app_config").upsert(update, { onConflict: "key" }).select("*").maybeSingle();
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ config: data as AppConfigRow });
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(request: Request) {
  try {
    const { db } = await requireConsoleAdmin();
    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (!key) throw new ApiError(400, "invalid_request", "key is required");
    const { error } = await db.from("app_config").delete().eq("key", key);
    if (error) throw new ApiError(500, "db_error", error.message);
    return json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
