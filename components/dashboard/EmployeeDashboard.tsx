"use client";

import { useEffect, useMemo } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client/react";
import { GET_USER_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";

const AttendanceTrendChart = dynamic(
  () =>
    import("@/components/dashboard/AttendanceTrendChart").then(
      (m) => m.AttendanceTrendChart
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary" />
      </div>
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
  if (hour >= 5 && hour < 11) return "morning";
  if (hour >= 11 && hour < 17) return "noon";
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
  { label: string; bar: string; dot: string; Icon?: typeof CheckCircle2 }
> = {
  present: {
    label: "Present",
    bar: "bg-emerald-500",
    dot: "bg-emerald-500",
    Icon: CheckCircle2,
  },
  leave: {
    label: "On leave",
    bar: "bg-orange-400",
    dot: "bg-orange-400",
    Icon: Plane,
  },
  absent: {
    label: "Absent",
    bar: "bg-red-500",
    dot: "bg-red-500",
    Icon: XCircle,
  },
  pending: {
    label: "Pending",
    bar: "bg-amber-400",
    dot: "bg-amber-400",
    Icon: Clock,
  },
  weekend: {
    label: "Weekend",
    bar: "bg-muted-foreground/25",
    dot: "bg-muted-foreground/30",
  },
  not_started: {
    label: "Upcoming",
    bar: "bg-border",
    dot: "bg-muted-foreground/20",
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
  });

  const isInitialLoading = !user && isUserLoading && !dashboardData;
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
  const presentDays = last7Days.filter((d: any) => d.status === "present").length;
  const totalLeaveLeft = leaveBalances.reduce(
    (sum: number, b: any) => sum + (Number(b.balance) || 0),
    0
  );
  const primaryLeave = leaveBalances[0];
  const period = periodForHour(now.hour());
  const heroMeta = periodHero[period];
  const dark = heroMeta.dark;
  const heroSrc = heroSrcForDay(period, now.date());

  return (
    <div className="w-full space-y-6 pb-8">
      {/* ── Today hero ───────────────────────────────────────── */}
      <section
        className={cn(
          "relative overflow-hidden rounded-2xl border border-border",
          dark ? "bg-[#16122a]" : "bg-[#e8eef4]"
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
        <div
          className={cn(
            "pointer-events-none absolute inset-0",
            dark
              ? "bg-gradient-to-b from-[#16122a]/75 via-[#16122a]/35 to-[#16122a]/55 sm:bg-gradient-to-r sm:from-[#16122a]/70 sm:via-[#16122a]/20 sm:to-transparent"
              : "bg-gradient-to-b from-[#e8eef4]/90 via-[#e8eef4]/55 to-[#e8eef4]/70 sm:bg-gradient-to-r sm:from-[#e8eef4]/88 sm:via-[#e8eef4]/30 sm:to-transparent"
          )}
        />

        <div className="relative z-10 flex min-h-[300px] flex-col justify-between gap-5 p-5 sm:min-h-[300px] sm:p-8 lg:min-h-[340px] lg:p-10">
          <div className="max-w-xl space-y-4 sm:space-y-5">
            <div className="space-y-1.5 sm:space-y-2">
              <p
                className={cn(
                  "text-xs font-medium tracking-wide sm:text-sm",
                  dark ? "text-white/70" : "text-slate-600"
                )}
              >
                {now.format("dddd, MMMM D")}
              </p>
              <h1
                className={cn(
                  "text-2xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl",
                  dark ? "text-white" : "text-slate-900"
                )}
              >
                {greetingForHour(now.hour())},{" "}
                <span className={dark ? "text-indigo-100" : "text-slate-800"}>
                  {user?.firstName || "there"}
                </span>
              </h1>
              <p
                className={cn(
                  "line-clamp-2 text-xs sm:text-base",
                  dark ? "text-white/70" : "text-slate-600"
                )}
              >
                {[user?.designation?.name, user?.department?.name, user?.organization?.name]
                  .filter(Boolean)
                  .join(" · ") || "Your workforce home"}
              </p>
            </div>

            <div
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm sm:gap-2.5 sm:px-3.5",
                dark
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-slate-200/80 bg-white/80 text-slate-800"
              )}
            >
              <TodayIcon className={cn("h-3.5 w-3.5", dark ? "text-white/80" : "text-slate-600")} />
              <span className="text-xs font-medium sm:text-sm">Today · {todayMeta.label}</span>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Link
                href="/attendance"
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold shadow-sm transition-opacity hover:opacity-95 sm:h-11 sm:w-auto sm:px-5",
                  dark ? "bg-white text-slate-900" : "bg-slate-900 text-white"
                )}
              >
                <MapPin className="h-4 w-4" />
                {todayEntry?.status === "present" ? "Open attendance" : "Check in"}
              </Link>
              <Link
                href="/leaves"
                className={cn(
                  "inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium backdrop-blur-sm transition-colors sm:h-11 sm:w-auto sm:px-5",
                  dark
                    ? "border-white/30 bg-white/10 text-white hover:bg-white/16"
                    : "border-slate-300 bg-white/85 text-slate-800 hover:bg-white"
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

      {/* ── Bento: leave + week + metrics ─────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Featured leave */}
        <section className="flex flex-col rounded-2xl border border-border bg-card p-5 sm:p-6 lg:col-span-4">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Leave available
                </h2>
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground">Total days you can use</p>
              <p className="pl-3.5 pt-2 text-4xl font-semibold tracking-tight tabular-nums text-foreground sm:text-5xl">
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

          <div className="mt-auto space-y-3">
            {leaveBalances.length > 0 ? (
              leaveBalances.slice(0, 3).map((balance: any, i: number) => {
                const pct =
                  balance.total > 0
                    ? Math.min(100, Math.round((balance.balance / balance.total) * 100))
                    : 0;
                return (
                  <div key={`${balance.name}-${i}`} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="truncate text-muted-foreground">{balance.name}</span>
                      <span className="shrink-0 tabular-nums text-foreground">
                        {balance.balance}
                        <span className="text-muted-foreground">/{balance.total}</span>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${pct}%` }}
                      />
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

        {/* Week — compact day list (no tall empty bars) */}
        <section className="flex flex-col rounded-2xl border border-border bg-card lg:col-span-5">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  This week
                </h2>
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground sm:text-sm">
                <span className="font-semibold text-foreground">{presentDays}</span>
                {" of "}
                {last7Days.length || 7} days present
              </p>
            </div>
            <Link
              href="/attendance"
              className="text-sm font-medium text-primary hover:underline"
            >
              Details
            </Link>
          </div>

          {last7Days.length > 0 ? (
            <ul className="flex flex-1 flex-col justify-center divide-y divide-border">
              {last7Days.map((d: any, i: number) => {
                const meta = dayTone[d.status] || dayTone.not_started;
                const Icon = meta.Icon;
                const isToday = (d.dayStr || "")
                  .toLowerCase()
                  .startsWith(now.format("ddd").toLowerCase().slice(0, 2));

                return (
                  <li key={`${d.date}-${i}`}>
                    <Link
                      href="/attendance"
                      className={cn(
                        "grid grid-cols-[4.5rem_1fr_auto] items-center gap-3 px-5 py-2.5 transition-colors hover:bg-muted/40 sm:px-6",
                        isToday && "bg-primary/5"
                      )}
                    >
                      <div className="min-w-0">
                        <p
                          className={cn(
                            "text-sm font-semibold tabular-nums",
                            isToday ? "text-primary" : "text-foreground"
                          )}
                        >
                          {d.dayStr}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{d.date}</p>
                      </div>

                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn("h-2 w-2 shrink-0 rounded-full", meta.dot)}
                          aria-hidden
                        />
                        <span className="truncate text-sm text-muted-foreground">
                          {meta.label}
                        </span>
                        {isToday && (
                          <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                            Today
                          </span>
                        )}
                      </div>

                      <span
                        className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg",
                          d.status === "present" && "bg-emerald-500/10 text-emerald-600",
                          d.status === "leave" && "bg-orange-500/10 text-orange-600",
                          d.status === "absent" && "bg-red-500/10 text-red-600",
                          d.status === "pending" && "bg-amber-500/10 text-amber-600",
                          (d.status === "weekend" || d.status === "not_started") &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {Icon ? (
                          <Icon className="h-3.5 w-3.5" />
                        ) : d.status === "weekend" ? (
                          <span className="text-[10px] font-semibold">W</span>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                        )}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <EmptyState
              src={EmptyImages.attendance}
              title="No week data yet"
              description="Your last 7 days will appear here once attendance starts."
              size="compact"
              className="flex-1"
            />
          )}
        </section>

        {/* Compact metrics stack */}
        <section className="grid grid-cols-3 gap-3 lg:col-span-3 lg:grid-cols-1">
          {[
            {
              label: "Attendance",
              value: `${stats.attendanceRate ?? 0}%`,
              href: "/attendance",
              icon: TrendingUp,
              hint: "Overall rate",
            },
            {
              label: "Days present",
              value: String(stats.daysPresent ?? 0),
              href: "/attendance",
              icon: CheckCircle2,
              hint: "This cycle",
            },
            {
              label: "Primary leave",
              value: String(primaryLeave?.balance ?? 0),
              href: "/leaves",
              icon: Calendar,
              hint: primaryLeave?.name || "Balance",
            },
          ].map((m) => (
            <Link
              key={m.label}
              href={m.href}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 transition-colors hover:bg-muted/30 sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <m.icon className="h-4 w-4 text-muted-foreground" />
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50" />
              </div>
              <div>
                <p className="text-2xl font-semibold tracking-tight tabular-nums text-foreground sm:text-3xl">
                  {m.value}
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">{m.label}</p>
                <p className="text-xs text-muted-foreground">{m.hint}</p>
              </div>
            </Link>
          ))}
        </section>
      </div>

      {/* ── Shortcuts ────────────────────────────────────────── */}
      <nav className="flex flex-wrap gap-2">
        {[
          { href: "/attendance", label: "Attendance", icon: Clock },
          { href: "/leaves", label: "Leaves", icon: Calendar },
          { href: "/payroll", label: "Payslips", icon: DollarSign },
          { href: "/team", label: "Team", icon: UserPlus },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
          >
            <item.icon className="h-3.5 w-3.5 text-muted-foreground" />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* ── Activity + team moments ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <section className="rounded-2xl border border-border bg-card lg:col-span-7">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Activity
                </h2>
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground sm:text-sm">
                Leave, attendance, and team updates
              </p>
            </div>
            <Link
              href="/notifications"
              className="text-sm font-medium text-primary hover:underline"
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

        <section className="rounded-2xl border border-border bg-card lg:col-span-5">
          <div className="flex items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                  Team moments
                </h2>
              </div>
              <p className="pl-3.5 text-xs text-muted-foreground sm:text-sm">
                Birthdays and work anniversaries
              </p>
            </div>
            <span className="text-xs font-medium text-muted-foreground">This month</span>
          </div>

          {upcomingEvents.length > 0 ? (
            <ul className="divide-y divide-border">
              {upcomingEvents.slice(0, 5).map((event: any) => {
                const src = profileSrc(event.profilePicture);
                return (
                  <li
                    key={event.id}
                    className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-5 py-3.5 sm:px-6"
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-medium",
                        !src &&
                          (event.type === "birthday"
                            ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : event.type === "holiday" || event.type === "optional_holiday"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-sky-500/10 text-sky-700 dark:text-sky-400")
                      )}
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt={event.user}
                          width={40}
                          height={40}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      ) : (
                        initials(event.user || "?")
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {event.user}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        {event.type === "birthday" ? (
                          <Gift className="h-3 w-3 text-amber-500" />
                        ) : event.type === "holiday" || event.type === "optional_holiday" ? (
                          <Calendar className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Award className="h-3 w-3 text-sky-500" />
                        )}
                        {event.type === "birthday"
                          ? "Birthday"
                          : event.type === "optional_holiday"
                            ? "Optional holiday"
                            : event.type === "holiday"
                              ? "Holiday"
                              : "Anniversary"}
                        <span>·</span>
                        {moment(event.date).format("MMM D")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                        event.daysUntil === 0
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground"
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
              title="No celebrations yet"
              description="Birthdays and anniversaries this month will show up here."
              size="compact"
            />
          )}
        </section>
      </div>

      {/* ── Attendance trend ─────────────────────────────────── */}
      <section className="rounded-2xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Attendance trend
              </h2>
            </div>
            <p className="pl-3.5 text-xs text-muted-foreground sm:text-sm">
              Monthly presence over recent periods
            </p>
          </div>
          <p className="pl-3.5 text-sm tabular-nums text-muted-foreground sm:pl-0">
            Current rate{" "}
            <span className="font-semibold text-foreground">{stats.attendanceRate ?? 0}%</span>
          </p>
        </div>
        <div className="h-56 px-2 pb-4 pt-2 sm:px-4">
          <AttendanceTrendChart data={attendanceTrend} />
        </div>
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
