"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AccountProfile } from "@/app/api/account/route";

export function ProfileForm({ profile }: { profile: AccountProfile }) {
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  function save() {
    setMessage(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/account", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ display_name: displayName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to save");
        setMessage({ kind: "success", text: "Saved." });
      } catch (e) {
        setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to save" });
      }
    });
  }

  return (
    <div className="max-w-md space-y-4 pt-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email ?? ""} disabled />
        <p className="text-xs text-muted-foreground">Email changes aren&apos;t supported yet — contact an admin.</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="display_name">Display name</Label>
        <Input
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={120}
        />
      </div>
      {message ? (
        <p className={`text-sm ${message.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message.text}
        </p>
      ) : null}
      <Button onClick={save} disabled={isPending || !displayName.trim()}>
        {isPending ? "Saving…" : "Save changes"}
      </Button>
    </div>
  );
}
