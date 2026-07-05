'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Files, MessageSquare, Plug, Settings } from 'lucide-react';
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

const TABS: Array<{ id: AgentTab; label: string; icon: typeof MessageSquare }> = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'files', label: 'Files', icon: Files },
  { id: 'integrations', label: 'Integrations', icon: Plug },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AgentWorkspace({
  agent,
  activeTab,
  userEmail,
}: {
  agent: MergedAgent;
  activeTab: AgentTab;
  userEmail?: string | null;
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
        <aside className='brand-sidebar flex w-80 shrink-0 flex-col border-r border-border/70'>
          <div className='border-b border-border/70 p-4'>
            <HeadmasterLockup />
            <Link href='/dashboard' className='mt-5 inline-flex text-xs font-medium text-muted-foreground transition-colors hover:text-primary'>
              Agents
            </Link>
            <div className='mt-2 min-w-0'>
              <h1 className='truncate text-base font-semibold tracking-tight'>{currentAgent.name || 'Headmaster runtime'}</h1>
              <div className='mt-2 flex min-w-0 items-center gap-2 text-xs text-muted-foreground'>
                <span className='inline-flex h-2 w-2 shrink-0 rounded-full bg-[#2563ff]' aria-hidden='true' />
                <span className='font-medium'>{currentAgent.live_status ?? 'unknown'}</span>
                <span className='text-muted-foreground/50'>•</span>
                <span className='truncate font-mono'>{currentAgent.runtime_id}</span>
              </div>
            </div>
          </div>

          <nav className='border-b border-border/70 p-2'>
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <Link
                  key={tab.id}
                  href={agentTabPath(currentAgent.runtime_id, tab.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'border-border/80 bg-foreground/[0.045] text-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-foreground/[0.035] hover:text-foreground'
                  )}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className='flex min-h-0 flex-1 flex-col'>
            {activeTab === 'chat' ? (
              <ChatSidebar />
            ) : (
              <div className='flex-1 p-4 text-sm text-muted-foreground'>
                {activeTab === 'files' && 'Browse and edit files in the managed runtime.'}
                {activeTab === 'integrations' && 'Connect third-party apps to this agent.'}
                {activeTab === 'settings' && 'Manage your headmaster runtime: lifecycle, shape, apps, budget.'}
              </div>
            )}

          </div>

          {userEmail ? (
            <div className='mt-auto border-t border-border/70 p-3'>
              <AccountMenu userEmail={userEmail} caption='' />
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
    <div className='mx-auto max-w-3xl p-8'>
      <h1 className='text-xl font-semibold tracking-tight'>Integrations</h1>
      <p className='mt-2 text-sm text-muted-foreground'>Connect third-party apps to this agent.</p>

      <div className='mt-6'>
        <ComposioApps />
      </div>
    </div>
  );
}
