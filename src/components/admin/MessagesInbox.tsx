"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { MessageRow } from "@/app/api/admin/messages/route";

export function MessagesInbox({ initialMessages }: { initialMessages: MessageRow[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [isPending, startTransition] = useTransition();

  function markRead(id: string) {
    startTransition(async () => {
      await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read_by_admin: true } : m)));
    });
  }

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <p className="text-sm text-muted-foreground">No messages yet.</p>
      ) : (
        messages.map((m) => (
          <div key={m.id} className="rounded-lg border p-4 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="font-medium">{m.sender_email ?? m.sender_id}</span>
                {!m.read_by_admin ? <Badge variant="warning">Unread</Badge> : null}
              </div>
              {!m.read_by_admin ? (
                <Button size="sm" variant="ghost" disabled={isPending} onClick={() => markRead(m.id)}>
                  Mark read
                </Button>
              ) : null}
            </div>
            <p className="text-sm">{m.body}</p>
            <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
          </div>
        ))
      )}
    </div>
  );
}
