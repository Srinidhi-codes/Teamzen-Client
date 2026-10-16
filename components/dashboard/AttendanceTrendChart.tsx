"use client";

import React, { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from "recharts";
import { Sparkles, Calendar, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendPoint = { month: string; value: number };

export interface HourlyTrendPoint {
  time: string;
  value: number;
  activeEmployees?: number;
  label?: string;
  isPeak?: boolean;
}

interface AttendanceTrendChartProps {
  data?: TrendPoint[];
  hourlyData?: HourlyTrendPoint[];
  currentRate?: number;
  className?: string;
  showToggle?: boolean;
}

const DEFAULT_HOURLY_DATA: HourlyTrendPoint[] = [
  { time: "0h", value: 18, label: "Night Shift Operations" },
  { time: "2h", value: 28, label: "Logistics Team" },
  { time: "4h", value: 24, label: "Early Maintenance" },
  { time: "6h", value: 42, label: "Morning Support" },
  { time: "8h", value: 58, label: "General Check-in Start" },
  { time: "10h", value: 76, label: "Core Business Hours" },
  { time: "12h", value: 96, label: "Peak Office Attendance", isPeak: true },
  { time: "14h", value: 72, label: "Afternoon Field Ops" },
  { time: "16h", value: 65, label: "Cross-functional Sync" },
  { time: "18h", value: 82, label: "Evening Shift Handover" },
  { time: "19h", value: 86, label: "Secondary Shift Peak", isPeak: true },
  { time: "20h", value: 66, label: "Global Coverage Team" },
  { time: "22h", value: 88, label: "Late Shift Influx" },
  { time: "24h", value: 92, label: "Daily Shift Closeout" },
];

function CustomChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0]?.payload;
  const val = payload[0]?.value;

  return (
    <div className="rounded-xl border border-[#38ABB1]/30 bg-slate-950/90 dark:bg-[#0b131e]/95 p-3 text-white shadow-xl shadow-[#38ABB1]/10 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-2 w-2 rounded-full bg-[#22D3EE] shadow-[0_0_8px_#22D3EE]" />
        <span className="text-xs font-semibold text-slate-300">
          {dataPoint?.month || dataPoint?.time || label}
        </span>
        {dataPoint?.isPeak && (
          <span className="rounded bg-[#38ABB1]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#4cd1d7] border border-[#38ABB1]/30">
            PEAK
          </span>
        )}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-xl font-extrabold tracking-tight text-white tabular-nums">
          {val}%
        </span>
        <span className="text-xs text-slate-400">attendance</span>
      </div>
      {dataPoint?.label && (
        <p className="mt-1 text-[11px] text-slate-400 font-medium">
          {dataPoint.label}
        </p>
      )}
    </div>
  );
}

function GlowingPeakDot(props: any) {
  const { cx, cy } = props;
  if (!cx || !cy) return null;

  return (
    <g>
      {/* Outer ambient glow */}
      <circle cx={cx} cy={cy} r={10} fill="#22D3EE" opacity={0.25} />
      <circle cx={cx} cy={cy} r={6} fill="#38ABB1" opacity={0.6} />
      {/* Crisp center dot */}
      <circle
        cx={cx}
        cy={cy}
        r={3.5}
        fill="#ffffff"
        stroke="#22D3EE"
        strokeWidth={1.5}
      />
    </g>
  );
}

export function AttendanceTrendChart({
  data = [],
  hourlyData,
  currentRate = 95,
  className,
  showToggle = true,
}: AttendanceTrendChartProps) {
  const [viewMode, setViewMode] = useState<"realtime" | "monthly">("realtime");

  const displayData = useMemo(() => {
    if (viewMode === "monthly" && data.length > 0) {
      return data;
    }
    if (hourlyData && hourlyData.length > 0) {
      return hourlyData;
    }
    return DEFAULT_HOURLY_DATA;
  }, [viewMode, data, hourlyData]);

  const peakPoints = useMemo(() => {
    if (viewMode !== "realtime") return [];
    return (displayData as any[]).filter((d) => Boolean(d.isPeak));
  }, [viewMode, displayData]);

  const xDataKey = viewMode === "monthly" && data.length > 0 ? "month" : "time";

  return (
    <div className={cn("relative w-full h-full flex flex-col justify-between", className)}>
      {/* Header controls with view toggle */}
      {showToggle && (
        <div className="flex items-center justify-between pb-2 px-1">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
            </span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {viewMode === "realtime" ? "Live Attendance Wave (24h)" : "Monthly Attendance History"}
            </span>
          </div>

          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800/80 p-0.5 border border-border/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setViewMode("realtime")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer",
                viewMode === "realtime"
                  ? "bg-white dark:bg-[#0e1726] text-[#38ABB1] dark:text-[#4cd1d7] font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Clock className="h-3 w-3" />
              <span>Today</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("monthly")}
              className={cn(
                "flex items-center gap-1 px-2.5 py-1 rounded-md transition-all cursor-pointer",
                viewMode === "monthly"
                  ? "bg-white dark:bg-[#0e1726] text-[#38ABB1] dark:text-[#4cd1d7] font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Calendar className="h-3 w-3" />
              <span>Monthly</span>
            </button>
          </div>
        </div>
      )}

      {/* Chart Canvas */}
      <div className="relative w-full flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={displayData}
            margin={{ top: 20, right: 16, left: -22, bottom: 4 }}
          >
            <defs>
              {/* Multi-stop stroke gradient: Purple -> Teal -> Cyan */}
              <linearGradient id="neonAttendanceLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8B5CF6" />
                <stop offset="50%" stopColor="#38ABB1" />
                <stop offset="100%" stopColor="#22D3EE" />
              </linearGradient>

              {/* Area gradient: Glowing Cyan-Teal with subtle bottom fade */}
              <linearGradient id="neonAttendanceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38ABB1" stopOpacity={0.32} />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity={0.10} />
                <stop offset="100%" stopColor="#38ABB1" stopOpacity={0.0} />
              </linearGradient>

              {/* Neon Glow Filter */}
              <filter id="neonGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#38ABB1" floodOpacity="0.45" />
              </filter>
            </defs>

            <CartesianGrid
              vertical={false}
              stroke="var(--border)"
              strokeDasharray="4 4"
              strokeOpacity={0.4}
            />

            <XAxis
              dataKey={xDataKey}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={6}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />

            <Tooltip
              content={<CustomChartTooltip />}
              cursor={{
                stroke: "#38ABB1",
                strokeWidth: 1.5,
                strokeDasharray: "4 4",
                strokeOpacity: 0.6,
              }}
            />

            {/* Dynamic vertical dashed guideline(s) to actual peak hour(s) */}
            {viewMode === "realtime" &&
              peakPoints.map((peak: any, idx: number) => (
                <React.Fragment key={`${peak.time}-${idx}`}>
                  <ReferenceLine
                    x={peak.time}
                    stroke="#38ABB1"
                    strokeDasharray="3 3"
                    strokeOpacity={0.6}
                  />
                  <ReferenceDot
                    x={peak.time}
                    y={peak.value}
                    shape={<GlowingPeakDot />}
                  />
                </React.Fragment>
              ))}

            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#neonAttendanceLine)"
              strokeWidth={3}
              fill="url(#neonAttendanceArea)"
              filter="url(#neonGlowFilter)"
              activeDot={{
                r: 6,
                fill: "#ffffff",
                stroke: "#22D3EE",
                strokeWidth: 2.5,
                className: "animate-pulse",
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
