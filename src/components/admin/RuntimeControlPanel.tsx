"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ExternalLink, FolderOpen, LayoutDashboard, SquareTerminal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { statusVariant } from "@/lib/format";
import { PORT_LABELS } from "@/config/agents";
import type { Agent, Budget } from "@/lib/types";

type Action = "start" | "stop" | "restart" | "update" | "delete";

export function RuntimeControlPanel({ userId, onDeleted }: { userId: string; onDeleted: () => void }) {
  const [instance, setInstance] = useState<Agent | null>(null);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [capInput, setCapInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [openingPort, setOpeningPort] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/users/${userId}/runtime`)
      .then(async (res) => {
        if (!res.ok) return null;
        return res.json();
      })
      .then((data) => {
        if (data) {
          setInstance(data.instance as Agent);
          setNameInput((data.instance as Agent).name ?? "");
          setBudget(data.budget as Budget | null);
          if (data.budget) setCapInput(String(Math.round(data.budget.monthly_cap_micros / 1_000_000)));
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  async function runAction(action: Action) {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? `Failed to ${action}`);
      if (action === "delete") {
        onDeleted();
      } else {
        setInstance(data.instance as Agent);
        toast.success(action === "update" ? "Re-pulling latest image" : `Runtime ${action}ed`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `Failed to ${action}`);
    } finally {
      setBusy(false);
    }
  }

  async function saveBudget() {
    const monthlyDollars = Number(capInput);
    if (Number.isNaN(monthlyDollars) || monthlyDollars < 0) {
      toast.error("Enter a valid monthly cap");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthly_cap_micros: Math.round(monthlyDollars * 1_000_000) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to update budget");
      setBudget(data.budget as Budget);
      toast.success("Budget updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update budget");
    } finally {
      setBusy(false);
    }
  }

  async function saveName() {
    const name = nameInput.trim();
    if (!name) {
      toast.error("Name cannot be empty");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to rename");
      setInstance(data.instance as Agent);
      toast.success("Renamed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to rename");
    } finally {
      setBusy(false);
    }
  }

  async function openPort(port: number) {
    setOpeningPort(port);
    try {
      const res = await fetch(`/api/admin/users/${userId}/runtime`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signed_url_port: port }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message ?? "Failed to open");
      window.open(data.url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open");
    } finally {
      setOpeningPort(null);
    }
  }

  if (loading) return <p className="text-sm text-muted-foreground">Loading runtime…</p>;
  if (!instance) return null;

  const openablePorts = (instance.ports ?? []).filter((p) => !p.default);
  const PORT_ICON: Record<string, typeof LayoutDashboard> = {
    Dashboard: LayoutDashboard,
    Terminal: SquareTerminal,
    Files: FolderOpen,
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Runtime control</h2>
        <Badge variant={statusVariant(instance.status)}>{instance.status}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Input value={nameInput} onChange={(e) => setNameInput(e.target.value)} className="max-w-xs" />
        <Button size="sm" variant="outline" disabled={busy || nameInput.trim() === instance.name} onClick={saveName}>
          Rename
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" disabled={busy || instance.status === "running"} onClick={() => runAction("start")}>
          Start
        </Button>
        <Button size="sm" variant="outline" disabled={busy || instance.status === "stopped"} onClick={() => runAction("stop")}>
          Stop
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => runAction("restart")}>
          Restart
        </Button>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => runAction("update")}>
          Re-pull image
        </Button>
        <Button size="sm" variant="destructive" disabled={busy} onClick={() => setConfirmOpen(true)}>
          Delete runtime
        </Button>
      </div>

      {openablePorts.length > 0 ? (
        <div className="space-y-1.5 border-t pt-4">
          <p className="text-xs text-muted-foreground">Open this user&apos;s instance directly (signed, time-limited link):</p>
          <div className="flex flex-wrap gap-2">
            {openablePorts.map((p) => {
              const label = PORT_LABELS[p.port] ?? `Port ${p.port}`;
              const Icon = PORT_ICON[label] ?? ExternalLink;
              return (
                <Button
                  key={p.port}
                  size="sm"
                  variant="outline"
                  disabled={openingPort === p.port}
                  onClick={() => openPort(p.port)}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      {budget ? (
        <div className="space-y-1.5 border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Consumed this period: ${(budget.monthly_consumed_micros / 1_000_000).toFixed(2)}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Monthly cap ($)</span>
            <Input className="w-28" value={capInput} onChange={(e) => setCapInput(e.target.value)} />
            <Button size="sm" disabled={busy} onClick={saveBudget}>
              Save
            </Button>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete this runtime?"
        description="This permanently deletes the Agent37 instance and all its data. The user can get a new one only if re-approved."
        confirmText="Delete"
        destructive
        onConfirm={() => runAction("delete")}
      />
    </div>
  );
}
