"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AccountMenu({ userEmail, caption = "Headmaster Console" }: { userEmail: string; caption?: string }) {
  const initial = (userEmail.trim()[0] ?? "?").toUpperCase();

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // Redirect anyway: the login page/server guard will verify whether any session remains.
    } finally {
      window.location.href = "/login";
    }
  }

  return (
    <div className="space-y-2">
      <Link
        href="/dashboard/settings"
        className="flex min-w-0 items-center gap-2 rounded-2xl px-2 py-1.5 transition-colors hover:bg-white/80"
      >
        <span className="brand-gradient-surface flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold shadow-sm">
          {initial}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">{userEmail}</span>
          {caption ? <span className="block truncate text-xs text-muted-foreground">{caption}</span> : null}
        </span>
      </Link>
      <Button variant="ghost" className="w-full justify-start gap-2 rounded-2xl text-muted-foreground hover:bg-white/80 hover:text-foreground" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
