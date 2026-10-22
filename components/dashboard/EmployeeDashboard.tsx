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
  Zap,
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
  { src: string; dark: boolean; timeLabel: string }
> = {
  morning: {
    src: "/images/hero/3d-morning.jpg",
    dark: false,
    timeLabel: "Morning Focus",
  },
  noon: {
    src: "/images/hero/3d-noon.jpg",
    dark: false,
    timeLabel: "Midday Work",
  },
  evening: {
    src: "/images/hero/3d-evening.jpg",
    dark: true,
    timeLabel: "Twilight Hours",
  },
  night: {
    src: "/images/hero/3d-night.jpg",
    dark: true,
    timeLabel: "Night Shift",
  },
};

function heroSrcForDay(period: DayPeriod) {
  return periodHero[period].src;
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
  const heroSrc = heroSrcForDay(period);

  return (
    <div className="w-full space-y-6 pb-8">
      {/* ── Today hero: 3D Architectural Workspace ───────────────────────────────────────── */}
      <section
        className={cn(
          "relative overflow-hidden rounded-3xl shadow-xl border border-border/40 -mx-4 -mt-6 sm:-mx-6 lg:-mx-8 mb-6 min-h-[320px] lg:min-h-[350px]",
          isDarkBg ? "bg-[#0b0f17]" : "bg-[#f1f5f9]"
        )}
      >
        <Image
          src={heroSrc}
          alt="3D Architectural Workspace"
          aria-hidden
          fill
          priority
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1280px"
          className="hero-art object-cover object-center transition-all duration-700"
        />

        {/* Ambient Gradient Scrim for crisp text legibility without obscuring the background */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[1]",
            isDarkBg
              ? "bg-gradient-to-r from-slate-950/70 via-slate-950/30 via-45% to-transparent"
              : "bg-gradient-to-r from-white/80 via-white/40 via-45% to-transparent"
          )}
        />
        {/* Bottom subtle vignette to smoothly blend with dashboard */}
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t",
            isDarkBg
              ? "from-slate-950/40 via-transparent to-transparent"
              : "from-white/40 via-transparent to-transparent"
          )}
        />

        {/* Content Area */}
        <div className="relative z-10 flex min-h-[320px] lg:min-h-[350px] flex-col justify-between p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Content */}
            <div className="max-w-xl space-y-4">
              {/* Date & Period Live Chip */}
              <div
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 shadow-xs backdrop-blur-md text-xs font-semibold",
                  isDarkBg
                    ? "border-white/20 bg-slate-950/60 text-white"
                    : "border-slate-300/80 bg-white/80 text-slate-800"
                )}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38ABB1] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38ABB1]"></span>
                </span>
                <span className="uppercase tracking-wider text-[11px] font-bold">
                  {now.format("dddd, MMMM D")}
                </span>
                <span className="opacity-40">•</span>
                <span className="text-[#38ABB1] font-semibold">{heroMeta.timeLabel}</span>
              </div>

              {/* Headline */}
              <div className="space-y-1.5">
                <h1
                  className={cn(
                    "text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-balance leading-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]",
                    isDarkBg ? "text-white" : "text-slate-900"
                  )}
                >
                  {greetingForHour(now.hour())},{" "}
                  <span className="bg-gradient-to-r from-[#38ABB1] via-teal-300 to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
                    {user?.firstName || "there"}
                  </span>
                </h1>
                <p
                  className={cn(
                    "text-xs sm:text-sm font-medium flex flex-wrap items-center gap-1.5 sm:gap-2 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]",
                    isDarkBg ? "text-slate-200" : "text-slate-600"
                  )}
                >
                  <span>{user?.designation?.name || "Software Engineer"}</span>
                  <span className="opacity-30">•</span>
                  <span>{user?.department?.name || "Engineering"}</span>
                  <span className="opacity-30">•</span>
                  <span className={cn("font-semibold", isDarkBg ? "text-white/90" : "text-slate-900")}>
                    {user?.organization?.name || "TechNova Pvt. Ltd."}
                  </span>
                </p>
              </div>

              {/* Action Buttons & Status */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/attendance"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-lg shadow-[#38ABB1]/25 bg-gradient-to-r from-[#38ABB1] to-[#2d8d93] text-white hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <MapPin className="h-4 w-4" />
                  {["present", "late_login", "early_logout", "half_day"].includes(todayEntry?.status)
                    ? "Open attendance"
                    : "Check in"}
                </Link>

                <Link
                  href="/leaves"
                  className={cn(
                    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold shadow-xs backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer",
                    isDarkBg
                      ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
                      : "border-slate-300 bg-white/80 text-slate-800 hover:bg-white"
                  )}
                >
                  <Plus className="h-4 w-4" />
                  Request leave
                </Link>

                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold shadow-xs backdrop-blur-md",
                    isDarkBg
                      ? "border-white/15 bg-black/40 text-white"
                      : "border-slate-200 bg-white/85 text-slate-800"
                  )}
                >
                  <TodayIcon className="h-3.5 w-3.5 text-[#38ABB1]" />
                  <span>
                    Today: <span className="font-bold text-[#38ABB1]">{todayMeta.label}</span>
                  </span>
                </div>
              </div>

              {/* Celebration / Wish Banner */}
              {wishMessage && (
                <div
                  className={cn(
                    "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 backdrop-blur-md shadow-xs animate-in fade-in-50",
                    isDarkBg
                      ? "border-white/15 bg-white/10 text-white"
                      : "border-amber-200 bg-amber-50/90 text-amber-900"
                  )}
                >
                  {wishMessage.toLowerCase().includes("birthday") ? (
                    <Cake className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  ) : (
                    <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  )}
                  <p className="text-xs sm:text-sm font-medium leading-relaxed">{wishMessage}</p>
                </div>
              )}
            </div>

            {/* Right Side Glassmorphic Live Shift Widget (Visible on lg screens) */}
            <div
              className={cn(
                "hidden lg:flex flex-col items-end gap-2 rounded-2xl border p-4.5 backdrop-blur-xl shadow-xl min-w-[210px]",
                isDarkBg
                  ? "border-white/15 bg-slate-950/50 text-white"
                  : "border-white/60 bg-white/60 text-slate-900"
              )}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#38ABB1]">
                <Clock className="w-3.5 h-3.5 text-[#38ABB1]" />
                <span>Shift Schedule</span>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight">
                {now.format("hh:mm A")}
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-white/10 w-full justify-end text-xs font-medium opacity-90">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>09:00 AM – 06:00 PM</span>
              </div>
            </div>
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
              hoverBorder: "hover:border-foreground/40",
            },
            {
              label: "Days present",
              value: String(stats.daysPresent ?? 0),
              href: "/attendance",
              icon: CheckCircle2,
              hint: "This cycle",
              accentClass: "bg-muted",
              hoverBorder: "hover:border-foreground/40",
            },
            {
              label: "Primary leave",
              value: String(primaryLeave?.balance ?? 0),
              href: "/leaves",
              icon: Calendar,
              hint: primaryLeave?.name || "Available balance",
              accentClass: "bg-muted",
              hoverBorder: "hover:border-foreground/40",
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
                <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-border/60 text-muted-foreground/60 transition-colors group-hover:border-foreground/40 group-hover:text-foreground/40">
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
        <section className="flex flex-col justify-between rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Today&apos;s Attendance
              </h2>
            </div>
            <Link
              href="/attendance"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="View attendance"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
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
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-4 mb-4">
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
          <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 shrink-0 rounded-full bg-[#38ABB1]" aria-hidden />
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
                  className="group flex flex-col justify-between rounded-xl border border-border bg-card hover:border-foreground/40 transition-all p-4 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {insight.title || "Action Item"}
                      </p>
                      {isWarning ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/25 shrink-0">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          Attention
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                          <Zap className="w-3 h-3 text-primary" />
                          Suggested
                        </span>
                      )}
                    </div>
                    <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                      {insight.message}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-border/40 flex items-center justify-between gap-2">
                    {insight.path ? (
                      <Link
                        href={insight.path}
                        className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        {openLabel}
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    ) : <span />}
                    <button
                      type="button"
                      onClick={() => {
                        setAssistantQuery(insight.query);
                        setAssistantOpen(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
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
