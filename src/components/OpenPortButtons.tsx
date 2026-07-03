"use client";

import { useState } from "react";
import {
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  Monitor,
  Server,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import type { Agent } from "@/lib/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PORT_LABELS: Record<number, string> = {
  3737: "Gateway",
  6080: "Desktop",
  7681: "Terminal",
  8080: "Files",
  8081: "Files",
  3000: "Dashboard",
};

const PORT_ICON: Record<string, LucideIcon> = {
  Dashboard: LayoutDashboard,
  Desktop: Monitor,
  Files: FolderOpen,
  Gateway: Server,
  Terminal: SquareTerminal,
};

export function OpenPortButtons({
  ports,
  disabled,
  size = "default",
  className,
}: {
  ports: Agent["ports"];
  disabled?: boolean;
  size?: "default" | "sm";
  className?: string;
}) {
  const [opening, setOpening] = useState<number | null>(null);
  const openable = ports.filter((p) => !p.default);

  async function open(port: number) {
    setOpening(port);
    try {
      const { url } = await apiFetch<{ url: string }>("/api/chat/signed-url", {
        method: "POST",
        body: JSON.stringify({ port }),
      });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setOpening(null);
    }
  }

  if (openable.length === 0) return null;

  return (
    <TooltipProvider delayDuration={250}>
      <div className={cn("flex flex-wrap gap-1.5", className)}>
        {openable.map((p) => {
          const label = PORT_LABELS[p.port] ?? `Port ${p.port}`;
          const Icon = PORT_ICON[label] ?? ExternalLink;
          return (
            <Tooltip key={p.port}>
              <TooltipTrigger asChild>
                <span className="inline-flex">
                  <button
                    type="button"
                    aria-label={`Open ${label}`}
                    disabled={disabled || opening === p.port}
                    onClick={() => open(p.port)}
                    className={cn(
                      "inline-flex items-center justify-center rounded-md border bg-background text-muted-foreground transition-colors",
                      "hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40",
                      size === "sm" ? "h-8 w-8" : "h-9 w-9"
                    )}
                  >
                    {opening === p.port ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  </button>
                </span>
              </TooltipTrigger>
              <TooltipContent>
                {disabled ? `${label} is available when the runtime is running` : `Open ${label}`}
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
