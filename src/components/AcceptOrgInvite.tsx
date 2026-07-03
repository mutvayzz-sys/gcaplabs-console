"use client";

import { useState } from "react";
import { toast } from "sonner";
import { branding } from "@/config/branding";
import { Button } from "@/components/ui/button";

export function AcceptOrgInvite({
  token,
  organizationName,
  orgRole,
}: {
  token: string;
  organizationName: string;
  orgRole: string;
}) {
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    try {
      const res = await fetch(`/api/org/invite/${token}/accept`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to accept invitation");
      window.location.href = "/dashboard";
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to accept invitation");
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-6 text-center">
        <h1 className="text-xl font-semibold tracking-tight">{branding.appName}</h1>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">You&apos;ve been invited to join</p>
          <p className="mt-1 text-lg font-medium">{organizationName}</p>
          <p className="mt-1 text-sm text-muted-foreground">as {orgRole}</p>
          <Button className="mt-4 w-full" onClick={accept} disabled={busy}>
            {busy ? "Joining…" : "Accept invitation"}
          </Button>
        </div>
      </div>
    </main>
  );
}
