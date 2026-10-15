"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import moment from "moment";
import {
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Plane,
  XCircle,
  Plus,
  Cake,
  MapPin,
  Gift,
  Award,
  UserPlus,
  PartyPopper,
  ArrowUpRight,
  Coffee,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client/react";
import { GET_USER_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useStore } from "@/lib/store/useStore";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";

import {
  WorkforceAnalyticsRow,
  AttendanceStatusPanel,
  DepartmentMetricsWidget,
  LeaveActivityWidgetsCard,
} from "@/components/dashboard/WorkforcePortalWidgets";

const AttendanceTrendChart = dynamic(
  () =>
    import("@/components/dashboard/AttendanceTrendChart").then(
      (m) => m.AttendanceTrendChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center p-6">
        <div className="w-full space-y-4">
          <div className="h-64 w-full rounded-xl bg-muted/50 animate-pulse border border-border" />
        </div>
      </div>
    ),
  }
);

const PayrollSalaryDisbursementWidget = dynamic(
  () =>
    import("@/components/dashboard/WorkforcePortalWidgets").then(
      (m) => m.PayrollSalaryDisbursementWidget
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-44 w-full rounded-xl bg-muted/50 animate-pulse border border-border" />
    ),
  }
);

function profileSrc(url?: string | null) {
  if (!url) return null;
  return url.startsWith("http")
    ? url
    : `${process.env.NEXT_PUBLIC_API_URL || ""}${url}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}

type DayPeriod = "morning" | "noon" | "evening" | "night";

function greetingForHour(hour: number) {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  if (hour >= 17 && hour < 21) return "Good evening";
  return "Good night";
}

function periodForHour(hour: number): DayPeriod {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "noon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

const periodHero: Record<
  DayPeriod,
  { day1: string; day2: string; dark: boolean }
> = {
  morning: {
    day1: "/images/hero/morning.webp",
    day2: "/images/hero/morning-2.webp",
    dark: false,
  },
  noon: {
    day1: "/images/hero/noon.webp",
    day2: "/images/hero/noon-2.webp",
    dark: false,
  },
  evening: {
    day1: "/images/hero/evening.webp",
    day2: "/images/hero/evening-2.webp",
    dark: false,
  },
  night: {
    day1: "/images/hero/night.webp",
    day2: "/images/hero/night-2.webp",
    dark: true,
  },
};

/** Odd calendar days → set 1; even days → set 2 */
function heroSrcForDay(period: DayPeriod, dayOfMonth: number) {
  const set = periodHero[period];
  return dayOfMonth % 2 === 1 ? set.day1 : set.day2;
}

const dayTone: Record<
  string,
  {
    label: string;
    sublabel: string;
    bar: string;
    dot: string;
    badgeClass: string;
    Icon: any;
  }
> = {
  present: {
    label: "Present",
    sublabel: "Shift completed",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25",
    Icon: CheckCircle2,
  },
  late_login: {
    label: "Late entry",
    sublabel: "Checked in late",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
    Icon: AlertCircle,
  },
  early_logout: {
    label: "Early exit",
    sublabel: "Left before shift end",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
    Icon: AlertCircle,
  },
  half_day: {
    label: "Half day",
    sublabel: "Half shift logged",
    bar: "bg-amber-500",
    dot: "bg-amber-500",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
    Icon: Clock,
  },
  leave: {
    label: "On leave",
    sublabel: "Approved time off",
    bar: "bg-orange-400",
    dot: "bg-orange-400",
    badgeClass: "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/25",
    Icon: Plane,
  },
  absent: {
    label: "Absent",
    sublabel: "No punch recorded",
    bar: "bg-rose-500",
    dot: "bg-rose-500",
    badgeClass: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25",
    Icon: XCircle,
  },
  pending: {
    label: "Pending",
    sublabel: "Correction in review",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
    Icon: Clock,
  },
  weekend: {
    label: "Weekend",
    sublabel: "Weekly off",
    bar: "bg-muted-foreground/25",
    dot: "bg-muted-foreground/30",
    badgeClass: "bg-muted/80 text-muted-foreground border-border/50",
    Icon: Coffee,
  },
  not_started: {
    label: "Pending check-in",
    sublabel: "Check-in required",
    bar: "bg-[#38ABB1]",
    dot: "bg-[#38ABB1]",
    badgeClass: "bg-[#38ABB1]/10 text-[#38ABB1] dark:text-[#4cd1d7] border-[#38ABB1]/30",
    Icon: Clock,
  },
};

export function EmployeeDashboard() {
  const persistedUser = useStore((s) => s.user);
  const { user: gqlUser, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useGraphQLUser();
  const user = gqlUser || persistedUser;
  const { setAssistantOpen, setAssistantQuery } = useStore();
  const {
    data: dashboardData,
    loading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery(GET_USER_DASHBOARD_STATS, {
    fetchPolicy: "cache-first",
    nextFetchPolicy: "cache-first",
    pollInterval: 30000,
  });
  const { resolvedTheme } = useTheme();

  const isInitialLoading = (!user && isUserLoading) || (!dashboardData && isDashboardLoading);
  const now = useMemo(() => moment(), []);

  useEffect(() => {
    if (!isInitialLoading && !user && userError) {
      window.location.href = "/login";
    }
  }, [isInitialLoading, user, userError]);

  if (isInitialLoading) {
    return (
      <div className="flex min-h-[70vh] w-full flex-col justify-center gap-6">
        <div className="h-48 animate-pulse rounded-2xl bg-muted/60" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="h-64 animate-pulse rounded-2xl bg-muted/50 lg:col-span-7" />
          <div className="h-64 animate-pulse rounded-2xl bg-muted/50 lg:col-span-5" />
        </div>
      </div>
    );
  }

  if (dashboardError && !dashboardData) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-10 w-10 text-destructive" />
        <h2 className="text-lg font-semibold">Unable to load dashboard</h2>
        <p className="text-sm text-muted-foreground">Please try again.</p>
        <Button
          className="h-9 rounded-md"
          onClick={() => {
            refetchDashboard();
            refetchUser();
          }}
        >
          Try again
        </Button>
      </div>
    );
  }

  const stats = (dashboardData as any)?.userDashboardStats || {};
  const wishMessage = stats.wishMessage as string | undefined;
  const upcomingEvents = stats.upcomingEvents || [];
  const aiInsights = stats.aiInsights || [];
  const leaveBalances = stats.leaveBalances || [];
  const last7Days = stats.last7Days || [];
  const attendanceTrend = stats.attendanceTrend || [];
  const recentActivities = stats.recentActivities || [];

  const todayEntry =
    last7Days.find((d: any) => {
      const day = (d.dayStr || "").toLowerCase();
      return day.startsWith(now.format("ddd").toLowerCase().slice(0, 2));
    }) || last7Days[last7Days.length - 1];

  const todayMeta = dayTone[todayEntry?.status] || dayTone.not_started;
  const TodayIcon = todayMeta.Icon || Clock;
  const presentDays = last7Days.filter((d: any) =>
    ["present", "late_login", "early_logout", "half_day"].includes(d.status)
  ).length;
  const totalLeaveLeft = leaveBalances.reduce(
    (sum: number, b: any) => sum + (Number(b.balance) || 0),
    0
  );
  const primaryLeave = leaveBalances[1];
  const period = periodForHour(now.hour());
  const heroMeta = periodHero[period];
  const dark = resolvedTheme === "dark";
  const isDarkBg = dark || heroMeta.dark;
  const heroSrc = heroSrcForDay(period, now.date());

  return (
    <div className="w-full space-y-6 pb-8">
      {/* ── Today hero ───────────────────────────────────────── */}
      <section
        className={cn(
          "relative overflow-hidden rounded-b-[34px] shadow-sm -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 mb-6",
          isDarkBg ? "bg-[#16122a]" : "bg-[#e8eef4]"
        )}
      >
        <Image
          src={heroSrc}
          alt=""
          aria-hidden
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1280px"
          className="hero-art"
        />
        {/* Responsive Gradient Scrim & Legibility Shield */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[1]",
            isDarkBg
              ? "bg-gradient-to-r from-[#16122a] via-[#16122a]/95 via-70% to-[#16122a]/40 sm:via-[#16122a]/95 sm:via-60% sm:to-[#16122a]/20 md:via-55% lg:via-[#16122a]/85 lg:via-48% lg:to-transparent"
              : "bg-gradient-to-r from-[#e8eef4] via-[#e8eef4]/95 via-70% to-[#e8eef4]/40 sm:via-[#e8eef4]/95 sm:via-60% sm:to-[#e8eef4]/20 md:via-55% lg:via-[#e8eef4]/85 lg:via-48% lg:to-transparent"
          )}
        />
        {/* Subtle vertical vignette on smaller screens for buttons and top text */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[2] lg:hidden",
            isDarkBg
              ? "bg-gradient-to-b from-[#16122a]/60 via-transparent to-[#16122a]/70"
              : "bg-gradient-to-b from-[#e8eef4]/60 via-transparent to-[#e8eef4]/70"
          )}
        />
        <div className="relative z-10 flex min-h-[300px] flex-col justify-between gap-5 px-6 py-8 sm:min-h-[300px] sm:px-10 sm:py-10 lg:min-h-[340px] lg:px-12 lg:py-12">
          <div className="max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <p
                className={cn(
                  "text-xs font-semibold tracking-wide uppercase sm:text-sm",
                  isDarkBg ? "text-slate-200/90" : "text-slate-600"
                )}
              >
                {now.format("dddd, MMMM D")}
              </p>
              <h1
                className={cn(
                  "text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-balance break-words",
                  isDarkBg ? "text-white" : "text-slate-900"
                )}
              >
                {greetingForHour(now.hour())},{" "}
                <br className="block sm:hidden" />
                <span className={cn(
                  "sm:ml-0 font-extrabold",
                  isDarkBg ? "text-teal-400" : "text-teal-700"
                )}>
                  {user?.firstName || "there"}
                </span>
              </h1>
              <p
                className={cn(
                  "line-clamp-2 text-xs sm:text-base font-medium",
                  isDarkBg ? "text-slate-300" : "text-slate-700"
                )}
              >
                {[user?.designation?.name, user?.department?.name, user?.organization?.name]
                  .filter(Boolean)
                  .join(" · ") || "Your workforce home"}
              </p>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-xs backdrop-blur-md sm:gap-2.5 sm:px-3.5",
                isDarkBg
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-slate-300/80 bg-white/90 text-slate-800"
              )}
            >
              <TodayIcon className={cn("h-3.5 w-3.5", isDarkBg ? "text-white" : "text-slate-700")} />
              <span className="text-xs font-semibold sm:text-sm">Today · {todayMeta.label}</span>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/attendance"
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-md transition-opacity hover:opacity-95 sm:h-11 sm:w-auto sm:px-5",
                  isDarkBg ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                )}
              >
                <MapPin className="h-4 w-4" />
                {["present", "late_login", "early_logout", "half_day"].includes(todayEntry?.status) ? "Open attendance" : "Check in"}
              </Link>
              <Link
                href="/leaves"
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium shadow-xs backdrop-blur-md transition-colors sm:h-11 sm:w-auto sm:px-5",
                  isDarkBg
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/16"
                    : "border-slate-300 bg-white/90 text-slate-800 hover:bg-white"
                )}
              >
                <Plus className="h-4 w-4" />
                Request leave
              </Link>
            </div>

            {wishMessage && (
              <div
                className={cn(
                  "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 backdrop-blur-sm",
                  dark
                    ? "border-white/15 bg-white/8"
                    : "border-slate-200/70 bg-white/65"
                )}
              >
                {wishMessage.toLowerCase().includes("birthday") ? (
                  <Cake
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      dark ? "text-amber-200" : "text-amber-600"
                    )}
                  />
                ) : (
                  <PartyPopper
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      dark ? "text-amber-200" : "text-amber-600"
                    )}
                  />
                )}
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    dark ? "text-white/80" : "text-slate-700"
                  )}
                >
                  {wishMessage}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Key Metrics & Attendance Chart ── */}
      <div className="space-y-4">
        {/* Metric cards flexed above chart: Attendance, Days present, Primary leave */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {[
            {
              label: "Attendance",
              value: `${stats.attendanceRate ?? 0}%`,
              href: "/attendance",
              icon: TrendingUp,
              hint: "Overall rate",
              accentClass: "bg-muted",
              hoverBorder: "hover:border-[#38ABB1]/50",
            },
            {
              label: "Days present",
              value: String(stats.daysPresent ?? 0),
              href: "/attendance",
              icon: CheckCircle2,
              hint: "This cycle",
              accentClass: "bg-muted",
              hoverBorder: "hover:border-cyan-500/50",
            },
            {
              label: "Primary leave",
              value: String(primaryLeave?.balance ?? 0),
              href: "/leaves",
              icon: Calendar,
              hint: primaryLeave?.name || "Available balance",
              accentClass: "bg-muted",
              hoverBorder: "hover:border-violet-500/50",
            },
          ].map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className={cn(
                "group flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5",
                m.hoverBorder
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl transition-colors", m.accentClass)}>
                  <m.icon className="h-4.5 w-4.5" />
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground/60 transition-colors group-hover:border-[#38ABB1]/40 group-hover:text-[#38ABB1]">
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight tabular-nums text-foreground sm:text-3xl">
                  {m.value}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.hint}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Today's Attendance Wave Chart */}
        <section className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-2">
            <div className="flex items-center gap-2">
              <span className="h-4 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
              <h3 className="text-sm sm:text-base font-bold text-foreground">
                Today&apos;s Attendance
              </h3>
            </div>
          </div>
          <div className="h-64 sm:h-72 w-full pt-1">
            <AttendanceTrendChart
              data={attendanceTrend}
              hourlyData={stats.hourlyAttendance}
              currentRate={stats.attendanceRate || 95}
            />
          </div>
        </section>
      </div>

      {/* ── Bento: Leave Available + This Week + Team Moments ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Featured leave with circular gauges */}
        <section className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Leave available
                </h2>
              </div>
              <p className="pl-3.5 pt-1 text-4xl font-semibold tracking-tight tabular-nums text-foreground sm:text-5xl">
                {totalLeaveLeft}
                <span className="ml-1.5 text-base font-medium text-muted-foreground">days</span>
              </p>
            </div>
            <Link
              href="/leaves"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="View leaves"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-auto space-y-2.5">
            {leaveBalances.length > 0 ? (
              leaveBalances.slice(0, 3).map((balance: any, i: number) => {
                const total = balance.total || 0;
                const current = balance.balance || 0;
                const pct =
                  total > 0
                    ? Math.min(100, Math.round((current / total) * 100))
                    : 0;
                const colorSchemes = [
                  {
                    stroke: "#38ABB1",
                    badge: "border-[#38ABB1]/30 bg-[#38ABB1]/10 text-[#38ABB1]",
                    dot: "bg-[#38ABB1]",
                  },
                  {
                    stroke: "#38ABB1",
                    badge: "border-[#38ABB1]/30 bg-[#38ABB1]/10 text-[#38ABB1]",
                    dot: "bg-[#38ABB1]",
                  },
                  {
                    stroke: "#38ABB1",
                    badge: "border-[#38ABB1]/30 bg-[#38ABB1]/10 text-[#38ABB1]",
                    dot: "bg-[#38ABB1]",
                  },
                ];
                const scheme = colorSchemes[i % colorSchemes.length];
                const radius = 17;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - (pct / 100) * circumference;

                return (
                  <div
                    key={`${balance.name}-${i}`}
                    className="group flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-2.5 transition-all duration-150 hover:border-border hover:bg-muted/40"
                  >
                    {/* Circular Balance Gauge */}
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
                      <svg className="h-16 w-16 -rotate-90 transform" viewBox="0 0 44 44">
                        <circle
                          cx="22"
                          cy="22"
                          r={radius}
                          stroke="currentColor"
                          strokeWidth="3.5"
                          fill="transparent"
                          className="text-border/60 dark:text-muted/30"
                        />
                        {pct > 0 && (
                          <circle
                            cx="22"
                            cy="22"
                            r={radius}
                            stroke={scheme.stroke}
                            strokeWidth="3.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            fill="transparent"
                            className="transition-all duration-500 ease-out"
                          />
                        )}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-md font-bold tabular-nums text-foreground leading-none">
                          {current}
                        </span>
                      </div>
                    </div>

                    {/* Balance Info & Status */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="truncate text-xs sm:text-sm font-semibold text-foreground">
                          {balance.name}
                        </span>
                        <span
                          className={cn(
                            "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums border",
                            current === 0 && total === 0
                              ? "border-border/60 bg-muted text-muted-foreground"
                              : scheme.badge
                          )}
                        >
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full",
                              current === 0 && total === 0 ? "bg-muted-foreground" : scheme.dot
                            )}
                          />
                          {pct}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {total > 0 ? (
                          <>
                            <span className="font-semibold text-foreground/80">{current}</span> of{" "}
                            <span>{total} days remaining</span>
                          </>
                        ) : (
                          "0 of 0 days allocated"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No leave balances yet</p>
            )}

            {(stats.pendingRequestsCount ?? 0) > 0 && (
              <div className="mt-2 flex items-center justify-between rounded-lg bg-amber-500/8 px-3 py-2 text-sm">
                <span className="text-amber-800 dark:text-amber-300">Pending requests</span>
                <span className="font-semibold tabular-nums text-amber-800 dark:text-amber-300">
                  {stats.pendingRequestsCount}
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Week — compact day list */}
        <section className="flex flex-col rounded-2xl border border-border bg-card lg:col-span-4">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  This week
                </h2>
                {last7Days.length > 0 && (
                  <span className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
                    {last7Days[0]?.dayStr} {last7Days[0]?.date} – {last7Days[last7Days.length - 1]?.dayStr} {last7Days[last7Days.length - 1]?.date}
                  </span>
                )}
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground sm:text-sm">
                <span className="font-semibold text-foreground">{presentDays}</span>
                {" of "}
                {last7Days.length || 7} days present
              </p>
            </div>
            <Link
              href="/attendance"
              className="inline-flex items-center gap-1 text-sm font-medium text-[#38ABB1] hover:underline"
            >
              <span>Details</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {isDashboardLoading && last7Days.length === 0 ? (
            <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4 sm:px-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-9 animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </div>
          ) : last7Days.length > 0 ? (
            <div className="px-3.5 sm:px-4 py-1">
              <ul className="divide-y divide-border/60">
                {last7Days.map((d: any, i: number) => {
                  const meta = dayTone[d.status] || dayTone.not_started;
                  const Icon = meta.Icon || Clock;
                  const isToday = (d.dayStr || "")
                    .toLowerCase()
                    .startsWith(now.format("ddd").toLowerCase().slice(0, 2));

                  return (
                    <li key={`${d.date}-${i}`}>
                      <Link
                        href="/attendance"
                        className={cn(
                          "group flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 sm:px-3 sm:py-2.5 transition-all duration-150",
                          isToday
                            ? "bg-[#38ABB1]/10 text-foreground hover:bg-[#38ABB1]/15"
                            : "hover:bg-muted/40"
                        )}
                      >
                        {/* Left: Date Badge + Name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg border text-center transition-colors",
                              isToday
                                ? "border-[#38ABB1]/40 bg-[#38ABB1]/15 text-[#38ABB1]"
                                : "border-border/60 bg-muted/30 text-muted-foreground group-hover:bg-muted/60"
                            )}
                          >
                            <span className="text-[9px] font-bold uppercase tracking-wider leading-none">
                              {d.dayStr}
                            </span>
                            <span
                              className={cn(
                                "text-xs font-black leading-none pt-0.5 tabular-nums",
                                isToday ? "text-[#38ABB1] dark:text-[#4cd1d7]" : "text-foreground"
                              )}
                            >
                              {d.date}
                            </span>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p
                                className={cn(
                                  "text-xs sm:text-sm font-semibold truncate",
                                  isToday ? "text-[#38ABB1] dark:text-[#4cd1d7]" : "text-foreground"
                                )}
                              >
                                {isToday ? "Today" : d.dayStr}
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {isToday && d.status === "not_started"
                                ? "Check-in required"
                                : meta.sublabel}
                            </p>
                          </div>
                        </div>

                        {/* Right: Status Pill */}
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border shadow-2xs transition-all",
                              meta.badgeClass
                            )}
                          >
                            <Icon className="h-3 w-3 shrink-0" />
                            <span>{meta.label}</span>
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-5 py-8 text-center sm:px-6">
              <p className="text-sm font-medium text-foreground">No week data yet</p>
              <p className="text-xs text-muted-foreground">
                Your last 7 days will appear here once attendance starts.
              </p>
            </div>
          )}
        </section>

        {/* Team moments (Moved to Bento grid in place of metrics) */}
        <section className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden lg:col-span-4">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Team moments
                </h2>
              </div>
            </div>
            <span className="rounded-full border border-border/80 bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums">
              {moment().format("MMM YY")}
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <ul className="divide-y divide-border/60">
              {upcomingEvents.slice(0, 5).map((event: any) => {
                const src = profileSrc(event.profilePicture);
                return (
                  <li
                    key={event.id}
                    className="grid grid-cols-[2.25rem_1fr_auto] items-center gap-3 px-4 py-3 sm:px-5 transition-colors hover:bg-muted/30"
                  >
                    <div
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-semibold",
                        !src &&
                          (event.type === "birthday"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : event.type === "holiday" || event.type === "optional_holiday"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : event.type === "leave"
                                ? "bg-orange-500/10 text-orange-700 dark:text-orange-400"
                                : "bg-sky-500/10 text-sky-700 dark:text-sky-400")
                      )}
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={event.user}
                          width={36}
                          height={36}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        initials(event.user || "?")
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs sm:text-sm font-semibold text-foreground">
                        {event.user}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        {event.type === "birthday" ? (
                          <Gift className="h-3 w-3 text-amber-500 shrink-0" />
                        ) : event.type === "holiday" || event.type === "optional_holiday" ? (
                          <Calendar className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : event.type === "leave" ? (
                          <Plane className="h-3 w-3 text-orange-500 shrink-0" />
                        ) : (
                          <Award className="h-3 w-3 text-sky-500 shrink-0" />
                        )}
                        <span className="truncate">
                          {event.type === "birthday"
                            ? "Birthday"
                            : event.type === "optional_holiday"
                              ? "Optional holiday"
                              : event.type === "holiday"
                                ? "Holiday"
                                : event.type === "leave"
                                  ? "On Leave"
                                  : "Anniversary"}
                        </span>
                        <span>·</span>
                        <span className="shrink-0">{moment(event.date).format("MMM D")}</span>
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums border",
                        event.daysUntil === 0
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-border/60 bg-muted/60 text-muted-foreground"
                      )}
                    >
                      {event.daysUntil === 0 ? "Today" : `in ${event.daysUntil}d`}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              src={EmptyImages.events}
              title="No celebrations"
              description="Birthdays and anniversaries this month will show up here."
              size="compact"
              className="flex-1 h-full min-h-[340px] sm:min-h-[380px] w-full"
              contentClassName="justify-start pt-7 sm:pt-9 pl-6 sm:pl-7 pr-2 w-[58%] max-w-[250px]"
              headingClassName="text-lg sm:text-xl font-bold tracking-tight text-slate-900 leading-snug"
              descriptionClassName="mt-2 text-xs sm:text-sm font-medium leading-relaxed text-slate-600/95 max-w-[190px]"
              imageClassName="object-cover object-bottom"
            />
          )}
        </section>
      </div>

      {/* ── Shortcuts ────────────────────────────────────────── */}
      <nav className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { href: "/attendance", label: "Attendance", icon: Clock },
          { href: "/leaves", label: "Leaves", icon: Calendar },
          { href: "/payroll", label: "Payslips", icon: DollarSign },
          { href: "/team", label: "Team", icon: UserPlus },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex shrink-0 h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ── Activity ─────────────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Activity
              </h2>
            </div>
          </div>
          <Link
            href="/notifications"
            className="text-sm font-medium text-[#38ABB1] hover:underline"
          >
            All updates
          </Link>
        </div>

        {recentActivities.length > 0 ? (
          <ul className="divide-y divide-border">
            {recentActivities.slice(0, 7).map((activity: any) => {
              const action = (activity.action || "").toLowerCase();
              const isLeave = action.includes("leave");
              const isAnniv = action.includes("celebrates");
              const isJoin = action.includes("joined");
              const Icon = isLeave
                ? Calendar
                : isAnniv
                  ? Award
                  : isJoin
                    ? UserPlus
                    : Clock;
              const category = isLeave
                ? "Leave"
                : isAnniv
                  ? "Milestone"
                  : isJoin
                    ? "Team"
                    : "Attendance";
              const href = activity.id?.includes("notif")
                ? "/notifications"
                : isLeave || activity.id?.includes("leave")
                  ? "/leaves"
                  : "/attendance";

              return (
                <li key={activity.id}>
                  <Link
                    href={href}
                    className="grid grid-cols-[2.5rem_1fr_auto] items-start gap-3 px-5 py-3.5 transition-colors hover:bg-muted/40 sm:grid-cols-[2.75rem_1fr_7.5rem] sm:items-center sm:px-6"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg sm:mt-0",
                        isLeave && "bg-sky-500/10 text-sky-600",
                        isAnniv && "bg-amber-500/10 text-amber-600",
                        isJoin && "bg-violet-500/10 text-violet-600",
                        !isLeave && !isAnniv && !isJoin && "bg-emerald-500/10 text-emerald-600"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {activity.user ? `${activity.user} ` : ""}
                        <span className="font-normal text-muted-foreground">
                          {activity.action}
                        </span>
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/80">
                        {category}
                      </p>
                    </div>

                    <time className="text-right text-xs tabular-nums text-muted-foreground sm:self-center">
                      {moment(activity.time).fromNow()}
                    </time>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            <Clock className="h-8 w-8 text-muted-foreground/35" />
            <p className="text-sm text-muted-foreground">Nothing new yet</p>
          </div>
        )}
      </section>



      {/* ── Next best actions ───────────────────────────────── */}
      {aiInsights.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Next up
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {aiInsights.slice(0, 3).map((insight: any, i: number) => {
              const isWarning = insight.type === "warning" || insight.type === "anomaly";
              const openLabel = insight.label || "Open page";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex flex-col rounded-xl border p-4",
                    isWarning
                      ? "border-amber-500/25 bg-amber-500/5"
                      : "border-border bg-background"
                  )}
                >
                  <p
                    className={cn(
                      "text-xs font-medium",
                      isWarning
                        ? "text-amber-700 dark:text-amber-400"
                        : "text-muted-foreground"
                    )}
                  >
                    {insight.title || "Insight"}
                  </p>
                  <p className="mt-1.5 flex-1 line-clamp-3 text-sm leading-relaxed text-foreground">
                    {insight.message}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    {insight.path ? (
                      <Link
                        href={insight.path}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {openLabel}
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setAssistantQuery(insight.query);
                        setAssistantOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      Ask assistant
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
