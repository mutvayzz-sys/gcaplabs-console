"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { branding } from "@/config/branding";
import { Plus, Send, Loader2 } from "lucide-react";

// Minimal Headmaster console chat. No fleet/workspace indirection —
// each user has one runtime container provisioned by HermesHQ.

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  reasoning?: string;
  isStreaming?: boolean;
}

interface SessionSummary {
  id: string;
  title?: string | null;
  preview?: string | null;
  last_active?: number | null;
  started_at?: number | null;
}

export default function DashboardPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load sessions list
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/sessions");
      if (res.ok) {
        const data = await res.json() as { data?: SessionSummary[] };
        setSessions(data.data ?? []);
      }
    } catch {
      // silently fail — sessions list is not critical for chat
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const send = useCallback(async () => {
    if (!draft.trim() || isSending) return;
    const userText = draft.trim();
    setDraft("");
    setIsSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: userText,
    };
    const assistantMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "",
      isStreaming: true,
    };
    setMessages((prev) => [...prev, userMsg, assistantMsg]);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: userText,
          stream: true,
          session_id: activeSessionId ?? undefined,
        }),
        signal: ctrl.signal,
      });

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => "Chat failed");
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, text: `Error: ${errText}`, isStreaming: false }
              : m,
          ),
        );
        return;
      }

      // Parse SSE stream
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const blocks = buf.split("\n\n");
        buf = blocks.pop() ?? "";
        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventType = "";
          const dataLines: string[] = [];
          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) eventType = line.slice(7).trim();
            else if (line.startsWith("data: ")) dataLines.push(line.slice(6));
          }
          if (!dataLines.length) continue;
          try {
            const evt = JSON.parse(dataLines.join("\n")) as Record<string, unknown>;
            const type = (evt.type as string) || eventType;
            if (type === "response.created" && evt.id) {
              if (!activeSessionId && evt.session_id) {
                setActiveSessionId(evt.session_id as string);
              }
            } else if (type === "response.output_text.delta") {
              const delta = (evt.delta as string) || "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, text: m.text + delta }
                    : m,
                ),
              );
            } else if (type === "response.reasoning.delta") {
              const delta = (evt.delta as string) || "";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, reasoning: (m.reasoning ?? "") + delta }
                    : m,
                ),
              );
            } else if (type === "response.completed") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, isStreaming: false }
                    : m,
                ),
              );
            } else if (type === "response.failed") {
              const err = (evt.error as string) || "Response failed";
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsg.id
                    ? { ...m, text: `Error: ${err}`, isStreaming: false }
                    : m,
                ),
              );
            }
          } catch {
            // skip malformed SSE block
          }
        }
      }
      // Refresh sessions list after the turn
      loadSessions();
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, text: `Error: ${(err as Error).message}`, isStreaming: false }
              : m,
          ),
        );
      }
    } finally {
      setIsSending(false);
    }
  }, [draft, isSending, activeSessionId, loadSessions]);

  const newChat = useCallback(() => {
    setMessages([]);
    setActiveSessionId(null);
    inputRef.current?.focus();
  }, []);

  const selectSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setMessages([]);
    try {
      const res = await fetch(`/api/chat/sessions/${sessionId}`);
      if (res.ok) {
        const data = await res.json() as { history?: Array<{ role: string; content: string }> };
        if (data.history) {
          setMessages(
            data.history.map((h) => ({
              id: crypto.randomUUID(),
              role: h.role as "user" | "assistant",
              text: h.content,
            })),
          );
        }
      }
    } catch {
      // silently fail
    }
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 py-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-lg font-semibold">
            {branding.appName}
          </h1>
          <span className="text-sm text-muted-foreground">Console</span>
        </div>
        <a href="/login" className="text-sm text-primary hover:underline">
          Sign out
        </a>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Session sidebar */}
        <aside className="w-64 border-r border-border bg-card p-3 overflow-y-auto">
          <button
            onClick={newChat}
            className="mb-3 flex w-full items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-foreground/10"
            style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <Plus className="h-4 w-4" />
            New chat
          </button>
          <div className="space-y-1">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => selectSession(s.id)}
                className={`block w-full truncate rounded-md px-3 py-2 text-left text-sm hover:bg-muted ${
                  activeSessionId === s.id ? "bg-muted font-medium" : "text-muted-foreground"
                }`}
              >
                {s.title || s.preview || "New conversation"}
              </button>
            ))}
            {sessions.length === 0 && (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No conversations yet. Start chatting!
              </p>
            )}
          </div>
        </aside>

        {/* Chat area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.length === 0 && (
              <div className="flex h-full items-center justify-center text-center">
                <div>
                  <h2 className="font-display text-2xl font-semibold text-foreground">
                    Welcome to {branding.appName}
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Ask anything — your Headmaster instance is ready.
                  </p>
                </div>
              </div>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-card-foreground border border-border"
                  }`}
                  style={
                    msg.role === "user"
                      ? { backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }
                      : {}
                  }
                >
                  {msg.reasoning && (
                    <div className="mb-2 border-b border-border pb-2 text-xs italic text-muted-foreground">
                      {msg.reasoning}
                    </div>
                  )}
                  <div className="whitespace-pre-wrap text-sm">
                    {msg.text || (msg.isStreaming && (
                      <Loader2 className="inline h-4 w-4 animate-spin text-muted-foreground" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Composer */}
          <div className="border-t border-border p-4">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 resize-none rounded-lg border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                disabled={isSending}
              />
              <button
                onClick={send}
                disabled={!draft.trim() || isSending}
                className="rounded-lg bg-primary p-2.5 text-primary-foreground disabled:opacity-50"
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}