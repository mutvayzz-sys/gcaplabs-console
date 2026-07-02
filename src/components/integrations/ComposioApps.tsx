'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Plug, Search, Unplug } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';

const SEARCH_DEBOUNCE_MS = 250;
const MIN_SEARCH = 3; // matches the /api/chat/integrations/toolkits route's own guard

type SortBy = 'usage' | 'alphabetically';

interface Toolkit {
  slug: string;
  name: string;
  auth_schemes: string[];
  composio_managed_auth_schemes: string[];
  meta?: { logo?: string; description?: string };
}

interface Connection {
  id: string;
  toolkit: { slug: string };
  status: string;
}

function toolkitLogoUrl(slug: string): string {
  return `https://logos.composio.dev/api/${slug}`;
}

function isActive(c: Connection): boolean {
  return c.status.toUpperCase() === 'ACTIVE';
}

type SubTab = 'browse' | 'connected';

export function ComposioApps() {
  const [tab, setTab] = useState<SubTab>('browse');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('usage');
  const [toolkits, setToolkits] = useState<Toolkit[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingFirstPage, setLoadingFirstPage] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loadingConns, setLoadingConns] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestSeq = useRef(0);

  const fetchConnections = useCallback(async () => {
    const { connections: conns } = await apiFetch<{ connections: Connection[] }>('/api/chat/integrations/connections');
    setConnections(conns);
    return conns;
  }, []);

  useEffect(() => {
    setLoadingConns(true);
    fetchConnections()
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoadingConns(false));
  }, [fetchConnections]);

  const fetchPage = useCallback((query: string, sort: SortBy, pageCursor: string | null, seq: number) => {
    const qs = new URLSearchParams();
    if (query) qs.set('search', query);
    qs.set('sort', sort);
    if (pageCursor) qs.set('cursor', pageCursor);
    return apiFetch<{ toolkits: Toolkit[]; nextCursor: string | null }>(
      `/api/chat/integrations/toolkits?${qs.toString()}`
    ).then((res) => {
      if (seq !== requestSeq.current) return; // a newer search/sort superseded this request
      setToolkits((prev) => (pageCursor ? [...prev, ...res.toolkits] : res.toolkits));
      setCursor(res.nextCursor);
    });
  }, []);

  // Reset and refetch from page one whenever the search query or sort changes.
  useEffect(() => {
    const query = search.trim();
    if (query.length > 0 && query.length < MIN_SEARCH) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const seq = ++requestSeq.current;
    debounceRef.current = setTimeout(() => {
      setLoadingFirstPage(true);
      setError(null);
      fetchPage(query, sortBy, null, seq)
        .catch((e: Error) => {
          if (seq === requestSeq.current) setError(e.message);
        })
        .finally(() => {
          if (seq === requestSeq.current) setLoadingFirstPage(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, sortBy, fetchPage]);

  // Infinite scroll: load the next page once the sentinel at the bottom of the grid is visible.
  useEffect(() => {
    if (tab !== 'browse') return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (!cursor || loadingMore || loadingFirstPage) return;
        const seq = requestSeq.current;
        setLoadingMore(true);
        fetchPage(search.trim(), sortBy, cursor, seq)
          .catch((e: Error) => {
            if (seq === requestSeq.current) setError(e.message);
          })
          .finally(() => setLoadingMore(false));
      },
      { rootMargin: '200px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tab, cursor, loadingMore, loadingFirstPage, search, sortBy, fetchPage]);

  const handleConnect = async (slug: string) => {
    setConnecting(slug);
    setError(null);
    try {
      const { redirectUrl } = await apiFetch<{ redirectUrl: string }>('/api/chat/integrations/connect', {
        method: 'POST',
        body: JSON.stringify({ toolkit: slug }),
      });
      window.location.href = redirectUrl;
    } catch (e) {
      setError((e as Error).message);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    setDisconnecting(connectionId);
    setError(null);
    try {
      await apiFetch(`/api/chat/integrations/connections/${encodeURIComponent(connectionId)}`, { method: 'DELETE' });
      await fetchConnections();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setDisconnecting(null);
    }
  };

  const connectedSlugs = new Set(connections.filter(isActive).map((c) => c.toolkit.slug));

  return (
    <div>
      <div className='flex items-center gap-1 border-b'>
        <TabButton active={tab === 'browse'} onClick={() => setTab('browse')}>
          Browse
        </TabButton>
        <TabButton active={tab === 'connected'} onClick={() => setTab('connected')}>
          Connected {connections.filter(isActive).length > 0 ? `(${connections.filter(isActive).length})` : ''}
        </TabButton>
      </div>

      {error ? (
        <div className='mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      {tab === 'browse' ? (
        <div className='mt-4 space-y-4'>
          <div className='flex gap-2'>
            <div className='relative flex-1'>
              <Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search 1000+ apps…'
                className='pl-9'
              />
              {loadingFirstPage ? (
                <Loader2 className='absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground' />
              ) : null}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className='rounded-md border bg-background px-2 text-sm text-muted-foreground'
            >
              <option value='usage'>Popular</option>
              <option value='alphabetically'>A–Z</option>
            </select>
          </div>

          {toolkits.length === 0 && !loadingFirstPage ? (
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              {search.trim().length > 0 && search.trim().length < MIN_SEARCH
                ? `Type at least ${MIN_SEARCH} characters to search.`
                : 'No apps found.'}
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
                {toolkits.map((toolkit) => {
                  const connected = connectedSlugs.has(toolkit.slug);
                  return (
                    <div key={toolkit.slug} className='flex flex-col gap-2 rounded-lg border p-3'>
                      <div className='flex items-center gap-2'>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={toolkitLogoUrl(toolkit.slug)}
                          alt=''
                          className='h-6 w-6 shrink-0 rounded'
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.visibility = 'hidden';
                          }}
                        />
                        <span className='min-w-0 truncate text-sm font-medium'>{toolkit.name}</span>
                      </div>
                      {toolkit.meta?.description ? (
                        <p className='line-clamp-2 text-xs text-muted-foreground'>{toolkit.meta.description}</p>
                      ) : null}
                      <Button
                        size='sm'
                        variant={connected ? 'outline' : 'default'}
                        disabled={connected || connecting === toolkit.slug}
                        onClick={() => handleConnect(toolkit.slug)}
                      >
                        {connecting === toolkit.slug ? (
                          <Loader2 className='h-3.5 w-3.5 animate-spin' />
                        ) : connected ? (
                          'Connected'
                        ) : (
                          <>
                            <Plug className='h-3.5 w-3.5' />
                            Connect
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
              <div ref={sentinelRef} className='flex justify-center py-2'>
                {loadingMore ? <Loader2 className='h-4 w-4 animate-spin text-muted-foreground' /> : null}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className='mt-4'>
          {loadingConns ? (
            <div className='rounded-lg border border-dashed p-6 text-sm text-muted-foreground'>Loading…</div>
          ) : connections.length === 0 ? (
            <div className='rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground'>
              No apps connected yet. Switch to Browse to connect one.
            </div>
          ) : (
            <div className='overflow-hidden rounded-lg border text-sm'>
              {connections.map((conn, i) => (
                <div
                  key={conn.id}
                  className={cn(
                    'flex items-center justify-between gap-4 px-4 py-3',
                    i < connections.length - 1 && 'border-b'
                  )}
                >
                  <div className='flex min-w-0 items-center gap-2'>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={toolkitLogoUrl(conn.toolkit.slug)} alt='' className='h-5 w-5 shrink-0 rounded' />
                    <span className='min-w-0 truncate font-medium'>{conn.toolkit.slug}</span>
                    <Badge variant={isActive(conn) ? 'default' : 'outline'}>{conn.status.toLowerCase()}</Badge>
                  </div>
                  <Button
                    size='sm'
                    variant='outline'
                    disabled={disconnecting === conn.id}
                    onClick={() => handleDisconnect(conn.id)}
                  >
                    {disconnecting === conn.id ? (
                      <Loader2 className='h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <Unplug className='h-3.5 w-3.5' />
                    )}
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        active ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'
      )}
    >
      {children}
    </button>
  );
}
