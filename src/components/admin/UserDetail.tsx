"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RuntimeControlPanel } from "@/components/admin/RuntimeControlPanel";
import type { AdminProfileRow } from "@/app/api/admin/users/route";

export function UserDetail({ initialUser }: { initialUser: AdminProfileRow }) {
  const [user, setUser] = useState(initialUser);
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function update(patch: { beta_approved?: boolean; is_admin?: boolean }) {
    setErrorMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/users", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: user.id, ...patch }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update user");
        setUser(data.user as AdminProfileRow);
      } catch (e) {
        setErrorMessage(e instanceof Error ? e.message : "Failed to update user");
      }
    });
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{user.email ?? user.display_name ?? user.id}</h1>
        <p className="mt-1 text-sm text-muted-foreground font-mono">{user.id}</p>
      </div>

      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}

      <div className="overflow-hidden rounded-lg border text-sm">
        <Row label="Approval">
          <Badge variant={user.beta_approved ? "success" : "warning"}>{user.beta_approved ? "Approved" : "Pending"}</Badge>
        </Row>
        <Row label="Console admin">{user.is_admin ? <Badge variant="success">Admin</Badge> : <span className="text-muted-foreground">No</span>}</Row>
        <Row label="Display name">{user.display_name ?? <span className="text-muted-foreground">—</span>}</Row>
        <Row label="Runtime">{user.agent37_id ? (user.agent37_status ?? "provisioned") : <span className="text-muted-foreground">none yet</span>}</Row>
        <Row label="Created" last>
          {new Date(user.created_at).toLocaleString()}
        </Row>
      </div>

      <div className="flex gap-2">
        <Button
          variant={user.beta_approved ? "outline" : "default"}
          disabled={isPending}
          onClick={() => update({ beta_approved: !user.beta_approved })}
        >
          {user.beta_approved ? "Revoke approval" : "Approve"}
        </Button>
        <Button variant="ghost" disabled={isPending} onClick={() => update({ is_admin: !user.is_admin })}>
          {user.is_admin ? "Remove admin" : "Make admin"}
        </Button>
      </div>

      {user.agent37_id ? (
        <RuntimeControlPanel
          userId={user.id}
          onDeleted={() => setUser((prev) => ({ ...prev, agent37_id: null, agent37_status: null }))}
        />
      ) : null}
    </div>
  );
}

function Row({ label, children, last }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`grid grid-cols-[160px_1fr] gap-4 px-4 py-3 ${last ? "" : "border-b"}`}>
      <div className="text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
