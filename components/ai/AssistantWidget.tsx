"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Send,
  X,
  Bot,
  Trash2,
  Loader2,
  Mic,
  MicOff,
  MessageCircle,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useVoiceWhisper } from "@/lib/hooks/useVoiceWhisper";
import { VoiceWave } from "./VoiceWave";
import { useAssistant } from "@/lib/api/assistant";
import { cn } from "@/lib/utils";
import moment from "moment";
import { MessageRenderer } from "./MessageRenderer";
import { TypingIndicator } from "./TypingIndicator";
import { useStore } from "@/lib/store/useStore";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import Image from "next/image";

function suggestionsForPath(pathname: string): string[] {
  if (pathname.startsWith("/leaves")) {
    return [
      "What's my leave balance?",
      "Help me apply for leave",
      "Show my pending leave requests",
    ];
  }
  if (pathname.startsWith("/attendance")) {
    return [
      "Have I checked in today?",
      "Show my attendance trends",
      "Help me fix a missing checkout",
    ];
  }
  if (pathname.startsWith("/payroll")) {
    return [
      "Show my latest payslip",
      "Explain my deductions",
      "Compare my last two payslips",
    ];
  }
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/preboarding")) {
    return [
      "What's left on my onboarding?",
      "Explain my next onboarding task",
      "What documents do I still need?",
    ];
  }
  if (pathname.startsWith("/policies")) {
    return [
      "What is the sick leave policy?",
      "Summarize the attendance policy",
      "What are WFH rules?",
    ];
  }
  return [
    "What's my leave balance?",
    "Have I checked in today?",
    "What is the company policy for sick leaves?",
  ];
}

export function AssistantWidget() {
  const {
    assistantOpen: isOpen,
    setAssistantOpen: setIsOpen,
    user,
    assistantPayload,
    assistantQuery,
    setAssistantQuery,
  } = useStore();
  const pathname = usePathname() || "/dashboard";
  const emptySuggestions = useMemo(() => suggestionsForPath(pathname), [pathname]);
  const [input, setInput] = useState("");
  const [cancelledIds, setCancelledIds] = useState<Set<string>>(new Set());
  const {
    messages,
    setMessages,
    sendMessage,
    isLoading,
    isStreaming,
    activeTool,
    clearHistory,
    config,
  } = useAssistant();
  const [isMicErrorModalOpen, setIsMicErrorModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendRef = useRef<(e?: React.FormEvent, customQuery?: string) => Promise<void>>(async () => {});

  const handleSend = useCallback(
    async (e?: React.FormEvent, customQuery?: string) => {
      e?.preventDefault();
      const query = customQuery || input;
      if (!query.trim() || isLoading) return;

      setMessages((prev) => [
        ...prev,
        { role: "user", content: query, timestamp: new Date().toISOString() },
      ]);
      if (!customQuery) setInput("");

      const cancelMatch = query.match(/Cancel (?:my )?leave (?:with )?ID\s*(\d+|\w+)/i);
      if (cancelMatch) {
        setCancelledIds((prev) => new Set(prev).add(cancelMatch[1]));
      }

      try {
        let latitude: number | undefined;
        let longitude: number | undefined;
        if ("geolocation" in navigator) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
                enableHighAccuracy: true,
              });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          } catch {
            // optional
          }
        }
        await sendMessage({ query, latitude, longitude, payload: assistantPayload });
      } catch (error) {
        console.error("Failed to send message", error);
      }
    },
    [input, isLoading, setMessages, sendMessage, assistantPayload]
  );

  sendRef.current = handleSend;

  const {
    isRecording,
    isProcessing: isVoiceProcessing,
    startRecording,
    stopRecording,
    error: voiceError,
  } = useVoiceWhisper({
    onTranscript: (text) => {
      if (text) void sendRef.current(undefined, text);
    },
  });

  useEffect(() => {
    if (voiceError === "device-not-found" || voiceError === "permission-denied") {
      setIsMicErrorModalOpen(true);
    }
  }, [voiceError]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, setIsOpen]);

  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !scrollRef.current) return;
    const el = scrollRef.current;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [messages, isLoading, isStreaming, isOpen, activeTool]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 180);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (assistantQuery && isOpen) {
      const timer = setTimeout(() => {
        void handleSend(undefined, assistantQuery);
        setAssistantQuery("");
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [assistantQuery, isOpen, handleSend, setAssistantQuery]);

  const handleVoiceToggle = async () => {
    if (isRecording) await stopRecording();
    else await startRecording();
  };

  const onComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const statusLabel = isStreaming
    ? "Thinking…"
    : isLoading
      ? "Working…"
      : isRecording
        ? "Listening…"
        : "Online";

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col items-end sm:bottom-6 sm:right-6">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Teamzen assistant"
          className={cn(
            "mb-3 flex w-[calc(100vw-2rem)] flex-col overflow-hidden",
            "h-[min(720px,calc(100dvh-5.5rem))] max-h-[85dvh] sm:w-[440px]",
            "rounded-2xl border border-border/80 bg-card text-card-foreground",
            "shadow-[0_24px_64px_-16px_rgba(15,23,42,0.28)]",
            "animate-in fade-in slide-in-from-bottom-3 duration-300",
            "dark:shadow-[0_24px_64px_-12px_rgba(0,0,0,0.55)]"
          )}
        >
          {/* Header */}
          <header className="relative shrink-0 border-b border-border/70 bg-gradient-to-b from-muted/50 to-card px-4 py-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-card bg-emerald-500" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground">
                    Teamzen Assistant
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        isLoading || isStreaming || isRecording
                          ? "animate-pulse bg-amber-500"
                          : "bg-emerald-500"
                      )}
                    />
                    {statusLabel}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={clearHistory}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Clear chat"
                  aria-label="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  title="Close"
                  aria-label="Close assistant"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </header>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain bg-[radial-gradient(ellipse_at_top,_var(--muted)_0%,_transparent_55%)] px-4 py-5"
          >
            {messages.length === 0 && (
              <div className="flex h-full min-h-[280px] flex-col justify-center animate-in fade-in duration-500">
                <div className="relative mx-auto mb-5 aspect-[16/10] w-full max-w-[320px] overflow-hidden rounded-xl ring-1 ring-border/70">
                  <Image
                    src="/images/empty/empty-assistant.webp"
                    alt=""
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="320px"
                    className="object-cover object-center"
                  />
                </div>
                <div className="mx-auto max-w-[320px] text-center">
                  <h4 className="text-base font-semibold tracking-tight text-foreground">
                    Hi{user?.firstName ? ` ${user.firstName}` : ""}
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Ask about leave, attendance, payslips, or company policy — I can answer and take you to the right screen.
                  </p>
                </div>
                <div className="mt-6 grid gap-2">
                  {emptySuggestions.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => void handleSend(undefined, q)}
                      className={cn(
                        "group flex items-center justify-between gap-3 rounded-xl border border-border/80 bg-background/90 px-3.5 py-3",
                        "text-left text-[13px] font-medium text-foreground/85 shadow-sm",
                        "transition-all hover:border-primary/35 hover:bg-primary/[0.04] hover:text-foreground",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      )}
                    >
                      <span className="leading-snug">{q}</span>
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={`${msg.timestamp ?? i}-${i}`}
                className={cn(
                  "flex animate-in fade-in slide-in-from-bottom-1 duration-300",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "min-w-0 max-w-[92%]",
                    msg.role === "assistant" && "w-full max-w-full"
                  )}
                >
                  <MessageRenderer
                    content={msg.content}
                    role={msg.role}
                    cancelledIds={cancelledIds}
                    handleSend={handleSend}
                    isLast={i === messages.length - 1}
                    isStreaming={isStreaming}
                    activeTool={i === messages.length - 1 ? activeTool : null}
                    toolsUsed={msg.toolsUsed}
                    sources={msg.sources}
                  />
                  <div
                    className={cn(
                      "mt-1.5 px-1 text-[10px] tabular-nums text-muted-foreground/70",
                      msg.role === "user" ? "text-right" : "text-left"
                    )}
                  >
                    {msg.timestamp
                      ? moment(msg.timestamp).format("h:mm A")
                      : moment().format("h:mm A")}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && !isStreaming && (
              <div className="flex justify-start animate-in fade-in duration-200">
                <TypingIndicator />
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="shrink-0 border-t border-border/70 bg-card p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={(e) => void handleSend(e)}
              className={cn(
                "relative flex items-end gap-1.5 rounded-2xl border border-border bg-muted/35 p-1.5 shadow-inner",
                "focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15",
                isRecording && "border-primary/45 bg-primary/[0.06]"
              )}
            >
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  const el = e.target;
                  el.style.height = "auto";
                  el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
                }}
                onKeyDown={onComposerKeyDown}
                placeholder={isRecording ? "Listening…" : "Ask anything…"}
                disabled={isLoading || isVoiceProcessing}
                className={cn(
                  "max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent px-3 py-2.5",
                  "text-sm leading-snug text-foreground placeholder:text-muted-foreground/70",
                  "outline-none disabled:opacity-60"
                )}
                aria-label="Message"
              />
              {(isRecording || isVoiceProcessing) && (
                <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
                  <VoiceWave isProcessing={isVoiceProcessing} />
                </div>
              )}
              <div className="flex shrink-0 items-center gap-1 pb-0.5 pr-0.5">
                <button
                  type="button"
                  onClick={() => void handleVoiceToggle()}
                  disabled={isLoading || isVoiceProcessing}
                  aria-label={isRecording ? "Stop listening" : "Voice input"}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isRecording
                      ? "bg-destructive text-destructive-foreground"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                  )}
                >
                  {isVoiceProcessing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim() || isRecording || isVoiceProcessing}
                  aria-label="Send message"
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground",
                    "transition-all hover:opacity-90 active:scale-95",
                    "disabled:pointer-events-none disabled:opacity-35",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </div>
            </form>
            <div className="mt-2 flex items-center justify-between px-1">
              <p className="truncate text-[10px] text-muted-foreground/70">
                {config?.model_name || "GPT-4o Mini"}
              </p>
              <p className="text-[10px] font-medium text-muted-foreground/50">Teamzen</p>
            </div>
          </div>
        </div>
      )}

      <button
        id="ai-assistant-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        aria-expanded={isOpen}
        className={cn(
          "flex h-[52px] w-[52px] items-center justify-center rounded-2xl transition-all duration-300",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "active:scale-95",
          isOpen
            ? "border border-border bg-card text-foreground shadow-lg hover:bg-muted"
            : "bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_oklch(0.45_0.09_200_/_0.55)] hover:brightness-105"
        )}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <ConfirmationModal
        isOpen={isMicErrorModalOpen}
        onClose={() => setIsMicErrorModalOpen(false)}
        onConfirm={() => setIsMicErrorModalOpen(false)}
        title={
          voiceError === "permission-denied"
            ? "Microphone access denied"
            : "Microphone not found"
        }
        description={
          voiceError === "permission-denied"
            ? "Enable microphone permissions in your browser settings to use voice input."
            : "No microphone was detected. Connect a recording device to use voice."
        }
        confirmText="Got it"
        variant={voiceError === "permission-denied" ? "warning" : "destructive"}
      />
    </div>
  );
}
