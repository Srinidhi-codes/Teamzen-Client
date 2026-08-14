"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Calendar, CheckCircle2, Clock3 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWindow, WorkflowStepRail } from "@/components/landing/WorkflowChrome";
import { usePrefersReducedMotion } from "@/components/landing/useWorkflowDemo";

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 1280px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

const STEPS = [
  { label: "Balance", title: "Pick a leave type you can actually take.", copy: "Annual leave shows 12 of 18 days left — no hidden balances, no spreadsheet math." },
  { label: "Dates", title: "Choose dates on a live team calendar.", copy: "18–20 August lights up as three working days, with teammates already off shown quietly." },
  { label: "Request", title: "Submit once. Managers see it immediately.", copy: "The request lands as pending with a clear trail — type, dates, and remaining balance." },
  { label: "Approved", title: "Approval updates the balance in place.", copy: "Priya approves, the calendar turns green, and annual leave drops from 12 to 9." },
];

const DAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const CELLS = [
  "", "", "", "", "", "1", "2",
  "3", "4", "5", "6", "7", "8", "9",
  "10", "11", "12", "13", "14", "15", "16",
  "17", "18", "19", "20", "21", "22", "23",
  "24", "25", "26", "27", "28", "29", "30",
  "31",
];

export function LeaveWorkflow() {
  const reduced = usePrefersReducedMotion();
  const isDesktop = useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia("(min-width: 1280px)").matches,
    () => false
  );
  const [step, setStep] = useState(0);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    if (!isDesktop) return;

    const observers = STEPS.map((_, index) => {
      const el = stepRefs.current[index];
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setStep(index);
        },
        { threshold: 0.55, rootMargin: "-18% 0px -28% 0px" }
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [isDesktop, reduced]);

  const goTo = (index: number) => {
    setStep(index);
    if (isDesktop) {
      stepRefs.current[index]?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "center" });
    }
  };

  return (
    <div className="relative mx-auto max-w-6xl">
      <p className="sr-only" aria-live="polite">
        Leave workflow step {step + 1} of {STEPS.length}: {STEPS[step].label}
      </p>
      <div className="grid gap-10 xl:grid-cols-2 xl:gap-16">
        <div className="xl:hidden">
          <p className="mb-3 text-sm font-medium tracking-wide text-teal-200">Leave</p>
          <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-white">
            {STEPS[step].title}
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">
            {STEPS[step].copy}
          </p>
        </div>

        <div className="hidden xl:block">
          {STEPS.map((item, index) => (
            <article
              key={item.label}
              ref={(node) => {
                stepRefs.current[index] = node;
              }}
              className="leave-story-step flex min-h-[64vh] flex-col justify-center py-10"
            >
              <p className="mb-3 text-sm font-medium tracking-wide text-teal-200">
                Leave · {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="font-[family-name:var(--font-landing-display)] text-3xl font-semibold tracking-tight text-balance text-white sm:text-5xl">
                {item.title}
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
                {item.copy}
              </p>
              <div className="mt-8 inline-flex items-center gap-2 text-sm text-white/70">
                <Calendar className="h-4 w-4 text-teal-200" />
                Requests, balances, and team calendar
              </div>
            </article>
          ))}
        </div>

        <div className="xl:h-full">
          <div className="leave-sticky-panel xl:sticky xl:top-24">
            <ProductWindow url="app.teamzen.io / leaves" dark>
              <LeaveDemo step={step} />
            </ProductWindow>
            <WorkflowStepRail
              steps={STEPS}
              current={step}
              onSelect={goTo}
              dark
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaveDemo({ step }: { step: number }) {
  const selected = step >= 1;
  const pending = step === 2;
  const approved = step >= 3;
  const annualLeft = approved ? 9 : 12;

  return (
    <div className="min-h-[24rem] space-y-3 bg-[#102027] p-4 sm:min-h-[26rem] sm:p-5">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        {[
          { name: "Annual", left: annualLeft, total: 18, active: true },
          { name: "Sick", left: 5, total: 8, active: false },
          { name: "Casual", left: 2, total: 4, active: false },
        ].map((item) => (
          <div
            key={item.name}
            className={cn(
              "min-w-0 rounded-xl border p-2 text-center transition-all duration-500 motion-reduce:transition-none sm:p-3 sm:text-left",
              item.active && step === 0
                ? "border-teal-300/50 bg-teal-300/10 ring-2 ring-teal-200/30"
                : "border-white/10 bg-white/5"
            )}
          >
            <p className="text-[10px] text-white/55">{item.name}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-white">
              {item.left}
              <span className="text-xs font-medium text-white/45">/{item.total}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-white">August 2026</p>
            <span className="text-[10px] text-white/50">Team calendar</span>
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-white/40 sm:gap-1">
            {DAYS.map((d) => (
              <span key={d}>{d}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-0.5 sm:gap-1">
            {CELLS.map((day, index) => {
              const inRange = selected && ["18", "19", "20"].includes(day);
              const today = day === "14";
              return (
                <span
                  key={`${day}-${index}`}
                  className={cn(
                    "flex h-7 items-center justify-center rounded-md text-[10px] tabular-nums",
                    !day && "opacity-0",
                    today && !inRange && "bg-white/10 font-semibold text-white",
                    inRange && approved && "bg-emerald-400/90 font-semibold text-[#102027]",
                    inRange && !approved && "bg-teal-300 font-semibold text-[#102027] landing-wf-day-pop",
                    !inRange && !today && "text-white/70"
                  )}
                >
                  {day}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/45">
              Request
            </p>
            <p className="mt-1 text-sm font-semibold text-white">Annual leave</p>
            <p className="mt-1 text-[11px] text-white/60">
              {selected ? "18 – 20 Aug · 3 working days" : "Choose dates to continue"}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] transition-all duration-500",
                pending
                  ? "bg-amber-300/15 text-amber-100"
                  : approved
                    ? "bg-emerald-400/15 text-emerald-100"
                    : "bg-white/5 text-white/50"
              )}
            >
              {approved ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Clock3 className="h-3.5 w-3.5" />
              )}
              {approved ? "Approved by Priya · Manager" : pending ? "Waiting on Priya" : "Draft"}
            </div>
            <div className="rounded-lg bg-white/5 px-2.5 py-2 text-[11px] text-white/65">
              Balance after request
              <span className="ml-2 font-semibold tabular-nums text-white">
                {annualLeft}/18
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
