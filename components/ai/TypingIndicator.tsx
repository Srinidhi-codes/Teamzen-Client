"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const IDLE_PHRASES = [
  "Thinking",
  "Gathering context",
  "Almost ready",
];

function formatToolLabel(name?: string | null) {
  if (!name) return null;
  const clean = name
    .replace(/^teamzen__/, "")
    .replace(/_/g, " ")
    .trim();
  if (!clean) return null;
  return clean.replace(/\b\w/g, (c) => c.toUpperCase());
}

interface TypingIndicatorProps {
  className?: string;
  activeTool?: { name: string; status: "running" | "completed" } | null;
  /** Compact = dots only (inline bubble) */
  compact?: boolean;
}

export function TypingIndicator({
  className,
  activeTool,
  compact = false,
}: TypingIndicatorProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (activeTool?.status === "running") return;
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % IDLE_PHRASES.length);
    }, 2200);
    return () => clearInterval(id);
  }, [activeTool?.status]);

  const toolLabel = formatToolLabel(activeTool?.name);
  const label =
    activeTool?.status === "running" && toolLabel
      ? `Using ${toolLabel}`
      : IDLE_PHRASES[phraseIdx];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-2xl rounded-bl-md border border-border/70 bg-background/95 shadow-sm",
        compact ? "px-3.5 py-2.5" : "px-3.5 py-3",
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`${label}…`}
    >
      <div className="typing-dots flex items-center gap-1" aria-hidden>
        <span className="typing-dot" />
        <span className="typing-dot" />
        <span className="typing-dot" />
      </div>
      {!compact && (
        <span className="text-xs font-medium text-muted-foreground tabular-nums">
          <span key={label} className="inline-block animate-in fade-in duration-300">
            {label}
          </span>
          <span className="typing-ellipsis" />
        </span>
      )}

      <style jsx>{`
        .typing-dot {
          display: block;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: var(--primary);
          opacity: 0.35;
          animation: typing-bounce 1.2s ease-in-out infinite;
        }
        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }
        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }
        @keyframes typing-bounce {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.35;
          }
          30% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }
        .typing-ellipsis::after {
          content: "";
          animation: typing-dots-text 1.2s steps(4, end) infinite;
        }
        @keyframes typing-dots-text {
          0% {
            content: "";
          }
          25% {
            content: ".";
          }
          50% {
            content: "..";
          }
          75% {
            content: "...";
          }
        }
      `}</style>
    </div>
  );
}
