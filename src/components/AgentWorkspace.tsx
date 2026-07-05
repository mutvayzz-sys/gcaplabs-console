'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  BarChart3,
  Brain,
  CalendarClock,
  Files,
  Hammer,
  MessageSquare,
  Plug,
  Settings,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { AccountMenu } from '@/components/AccountMenu';
import { HeadmasterLockup } from '@/components/HeadmasterBrand';
import { ChatProvider } from '@/components/chat/ChatProvider';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatView } from '@/components/chat/ChatView';
import { FilesTab } from '@/components/files/FilesTab';
import { ComposioApps } from '@/components/integrations/ComposioApps';
import { RuntimeSettingsTab } from '@/components/RuntimeSettingsTab';
import { agentTabPath, type AgentTab } from '@/lib/dashboard-tabs';
import { cn } from '@/lib/utils';
import type { MergedAgent } from '@/lib/types';

const TABS: Array<{ id: AgentTab; label: string; icon: LucideIcon; caption: string }> = [
  { id: 'chat', label: 'Chat', icon: MessageSquare, caption: 'Talk to the runtime' },
  { id: 'files', label: 'Files', icon: Files, caption: 'Workspace browser' },
  { id: 'integrations', label: 'Integrations', icon: Plug, caption: 'Apps and tools' },
  { id: 'settings', label: 'Settings', icon: Settings, caption: 'Runtime controls' },
];

const IOS_SECTIONS: Array<{ label: string; icon: LucideIcon; caption: string }> = [
  { label: 'Tasks', icon: CalendarClock, caption: 'Cron jobs' },
  { label: 'Skills', icon: Hammer, caption: 'Procedures' },
  { label: 'Memory', icon: Brain, caption: 'Recall' },
  { label: 'Insights', icon: BarChart3, caption: 'Activity' },
];

export function AgentWorkspace({
  agent,
  activeTab,
  userEmail,
  isAdmin = false,
}: {
  agent: MergedAgent;
  activeTab: AgentTab;
  userEmail?: string | null;
  isAdmin?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = activeTab === 'chat' ? searchParams.get('session') : null;
  // Local mirror of the runtime state so lifecycle actions (start/stop/restart/update/resize/
  // rename) can refresh the header + tabs without a full page navigation. The server component
  // passed `agent` from getManagedAgent(); we re-fetch via /api/chat/runtime after every mutation.
  const [currentAgent, setCurrentAgent] = useState<MergedAgent>(agent);

  function navigateToSession(nextSessionId: string | null, mode: 'push' | 'replace' = 'push') {
    const params = new URLSearchParams(searchParams.toString());
    if (nextSessionId) params.set('session', nextSessionId);
    else params.delete('session');
    const qs = params.toString();
    const next = `${agentTabPath(currentAgent.runtime_id, 'chat')}${qs ? `?${qs}` : ''}`;
    if (mode === 'replace') router.replace(next);
    else router.push(next);
  }

  async function refreshRuntime() {
    try {
      const res = await fetch('/api/chat/runtime', { cache: 'no-store' });
      if (res.ok) setCurrentAgent(await res.json());
    } catch {
      // Silent — the next render will retry. Lifecycle actions still report their own toast.
    }
  }

  return (
    <ChatProvider
      agentId={currentAgent.runtime_id}
      agents={[currentAgent]}
      urlSessionId={sessionId}
      onChatTab={activeTab === 'chat'}
      navigateToSession={navigateToSession}
    >
      <div className='brand-shell flex h-full min-h-0 w-full overflow-hidden border-0 bg-background'>
        <aside className='brand-sidebar flex w-[22rem] shrink-0 flex-col border-r border-border/70 shadow-[18px_0_60px_rgba(13,15,20,0.04)]'>
          <div className='border-b border-border/70 p-5'>
            <HeadmasterLockup />
            <Link href='/dashboard' className='mt-6 inline-flex text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-primary'>
              Agents
            </Link>
            <div className='brand-soft-card mt-3 min-w-0 rounded-2xl p-3'>
              <h1 className='truncate text-base font-semibold tracking-tight'>{userEmail || currentAgent.name || 'Headmaster runtime'}</h1>
              <div className='mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground'>
                <span className='brand-status-connected inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-1 font-semibold lowercase'>
                  <span className='h-1.5 w-1.5 rounded-full bg-[#2563ff]' aria-hidden='true' />
                  {currentAgent.live_status ?? 'unknown'}
                </span>
                <span className='truncate font-mono'>{currentAgent.runtime_id}</span>
              </div>
            </div>
          </div>

          <nav className='space-y-1 border-b border-border/70 p-3'>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={agentTabPath(currentAgent.runtime_id, tab.id)}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition-all',
                    active
                      ? 'brand-active-nav border-transparent'
                      : 'border-transparent text-muted-foreground hover:border-border/80 hover:bg-white/78 hover:text-foreground hover:shadow-sm'
                  )}
                >
                  <Icon className='h-4 w-4 shrink-0' />
                  <span className='min-w-0 flex-1'>
                    <span className='block truncate'>{tab.label}</span>
                    <span className={cn('block truncate text-[11px] font-medium', active ? 'text-white/72' : 'text-muted-foreground/72')}>
                      {tab.caption}
                    </span>
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className='border-b border-border/70 px-3 py-3'>
            <div className='mb-2 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground'>
              <Sparkles className='h-3.5 w-3.5 text-primary' />
              iOS sections
            </div>
            <div className='grid grid-cols-2 gap-2'>
              {IOS_SECTIONS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className='brand-chip rounded-2xl px-3 py-2 text-xs transition-transform'>
                    <div className='flex items-center gap-2 font-semibold text-foreground'>
                      <Icon className='h-3.5 w-3.5 text-primary' />
                      {item.label}
                    </div>
                    <div className='mt-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground'>{item.caption}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className='flex min-h-0 flex-1 flex-col'>
            {activeTab === 'chat' ? (
              <ChatSidebar />
            ) : (
              <div className='flex-1 p-4 text-sm text-muted-foreground'>
                {activeTab === 'files' && 'Browse and edit files in the managed runtime.'}
                {activeTab === 'integrations' && 'Connect third-party apps to this agent.'}
                {activeTab === 'settings' && 'Manage your Headmaster runtime: lifecycle, shape, apps, budget.'}
              </div>
            )}

          </div>

          {userEmail ? (
            <div className='mt-auto border-t border-border/70 p-3'>
              <AccountMenu userEmail={userEmail} isAdmin={isAdmin} caption='' />
            </div>
          ) : null}
        </aside>

        <main className='min-w-0 flex-1'>
          {activeTab === 'chat' && <ChatView />}
          {activeTab === 'files' && <FilesTab agentId={currentAgent.runtime_id} />}
          {activeTab === 'integrations' && <RuntimeIntegrations />}
          {activeTab === 'settings' && <RuntimeSettingsTab agent={currentAgent} onChanged={refreshRuntime} />}
        </main>
      </div>
    </ChatProvider>
  );
}

function RuntimeIntegrations() {
  return (
    <div className='brand-chat-bg h-full overflow-y-auto p-8'>
      <div className='brand-soft-card mx-auto max-w-4xl rounded-[28px] p-6'>
      <h1 className='text-xl font-semibold tracking-tight'>Integrations</h1>
      <p className='mt-2 text-sm text-muted-foreground'>Connect third-party apps to this agent.</p>

      <div className='mt-6'>
        <ComposioApps />
      </div>
      </div>
    </div>
  );
}
