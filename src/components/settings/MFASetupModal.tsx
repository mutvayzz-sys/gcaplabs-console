"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type Step = "start" | "verify" | "done";

export function MFASetupModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [step, setStep] = useState<Step>("start");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setStep("start");
    setQrCode(null);
    setFactorId(null);
    setCode("");
    setError(null);
  }

  async function startEnroll() {
    setIsPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setFactorId(data.id);
      setQrCode(data.totp.qr_code);
      setStep("verify");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start enrollment");
    } finally {
      setIsPending(false);
    }
  }

  async function verify() {
    if (!factorId) return;
    setIsPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
      if (error) throw error;
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid code");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Set up authenticator app</DialogTitle>
          <DialogDescription>
            {step === "start" && "Scan a QR code with your authenticator app to add a second factor."}
            {step === "verify" && "Scan the code below, then enter the 6-digit code it generates."}
            {step === "done" && "Two-factor authentication is now enabled."}
          </DialogDescription>
        </DialogHeader>

        {step === "start" ? (
          <Button onClick={startEnroll} disabled={isPending}>
            {isPending ? "Starting…" : "Generate QR code"}
          </Button>
        ) : null}

        {step === "verify" && qrCode ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              {/* Supabase returns a data: URI SVG — next/image doesn't optimize data URIs anyway. */}
              <Image src={qrCode} alt="TOTP QR code" width={200} height={200} unoptimized />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mfa_code">6-digit code</Label>
              <Input
                id="mfa_code"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        ) : null}

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        {step === "verify" ? (
          <DialogFooter>
            <Button onClick={verify} disabled={isPending || code.length !== 6}>
              {isPending ? "Verifying…" : "Verify and enable"}
            </Button>
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
