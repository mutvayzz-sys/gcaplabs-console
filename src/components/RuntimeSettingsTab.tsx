'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowDownToLine,
  Cpu,
  Pencil,
  Play,
  RotateCw,
  Square,
  type LucideIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch } from '@/lib/api';
import { SHAPE_PRESETS, shapeFor, shapeLabel, type Shape } from '@/config/agents';
import { isTransitional, statusVariant } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OpenPortButtons } from '@/components/OpenPortButtons';
import { useAsyncAction } from '@/components/useAsyncAction';
import { cn } from '@/lib/utils';
import type { MergedAgent } from '@/lib/types';

// Runtime settings tab for the headmaster-runtime singleton. Adapted from the
// upstream starter-kit's AgentSettingsTab to the singleton model:
//   - no agentId prop; all BFF calls hit /api/chat/runtime/*
//   - no Delete action (singleton is not deletable from the UI; it auto-recreates
//     on next dashboard visit if the underlying Agent37 instance is gone)
//
// Sections in render order: header (name + lifecycle + status), Update banner
// (when applicable), Apps (open signed ports), Shape picker, Budget, Info rows.
export function RuntimeSettingsTab({
  agent,
  onChanged,
}: {
  agent: MergedAgent;
  onChanged?: () => void;
}) {
  const isAdmin = true; // headmaster-runtime is single-user; no role gate for now
  const running = agent.live_status === 'running';
  const transitional = isTransitional(agent.live_status);
  const { busy, run } = useAsyncAction();

  const action = (path: string, successMsg: string) =>
    run(async () => {
      await apiFetch(`/api/chat/runtime/${path}`, { method: 'POST' });
      toast.success(successMsg);
      onChanged?.();
    });

  return (
    <div className='mx-auto max-w-3xl space-y-6 p-8'>
      <header className='space-y-3'>
        <div className='flex items-start justify-between gap-4'>
          <NameEditor agent={agent} onChanged={onChanged} />
          {isAdmin && (
            <div className='flex shrink-0 items-center gap-1.5'>
              {running ? (
                <IconAction
                  label='Stop'
                  icon={Square}
                  disabled={busy || transitional}
                  onClick={() => action('stop', 'Stopping')}
                />
              ) : (
                <IconAction
                  label='Start'
                  icon={Play}
                  disabled={busy || transitional}
                  onClick={() => action('start', 'Starting')}
                />
              )}
              <IconAction
                label='Restart'
                icon={RotateCw}
                disabled={!running || busy}
                onClick={() => action('restart', 'Restarting')}
              />
              {agent.update_available && (
                <IconAction
                  label='Update to latest image'
                  icon={ArrowDownToLine}
                  amber
                  disabled={transitional || busy}
                  onClick={() => action('update', 'Updating')}
                />
              )}
            </div>
          )}
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Badge variant={statusVariant(agent.live_status)}>{agent.live_status ?? 'unknown'}</Badge>
          {shapeLabel(agent.cpu, agent.memory) && (
            <Badge variant='outline'>{shapeLabel(agent.cpu, agent.memory)}</Badge>
          )}
          {agent.template && <Badge variant='outline'>{agent.template}</Badge>}
          {agent.past_due && <Badge variant='warning'>past due</Badge>}
          <span className='truncate font-mono text-xs text-muted-foreground' title={agent.agent37_id}>
            {agent.agent37_id}
          </span>
        </div>

        {agent.status_reason && (
          <p className='text-xs text-destructive' title={agent.status_reason.message}>
            {agent.status_reason.message}
          </p>
        )}
      </header>

      {agent.update_available && (
        <UpdateBanner
          agent={agent}
          busy={busy}
          transitional={transitional}
          onUpdate={() => action('update', 'Updating')}
        />
      )}

      <AppsSection agent={agent} />
      <ShapeSection agent={agent} onChanged={onChanged} />
      <InfoSection agent={agent} />
    </div>
  );
}

function UpdateBanner({
  agent,
  busy,
  transitional,
  onUpdate,
}: {
  agent: MergedAgent;
  busy: boolean;
  transitional: boolean;
  onUpdate: () => void;
}) {
  return (
    <div className='flex items-center justify-between gap-4 rounded-lg border border-amber-300 bg-amber-50 p-4 dark:border-amber-700 dark:bg-amber-950/30'>
      <div>
        <div className='text-sm font-medium text-amber-900 dark:text-amber-200'>Update available</div>
        <p className='mt-0.5 text-xs text-amber-800 dark:text-amber-300'>
          A newer image has been published for the {agent.template || 'current'} template. Update
          to pick up the latest fixes.
        </p>
      </div>
      <Button
        type='button'
        size='sm'
        variant='outline'
        disabled={busy || transitional}
        onClick={onUpdate}
        className='border-amber-400 text-amber-700 hover:bg-amber-100 hover:text-amber-900'
      >
        <ArrowDownToLine className='h-4 w-4' />
        Update
      </Button>
    </div>
  );
}

function AppsSection({ agent }: { agent: MergedAgent }) {
  const running = agent.live_status === 'running';
  const openableCount = agent.ports.filter((p) => !p.default).length;

  return (
    <section className='rounded-lg border p-5'>
      <h2 className='text-sm font-semibold'>Apps</h2>
      <p className='mt-0.5 text-sm text-muted-foreground'>
        Open this runtime&apos;s own web apps, such as dashboard, terminal, or file browser, using
        short-lived signed links.
      </p>
      <div className='mt-4'>
        {openableCount > 0 ? (
          <OpenPortButtons ports={agent.ports} disabled={!running} />
        ) : (
          <p className='text-sm text-muted-foreground'>No app ports are available yet.</p>
        )}
        {!running && openableCount > 0 && (
          <p className='mt-2 text-xs text-muted-foreground'>Start the runtime to open its apps.</p>
        )}
      </div>
    </section>
  );
}

function ShapeSection({ agent, onChanged }: { agent: MergedAgent; onChanged?: () => void }) {
  const current = shapeFor(agent.cpu, agent.memory);
  const { busy, run } = useAsyncAction();
  const [pending, setPending] = useState<Shape | null>(null);

  function pick(shape: Shape) {
    if (
      (shape.cpu === agent.cpu && shape.memory === agent.memory) ||
      busy ||
      isTransitional(agent.live_status)
    ) {
      return;
    }
    setPending(shape);
    run(async () => {
      await apiFetch('/api/chat/runtime/resize', {
        method: 'POST',
        body: JSON.stringify({ cpu: shape.cpu, memory: shape.memory, disk: shape.diskMin }),
      });
      toast.success(`Resizing to ${shape.label.split(' · ')[0]}`);
      onChanged?.();
    }).finally(() => setPending(null));
  }

  return (
    <section className='rounded-lg border p-5'>
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h2 className='text-sm font-semibold'>Shape</h2>
          <p className='mt-0.5 text-sm text-muted-foreground'>
            Change the CPU / memory / disk the runtime is allocated. Resizes take effect after a
            brief restart.
          </p>
        </div>
        <Cpu className='h-4 w-4 text-muted-foreground' />
      </div>
      <div className='mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4'>
        {SHAPE_PRESETS.map((shape) => {
          const isCurrent =
            current != null && shape.cpu === current.cpu && shape.memory === current.memory;
          const isPending = pending != null && shape.cpu === pending.cpu && shape.memory === pending.memory;
          return (
            <button
              key={shape.label}
              type='button'
              disabled={busy || isCurrent || (pending != null && !isPending)}
              onClick={() => pick(shape)}
              className={cn(
                'rounded-md border p-3 text-left text-sm transition-colors',
                isCurrent
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'hover:bg-accent hover:text-accent-foreground',
                busy && !isPending && 'opacity-60'
              )}
            >
              <div className='font-medium'>{shape.label.split(' · ')[0]}</div>
              <div className='mt-1 text-xs text-muted-foreground'>
                {shape.cpu} vCPU · {shape.memory} GB
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function InfoSection({ agent }: { agent: MergedAgent }) {
  return (
    <section className='overflow-hidden rounded-lg border text-sm'>
      <InfoRow label='Runtime ID' value={agent.agent37_id} mono />
      <InfoRow label='Name' value={agent.name || 'Headmaster runtime'} />
      <InfoRow label='Status' value={agent.live_status || 'unknown'} />
      <InfoRow label='Template' value={agent.template || 'agent37-hermes'} />
      <InfoRow label='Shape' value={shapeLabel(agent.cpu, agent.memory) || 'custom'} />
      <InfoRow
        label='Resources'
        value={
          agent.cpu != null && agent.memory != null && agent.disk != null
            ? `${agent.cpu} vCPU · ${agent.memory} GB · ${agent.disk} GB disk`
            : '—'
        }
      />
      <InfoRow label='Created' value={new Date(agent.created_at).toLocaleString()} last />
    </section>
  );
}

// A circular icon button for a header action. Label rides the tooltip + aria so the row stays
// icons.
function IconAction({
  label,
  icon: Icon,
  onClick,
  disabled,
  amber,
}: {
  label: string;
  icon: LucideIcon;
  onClick: () => void;
  disabled?: boolean;
  amber?: boolean;
}) {
  return (
    <button
      type='button'
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-full border bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40',
        amber && 'border-amber-400 text-amber-600 hover:bg-amber-50 hover:text-amber-700'
      )}
    >
      <Icon className='h-4 w-4' />
    </button>
  );
}

function InfoRow({ label, value, mono, last }: { label: string; value: string; mono?: boolean; last?: boolean }) {
  return (
    <div className={cn('grid grid-cols-[160px_1fr] gap-4 px-4 py-3', !last && 'border-b')}>
      <div className='text-muted-foreground'>{label}</div>
      <div className={cn('min-w-0 truncate', mono && 'font-mono text-xs')}>{value}</div>
    </div>
  );
}

// The runtime name as an inline-editable title: click the pencil to swap the heading for an
// input. Enter / blur commits; Escape cancels.
function NameEditor({ agent, onChanged }: { agent: MergedAgent; onChanged?: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(agent.name ?? '');
  const skipBlur = useRef(false);
  const { busy: saving, run } = useAsyncAction();

  useEffect(() => {
    if (!editing) setDraft(agent.name ?? '');
  }, [agent.name, editing]);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    if (!trimmed || trimmed === (agent.name ?? '')) return;
    run(async () => {
      await apiFetch('/api/chat/runtime', {
        method: 'PATCH',
        body: JSON.stringify({ name: trimmed }),
      });
      toast.success('Renamed');
      onChanged?.();
    });
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={draft}
        disabled={saving}
        onChange={(e) => setDraft(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        onBlur={() => {
          if (skipBlur.current) {
            skipBlur.current = false;
            return;
          }
          commit();
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            skipBlur.current = true;
            setDraft(agent.name ?? '');
            setEditing(false);
          }
        }}
        aria-label='Runtime name'
        placeholder='Headmaster runtime'
        className='min-w-0 max-w-md flex-1 border-b-2 border-ring bg-transparent text-2xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/60'
      />
    );
  }

  return (
    <div className='flex min-w-0 items-center gap-2'>
      <h1 className='truncate text-2xl font-semibold tracking-tight'>
        {agent.name?.trim() || 'Headmaster runtime'}
      </h1>
      <button
        type='button'
        onClick={() => setEditing(true)}
        aria-label='Rename runtime'
        title='Rename'
        className='shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <Pencil className='h-4 w-4' />
      </button>
    </div>
  );
}

// Budget + usage dialog — see BudgetDialog for the inner content; this thin wrapper adds the
// trigger button and owns the open state. Imported directly where needed.
