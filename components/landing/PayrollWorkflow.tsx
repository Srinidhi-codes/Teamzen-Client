"use client";

import { Check, FileText, IndianRupee, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductWindow, WorkflowStepRail } from "@/components/landing/WorkflowChrome";
import { useWorkflowDemo } from "@/components/landing/useWorkflowDemo";

const STEPS = [
  { label: "Calculate" },
  { label: "Validate" },
  { label: "Publish" },
];

const LINES = [
  { name: "Basic", amount: "₹50,000", kind: "earning" },
  { name: "HRA", amount: "₹20,000", kind: "earning" },
  { name: "Special allowance", amount: "₹22,000", kind: "earning" },
  { name: "Provident fund", amount: "₹1,800", kind: "deduction" },
  { name: "Income tax", amount: "₹5,950", kind: "deduction" },
];

export function PayrollWorkflow() {
  const { containerRef, step, setStep, replay } = useWorkflowDemo({
    stepCount: STEPS.length,
    interval: 2800,
  });

  return (
    <div ref={containerRef} className="landing-workflow">
      <p className="sr-only" aria-live="polite">
        Payroll workflow step {step + 1} of {STEPS.length}: {STEPS[step].label}
      </p>
      <ProductWindow url="app.teamzen.io / payroll / july-2026">
        <div className="min-h-[22rem] bg-background p-4 sm:min-h-[26rem] sm:p-5">
          <div className="mb-4 flex items-start justify-between gap-2 sm:gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium tracking-wide text-muted-foreground">
                Payroll run
              </p>
              <h3 className="mt-0.5 text-sm font-semibold text-foreground sm:text-base">
                July 2026 · 48 employees
              </h3>
            </div>
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2 py-1 text-[9px] font-semibold sm:px-2.5 sm:text-[10px]",
                step === 0 && "bg-amber-500/12 text-amber-700 dark:text-amber-400",
                step === 1 && "bg-primary/12 text-primary",
                step === 2 && "bg-emerald-500/12 text-emerald-600 dark:text-emerald-400"
              )}
            >
              {step === 0 ? "Calculating" : step === 1 ? "Validating" : "Published"}
            </span>
          </div>

          <div className="workflow-inner-grid workflow-inner-grid--payroll grid gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-[11px] font-medium text-muted-foreground">Run progress</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                  style={{ width: step === 0 ? "38%" : step === 1 ? "72%" : "100%" }}
                />
              </div>
              <ul className="mt-4 space-y-2.5 text-[12px]">
                <ProgressRow
                  done={step > 0}
                  active={step === 0}
                  label="Attendance, LOP, and overtime"
                />
                <ProgressRow
                  done={step > 1}
                  active={step === 1}
                  label="Earnings and statutory deductions"
                />
                <ProgressRow
                  done={step === 2}
                  active={step === 2}
                  label="Payslips published to employees"
                />
              </ul>
            </div>

            <div className="relative min-h-[17rem] overflow-hidden rounded-xl border border-border bg-card">
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  step === 0 && "landing-wf-stage--in"
                )}
              >
                <CalculateStage />
              </div>
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  step === 1 && "landing-wf-stage--in"
                )}
              >
                <ValidateStage />
              </div>
              <div
                className={cn(
                  "landing-wf-stage absolute inset-0 p-4",
                  step === 2 && "landing-wf-stage--in"
                )}
              >
                <PublishStage />
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

function ProgressRow({
  done,
  active,
  label,
}: {
  done: boolean;
  active: boolean;
  label: string;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border",
          done && "border-emerald-500 bg-emerald-500 text-white",
          active && !done && "border-primary text-primary",
          !done && !active && "border-border text-transparent"
        )}
      >
        {done ? (
          <Check className="h-3 w-3" />
        ) : active ? (
          <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" />
        ) : null}
      </span>
      <span className={cn("text-foreground/80", active && "font-medium text-foreground")}>
        {label}
      </span>
    </li>
  );
}

function CalculateStage() {
  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-[11px] font-medium text-muted-foreground">Headcount snapshot</p>
      <div className="mt-3 space-y-2">
        {[
          { name: "Alex Chen", note: "22 days · 0 LOP" },
          { name: "Priya Nair", note: "21 days · 1 LOP" },
          { name: "Rahul Iyer", note: "22 days · 0 LOP" },
        ].map((row, index) => (
          <div
            key={row.name}
            className="landing-wf-row flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div>
              <p className="text-xs font-semibold text-foreground">{row.name}</p>
              <p className="text-[10px] text-muted-foreground">{row.note}</p>
            </div>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ValidateStage() {
  return (
    <div className="flex h-full flex-col">
      <p className="text-[11px] font-medium text-muted-foreground">Alex Chen · breakdown</p>
      <ul className="mt-3 space-y-1.5">
        {LINES.map((line, index) => (
          <li
            key={line.name}
            className="landing-wf-row flex items-center justify-between rounded-md px-2 py-1.5 text-[12px]"
            style={{ animationDelay: `${index * 90}ms` }}
          >
            <span className="flex items-center gap-2 text-foreground">
              <Check className="h-3 w-3 text-emerald-500" />
              {line.name}
            </span>
            <span
              className={cn(
                "tabular-nums",
                line.kind === "deduction" ? "text-destructive" : "text-foreground"
              )}
            >
              {line.kind === "deduction" ? "−" : ""}
              {line.amount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PublishStage() {
  return (
    <div className="flex h-full items-center">
      <div className="landing-wf-payslip w-full rounded-xl border border-border bg-background p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium text-muted-foreground">Payslip</p>
            <p className="text-sm font-semibold text-foreground">July 2026</p>
            <p className="text-[11px] text-muted-foreground">Alex Chen · #PS-2841</p>
          </div>
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] min-[380px]:grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-2">
            <p className="text-muted-foreground">Gross</p>
            <p className="mt-0.5 font-semibold tabular-nums">₹92,000</p>
          </div>
          <div className="rounded-lg bg-muted/60 p-2">
            <p className="text-muted-foreground">Deductions</p>
            <p className="mt-0.5 font-semibold tabular-nums text-destructive">₹7,750</p>
          </div>
          <div className="col-span-2 rounded-lg bg-primary/10 p-2 min-[380px]:col-span-1">
            <p className="text-muted-foreground">Net pay</p>
            <p className="mt-0.5 inline-flex items-center gap-0.5 font-semibold tabular-nums text-primary">
              <IndianRupee className="h-3 w-3" />
              84,250
            </p>
          </div>
        </div>
        <p className="mt-3 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
          Published to employee vault
        </p>
      </div>
    </div>
  );
}
