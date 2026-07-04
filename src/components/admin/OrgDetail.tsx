"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export function OrgDetail({ organizationId, initialMembers }: { organizationId: string; initialMembers: AdminProfileRow[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function updateMember(userId: string, patch: { beta_approved?: boolean; org_role?: "admin" | "member" | null }) {
    setPendingId(userId);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/organizations/${organizationId}/members`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, ...patch }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update member");
        if (patch.org_role === null) {
          setMembers((prev) => prev.filter((m) => m.id !== userId));
        } else {
          setMembers((prev) => prev.map((m) => (m.id === userId ? (data.user as AdminProfileRow) : m)));
        }
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Failed to update member");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-6">
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <InviteForm organizationId={organizationId} />

      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_110px_110px_100px] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Email</span>
          <span>Approved</span>
          <span>Org role</span>
          <span />
        </div>
        {members.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No members yet — invite one above.</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="grid grid-cols-[1fr_110px_110px_100px] items-center border-b px-4 py-3 text-sm last:border-b-0">
              <span className="truncate font-medium">{member.email ?? member.id}</span>
              <span>
                <Badge variant={member.beta_approved ? "success" : "warning"}>{member.beta_approved ? "Approved" : "Pending"}</Badge>
              </span>
              <span>
                <Badge variant="outline">{(member as unknown as { org_role: string | null }).org_role ?? "member"}</Badge>
              </span>
              <span className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant={member.beta_approved ? "outline" : "default"}
                  disabled={isPending && pendingId === member.id}
                  onClick={() => updateMember(member.id, { beta_approved: !member.beta_approved })}
                >
                  {member.beta_approved ? "Revoke" : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isPending && pendingId === member.id}
                  onClick={() => updateMember(member.id, { org_role: null })}
                >
                  Remove from org
                </Button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function InviteForm({ organizationId }: { organizationId: string }) {
  const [orgRole, setOrgRole] = useState<"admin" | "member">("member");
  const [link, setLink] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createInvite() {
    setIsPending(true);
    setError(null);
    setLink(null);
    try {
      const res = await fetch(`/api/admin/organizations/${organizationId}/invite`, {
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
