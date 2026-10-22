"use client";

import React, { useMemo, useState } from "react";
import moment from "moment";
import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export interface AttendanceTimelineBarProps {
  loginTime?: string | null;
  logoutTime?: string | null;
  attendanceDate?: string;
  status?: string;
  shiftStart?: string; // e.g. "09:00:00"
  shiftEnd?: string;   // e.g. "18:00:00"
  workedHours?: number | string | null;
  effectiveWorkedHours?: number | string | null;
  roamingAnomalyDetected?: boolean;
  outOfFenceHeartbeats?: number;
  compact?: boolean;
  showTimeMarkers?: boolean;
  interactive?: boolean;
  className?: string;
  onClick?: () => void;
}

interface Segment {
  id: string;
  type: "neutral" | "present" | "late_deficit" | "early_deficit" | "overtime" | "absent";
  label: string;
  startMinutes: number;
  endMinutes: number;
  leftPct: number;
  widthPct: number;
  bgClass: string;
  borderClass?: string;
  tooltipText: string;
}

function timeToMinutes(timeStr?: string | null): number | null {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return null;
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
  if (isNaN(hours) || isNaN(minutes)) return null;
  return hours * 60 + minutes + (seconds > 30 ? 1 : 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = Math.floor(minutes % 60);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  const displayM = m < 10 ? `0${m}` : m;
  return `${displayH}:${displayM} ${period}`;
}

export function AttendanceTimelineBar({
  loginTime,
  logoutTime,
  attendanceDate,
  status = "present",
  shiftStart = "09:00:00",
  shiftEnd = "18:00:00",
  workedHours,
  effectiveWorkedHours,
  roamingAnomalyDetected,
  outOfFenceHeartbeats = 0,
  compact = false,
  showTimeMarkers = false,
  interactive = true,
  className,
  onClick,
}: AttendanceTimelineBarProps) {
  const [hoveredSegment, setHoveredSegment] = useState<Segment | null>(null);

  const { segments, shiftStartPct, shiftEndPct, isLive, isAbsent } = useMemo(() => {
    const TOTAL_MINUTES = 1440; // 24 hours
    const shiftStartMin = timeToMinutes(shiftStart) ?? 540; // default 09:00 AM
    const shiftEndMin = timeToMinutes(shiftEnd) ?? 1080;   // default 06:00 PM

    const shiftStartPct = (shiftStartMin / TOTAL_MINUTES) * 100;
    const shiftEndPct = (shiftEndMin / TOTAL_MINUTES) * 100;

    const isToday = attendanceDate ? moment().isSame(moment(attendanceDate), "day") : false;
    const isAbsent = status === "absent" || (!loginTime && !isToday);

    const loginMin = timeToMinutes(loginTime);
    let logoutMin = timeToMinutes(logoutTime);
    let isLive = false;

    // If active shift today with no logout time
    if (loginMin !== null && logoutMin === null) {
      if (isToday) {
        const nowMinutes = moment().hours() * 60 + moment().minutes();
        logoutMin = Math.min(TOTAL_MINUTES, Math.max(loginMin, nowMinutes));
        isLive = true;
      } else {
        logoutMin = Math.max(loginMin, shiftEndMin);
      }
    }

    const segList: Segment[] = [];

    const addSegment = (
      id: string,
      type: Segment["type"],
      start: number,
      end: number,
      label: string,
      bgClass: string,
      borderClass?: string
    ) => {
      const validStart = Math.max(0, Math.min(TOTAL_MINUTES, start));
      const validEnd = Math.max(0, Math.min(TOTAL_MINUTES, end));
      if (validEnd <= validStart) return;

      const durationMin = Math.round(validEnd - validStart);
      const hours = Math.floor(durationMin / 60);
      const mins = durationMin % 60;
      const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

      segList.push({
        id,
        type,
        label,
        startMinutes: validStart,
        endMinutes: validEnd,
        leftPct: (validStart / TOTAL_MINUTES) * 100,
        widthPct: ((validEnd - validStart) / TOTAL_MINUTES) * 100,
        bgClass,
        borderClass,
        tooltipText: `${label}: ${minutesToTime(validStart)} – ${minutesToTime(validEnd)} (${durationStr})`,
      });
    };

    if (isAbsent) {
      addSegment(
        "absent-shift",
        "absent",
        shiftStartMin,
        shiftEndMin,
        "Absent during Office Hours",
        "bg-rose-500/80 dark:bg-rose-600/80",
        "border-rose-600/30"
      );
    } else if (loginMin !== null && logoutMin !== null) {
      // 1. Early Arrival (before shift start) -> Green (Early Present)
      if (loginMin < shiftStartMin) {
        const earlyEnd = Math.min(logoutMin, shiftStartMin);
        addSegment(
          "early-present",
          "present",
          loginMin,
          earlyEnd,
          "Early Login (Present)",
          "bg-emerald-500/90 dark:bg-emerald-400/90",
          "border-emerald-600/20"
        );
      }

      // 2. Late Login Deficit (during office hours before login) -> RED
      if (loginMin > shiftStartMin) {
        const lateDeficitEnd = Math.min(loginMin, shiftEndMin);
        if (lateDeficitEnd > shiftStartMin) {
          addSegment(
            "late-deficit",
            "late_deficit",
            shiftStartMin,
            lateDeficitEnd,
            "Late Login Deficit (Office Hours)",
            "bg-rose-500 dark:bg-rose-600 shadow-xs",
            "border-rose-700/30"
          );
        }
      }

      // 3. Main Present Shift (core working hours) -> GREEN
      const coreStart = Math.max(loginMin, shiftStartMin);
      const coreEnd = Math.min(logoutMin, shiftEndMin);
      if (coreEnd > coreStart) {
        addSegment(
          "shift-present",
          "present",
          coreStart,
          coreEnd,
          isLive ? "Active Present Shift (Working)" : "Present (Working Hours)",
          "bg-emerald-500 dark:bg-emerald-400 shadow-xs",
          "border-emerald-600/20"
        );
      }

      // 4. Early Logout Deficit (during office hours after logout) -> RED
      if (logoutMin < shiftEndMin && !isLive) {
        const earlyLogoutStart = Math.max(logoutMin, shiftStartMin);
        if (shiftEndMin > earlyLogoutStart) {
          addSegment(
            "early-logout-deficit",
            "early_deficit",
            earlyLogoutStart,
            shiftEndMin,
            "Early Logout Deficit (Office Hours)",
            "bg-rose-500 dark:bg-rose-600 shadow-xs",
            "border-rose-700/30"
          );
        }
      }

      // 5. Overtime / Late Stay (after shift end) -> Emerald/Teal
      if (logoutMin > shiftEndMin) {
        const overtimeStart = Math.max(loginMin, shiftEndMin);
        if (logoutMin > overtimeStart) {
          addSegment(
            "overtime-present",
            "overtime",
            overtimeStart,
            logoutMin,
            "Overtime Work (Present)",
            "bg-emerald-600 dark:bg-emerald-500",
            "border-emerald-700/20"
          );
        }
      }
    }

    return {
      segments: segList,
      shiftStartPct,
      shiftEndPct,
      isLive,
      isAbsent,
    };
  }, [loginTime, logoutTime, attendanceDate, status, shiftStart, shiftEnd]);

  const hourTicks = [
    { hour: 0, label: "12 AM" },
    { hour: 3, label: "3 AM" },
    { hour: 6, label: "6 AM" },
    { hour: 9, label: "9 AM" },
    { hour: 12, label: "12 PM" },
    { hour: 15, label: "3 PM" },
    { hour: 18, label: "6 PM" },
    { hour: 21, label: "9 PM" },
  ];  const barHeight = compact ? "h-3.5 rounded-sm" : "h-6 rounded-lg";
  const containerHeight = compact ? "h-3.5" : showTimeMarkers ? "h-10" : "h-6";

  return (
    <div
      className={cn(
        "relative w-full select-none flex flex-col justify-center",
        containerHeight,
        className
      )}
      onClick={onClick}
    >
      {/* Floating Active Hover Tooltip (Absolute, zero layout shift) */}
      {hoveredSegment && (
        <div
          style={{
            left: `${Math.max(10, Math.min(90, hoveredSegment.leftPct + hoveredSegment.widthPct / 2))}%`,
          }}
          className="pointer-events-none absolute -top-9 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/80 bg-popover/95 px-2.5 py-1 text-[11px] font-medium text-popover-foreground shadow-xl backdrop-blur-xs flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-100"
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full shrink-0",
              hoveredSegment.type === "present" || hoveredSegment.type === "overtime"
                ? "bg-emerald-500"
                : hoveredSegment.type === "late_deficit" ||
                  hoveredSegment.type === "early_deficit" ||
                  hoveredSegment.type === "absent"
                ? "bg-rose-500"
                : "bg-muted-foreground"
            )}
          />
          <span className="font-semibold">{hoveredSegment.tooltipText}</span>
          {/* Caret arrow */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rotate-45 border-b border-r border-border/80 bg-popover" />
        </div>
      )}

      {/* Active timeline bar track */}
      <div
        className={cn(
          "relative w-full overflow-hidden border border-border/70 bg-muted/30 shadow-xs",
          barHeight,
          interactive && "cursor-pointer hover:border-primary/50"
        )}
      >
        {/* Office Shift window outline marker (9:00 AM to 6:00 PM) */}
        <div
          style={{
            left: `${shiftStartPct}%`,
            width: `${shiftEndPct - shiftStartPct}%`,
          }}
          className="absolute inset-y-0 border-x border-primary/20 bg-primary/5 pointer-events-none z-0"
          title={`Standard Office Shift: ${minutesToTime((shiftStartPct / 100) * 1440)} – ${minutesToTime((shiftEndPct / 100) * 1440)}`}
        />

        {/* Shift boundary dashed tick lines */}
        <div
          style={{ left: `${shiftStartPct}%` }}
          className="absolute inset-y-0 w-px border-l border-dashed border-primary/40 z-10 pointer-events-none"
        />
        <div
          style={{ left: `${shiftEndPct}%` }}
          className="absolute inset-y-0 w-px border-l border-dashed border-primary/40 z-10 pointer-events-none"
        />

        {/* Dynamic Colored Timeline Segments */}
        {segments.map((seg) => (
          <div
            key={seg.id}
            style={{
              left: `${seg.leftPct}%`,
              width: `${Math.max(0.6, seg.widthPct)}%`,
            }}
            onMouseEnter={() => setHoveredSegment(seg)}
            onMouseLeave={() => setHoveredSegment(null)}
            className={cn(
              "absolute inset-y-0 transition-opacity z-20 group",
              seg.bgClass,
              seg.borderClass && `border-r ${seg.borderClass}`,
              hoveredSegment?.id === seg.id && "brightness-110 ring-1 ring-white/50 z-30"
            )}
          >
            {isLive && seg.id === "shift-present" && (
              <span className="absolute right-0 top-0 bottom-0 w-1 bg-white animate-pulse" />
            )}
          </div>
        ))}

        {/* Roaming anomaly badge if detected */}
        {roamingAnomalyDetected && (
          <div
            style={{ left: `${Math.min(88, Math.max(10, shiftStartPct + 15))}%` }}
            className="absolute top-1/2 -translate-y-1/2 z-30 flex items-center justify-center bg-amber-500 text-white rounded-full p-0.5 shadow-xs pointer-events-none"
            title={`Roaming flagged: ${outOfFenceHeartbeats} out-of-fence pings`}
          >
            <AlertTriangle className="h-2.5 w-2.5" />
          </div>
        )}
      </div>

      {/* Optional Top or Bottom Time Ruler */}
      {showTimeMarkers && (
        <div className="relative mt-1 h-3.5 w-full text-[9px] font-medium text-muted-foreground/70 select-none">
          {hourTicks.map((t) => {
            const left = (t.hour / 24) * 100;
            return (
              <span
                key={t.hour}
                style={{ left: `${left}%` }}
                className={cn(
                  "absolute -translate-x-1/2 whitespace-nowrap tabular-nums",
                  t.hour === 9 || t.hour === 18 ? "font-bold text-foreground" : "",
                  t.hour % 6 !== 0 && "hidden sm:inline"
                )}
              >
                {t.label}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
