"use client";

import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AccountMenu({ userEmail }: { userEmail: string }) {
  const initial = (userEmail.trim()[0] ?? "?").toUpperCase();

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="space-y-2">
      <div className="flex min-w-0 items-center gap-2 px-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-medium text-secondary-foreground">
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{userEmail}</span>
          <span className="block truncate text-xs text-muted-foreground">HermesHQ console</span>
        </span>
      </div>
      <Button variant="ghost" className="w-full justify-start gap-2 text-muted-foreground" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
