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
  Gift,
  Award,
  UserPlus,
  PartyPopper,
  ArrowUpRight,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import dynamic from "next/dynamic";
import { useQuery } from "@apollo/client/react";
import { GET_USER_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";

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

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
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
  const { user, isLoading: isUserLoading, error: userError, refetch: refetchUser } = useGraphQLUser();
  const { setAssistantOpen, setAssistantQuery } = useStore();
  const {
    data: dashboardData,
    loading: isDashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useQuery(GET_USER_DASHBOARD_STATS);

  const isInitialLoading =
    (isUserLoading && !user) || (isDashboardLoading && !dashboardData);
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

  return (
    <div className="w-full space-y-6 pb-8">
      {/* ── Today hero ───────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-[oklch(0.28_0.04_200)] text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "radial-gradient(circle at 12% 20%, oklch(0.55 0.09 200 / 0.5), transparent 42%), radial-gradient(circle at 88% 80%, oklch(0.4 0.06 220 / 0.35), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 flex flex-col gap-8 p-6 sm:p-8 lg:flex-row lg:items-end lg:justify-between lg:p-10">
          <div className="max-w-2xl space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium tracking-wide text-teal-200/80">
                {now.format("dddd, MMMM D")}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl">
                {greetingForHour(now.hour())},{" "}
                <span className="text-teal-200">{user?.firstName || "there"}</span>
              </h1>
              <p className="text-sm text-white/65 sm:text-base">
                {[user?.designation?.name, user?.department?.name, user?.organization?.name]
                  .filter(Boolean)
                  .join(" · ") || "Your workforce home"}
              </p>
            </div>

            <div className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-sm">
              <TodayIcon className="h-3.5 w-3.5 text-white/80" />
              <span className="text-sm font-medium">Today · {todayMeta.label}</span>
            </div>

            {wishMessage && (
              <div className="flex items-start gap-2.5 rounded-xl border border-white/10 bg-white/8 px-3.5 py-3">
                {wishMessage.toLowerCase().includes("birthday") ? (
                  <Cake className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                ) : (
                  <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-amber-200" />
                )}
                <p className="text-sm leading-relaxed text-white/80">{wishMessage}</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
            <Link
              href="/attendance"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-[oklch(0.28_0.04_200)] transition-opacity hover:opacity-95"
            >
              <MapPin className="h-4 w-4" />
              {todayEntry?.status === "present" ? "Open attendance" : "Check in"}
            </Link>
            <Link
              href="/leaves"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/25 bg-white/5 px-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Request leave
            </Link>
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
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-muted-foreground">
              No week data yet
            </div>
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
                        ) : (
                          <Award className="h-3 w-3 text-sky-500" />
                        )}
                        {event.type === "birthday" ? "Birthday" : "Anniversary"}
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
            <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                <Gift className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-foreground">No celebrations yet</p>
              <p className="max-w-55 text-xs text-muted-foreground">
                Birthdays and anniversaries this month will show up here.
              </p>
            </div>
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

      {/* ── Insights digest ──────────────────────────────────── */}
      {aiInsights.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                Worth a look
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {aiInsights.slice(0, 3).map((insight: any, i: number) => {
              const isWarning = insight.type === "warning" || insight.type === "anomaly";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setAssistantQuery(insight.query);
                    setAssistantOpen(true);
                  }}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors hover:bg-muted/40",
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
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-foreground">
                    {insight.message}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                    Ask assistant
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </button>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
