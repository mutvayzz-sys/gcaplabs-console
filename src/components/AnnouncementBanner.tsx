"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnreadAnnouncement } from "@/app/api/account/announcements/route";

export function AnnouncementBanner() {
  const [queue, setQueue] = useState<UnreadAnnouncement[] | null>(null);

  useEffect(() => {
    fetch("/api/account/announcements")
      .then((res) => res.json())
      .then((data) => setQueue(data.unread ?? []))
      .catch(() => setQueue([]));
  }, []);

  if (!queue || queue.length === 0) return null;
  const current = queue[0];

  function dismiss() {
    fetch("/api/account/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announcement_id: current.id }),
    }).catch(() => {});
    setQueue((prev) => (prev ?? []).slice(1));
  }

  return (
    <div className="flex items-start justify-between gap-4 border-b bg-secondary/60 px-4 py-3 text-sm">
      <div>
        <span className="font-medium">{current.title}</span>
        <span className="ml-2 text-muted-foreground">{current.body}</span>
      </div>
      <Button size="sm" variant="ghost" onClick={dismiss} className="h-6 w-6 shrink-0 p-0">
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
