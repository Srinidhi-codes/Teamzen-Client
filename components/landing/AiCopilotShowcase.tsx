"use client";

import Image from "next/image";
import {
  ArrowUpRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Mic,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BrandImages } from "@/lib/brand-images";
import { useWorkflowDemo } from "@/components/landing/useWorkflowDemo";

const SCENARIOS = [
  {
    label: "Attendance",
    prompt: "Have I checked in today?",
    tool: "Checking attendance",
    answer: "Yes — you checked in at 09:12 AM. Face and office location were verified.",
  },
  {
    label: "Leave",
    prompt: "Can I take leave from 18–20 Aug?",
    tool: "Checking balance & calendar",
    answer: "You have 12 annual leave days. Your team has coverage for all three dates.",
  },
  {
    label: "Payroll",
    prompt: "Why is my net pay lower this month?",
    tool: "Explaining deductions",
    answer: "Your net changed because income tax increased by ₹1,250. PF stayed the same.",
  },
] as const;

export function AiCopilotShowcase() {
  const { containerRef, step, setStep, replay } = useWorkflowDemo({
    stepCount: SCENARIOS.length,
    interval: 4200,
  });
  const scenario = SCENARIOS[step];

  return (
    <div ref={containerRef} className="ai-showcase-grid">
      <div className="relative z-10">
        <p className="mb-3 inline-flex items-center gap-2 text-sm font-medium tracking-wide text-primary">
          Teamzen Assistant
        </p>
        <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
          Bored doing it?
          <br />
          Ask AI to handle it.
        </h2>
        <p className="mt-4 max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
          The same assistant understands attendance, leave, payroll, onboarding,
          and company policies. Ask in plain language, get a clear answer, then
          take action without hunting through menus.
        </p>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="AI examples">
          {SCENARIOS.map((item, index) => (
            <button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={index === step}
              onClick={() => setStep(index)}
              className={cn(
                "min-h-11 rounded-full border px-4 py-2 text-xs font-semibold transition-all motion-reduce:transition-none",
                index === step
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_8px_24px_-12px_color-mix(in_oklab,var(--primary)_80%,transparent)]"
                  : "border-border bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            onClick={replay}
            className="min-h-11 rounded-full border border-border bg-background/70 px-4 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Replay
          </button>
        </div>

        <div className="mt-10 grid max-w-lg grid-cols-1 gap-3 min-[360px]:grid-cols-3">
          {[
            ["30+ tools", "Can answer and act"],
            ["Policy RAG", "Answers with citations"],
            ["Voice ready", "Talk instead of type"],
          ].map(([value, label]) => (
            <div key={value} className="rounded-xl border border-primary/15 bg-white/45 p-3 backdrop-blur-sm dark:bg-white/5">
              <p className="text-sm font-semibold text-foreground">{value}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="ai-chat-shell" aria-live="polite">
        <div className="ai-chat-header">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-primary/10 ring-1 ring-primary/20">
              <Image
                src={BrandImages.assistantMark}
                alt=""
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full border-2 border-card bg-emerald-500" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">Teamzen Assistant</p>
              <p className="text-[10px] text-muted-foreground">Ready across your workspace</p>
            </div>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-1 text-[9px] font-semibold text-primary">
            AI
          </span>
        </div>

        <div key={scenario.label} className="ai-chat-conversation">
          <div className="ai-user-message">{scenario.prompt}</div>

          <div className="ai-tool-message">
            <span className="ai-tool-spinner" />
            <span>{scenario.tool}</span>
            <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-500" />
          </div>

          <div className="ai-answer-message">
            <div className="mb-2 flex items-center gap-2">
              <Bot className="h-3.5 w-3.5 text-primary" />
              <span className="text-[10px] font-semibold text-primary">
                Teamzen
              </span>
            </div>
            <p className="text-xs leading-relaxed text-foreground/85">{scenario.answer}</p>
          </div>

          <AiResultCard step={step} />
        </div>

        <div className="ai-chat-composer">
          <Mic className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-[11px] text-muted-foreground">Ask anything…</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Send className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
}

function AiResultCard({ step }: { step: number }) {
  if (step === 0) {
    return (
      <div className="ai-result-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Today’s attendance</p>
              <p className="text-xs font-semibold">Bengaluru HQ</p>
            </div>
          </div>
          <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            Present
          </span>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[10px]">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Clock3 className="h-3 w-3" /> Recorded at
          </span>
          <span className="font-semibold tabular-nums">09:12 AM</span>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="ai-result-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Annual leave</p>
              <p className="text-xs font-semibold">12 days available</p>
            </div>
          </div>
          <button type="button" className="min-h-10 shrink-0 rounded-md bg-foreground px-3 py-2 text-[10px] font-semibold text-background">
            Apply leave
          </button>
        </div>
        <p className="mt-3 border-t border-border pt-3 text-[10px] text-emerald-600 dark:text-emerald-400">
          Team availability looks good for 18–20 Aug.
        </p>
      </div>
    );
  }

  return (
    <div className="ai-result-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] text-muted-foreground">July 2026 · Net pay</p>
          <p className="mt-0.5 inline-flex items-center text-lg font-semibold tabular-nums">
            <IndianRupee className="h-3.5 w-3.5" />
            84,250
          </p>
        </div>
        <span className="text-right text-[10px] text-rose-600 dark:text-rose-400">
          Income tax
          <br />
          <strong>+₹1,250</strong>
        </span>
      </div>
      <button type="button" className="mt-3 inline-flex min-h-10 items-center gap-1 border-t border-border pt-3 text-xs font-semibold text-primary">
        Open full payslip <ArrowUpRight className="h-3 w-3" />
      </button>
    </div>
  );
}
