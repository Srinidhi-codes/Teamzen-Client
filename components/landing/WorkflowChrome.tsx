"use client";

import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductWindow({
  url = "app.teamzen.io",
  children,
  className,
  dark,
}: {
  url?: string;
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border shadow-[0_32px_80px_-24px_rgba(15,40,50,0.38)]",
        dark
          ? "border-white/10 bg-[#0f1c22] text-white shadow-[0_32px_80px_-24px_rgba(0,0,0,0.55)]"
          : "border-border bg-background",
        className
      )}
    >
      <div
        className={cn(
          "flex items-center gap-1.5 border-b px-3 py-2.5 sm:gap-2 sm:px-4",
          dark ? "border-white/10 bg-white/5" : "border-border bg-card"
        )}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <div
          className={cn(
            "ml-2 flex-1 truncate rounded-md px-2 py-1 text-[10px] sm:ml-3 sm:px-3 sm:text-[11px]",
            dark ? "bg-white/8 text-white/60" : "bg-muted text-foreground/70"
          )}
        >
          {url}
        </div>
      </div>
      {children}
    </div>
  );
}

export function WorkflowStepRail({
  steps,
  current,
  onSelect,
  onReplay,
  dark,
}: {
  steps: { label: string }[];
  current: number;
  onSelect: (index: number) => void;
  onReplay?: () => void;
  dark?: boolean;
}) {
  return (
    <div className="mt-4 flex min-w-0 items-center gap-2 sm:mt-5">
      <div
        role="tablist"
        aria-label="Workflow steps"
        className="scrollbar-hide flex min-w-0 flex-1 flex-nowrap gap-1.5 overflow-x-auto pb-1"
      >
        {steps.map((item, index) => {
          const active = index === current;
          const done = index < current;
          return (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onSelect(index)}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors motion-reduce:transition-none",
                dark
                  ? active
                    ? "border-white/30 bg-white text-[#102027]"
                    : done
                      ? "border-teal-300/30 bg-teal-300/10 text-teal-100"
                      : "border-white/15 bg-white/5 text-white/65 hover:bg-white/10"
                  : active
                    ? "border-foreground bg-foreground text-background"
                    : done
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="mr-1.5 tabular-nums opacity-70">{index + 1}</span>
              {item.label}
            </button>
          );
        })}
      </div>
      {onReplay ? (
        <button
          type="button"
          onClick={onReplay}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors motion-reduce:transition-none",
            dark
              ? "border-white/15 bg-white/5 text-white/70 hover:bg-white/10"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <RotateCcw className="h-3 w-3" />
          Replay
        </button>
      ) : null}
    </div>
  );
}
