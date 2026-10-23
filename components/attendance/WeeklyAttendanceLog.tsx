"use client";

import React, { useMemo, useState, useEffect } from "react";
import moment from "moment";
import {
  Calendar,
  Clock,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  FilePenLine,
  Coffee,
  ScanFace,
  Building2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { AttendanceTimelineBar } from "./AttendanceTimelineBar";
import { AttendanceRecord } from "@/lib/graphql/attendance/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WeeklyAttendanceLogProps {
  records: AttendanceRecord[];
  isLoading?: boolean;
  onRefresh?: () => void;
  officeName?: string;
  officeRadiusMeters?: number;
  shiftStart?: string;
  shiftEnd?: string;
  className?: string;
}

interface DayLogItem {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue...
  fullDayName: string; // Monday, Tuesday...
  formattedDate: string; // 23 Oct
  isToday: boolean;
  isFuture: boolean;
  isWeekend: boolean;
  record?: AttendanceRecord;
  status: "present" | "late_login" | "early_logout" | "half_day" | "absent" | "weekend" | "holiday" | "leave" | "upcoming" | "not_marked";
  inTime?: string | null;
  outTime?: string | null;
  workedHours?: number | string | null;
  isLive: boolean;
  isWithinGeofence?: boolean;
  faceVerified?: boolean;
  correctionStatus?: string;
}

export function WeeklyAttendanceLog({
  records = [],
  isLoading = false,
  onRefresh,
  officeName = "Office",
  officeRadiusMeters = 200,
  shiftStart = "09:00:00",
  shiftEnd = "18:00:00",
  className,
}: WeeklyAttendanceLogProps) {
  const [viewScope, setViewScope] = useState<"isoWeek" | "last7">("isoWeek");
  const [statusFilter, setStatusFilter] = useState<"all" | "present" | "issues">("all");
  const [now, setNow] = useState(() => new Date());

  // Update live clock every 30s to keep today's worked hours updated
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Build a lookup map of records by attendanceDate
  const recordsByDate = useMemo(() => {
    const map = new Map<string, AttendanceRecord>();
    records.forEach((r) => {
      if (r.attendanceDate) {
        map.set(r.attendanceDate, r);
      }
    });
    return map;
  }, [records]);

  // Generate 7 days according to viewScope
  const days: DayLogItem[] = useMemo(() => {
    const today = moment();
    const result: DayLogItem[] = [];

    let startDay: moment.Moment;
    let endDay: moment.Moment;

    if (viewScope === "isoWeek") {
      // Monday of current week to Sunday
      startDay = moment().startOf("isoWeek");
      endDay = moment().endOf("isoWeek");
    } else {
      // Past 7 days ending today
      startDay = moment().subtract(6, "days");
      endDay = moment();
    }

    const curr = startDay.clone();
    while (curr.isSameOrBefore(endDay, "day")) {
      const dateStr = curr.format("YYYY-MM-DD");
      const isToday = curr.isSame(today, "day");
      const isFuture = curr.isAfter(today, "day");
      const dayOfWeek = curr.isoWeekday(); // 1 = Mon, 7 = Sun
      const isWeekend = dayOfWeek === 6 || dayOfWeek === 7;

      const record = recordsByDate.get(dateStr);
      let status: DayLogItem["status"] = "not_marked";
      let isLive = false;

      if (record) {
        status = (record.status as DayLogItem["status"]) || "present";
        if (isToday && record.loginTime && !record.logoutTime) {
          isLive = true;
        }
      } else if (isFuture) {
        status = "upcoming";
      } else if (isWeekend) {
        status = "weekend";
      } else if (isToday) {
        status = "not_marked";
      } else {
        status = "absent";
      }

      result.push({
        date: dateStr,
        dayName: curr.format("ddd"),
        fullDayName: curr.format("dddd"),
        formattedDate: curr.format("DD MMM"),
        isToday,
        isFuture,
        isWeekend,
        record,
        status,
        inTime: record?.loginTime,
        outTime: record?.logoutTime,
        workedHours: record?.workedHours,
        isLive,
        isWithinGeofence: record?.isWithinGeofence,
        faceVerified: record?.faceVerified,
        correctionStatus: record?.correctionStatus,
      });

      curr.add(1, "day");
    }

    // Sort descending so today / most recent date is at the top
    return result.sort((a, b) => b.date.localeCompare(a.date));
  }, [viewScope, recordsByDate]);

  // Weekly KPI stats
  const stats = useMemo(() => {
    const workDays = days.filter((d) => !d.isWeekend && !d.isFuture);
    const presentDays = days.filter(
      (d) =>
        d.record &&
        (d.status === "present" ||
          d.status === "late_login" ||
          d.status === "early_logout" ||
          d.status === "half_day")
    );
    const issueDays = days.filter(
      (d) =>
        !d.isWeekend &&
        !d.isFuture &&
        (d.status === "absent" ||
          d.status === "late_login" ||
          d.status === "early_logout" ||
          d.status === "half_day" ||
          (d.isToday && !d.inTime && moment().hour() >= 12))
    );

    let totalHours = 0;
    records.forEach((r) => {
      // Only count records within the generated week
      if (days.some((d) => d.date === r.attendanceDate)) {
        if (r.workedHours) {
          totalHours += Number(r.workedHours);
        } else if (r.loginTime && !r.logoutTime && r.attendanceDate === moment().format("YYYY-MM-DD")) {
          // Add live running duration for today
          const start = moment(`${r.attendanceDate} ${r.loginTime}`);
          const diffHours = Math.max(0, moment().diff(start, "hours", true));
          totalHours += diffHours;
        }
      }
    });

    const avgHours = presentDays.length > 0 ? (totalHours / presentDays.length).toFixed(1) : "0.0";
    const onTimeRate =
      presentDays.length > 0
        ? Math.round(
            (presentDays.filter((d) => d.status === "present").length / presentDays.length) * 100
          )
        : 100;

    return {
      workDaysCount: workDays.length,
      presentCount: presentDays.length,
      issuesCount: issueDays.length,
      totalHours: totalHours.toFixed(1),
      avgHours,
      onTimeRate,
    };
  }, [days, records]);

  // Filtered days list
  const filteredDays = useMemo(() => {
    if (statusFilter === "all") return days;
    if (statusFilter === "present") {
      return days.filter(
        (d) =>
          d.record &&
          (d.status === "present" ||
            d.status === "late_login" ||
            d.status === "early_logout" ||
            d.status === "half_day")
      );
    }
    if (statusFilter === "issues") {
      return days.filter(
        (d) =>
          !d.isWeekend &&
          !d.isFuture &&
          (d.status === "absent" ||
            d.status === "late_login" ||
            d.status === "early_logout" ||
            d.status === "half_day" ||
            d.correctionStatus === "pending")
      );
    }
    return days;
  }, [days, statusFilter]);

  const getStatusBadge = (item: DayLogItem) => {
    switch (item.status) {
      case "present":
        return <Badge variant="success" className="gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Present</Badge>;
      case "late_login":
        return <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3 text-amber-500" /> Late Entry</Badge>;
      case "early_logout":
        return <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3 text-amber-500" /> Early Exit</Badge>;
      case "half_day":
        return <Badge variant="warning" className="gap-1"><AlertCircle className="w-3 h-3 text-amber-500" /> Half Day</Badge>;
      case "absent":
        return <Badge variant="danger" className="gap-1"><XCircle className="w-3 h-3 text-rose-500" /> Absent</Badge>;
      case "weekend":
        return <Badge variant="default" className="gap-1 text-muted-foreground"><Coffee className="w-3 h-3" /> Weekend</Badge>;
      case "upcoming":
        return <Badge variant="default" className="gap-1 opacity-70">Scheduled</Badge>;
      case "holiday":
        return <Badge variant="info" className="gap-1">Holiday</Badge>;
      case "leave":
        return <Badge variant="info" className="gap-1">On Leave</Badge>;
      case "not_marked":
        return item.isToday ? (
          <Badge variant="warning" className="gap-1">Pending Punch</Badge>
        ) : (
          <Badge variant="danger" className="gap-1">Missed</Badge>
        );
      default:
        return <Badge variant="default">{item.status}</Badge>;
    }
  };

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "—";
    try {
      return moment(timeStr, "HH:mm:ss").format("hh:mm A");
    } catch {
      return timeStr;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Top Header Card */}
      <div className="premium-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary">
                <Calendar className="w-4 h-4" />
              </span>
              <h3 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
                Weekly Attendance Log & Overview
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Review your shifts, daily hours, geofence status, and regularizations for the week.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Scope Toggle: Current Week vs Last 7 Days */}
            <div className="flex bg-muted/60 p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewScope("isoWeek")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  viewScope === "isoWeek"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                This Week (Mon–Sun)
              </button>
              <button
                type="button"
                onClick={() => setViewScope("last7")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer",
                  viewScope === "last7"
                    ? "bg-card text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                Last 7 Days
              </button>
            </div>

            {onRefresh && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isLoading}
                className="h-8.5 rounded-xl text-xs gap-1.5 px-3"
              >
                <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin text-primary")} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            )}

            <Link href="/attendance/attendance-correction">
              <Button
                variant="outline"
                size="sm"
                className="h-8.5 rounded-xl text-xs gap-1.5 px-3 border-primary/30 text-primary hover:bg-primary/5 hover:text-primary"
              >
                <FilePenLine className="w-3.5 h-3.5" />
                <span>Regularize Log</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 Summary KPI Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Logged Days</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
                {stats.presentCount}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {stats.workDaysCount} days
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${
                    stats.workDaysCount > 0
                      ? Math.min(100, Math.round((stats.presentCount / stats.workDaysCount) * 100))
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Total Worked</span>
              <Clock className="w-4 h-4 text-primary" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
                {stats.totalHours}
              </span>
              <span className="text-xs text-muted-foreground font-medium">hrs logged</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              Target: ~{(stats.workDaysCount * 8).toFixed(0)} hrs (8h/day)
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Daily Average</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-bold tabular-nums text-foreground">
                {stats.avgHours}
              </span>
              <span className="text-xs text-muted-foreground font-medium">hrs / day</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {Number(stats.avgHours) >= 8 ? "Meeting standard shift" : "Below 8.0h pace"}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-muted/20 space-y-2">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Shift Health</span>
              {stats.issuesCount === 0 ? (
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="flex items-baseline gap-1.5">
              <span
                className={cn(
                  "text-xl sm:text-2xl font-bold tabular-nums",
                  stats.issuesCount === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-500"
                )}
              >
                {stats.issuesCount === 0 ? "100%" : `${stats.issuesCount} Alert`}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                {stats.issuesCount === 0 ? "compliance" : "needs review"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">
              {stats.issuesCount === 0
                ? "All shifts completed smoothly"
                : `${stats.issuesCount} missing punch or late entry`}
            </p>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-xs text-muted-foreground font-medium mr-1 hidden sm:inline">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium",
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              All Days ({days.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("present")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium",
                statusFilter === "present"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Present ({stats.presentCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("issues")}
              className={cn(
                "px-2.5 py-1 text-xs rounded-lg transition-all cursor-pointer font-medium",
                statusFilter === "issues"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              Exceptions ({stats.issuesCount})
            </button>
          </div>

          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Shift: {moment(shiftStart, "HH:mm:ss").format("hh:mm A")} – {moment(shiftEnd, "HH:mm:ss").format("hh:mm A")}</span>
          </div>
        </div>

        {/* Days List / Log Table */}
        <div className="space-y-3 pt-2">
          {isLoading && days.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
              <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-medium">Loading weekly attendance records…</p>
            </div>
          ) : filteredDays.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-border text-center space-y-2 text-muted-foreground">
              <Calendar className="w-8 h-8 mx-auto opacity-30 text-primary" />
              <p className="text-sm font-medium text-foreground">No records match this filter</p>
              <p className="text-xs">Try selecting 'All Days' to view the entire week.</p>
            </div>
          ) : (
            filteredDays.map((item) => {
              const hasIssue =
                !item.isWeekend &&
                !item.isFuture &&
                (item.status === "absent" ||
                  item.status === "late_login" ||
                  item.status === "early_logout" ||
                  item.status === "half_day" ||
                  item.status === "not_marked");

              return (
                <div
                  key={item.date}
                  className={cn(
                    "p-4 rounded-xl border transition-all duration-200",
                    item.isToday
                      ? "border-primary/40 bg-primary/[0.03] shadow-xs"
                      : item.isWeekend
                      ? "border-border/40 bg-muted/10 opacity-75"
                      : "border-border/70 bg-card hover:border-border hover:shadow-xs"
                  )}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Day / Date / Badge Column */}
                    <div className="flex items-center gap-3.5 min-w-[190px]">
                      <div
                        className={cn(
                          "w-11 h-11 rounded-xl flex flex-col items-center justify-center font-semibold text-center shrink-0 border",
                          item.isToday
                            ? "bg-primary text-primary-foreground border-primary"
                            : item.isWeekend
                            ? "bg-muted/40 text-muted-foreground border-border/50"
                            : "bg-muted/20 text-foreground border-border"
                        )}
                      >
                        <span className="text-[10px] uppercase font-bold leading-none tracking-wider opacity-85">
                          {item.dayName}
                        </span>
                        <span className="text-sm font-extrabold leading-tight tabular-nums">
                          {moment(item.date).format("DD")}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-foreground">
                            {item.isToday ? "Today" : item.fullDayName}
                          </span>
                          {item.isToday && (
                            <span className="px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{item.formattedDate}</span>
                          <span>•</span>
                          {getStatusBadge(item)}
                        </div>
                      </div>
                    </div>

                    {/* Punches & Timeline Section */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                        {/* Punch In & Punch Out times */}
                        <div className="flex items-center gap-4 text-foreground font-medium">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="text-muted-foreground text-[11px]">In:</span>
                            <span className="tabular-nums font-semibold">
                              {formatTime(item.inTime)}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full shrink-0",
                                item.isLive
                                  ? "bg-emerald-500 animate-pulse"
                                  : item.outTime
                                  ? "bg-rose-500"
                                  : "bg-muted-foreground/40"
                              )}
                            />
                            <span className="text-muted-foreground text-[11px]">Out:</span>
                            <span className="tabular-nums font-semibold">
                              {item.isLive ? (
                                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                  In Progress
                                </span>
                              ) : (
                                formatTime(item.outTime)
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Telemetry Pills (Geofence & Face verification) */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.record && (
                            <>
                              {item.isWithinGeofence ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md font-medium border border-emerald-500/20">
                                  <MapPin className="w-3 h-3" />
                                  Office Geofence
                                </span>
                              ) : item.record.loginDistance ? (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-medium border border-amber-500/20">
                                  <MapPin className="w-3 h-3" />
                                  {(item.record.loginDistance / 1000).toFixed(1)}km away
                                </span>
                              ) : null}

                              {item.faceVerified && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium border border-primary/20">
                                  <ScanFace className="w-3 h-3" />
                                  Face Verified
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Interactive Visual Shift Bar */}
                      <div className="w-full h-6 relative pt-0.5">
                        <AttendanceTimelineBar
                          loginTime={item.inTime}
                          logoutTime={item.outTime}
                          attendanceDate={item.date}
                          status={item.status === "upcoming" ? "absent" : item.status}
                          workedHours={item.workedHours}
                          compact={true}
                          showTimeMarkers={false}
                          interactive={true}
                          shiftStart={shiftStart}
                          shiftEnd={shiftEnd}
                        />
                      </div>
                    </div>

                    {/* Worked Hours & Regularize Action Column */}
                    <div className="flex items-center justify-between lg:justify-end gap-3 min-w-[150px] pt-2 lg:pt-0 border-t lg:border-t-0 border-border/40">
                      <div className="text-left lg:text-right space-y-0.5">
                        <span className="text-[11px] text-muted-foreground block font-medium">
                          Worked Hours
                        </span>
                        <div className="flex items-center lg:justify-end gap-1.5 font-bold text-sm tabular-nums text-foreground">
                          <TrendingUp
                            className={cn(
                              "w-3.5 h-3.5",
                              Number(item.workedHours || 0) >= 8
                                ? "text-emerald-500"
                                : item.isLive
                                ? "text-primary animate-spin"
                                : "text-amber-500"
                            )}
                          />
                          <span>
                            {item.isLive
                              ? "Tracking…"
                              : item.workedHours
                              ? `${Number(item.workedHours).toFixed(1)}h`
                              : item.isWeekend
                              ? "Off"
                              : "0.0h"}
                          </span>
                        </div>
                      </div>

                      {/* Regularization Trigger */}
                      {item.correctionStatus === "pending" ? (
                        <Badge variant="warning" className="text-[10px] whitespace-nowrap">
                          Correction Pending
                        </Badge>
                      ) : item.correctionStatus === "approved" ? (
                        <Badge variant="success" className="text-[10px] whitespace-nowrap">
                          Corrected
                        </Badge>
                      ) : hasIssue ? (
                        <Link href={`/attendance/attendance-correction?date=${item.date}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs font-semibold rounded-lg border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 gap-1 px-2.5"
                          >
                            <span>Regularize</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      ) : (
                        <div className="w-6 hidden lg:block" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
