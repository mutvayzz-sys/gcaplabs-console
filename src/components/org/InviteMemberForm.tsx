"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function InviteMemberForm() {
  const [orgRole, setOrgRole] = useState<"admin" | "member">("member");
  const [link, setLink] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createInvite() {
    setIsPending(true);
    setError(null);
    setLink(null);
    try {
      const res = await fetch("/api/org/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_role: orgRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create invitation");
      setLink(`${window.location.origin}/invite-org/${data.invitation.token}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create invitation");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <h3 className="text-sm font-semibold">Invite a member</h3>
      <div className="flex items-center gap-2">
        <select
          className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          value={orgRole}
          onChange={(e) => setOrgRole(e.target.value as "admin" | "member")}
        >
          <option value="member">Member</option>
          <option value="admin">Org admin</option>
        </select>
        <Button size="sm" onClick={createInvite} disabled={isPending}>
          {isPending ? "Creating…" : "Create invite link"}
        </Button>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      {link ? (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Share this link — it expires in 7 days:</p>
          <Input readOnly value={link} onFocus={(e) => e.currentTarget.select()} />
        </div>
      ) : null}
    </div>
  );
}
