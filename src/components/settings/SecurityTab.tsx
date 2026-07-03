"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { MFASetupModal } from "@/components/settings/MFASetupModal";

// Password change, MFA, and sign-out-everywhere all run through the browser Supabase client
// (the caller's own session) — NOT the service-role admin client used everywhere else in this
// app. There's no server-side equivalent for these: Supabase Auth requires the interactive
// session context for password updates and MFA challenge/verify.
export function SecurityTab() {
  return (
    <div className="max-w-md space-y-8 pt-4">
      <PasswordSection />
      <MFASection />
      <SignOutSection />
    </div>
  );
}

function PasswordSection() {
  const [password, setPassword] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function save() {
    setMessage(null);
    if (password.length < 8) {
      setMessage({ kind: "error", text: "Password must be at least 8 characters." });
      return;
    }
    setIsPending(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setMessage({ kind: "success", text: "Password updated." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to update password" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Password</h2>
      <div className="space-y-1.5">
        <Label htmlFor="new_password">New password</Label>
        <Input
          id="new_password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
      </div>
      {message ? (
        <p className={`text-sm ${message.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message.text}
        </p>
      ) : null}
      <Button onClick={save} disabled={isPending || !password}>
        {isPending ? "Updating…" : "Update password"}
      </Button>
    </section>
  );
}

function MFASection() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Two-factor authentication</h2>
      <p className="text-sm text-muted-foreground">Add an authenticator app as a second factor on sign-in.</p>
      <Button variant="outline" onClick={() => setModalOpen(true)}>
        Set up authenticator app
      </Button>
      <MFASetupModal open={modalOpen} onOpenChange={setModalOpen} />
    </section>
  );
}

function SignOutSection() {
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function signOutOthers() {
    setIsPending(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      setMessage("Signed out of all other devices.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to sign out other sessions");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">Sessions</h2>
      <p className="text-sm text-muted-foreground">
        Supabase doesn&apos;t expose a list of your active sessions/devices — this signs out every
        session except the one you&apos;re using right now.
      </p>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <Button variant="outline" onClick={signOutOthers} disabled={isPending}>
        {isPending ? "Signing out…" : "Sign out of all other devices"}
      </Button>
    </section>
  );
}
