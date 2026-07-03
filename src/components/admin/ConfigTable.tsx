"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { AppConfigRow, ConfigValueType } from "@/app/api/admin/config/route";

const VALUE_TYPES: ConfigValueType[] = ["string", "number", "boolean", "enum", "json"];

function valueToInputString(value: unknown, valueType: ConfigValueType): string {
  if (valueType === "json") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function parseInputValue(raw: string, valueType: ConfigValueType): unknown {
  switch (valueType) {
    case "number": {
      const n = Number(raw);
      if (Number.isNaN(n)) throw new Error("Not a valid number");
      return n;
    }
    case "boolean":
      return raw === "true";
    case "json":
      return JSON.parse(raw);
    default:
      return raw;
  }
}

export function ConfigTable({ initialConfig }: { initialConfig: AppConfigRow[] }) {
  const [rows, setRows] = useState(initialConfig);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function upsertLocal(row: AppConfigRow) {
    setRows((prev) => {
      const idx = prev.findIndex((r) => r.key === row.key);
      if (idx === -1) return [...prev, row].sort((a, b) => a.key.localeCompare(b.key));
      const next = [...prev];
      next[idx] = row;
      return next;
    });
  }

  function removeLocal(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  return (
    <div className="space-y-6">
      {errorMessage ? <p className="text-sm text-destructive">{errorMessage}</p> : null}
      <div className="space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No config keys yet.</p>
        ) : (
          rows.map((row) => (
            <ConfigRow key={row.key} row={row} onSaved={upsertLocal} onDeleted={removeLocal} onError={setErrorMessage} />
          ))
        )}
      </div>
      <NewConfigRow onCreated={upsertLocal} onError={setErrorMessage} />
    </div>
  );
}

function ConfigRow({
  row,
  onSaved,
  onDeleted,
  onError,
}: {
  row: AppConfigRow;
  onSaved: (row: AppConfigRow) => void;
  onDeleted: (key: string) => void;
  onError: (message: string | null) => void;
}) {
  const [rawValue, setRawValue] = useState(valueToInputString(row.value, row.value_type));
  const [description, setDescription] = useState(row.description ?? "");
  const [isPending, startTransition] = useTransition();

  function save() {
    onError(null);
    startTransition(async () => {
      try {
        const value = parseInputValue(rawValue, row.value_type);
        const res = await fetch("/api/admin/config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: row.key, value, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to save");
        onSaved(data.config as AppConfigRow);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Failed to save");
      }
    });
  }

  function remove() {
    onError(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/config?key=${encodeURIComponent(row.key)}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to delete");
        onDeleted(row.key);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Failed to delete");
      }
    });
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">{row.key}</span>
          <Badge variant="outline">{row.value_type}</Badge>
        </div>
        <Button size="sm" variant="ghost" disabled={isPending} onClick={remove}>
          Delete
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <div className="space-y-1.5">
          <Label>Value</Label>
          {row.value_type === "boolean" ? (
            <select
              className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm")}
              value={rawValue}
              onChange={(e) => setRawValue(e.target.value)}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
          ) : row.value_type === "json" ? (
            <textarea
              className="flex min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-sm"
              value={rawValue}
              onChange={(e) => setRawValue(e.target.value)}
            />
          ) : (
            <Input value={rawValue} onChange={(e) => setRawValue(e.target.value)} />
          )}
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <Button size="sm" disabled={isPending} onClick={save}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function NewConfigRow({
  onCreated,
  onError,
}: {
  onCreated: (row: AppConfigRow) => void;
  onError: (message: string | null) => void;
}) {
  const [key, setKey] = useState("");
  const [valueType, setValueType] = useState<ConfigValueType>("string");
  const [rawValue, setRawValue] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  function create() {
    onError(null);
    startTransition(async () => {
      try {
        const value = parseInputValue(rawValue, valueType);
        const res = await fetch("/api/admin/config", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key, value, value_type: valueType, description }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message ?? "Failed to create");
        onCreated(data.config as AppConfigRow);
        setKey("");
        setRawValue("");
        setDescription("");
      } catch (e) {
        onError(e instanceof Error ? e.message : "Failed to create");
      }
    });
  }

  return (
    <div className="rounded-lg border border-dashed p-4 space-y-3">
      <h3 className="text-sm font-semibold">Add a config key</h3>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="space-y-1.5">
          <Label>Key</Label>
          <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="beta_signup_open" />
        </div>
        <div className="space-y-1.5">
          <Label>Type</Label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            value={valueType}
            onChange={(e) => setValueType(e.target.value as ConfigValueType)}
          >
            {VALUE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Value</Label>
          <Input value={rawValue} onChange={(e) => setRawValue(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
      </div>
      <Button size="sm" disabled={isPending || !key.trim()} onClick={create}>
        {isPending ? "Adding…" : "Add"}
      </Button>
    </div>
  );
}
