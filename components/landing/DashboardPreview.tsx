"use client";

import { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const week = [
  { day: "Mon", date: "Jul 21", status: "present", label: "Present" },
  { day: "Tue", date: "Jul 22", status: "present", label: "Present" },
  { day: "Wed", date: "Jul 23", status: "leave", label: "On leave" },
  { day: "Thu", date: "Jul 24", status: "present", label: "Present" },
  { day: "Fri", date: "Jul 25", status: "pending", label: "Today", today: true },
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

/**
 * Faithful UI mock of the employee dashboard — used as the landing hero product shot.
 */
export function DashboardPreview({ className }: { className?: string }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const onScroll = () => {
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

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={cn("landing-preview-perspective", className)}>
      <div
        ref={frameRef}
        className="landing-preview-frame will-change-transform"
        aria-hidden
      >
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.985_0.002_240)] shadow-[0_40px_100px_-20px_rgba(15,40,50,0.45)]">
          {/* Window chrome */}
          <div className="flex items-center gap-2 border-b border-border/80 bg-white px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
            <div className="ml-3 flex-1 rounded-md bg-muted/70 px-3 py-1 text-[11px] text-muted-foreground">
              app.teamzen.io / dashboard
            </div>
          </div>

          <div className="grid grid-cols-[56px_1fr] sm:grid-cols-[180px_1fr]">
            {/* Sidebar */}
            <aside className="border-r border-border bg-white p-3 sm:p-4">
              <div className="mb-5 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[oklch(0.28_0.04_200)] text-[10px] font-bold text-teal-100">
                  Tz
                </div>
                <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
                  Teamzen
                </span>
              </div>
              <nav className="space-y-1">
                {["Dashboard", "Attendance", "Leaves", "Payroll", "Team"].map(
                  (item, i) => (
                    <div
                      key={item}
                      className={cn(
                        "rounded-md px-2 py-1.5 text-[11px] sm:text-xs",
                        i === 0
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      <span className="hidden sm:inline">{item}</span>
                      <span className="sm:hidden">{item.slice(0, 1)}</span>
                    </div>
                  )
                )}
              </nav>
            </aside>

            {/* Main */}
            <div className="space-y-3 bg-[oklch(0.985_0.002_240)] p-3 sm:space-y-4 sm:p-5">
              {/* Today hero — mirrors EmployeeDashboard */}
              <div className="relative overflow-hidden rounded-xl bg-[oklch(0.28_0.04_200)] p-4 text-white sm:p-5">
                <div
                  className="pointer-events-none absolute inset-0 opacity-50"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 12% 20%, oklch(0.55 0.09 200 / 0.5), transparent 42%), radial-gradient(circle at 88% 80%, oklch(0.4 0.06 220 / 0.35), transparent 40%)",
                  }}
                />
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-medium tracking-wide text-teal-200/80 sm:text-xs">
                      Friday, July 25
                    </p>
                    <h3 className="mt-1 text-lg font-semibold tracking-tight sm:text-2xl">
                      Good morning, <span className="text-teal-200">Alex</span>
                    </h3>
                    <p className="mt-1 text-[11px] text-white/65 sm:text-xs">
                      Product Designer · People Ops
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] backdrop-blur-sm">
                      <Clock className="h-3 w-3 text-white/80" />
                      Today · Pending check-in
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-white px-3 text-[11px] font-semibold text-[oklch(0.28_0.04_200)]">
                      <MapPin className="h-3 w-3" />
                      Check in
                    </span>
                    <span className="inline-flex h-8 items-center rounded-lg border border-white/25 bg-white/5 px-3 text-[11px] font-medium">
                      Request leave
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-12">
                {/* Leave */}
                <div className="rounded-xl border border-border bg-white p-3 sm:p-4 lg:col-span-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold sm:text-sm">Leave available</p>
                    </div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <p className="text-3xl font-semibold tracking-tight tabular-nums">
                    19
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      days
                    </span>
                  </p>
                  <div className="mt-3 space-y-2.5">
                    {leaves.map((l) => (
                      <div key={l.name} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-muted-foreground">{l.name}</span>
                          <span className="tabular-nums">
                            {l.balance}
                            <span className="text-muted-foreground">/{l.total}</span>
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

                {/* Week */}
                <div className="rounded-xl border border-border bg-white lg:col-span-5">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-1 rounded-full bg-primary" />
                      <p className="text-xs font-semibold sm:text-sm">This week</p>
                    </div>
                    <span className="text-[11px] font-medium text-primary">Details</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {week.map((d) => (
                      <li
                        key={d.day}
                        className={cn(
                          "grid grid-cols-[3.5rem_1fr_auto] items-center gap-2 px-3 py-2 text-[11px] sm:px-4",
                          d.today && "bg-primary/5"
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
                          <p className="text-[10px] text-muted-foreground">{d.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              d.status === "present" && "bg-emerald-500",
                              d.status === "leave" && "bg-orange-400",
                              d.status === "pending" && "bg-amber-400"
                            )}
                          />
                          <span className="text-muted-foreground">{d.label}</span>
                        </div>
                        {d.today ? (
                          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
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

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 lg:col-span-3 lg:grid-cols-1">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="rounded-xl border border-border bg-white p-3"
                    >
                      <m.icon className="mb-2 h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-lg font-semibold tracking-tight tabular-nums sm:text-xl">
                        {m.value}
                      </p>
                      <p className="text-[11px] font-medium">{m.label}</p>
                      <p className="text-[10px] text-muted-foreground">{m.hint}</p>
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
