"use client";

import { CheckCircle2, MapPin, ScanFace, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWindow, WorkflowStepRail } from "@/components/landing/WorkflowChrome";
import { useWorkflowDemo } from "@/components/landing/useWorkflowDemo";

const STEPS = [
  { label: "Check in" },
  { label: "Face scan" },
  { label: "Location" },
  { label: "Confirmed" },
];

const WEEK = [
  { day: "Mon", mark: "present" },
  { day: "Tue", mark: "present" },
  { day: "Wed", mark: "leave" },
  { day: "Thu", mark: "present" },
  { day: "Fri", mark: "today" },
];

export function AttendanceWorkflow() {
  const { containerRef, step, setStep, playFrom, replay, reduced } = useWorkflowDemo({
    stepCount: STEPS.length,
    interval: 2400,
  });

  const checkedIn = step === 3;
  const scanning = step === 1;
  const locating = step === 2;

  return (
    <div ref={containerRef} className="landing-workflow">
      <p className="sr-only" aria-live="polite">
        Attendance workflow step {step + 1} of {STEPS.length}: {STEPS[step].label}
      </p>
      <ProductWindow url="app.teamzen.io / attendance">
        <div className="relative min-h-[22rem] overflow-hidden bg-background p-4 sm:min-h-[26rem] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                Friday, 14 Aug 2026
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-foreground sm:text-base">
                Today’s attendance
              </h3>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold sm:px-2.5 sm:text-[10px]",
                checkedIn
                  ? "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-500/12 text-amber-700 dark:text-amber-400"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  checkedIn ? "bg-emerald-500" : "bg-amber-400 landing-wf-pulse"
                )}
              />
              {checkedIn ? "Present" : "Pending check-in"}
            </span>
          </div>

          <div className="workflow-inner-grid workflow-inner-grid--attendance relative grid gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">
                Live status
              </p>
              <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
                {checkedIn ? "09:12 AM" : "—"}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {checkedIn ? "Bengaluru HQ · Inside geofence" : "Waiting for check-in"}
              </p>

              <button
                type="button"
                onClick={() => (step === 0 ? playFrom(1) : replay())}
                disabled={step > 0 && step < 3}
                className={cn(
                  "mt-4 inline-flex min-h-11 items-center gap-2 rounded-lg px-4 text-xs font-semibold transition-all motion-reduce:transition-none",
                  checkedIn
                    ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
                    : step === 0
                      ? "bg-foreground text-background hover:opacity-90 landing-wf-cta-pulse"
                      : "bg-muted text-muted-foreground"
                )}
              >
                <MapPin className="h-3.5 w-3.5" />
                {checkedIn ? "Checked in" : step === 0 ? "Check in" : "Verifying…"}
              </button>

              <ul className="mt-4 grid grid-cols-5 gap-1 max-[340px]:gap-0.5 sm:gap-1.5">
                {WEEK.map((d) => {
                  const fridayDone = d.mark === "today" && checkedIn;
                  return (
                    <li
                      key={d.day}
                      className={cn(
                        "rounded-lg border px-1 py-2 text-center",
                        d.mark === "today"
                          ? fridayDone
                            ? "border-emerald-500/30 bg-emerald-500/10"
                            : "border-primary/30 bg-primary/8"
                          : "border-border bg-background"
                      )}
                    >
                      <p className="text-[10px] font-semibold text-foreground">{d.day}</p>
                      <span
                        className={cn(
                          "mx-auto mt-1 block h-1.5 w-1.5 rounded-full",
                          d.mark === "present" || fridayDone
                            ? "bg-emerald-500"
                            : d.mark === "leave"
                              ? "bg-orange-400"
                              : "bg-amber-400"
                        )}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="relative min-h-[14rem] overflow-hidden rounded-xl border border-border bg-muted/40">
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  step === 0 && "landing-wf-stage--in"
                )}
              >
                <IdleHint />
              </div>
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  scanning && "landing-wf-stage--in"
                )}
              >
                <FaceScanStage reduced={reduced} />
              </div>
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  locating && "landing-wf-stage--in"
                )}
              >
                <LocationStage />
              </div>
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  checkedIn && "landing-wf-stage--in"
                )}
              >
                <ConfirmedStage />
              </div>
            </div>
          </div>
        </div>
      </ProductWindow>

      <WorkflowStepRail
        steps={STEPS}
        current={step}
        onSelect={setStep}
        onReplay={replay}
      />
    </div>
  );
}

function IdleHint() {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <span className="landing-wf-arrow mb-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-primary">
        <MapPin className="h-4 w-4" />
      </span>
      <p className="text-xs font-semibold text-foreground">Tap Check in</p>
      <p className="mt-1 max-w-[12rem] text-[11px] leading-relaxed text-muted-foreground">
        Face recognition and geofence run next — the same path employees use every morning.
      </p>
    </div>
  );
}

function FaceScanStage({ reduced }: { reduced: boolean }) {
  return (
    <div className="flex h-full flex-col items-center justify-center">
      <div className="landing-wf-viewfinder relative h-28 w-28">
        <span className="landing-wf-bracket landing-wf-bracket-tl" />
        <span className="landing-wf-bracket landing-wf-bracket-tr" />
        <span className="landing-wf-bracket landing-wf-bracket-bl" />
        <span className="landing-wf-bracket landing-wf-bracket-br" />
        <div className="landing-wf-scan-ring" aria-hidden />
        <div className="absolute inset-3 overflow-hidden rounded-full bg-gradient-to-b from-teal-200/80 to-slate-400/70 dark:from-teal-900/80 dark:to-slate-700">
          <div className="landing-wf-face-silhouette" />
          {!reduced ? <span className="landing-wf-scan-line" /> : null}
        </div>
      </div>
      <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
        <ScanFace className="h-3.5 w-3.5 text-primary" />
        Matching face
      </p>
      <p className="mt-1 text-[11px] tabular-nums text-muted-foreground">
        Similarity 98%
      </p>
    </div>
  );
}

function LocationStage() {
  return (
    <div className="relative flex h-full flex-col">
      <div className="landing-wf-map relative min-h-[10.5rem] flex-1 overflow-hidden rounded-lg">
        <span className="landing-wf-map-road landing-wf-map-road-h" />
        <span className="landing-wf-map-road landing-wf-map-road-v" />
        <span className="landing-wf-radar" />
        <span className="landing-wf-office" />
        <span className="landing-wf-pin">
          <MapPin className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-primary" />
        Inside office radius · 42 m
      </p>
    </div>
  );
}

function ConfirmedStage() {
  return (
    <div className="flex h-full flex-col justify-center rounded-lg bg-background/80 p-3">
      <CheckCircle2 className="landing-wf-check mb-2 h-7 w-7 text-emerald-500" />
      <p className="text-sm font-semibold text-foreground">Checked in</p>
      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
        09:12 AM IST · Bengaluru HQ
        <br />
        Face verified · Geo-fenced
      </p>
    </div>
  );
}
