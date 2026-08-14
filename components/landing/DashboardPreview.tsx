"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  ScanFace,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const week = [
  { day: "Mon", date: "Aug 10", status: "present", label: "Present" },
  { day: "Tue", date: "Aug 11", status: "present", label: "Present" },
  { day: "Wed", date: "Aug 12", status: "leave", label: "On leave" },
  { day: "Thu", date: "Aug 13", status: "present", label: "Present" },
  { day: "Fri", date: "Aug 14", status: "pending", label: "Today", today: true },
];

const leaves = [
  { name: "Annual leave", balance: 12, total: 18, pct: 67 },
  { name: "Sick leave", balance: 5, total: 8, pct: 63 },
  { name: "Casual", balance: 2, total: 4, pct: 50 },
];

const metrics = [
  { label: "Attendance", value: "96%", hint: "Overall rate", icon: TrendingUp },
  { label: "Days present", value: "18", hint: "This cycle", icon: CheckCircle2 },
  { label: "Leave left", value: "19", hint: "Available days", icon: Calendar },
];

const NAV = ["Dashboard", "Attendance", "Leaves", "Payroll", "Team"];

/**
 * Faithful UI mock of the employee dashboard — used as the landing hero product shot.
 */
export function DashboardPreview({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    let raf = 0;
    const updateTransform = () => {
      raf = 0;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        frame.style.transform = "none";
        return;
      }
      const rect = frame.getBoundingClientRect();
      const viewH = window.innerHeight || 1;
      const progress = Math.min(1, Math.max(0, 1 - rect.top / viewH));
      const lift = (1 - progress) * 28;
      const tilt = (1 - progress) * 4;
      frame.style.transform = `translate3d(0, ${lift}px, 0) rotateX(${tilt}deg)`;
    };

    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(updateTransform);
    };

    updateTransform();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => setToast(true), 1400);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className={cn("landing-preview-perspective", className)}>
      <div
        ref={frameRef}
        className="landing-preview-frame"
        aria-hidden
      >
        <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-[0_40px_100px_-20px_rgba(15,40,50,0.45)] transition-colors duration-500 dark:shadow-[0_40px_100px_-20px_rgba(0,0,0,0.55)]">
          <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-3 transition-colors duration-500">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 rounded-md bg-muted px-3 py-1 text-[11px] text-foreground/70">
              app.teamzen.io / dashboard
            </div>
          </div>

          <div className="grid grid-cols-[44px_1fr] min-[380px]:grid-cols-[52px_1fr] sm:grid-cols-[180px_1fr]">
            <aside className="border-r border-border bg-card p-2 transition-colors duration-500 min-[380px]:p-2.5 sm:p-4">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground">
                  Tz
                </div>
                <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
                  Teamzen
                </span>
              </div>
              <nav className="space-y-1">
                {NAV.map((item, i) => (
                  <div
                    key={item}
                    className={cn(
                      "rounded-md px-2 py-1.5 text-[11px] sm:text-xs",
                      i === 0
                        ? "bg-primary/15 font-semibold text-primary"
                        : "text-foreground/70"
                    )}
                  >
                    <span className="hidden sm:inline">{item}</span>
                    <span className="sm:hidden">{item.slice(0, 1)}</span>
                  </div>
                ))}
              </nav>
            </aside>

            <div className="relative space-y-3 bg-background p-3 transition-colors duration-500 sm:space-y-4 sm:p-5">
              <div
                className={cn(
                  "pointer-events-none absolute right-6 top-6 z-20 hidden max-w-[13rem] rounded-lg border border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm transition-all duration-500 lg:block motion-reduce:transition-none",
                  toast ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
                )}
              >
                <p className="flex items-center gap-1.5 text-[10px] font-semibold text-foreground">
                  <ScanFace className="h-3 w-3 text-primary" />
                  12 teammates in
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  Face + geofence already verified
                </p>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-[oklch(0.32_0.05_200)] p-4 text-white sm:p-5 dark:bg-[oklch(0.28_0.045_200)]">
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 12% 20%, oklch(0.55 0.09 200 / 0.5), transparent 42%), radial-gradient(circle at 88% 80%, oklch(0.4 0.06 220 / 0.35), transparent 40%)",
                  }}
                />
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-teal-100 sm:text-xs">
                      Friday, August 14
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-2xl">
                      Good morning, <span className="text-teal-100">Alex</span>
                    </h3>
                    <p className="mt-1 text-[11px] text-white/80 sm:text-xs">
                      Product Designer · People Ops
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-white" />
                      Today · Pending check-in
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="landing-wf-cta-pulse inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold text-[oklch(0.28_0.04_200)]">
                      <MapPin className="h-3 w-3" />
                      Check in
                    </span>
                    <span className="inline-flex h-8 items-center rounded-lg border border-white/30 bg-white/10 px-3 text-[11px] font-medium text-white">
                      Request leave
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-12">
                <div className="hidden rounded-xl border border-border bg-card p-3 transition-colors duration-500 min-[360px]:block sm:p-4 lg:col-span-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        Leave available
                      </p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-foreground/55" />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
                    19
                    <span className="ml-1 text-sm font-medium text-foreground/65">
                      days
                    </span>
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {leaves.map((l) => (
                      <div key={l.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="font-medium text-foreground/75">{l.name}</span>
                          <span className="tabular-nums text-foreground">
                            {l.balance}
                            <span className="text-foreground/60">/{l.total}</span>
                          </span>
                        </div>
                        <div className="h-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary landing-bar-grow"
                            style={{ width: `${l.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card transition-colors duration-500 lg:col-span-5">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold text-foreground sm:text-sm">
                        This week
                      </p>
                    </div>
                    <span className="text-[11px] font-medium text-primary">Details</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {week.map((d) => (
                      <li
                        key={d.day}
                        className={cn(
                          "grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 px-3 py-2 text-[11px] sm:px-4",
                          d.today && "bg-primary/10"
                        )}
                      >
                        <div>
                          <p
                            className={cn(
                              "font-semibold",
                              d.today ? "text-primary" : "text-foreground"
                            )}
                          >
                            {d.day}
                          </p>
                          <p className="text-[10px] text-foreground/60">{d.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              d.status === "present" && "bg-emerald-500",
                              d.status === "leave" && "bg-orange-400",
                              d.status === "pending" && "bg-amber-400 landing-wf-pulse"
                            )}
                          />
                          <span className="font-medium text-foreground/75">{d.label}</span>
                        </div>
                        {d.today ? (
                          <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
                            Today
                          </span>
                        ) : (
                          <CheckCircle2
                            className={cn(
                              "h-3.5 w-3.5",
                              d.status === "present"
                                ? "text-emerald-500"
                                : "text-orange-400"
                            )}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="hidden grid-cols-2 gap-2 min-[420px]:grid min-[420px]:grid-cols-3 lg:col-span-3 lg:grid-cols-1">
                  {metrics.map((m, index) => (
                    <div
                      key={m.label}
                      className={cn(
                        "rounded-xl border border-border bg-card p-3 transition-colors duration-500",
                        index === 2 && "col-span-2 min-[420px]:col-span-1"
                      )}
                    >
                      <m.icon className="mb-2 h-3.5 w-3.5 text-foreground/55" />
                      <p className="text-lg font-semibold tracking-tight text-foreground tabular-nums sm:text-xl">
                        {m.value}
                      </p>
                      <p className="text-[11px] font-medium text-foreground">{m.label}</p>
                      <p className="text-[10px] text-foreground/65">{m.hint}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
