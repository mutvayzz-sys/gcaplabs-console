"use client";

import { useEffect, useMemo, useRef } from "react";
import { Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropOverlay } from "@/components/DropOverlay";
import { ChatComposer } from "./ChatComposer";
import { ChatMessages } from "./ChatMessages";
import { useChatContext } from "./ChatProvider";
import { useChat } from "./useChat";
import { useChatAttachments } from "./useChatAttachments";

// The conversation pane, rendered full-height in the chat tab's main column. Empty state = a
// centered welcome (heading + big composer + subtitle); once there are messages it becomes a
// scrolling transcript with the composer docked at the bottom. The composer is kept at a STABLE
// position in the tree across both states so it never remounts (preserving the draft, model, and
// effort selection through the first send).
export function ChatView() {
  const {
    agentId,
    agents,
    sessions,
    activeSessionId,
    composerFocusToken,
    requestComposerFocus,
    startNewChat,
    onSessionCreated,
    bumpSession,
  } = useChatContext();
  const { messages, isStreaming, loadingHistory, error, send, stop } = useChat({
    agentId,
    sessionId: activeSessionId,
    onSessionCreated,
    onActivity: bumpSession,
  });

  // Attachment state lives here (not in the composer) so the ENTIRE pane is a drop zone — a file
  // dropped anywhere over the transcript or composer lands in the same tray. A landed attachment
  // refocuses the composer through the same shared signal selecting/creating a thread uses.
  const att = useChatAttachments(agentId, requestComposerFocus);
  const { clearFiles } = att;

  // Switching threads / starting a new chat empties the staged tray, so a file picked for one
  // conversation can't silently ride along into the next.
  useEffect(() => {
    clearFiles();
  }, [activeSessionId, clearFiles]);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Whether the user is pinned near the bottom — controls whether new tokens auto-scroll.
  const stickRef = useRef(true);

  const onScroll = () => {
    const el = scrollRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  // Follow the stream only when the user is already near the bottom.
  useEffect(() => {
    if (!stickRef.current) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loadingHistory]);

  const showWelcome = !loadingHistory && messages.length === 0;
  // Memoized so the per-token re-renders during streaming don't re-scan the thread list.
  const activeTitle = useMemo(
    () => sessions.find((s) => s.session_id === activeSessionId)?.title?.trim(),
    [sessions, activeSessionId]
  );
  const headerTitle = activeTitle || (activeSessionId ? "Chat" : "New chat");
  const agentName = useMemo(() => {
    const a = agents.find((x) => x.runtime_id === agentId);
    return a?.name?.trim() || agentId;
  }, [agents, agentId]);

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background" {...att.dragHandlers}>
      {att.dragOver && <DropOverlay label="Drop files to attach" />}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,255,0.08),transparent_62%)]" />
      <header className="relative z-10 flex h-16 shrink-0 items-center justify-between border-b border-border/70 bg-background/88 px-6 backdrop-blur md:px-10">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground">{headerTitle}</h1>
          <p className="truncate text-xs font-medium text-muted-foreground">{agentName}</p>
        </div>
        <button
          type="button"
          onClick={startNewChat}
          aria-label="New chat"
          title="New chat"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>
      {/* Top: scrolling transcript when there are messages; the centered welcome heading when
          empty (justify-end seats it just above the composer). */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className={cn(
          "relative z-10 min-h-0",
          showWelcome ? "flex flex-1 flex-col items-center justify-end px-4 pb-4" : "flex-1 overflow-y-auto"
        )}
      >
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : messages.length > 0 ? (
          <ChatMessages messages={messages} isStreaming={isStreaming} />
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <h1 className="text-[32px] font-semibold tracking-tight text-foreground sm:text-[44px]">
              What can <span className="brand-gradient-text">Headmaster</span> help with?
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground">
              Start with a goal, a file, or the messy version of what you need done.
            </p>
          </div>
        )}
      </div>

      {/* Composer wrapper — the STABLE 2nd child. Its chrome (docked vs bare centered) is a
          className swap so the ChatComposer inside never changes tree position. */}
      <div className={cn("relative z-10", showWelcome ? "w-full px-6 md:px-10" : "bg-background/88 px-6 py-3 backdrop-blur md:px-10 sm:py-4")}>
        {/* No hard divider — a short fade dissolves the transcript into the composer instead. */}
        {!showWelcome && (
          <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-background to-transparent" />
        )}
        <div className={cn("mx-auto w-full", showWelcome ? "max-w-4xl" : "max-w-5xl")} aria-live="polite">
          {error && <p className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}
        </div>
        <ChatComposer
          agentId={agentId}
          isStreaming={isStreaming}
          att={att}
          onSend={send}
          onStop={stop}
          large={showWelcome}
          focusToken={composerFocusToken}
        />
      </div>

      {/* Bottom: balances the vertical centering and carries the welcome subtitle. */}
      {showWelcome && (
        <div className="flex flex-1 flex-col items-center px-4 pt-3">
          <p className="text-sm font-medium text-muted-foreground">
            The more context you give, the better your agent can help.
          </p>
        </div>
      )}
    </div>
  );
}
