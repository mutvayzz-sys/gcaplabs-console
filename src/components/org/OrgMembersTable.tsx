"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export function OrgMembersTable({ initialMembers }: { initialMembers: AdminProfileRow[] }) {
  const [members, setMembers] = useState(initialMembers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleApproval(member: AdminProfileRow) {
    setPendingId(member.id);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/org/members", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: member.id, beta_approved: !member.beta_approved }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update member");
        setMembers((prev) => prev.map((m) => (m.id === member.id ? (data.user as AdminProfileRow) : m)));
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Failed to update member");
      } finally {
        setPendingId(null);
      }
    });
  }

  return (
    <div className="space-y-3">
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <div className="overflow-hidden rounded-lg border">
        <div className="grid grid-cols-[1fr_120px_140px_100px] border-b bg-muted/40 px-4 py-2.5 text-xs font-medium text-muted-foreground">
          <span>Email</span>
          <span>Approved</span>
          <span>Runtime</span>
          <span />
        </div>
        {members.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No members yet — invite one below.</div>
        ) : (
          members.map((member) => (
            <div key={member.id} className="grid grid-cols-[1fr_120px_140px_100px] items-center border-b px-4 py-3 text-sm last:border-b-0">
              <span className="truncate font-medium">
                {member.email ?? member.display_name ?? member.id}
                {member.is_admin ? <Badge variant="muted" className="ml-2">Site admin</Badge> : null}
              </span>
              <span>
                <Badge variant={member.beta_approved ? "success" : "warning"}>{member.beta_approved ? "Approved" : "Pending"}</Badge>
              </span>
              <span className="truncate text-xs text-muted-foreground">{member.runtime_id ? (member.runtime_status ?? "provisioned") : "none yet"}</span>
              <span>
                <Button
                  size="sm"
                  variant={member.beta_approved ? "outline" : "default"}
                  disabled={isPending && pendingId === member.id}
                  onClick={() => toggleApproval(member)}
                >
                  {isPending && pendingId === member.id ? "…" : member.beta_approved ? "Revoke" : "Approve"}
                </Button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
