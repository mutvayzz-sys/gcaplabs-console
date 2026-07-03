import { requireConsoleAdmin } from "@/lib/auth";
import { ApiError, handleError, json, readJson } from "@/lib/http";
import type { Organization } from "@/lib/types";

export interface OrganizationWithCounts extends Organization {
  member_count: number;
}

export async function GET() {
  try {
    const { db } = await requireConsoleAdmin();
    const { data: orgs, error } = await db.from("organizations").select("*").order("created_at", { ascending: false });
    if (error) throw new ApiError(500, "db_error", error.message);

    const { data: counts } = await db.from("profiles").select("organization_id").not("organization_id", "is", null);
    const countByOrg = new Map<string, number>();
    for (const row of counts ?? []) {
      const id = row.organization_id as string;
      countByOrg.set(id, (countByOrg.get(id) ?? 0) + 1);
    }

    const result: OrganizationWithCounts[] = (orgs ?? []).map((org) => ({
      ...(org as Organization),
      member_count: countByOrg.get(org.id) ?? 0,
    }));
    return json({ organizations: result });
  } catch (e) {
    return handleError(e);
  }
}

// Creates an org and, if admin_email matches an existing profile, makes that user its first
// org admin in the same call — otherwise the org is created with no members and an admin
// invite link can be generated from /dashboard/org once someone is assigned.
export async function POST(request: Request) {
  try {
    const { db, user } = await requireConsoleAdmin();
    const body = await readJson<{ name?: string; admin_email?: string }>(request);
    const name = (body.name ?? "").trim();
    if (!name) throw new ApiError(400, "invalid_request", "name is required");

    const { data: org, error } = await db
      .from("organizations")
      .insert({ name, created_by: user.id })
      .select("*")
      .single();
    if (error) throw new ApiError(500, "db_error", error.message);

    const adminEmail = body.admin_email?.trim();
    if (adminEmail) {
      await db
        .from("profiles")
        .update({ organization_id: org.id, org_role: "admin" })
        .eq("email", adminEmail);
    }

    return json({ organization: org as Organization });
  } catch (e) {
    return handleError(e);
  }
}
