"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AnnouncementRow } from "@/app/api/admin/announcements/route";

export function AnnouncementsPanel({ initialAnnouncements }: { initialAnnouncements: AnnouncementRow[] }) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function create() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, body }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create announcement");
        setAnnouncements((prev) => [data.announcement as AnnouncementRow, ...prev]);
        setTitle("");
        setBody("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create announcement");
      }
    });
  }

  function toggleActive(announcement: AnnouncementRow) {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/announcements", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: announcement.id, active: !announcement.active }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update announcement");
        setAnnouncements((prev) => prev.map((a) => (a.id === announcement.id ? (data.announcement as AnnouncementRow) : a)));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update announcement");
      }
    });
  }

  return (
    <div className="space-y-6">
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="rounded-lg border border-dashed p-4 space-y-3">
        <h3 className="text-sm font-semibold">New announcement</h3>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Body</Label>
          <textarea
            className="flex min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
        <Button size="sm" disabled={isPending || !title.trim() || !body.trim()} onClick={create}>
          {isPending ? "Publishing…" : "Publish"}
        </Button>
      </div>

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{a.title}</span>
                  <Badge variant={a.active ? "success" : "muted"}>{a.active ? "Active" : "Inactive"}</Badge>
                </div>
                <Button size="sm" variant="ghost" disabled={isPending} onClick={() => toggleActive(a)}>
                  {a.active ? "Deactivate" : "Reactivate"}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{a.body}</p>
              <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
