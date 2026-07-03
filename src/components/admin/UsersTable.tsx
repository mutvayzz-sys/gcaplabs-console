"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export function UsersTable({ initialUsers }: { initialUsers: AdminProfileRow[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function toggleApproval(user: AdminProfileRow) {
    setPendingId(user.id);
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, beta_approved: !user.beta_approved }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update user");
        setUsers((prev) => prev.map((u) => (u.id === user.id ? (data.user as AdminProfileRow) : u)));
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Failed to update user");
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
        {users.length === 0 ? (
          <div className="px-4 py-6 text-sm text-muted-foreground">No signups yet.</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="grid grid-cols-[1fr_120px_140px_100px] items-center border-b px-4 py-3 text-sm last:border-b-0">
              <span className="truncate font-medium">{user.email ?? user.display_name ?? user.id}</span>
              <span>
                <Badge variant={user.beta_approved ? "success" : "warning"}>{user.beta_approved ? "Approved" : "Pending"}</Badge>
              </span>
              <span className="truncate text-xs text-muted-foreground">{user.agent37_id ? (user.agent37_status ?? "provisioned") : "none yet"}</span>
              <span>
                <Button
                  size="sm"
                  variant={user.beta_approved ? "outline" : "default"}
                  disabled={isPending && pendingId === user.id}
                  onClick={() => toggleApproval(user)}
                >
                  {isPending && pendingId === user.id ? "…" : user.beta_approved ? "Revoke" : "Approve"}
                </Button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
