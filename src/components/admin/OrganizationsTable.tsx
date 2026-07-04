"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrganizationWithCounts } from "@/app/api/admin/organizations/route";

export function OrganizationsTable({ initialOrganizations }: { initialOrganizations: OrganizationWithCounts[] }) {
  const [organizations, setOrganizations] = useState(initialOrganizations);
  const [name, setName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create() {
    setIsPending(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, admin_email: adminEmail || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create organization");
      setOrganizations((prev) => [{ ...data.organization, member_count: adminEmail ? 1 : 0 }, ...prev]);
      setName("");
      setAdminEmail("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create organization");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_100px_160px] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Name</span>
          <span>Members</span>
          <span>Created</span>
        </div>
        {organizations.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No organizations yet.</div>
        ) : (
          organizations.map((org) => (
            <div key={org.id} className="grid grid-cols-[1fr_100px_160px] items-center border-b px-4 py-3 text-sm last:border-b-0">
              <Link href={`/dashboard/admin/organizations/${org.id}`} className="truncate font-medium hover:underline">
                {org.name}
              </Link>
              <span>{org.member_count}</span>
              <span className="text-xs text-muted-foreground">{new Date(org.created_at).toLocaleDateString()}</span>
            </div>
          ))
        )}
      </div>

      <div className="rounded-lg border border-dashed p-4 space-y-3">
        <h3 className="text-sm font-semibold">Create an organization</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Springfield Elementary" />
          </div>
          <div className="space-y-1.5">
            <Label>Initial admin email (optional)</Label>
            <Input value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="Must already have an account" />
          </div>
        </div>
        <Button size="sm" disabled={isPending || !name.trim()} onClick={create}>
          {isPending ? "Creating…" : "Create organization"}
        </Button>
      </div>
    </div>
  );
}
