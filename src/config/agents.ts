// Catalog of Agent37 runtime templates and shape presets the user can pick from
// the runtime settings page. Modeled on the upstream starter-kit's config/agents.ts
// (single-managed-agent fork: there is no create-agent screen; the runtime is
// provisioned on first dashboard visit and these are the post-hoc reconfigure
// choices).
//
// Why this lives in src/config: it is the operator's curation of which templates
// and shapes the Headmaster brand exposes, NOT a dynamic list from Agent37. If
// you ship a new template to the Agent37 platform, add it here.

export interface Shape {
  label: string;
  cpu: number;
  memory: number;
  diskMin: number;
  diskMax: number;
}

// Sized to match the Agent37 hosting presets; the labels are the only Headmaster
// brand surface here. "Pro" is the recommended default for the headmaster-runtime.
export const SHAPE_PRESETS: Shape[] = [
  { label: "Small · 1 vCPU / 3 GB", cpu: 1, memory: 3, diskMin: 6, diskMax: 20 },
  { label: "Standard · 2 vCPU / 4 GB", cpu: 2, memory: 4, diskMin: 6, diskMax: 20 },
  { label: "Pro · 4 vCPU / 8 GB", cpu: 4, memory: 8, diskMin: 20, diskMax: 40 },
  { label: "Max · 8 vCPU / 16 GB", cpu: 8, memory: 16, diskMin: 40, diskMax: 80 },
];

// Default for the headmaster-runtime singleton. Mirrors DEFAULT_AGENT upstream
// but exposes monthlyCapUsd as the only Headmaster-side setting that survives
// across re-provision.
export const DEFAULT_AGENT = {
  template: "agent37-hermes",
  cpu: 2,
  memory: 4,
  disk: 6,
  monthlyCapUsd: 5,
} as const;

export interface AgentTypeOption {
  id: string;
  template: string;
  label: string;
  description: string;
  recommended?: boolean;
}

// The agent types offered as reconfigure choices. To add a custom image,
// publish + register it on Agent37 (template/release.sh) and uncomment the
// "custom" entry below, matching its `template` to TEMPLATE_NAME.
export const AGENT_TYPES: AgentTypeOption[] = [
  {
    id: "hermes",
    template: "agent37-hermes",
    label: "Hermes",
    description: "General agent: chat, browsing, code, files.",
    recommended: true,
  },
  {
    id: "openclaw",
    template: "agent37-openclaw",
    label: "OpenClaw",
    description: "General agent: headless browser, code, files.",
  },
  // {
  //   id: "custom",
  //   template: "your-template-name", // must match TEMPLATE_NAME in template/release.sh
  //   label: "My Agent",
  //   description: "Your own image and model.",
  // },
];

export const AGENT_TEMPLATES = AGENT_TYPES.map((a) => a.template);

// Labels for the "open in new tab" buttons. Ports come from the live instance
// (instance.ports), never this map — this only prettifies known port numbers;
// any unrecognized port falls back to "Port {n}". Covers stock Hermes/OpenClaw
// and the remapped ports a custom workspace template uses.
export const PORT_LABELS: Record<number, string> = {
  9119: "Dashboard",
  7681: "Terminal",
  8080: "Files",
  18789: "OpenClaw",
  9120: "Dashboard",
  7682: "Terminal",
  8081: "Files",
  3738: "Gateway",
};

// Find a shape preset by current resources. Returns null if the running
// resources don't match any preset (custom or in-between size).
export function shapeFor(cpu: number | null, memory: number | null): Shape | null {
  if (cpu == null || memory == null) return null;
  return SHAPE_PRESETS.find((p) => p.cpu === cpu && p.memory === memory) ?? null;
}

// Short shape label for badge use (e.g. "Pro") — null on custom sizes.
export function shapeLabel(cpu: number | null, memory: number | null): string | null {
  const s = shapeFor(cpu, memory);
  return s ? s.label.split(" · ")[0] : null;
}
