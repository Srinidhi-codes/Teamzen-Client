"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUpdateUser } from "@/lib/api/graphqlHooks";
import type { FirstDayWizardData, FirstDayWizardStep } from "@/lib/graphql/ai/types";

const STEP_ICONS: Record<string, React.ReactNode> = {
  welcome: <Sparkles className="h-5 w-5" />,
  progress: <ClipboardList className="h-5 w-5" />,
  docs: <ClipboardList className="h-5 w-5" />,
  leave: <CalendarDays className="h-5 w-5" />,
  attendance: <MapPin className="h-5 w-5" />,
  policies: <BookOpen className="h-5 w-5" />,
  contacts: <Users className="h-5 w-5" />,
  done: <CheckCircle2 className="h-5 w-5" />,
};

interface FirstDayWizardProps {
  data: FirstDayWizardData;
  onClose: () => void;
  onCompleted?: () => void;
}

export function FirstDayWizard({ data, onClose, onCompleted }: FirstDayWizardProps) {
  const router = useRouter();
  const setAssistantOpen = useStore((s) => s.setAssistantOpen);
  const { updateUserAsync } = useGraphQLUpdateUser();
  const steps = data.steps || [];
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);

  const step: FirstDayWizardStep | undefined = steps[index];
  const isLast = index >= steps.length - 1;
  const progress = useMemo(
    () => (steps.length ? ((index + 1) / steps.length) * 100 : 0),
    [index, steps.length]
  );

  const finish = async (openAssistant = false) => {
    setBusy(true);
    try {
      await updateUserAsync({ has_seen_ai_onboarding: true });
      onCompleted?.();
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
      onClose();
      if (openAssistant) {
        setTimeout(() => setAssistantOpen(true), 50);
      }
    }
  };

  const goNext = () => {
    if (isLast) void finish(false);
    else setIndex((i) => Math.min(i + 1, steps.length - 1));
  };

  const goBack = () => setIndex((i) => Math.max(i - 1, 0));

  const openRoute = (path?: string | null) => {
    if (!path) return;
    router.push(path);
  };

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-background/70 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="First day wizard"
    >
      <div
        className={cn(
          "flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border/80 bg-card text-card-foreground",
          "shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)]",
          "animate-in fade-in zoom-in-95 duration-300",
          "max-h-[min(720px,92dvh)]"
        )}
      >
        <header className="shrink-0 border-b border-border/70 bg-gradient-to-b from-muted/50 to-card px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Day-1 guide · {index + 1}/{steps.length}
              </p>
              <h2 className="mt-1 truncate text-lg font-semibold tracking-tight">
                {step.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => void finish()}
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close wizard"
              disabled={busy}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              {STEP_ICONS[step.id] || <Sparkles className="h-5 w-5" />}
            </div>
            <p className="text-sm leading-relaxed text-foreground/90">{step.summary}</p>
          </div>

          {step.bullets?.length > 0 && (
            <ul className="space-y-2 rounded-xl border border-border/70 bg-muted/30 p-3.5">
              {step.bullets.map((b) => (
                <li key={b} className="flex gap-2 text-sm text-foreground/85">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />
                  <span className="leading-snug">{b}</span>
                </li>
              ))}
            </ul>
          )}

          {step.route && step.routeLabel && (
            <button
              type="button"
              onClick={() => openRoute(step.route)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10"
            >
              {step.routeLabel}
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        <footer className="shrink-0 space-y-2 border-t border-border/70 bg-card px-5 py-4">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={goBack}
              disabled={index === 0 || busy}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted disabled:opacity-40"
            >
              Back
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={busy}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isLast ? (busy ? "Saving…" : "Finish") : "Continue"}
              {!isLast && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => void finish(true)}
            disabled={busy}
            className="w-full text-center text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            Ask the assistant anything else
          </button>
        </footer>
      </div>
    </div>
  );
}
