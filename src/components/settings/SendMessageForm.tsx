"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function SendMessageForm() {
  const [body, setBody] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function send() {
    setIsPending(true);
    setMessage(null);
    try {
      const res = await fetch("/api/account/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to send message");
      setBody("");
      setMessage({ kind: "success", text: "Sent." });
    } catch (e) {
      setMessage({ kind: "error", text: e instanceof Error ? e.message : "Failed to send message" });
    } finally {
      setIsPending(false);
    }
  }

  return (
    <section className="space-y-3 pt-4">
      <h2 className="text-sm font-semibold">Contact an admin</h2>
      <textarea
        className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        maxLength={4000}
        placeholder="Send a message to the console admins…"
      />
      {message ? (
        <p className={`text-sm ${message.kind === "error" ? "text-destructive" : "text-muted-foreground"}`}>
          {message.text}
        </p>
      ) : null}
      <Button size="sm" onClick={send} disabled={isPending || !body.trim()}>
        {isPending ? "Sending…" : "Send"}
      </Button>
    </section>
  );
}
