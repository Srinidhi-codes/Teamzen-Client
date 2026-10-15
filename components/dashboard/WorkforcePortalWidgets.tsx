"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  Activity,
  MoreVertical,
  ArrowUpRight,
  ChevronRight,
  Check,
  X,
  DollarSign,
  Briefcase,
  Layers,
  ChevronDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { useMutation } from "@apollo/client/react";
import { LEAVE_REQUEST_PROCESS } from "@/lib/graphql/leaves/mutations";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------
   1. TOP CARDS: Workforce Analytics Cards
   ------------------------------------------------------------------------- */
interface WorkforceCardProps {
  title: string;
  value: string | number;
  delta: string;
  deltaType: "increase" | "decrease" | "neutral";
  badgeText: string;
  badgeVariant?: "active" | "onboarding" | "stable" | "default";
}

export function WorkforceAnalyticsCard({
  title,
  value,
  delta,
  deltaType,
  badgeText,
  badgeVariant = "default",
}: WorkforceCardProps) {
  const isPositive = deltaType === "increase";
  const isNegative = deltaType === "decrease";

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs transition-all duration-200 hover:border-[#38ABB1]/40 hover:shadow-md hover:shadow-[#38ABB1]/5">
      {/* Top Header Row with Title & Options */}
      <div className="flex items-center justify-between text-muted-foreground mb-3">
        <h3 className="text-xs sm:text-sm font-medium tracking-wide text-muted-foreground">
          {title}
        </h3>
        <button
          type="button"
          aria-label="Card options"
          className="rounded-lg p-1 text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      </div>

      {/* Main Metric & Delta + Pill Badge */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2.5">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
            {value}
          </span>
          <div
            className={cn(
              "flex items-center text-xs font-semibold tabular-nums",
              isPositive
                ? "text-emerald-500 dark:text-emerald-400"
                : isNegative
                  ? "text-rose-500 dark:text-rose-400"
                  : "text-muted-foreground"
            )}
          >
            {isPositive ? (
              <span className="inline-flex items-center">↗ {delta}</span>
            ) : isNegative ? (
              <span className="inline-flex items-center">↘ {delta}</span>
            ) : (
              <span>{delta}</span>
            )}
          </div>
        </div>

        {/* Status Pill Badge */}
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[11px] font-semibold border tracking-wide",
            badgeVariant === "active" &&
              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
            badgeVariant === "onboarding" &&
              "bg-[#38ABB1]/10 text-[#38ABB1] dark:text-[#4cd1d7] border-[#38ABB1]/30",
            badgeVariant === "stable" &&
              "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/25",
            badgeVariant === "default" &&
              "bg-muted text-muted-foreground border-border"
          )}
        >
          {badgeText}
        </span>
      </div>
    </div>
  );
}

export function WorkforceAnalyticsRow({
  totalEmployees,
  newHires,
  turnoverRate,
  activeEmployees,
}: {
  totalEmployees?: number;
  newHires?: number;
  turnoverRate?: string;
  activeEmployees?: number;
}) {
  const empVal = typeof totalEmployees === "number" ? totalEmployees.toLocaleString() : "1,248";
  const hiresVal = typeof newHires === "number" ? newHires : 15;
  const turnoverVal = turnoverRate || "2.1%";
  const deltaActive = typeof activeEmployees === "number" ? String(activeEmployees) : "13";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Workforce Analytics Cards
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <WorkforceAnalyticsCard
          title="Total Employees"
          value={empVal}
          delta={deltaActive}
          deltaType="increase"
          badgeText="Active"
          badgeVariant="active"
        />
        <WorkforceAnalyticsCard
          title="New Hires (This Month)"
          value={hiresVal}
          delta={String(hiresVal)}
          deltaType="increase"
          badgeText="Onboarding"
          badgeVariant="onboarding"
        />
        <WorkforceAnalyticsCard
          title="Employee Turnover"
          value={turnoverVal}
          delta={turnoverVal}
          deltaType="decrease"
          badgeText="Stable"
          badgeVariant="stable"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   2. ATTENDANCE STATUS PANEL (Right side of Real-Time Attendance graph)
   ------------------------------------------------------------------------- */
export interface DepartmentAttendanceItem {
  name: string;
  code: string;
  rate: number;
}

const DEFAULT_DEPARTMENTS: DepartmentAttendanceItem[] = [
  { name: "Engineering", code: "Eng", rate: 98 },
  { name: "Sales & Expansion", code: "Sales", rate: 92 },
  { name: "Marketing", code: "Mktg", rate: 96 },
  { name: "Product Design", code: "Prod", rate: 94 },
];

export function AttendanceStatusPanel({
  attendanceRate = 95,
  departments,
}: {
  attendanceRate?: number;
  departments?: DepartmentAttendanceItem[];
}) {
  const deptList =
    departments && departments.length > 0 ? departments : DEFAULT_DEPARTMENTS;

  return (
    <div className="flex flex-col justify-between h-full rounded-2xl border border-border/80 bg-slate-900/90 dark:bg-[#0c1421]/95 text-white p-5 lg:p-6 shadow-sm">
      <div className="space-y-4">
        {/* Status Header */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Current Status:
          </p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22D3EE] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#38ABB1]" />
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#22D3EE] drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]">
              {attendanceRate}% Present
            </h3>
          </div>
        </div>

        {/* Department Progress Bars */}
        <div className="space-y-3.5 pt-2">
          {deptList.map((dept) => (
            <div key={dept.code} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-slate-300 font-semibold">{dept.code}</span>
                <span className="text-slate-200 tabular-nums font-bold">
                  {dept.rate}%
                </span>
              </div>
              {/* Progress Track & Glow Bar */}
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#38ABB1] to-[#22D3EE] transition-all duration-700 shadow-[0_0_8px_#38ABB1]"
                  style={{ width: `${dept.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom hint / quick link */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <span className="text-[11px]">Real-time biometrics sync</span>
        <Link
          href="/attendance"
          className="inline-flex items-center gap-1 text-[#38ABB1] hover:text-[#22D3EE] font-medium transition-colors"
        >
          <span>Logs</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   3. CARD 1: Payroll Salary Disbursement (Bar Chart)
   ------------------------------------------------------------------------- */
export interface PayrollBarItem {
  month: string;
  amount: number;
  label: string;
}

const DEFAULT_PAYROLL_DATA: PayrollBarItem[] = [
  { month: "July", amount: 2.1, label: "$2.1M" },
  { month: "August", amount: 2.2, label: "$2.2M" },
  { month: "September", amount: 2.2, label: "$2.2M" },
  { month: "Total", amount: 2.3, label: "$2.3M" },
];

export function PayrollSalaryDisbursementWidget({
  quarterLabel = "Salary Disbursement - Q3 2024",
  totalAmount = "$6.6M",
  data,
}: {
  quarterLabel?: string;
  totalAmount?: string;
  data?: PayrollBarItem[];
}) {
  const chartData = data && data.length > 0 ? data : DEFAULT_PAYROLL_DATA;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      <div>
        {/* Section Header */}
        <div className="mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Payroll Salary Disbursement
          </h3>
        </div>

        {/* Big Metric Row */}
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground truncate max-w-[180px]">
            {quarterLabel}
          </p>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#38ABB1] dark:text-[#4cd1d7] tabular-nums">
            {totalAmount}
          </span>
        </div>

        {/* Vertical Bar Chart */}
        <div className="h-44 w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 18, right: 8, left: -26, bottom: 0 }}
            >
              <defs>
                <linearGradient id="payrollBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#38ABB1" />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                stroke="var(--border)"
                strokeDasharray="3 3"
                strokeOpacity={0.4}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                dy={4}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}M`}
                domain={[0, "auto"]}
                tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              />
              <Tooltip
                cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const item = payload[0].payload as PayrollBarItem;
                  return (
                    <div className="rounded-lg border border-[#38ABB1]/30 bg-slate-950/90 p-2 text-xs text-white shadow-md">
                      <p className="font-semibold">{item.month}</p>
                      <p className="text-[#22D3EE] font-bold">{item.label}</p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="amount"
                fill="url(#payrollBarGrad)"
                radius={[6, 6, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span>Quarterly disbursement</span>
        <Link
          href="/payroll"
          className="inline-flex items-center gap-1 font-medium text-[#38ABB1] hover:underline"
        >
          <span>View payslips</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   4. CARD 2: Department Metrics (Circular Meters)
   ------------------------------------------------------------------------- */
export interface DeptMetric {
  name: string;
  rate: number;
}

const DEFAULT_METRICS: DeptMetric[] = [
  { name: "Engineering", rate: 94 },
  { name: "Sales", rate: 88 },
  { name: "Marketing", rate: 91 },
  { name: "Product", rate: 95 },
  { name: "HR", rate: 96 },
];

function CircularGauge({ rate, size = 32 }: { rate: number; size?: number }) {
  const strokeWidth = 3;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/40 dark:text-slate-800"
        />
        {/* Animated Progress Ring in #38ABB1 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#38ABB1"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <span className="absolute text-[10px] font-bold text-foreground tabular-nums">
        {rate}%
      </span>
    </div>
  );
}

export function DepartmentMetricsWidget({
  metrics,
}: {
  metrics?: DeptMetric[];
}) {
  const list = metrics && metrics.length > 0 ? metrics : DEFAULT_METRICS;

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      <div>
        {/* Section Header */}
        <div className="mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Department Metrics
          </h3>
        </div>

        <p className="text-xs font-medium text-muted-foreground mb-3">
          Department Performance
        </p>

        {/* List of Department Performance rows */}
        <div className="space-y-2.5">
          {list.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/20 px-3 py-2 transition-colors hover:bg-muted/40"
            >
              <span className="text-xs font-semibold text-foreground">
                {m.name}
              </span>
              <CircularGauge rate={m.rate} size={30} />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span>Team efficiency scores</span>
        <Link
          href="/team"
          className="inline-flex items-center gap-1 font-medium text-[#38ABB1] hover:underline"
        >
          <span>Team directory</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------
   5. CARD 3: Leave Activity Widgets (Pending Leave Requests)
   ------------------------------------------------------------------------- */
export interface PendingLeaveRequest {
  id: string;
  name: string;
  leaveType: string;
  dateRange: string;
  avatar?: string;
  status?: "pending" | "approved" | "rejected";
}

const DEFAULT_LEAVE_REQUESTS: PendingLeaveRequest[] = [
  {
    id: "lr-1",
    name: "John Doe",
    leaveType: "Annual Leave",
    dateRange: "Oct 29-30",
  },
  {
    id: "lr-2",
    name: "Jane Smith",
    leaveType: "Sick Leave",
    dateRange: "Oct 28",
  },
  {
    id: "lr-3",
    name: "Alex Johnson",
    leaveType: "Personal Leave",
    dateRange: "Nov 1-3",
  },
];

export function LeaveActivityWidgetsCard({
  requests,
  onRefresh,
}: {
  requests?: PendingLeaveRequest[];
  onRefresh?: () => void;
}) {
  const [items, setItems] = useState<PendingLeaveRequest[]>(
    requests && requests.length > 0 ? requests : DEFAULT_LEAVE_REQUESTS
  );

  const [processLeave] = useMutation(LEAVE_REQUEST_PROCESS);

  useEffect(() => {
    if (requests && requests.length > 0) {
      setItems(requests);
    }
  }, [requests]);

  const handleAction = async (id: string, action: "approved" | "rejected", name: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: action } : item))
    );

    try {
      if (!id.startsWith("lr-")) {
        await processLeave({
          variables: {
            input: {
              requestId: id,
              status: action === "approved" ? "APPROVED" : "REJECTED",
            },
          },
        });
        onRefresh?.();
      }
      if (action === "approved") {
        toast.success(`Approved leave for ${name}`);
      } else {
        toast.error(`Declined leave for ${name}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to process leave request");
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      <div>
        {/* Section Header */}
        <div className="mb-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Leave Activity Widgets
          </h3>
        </div>

        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-foreground">
            Pending Leave Requests
          </p>
          <Link
            href="/leaves"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="View all leaves"
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {/* List of Pending Requests */}
        <div className="space-y-2">
          {items.map((req) => {
            const isApproved = req.status === "approved";
            const isRejected = req.status === "rejected";

            return (
              <div
                key={req.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-border/50 bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
              >
                {/* Left: User Avatar + Info */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#38ABB1]/15 text-[#38ABB1] font-bold text-xs">
                    {req.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {req.name} ·{" "}
                      <span className="text-muted-foreground font-normal">
                        {req.leaveType}
                      </span>
                    </p>
                    <p className="text-[10px] text-muted-foreground font-medium">
                      ({req.dateRange})
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {isApproved ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-500 border border-emerald-500/20">
                      <Check className="h-3 w-3" />
                      Approved
                    </span>
                  ) : isRejected ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-semibold text-rose-500 border border-rose-500/20">
                      <X className="h-3 w-3" />
                      Rejected
                    </span>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => handleAction(req.id, "approved", req.name)}
                        className="rounded-lg bg-[#38ABB1] hover:bg-[#2e949a] text-white px-2 py-1 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(req.id, "rejected", req.name)}
                        className="rounded-lg border border-border bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span>Awaiting management review</span>
        <Link
          href="/leaves"
          className="inline-flex items-center gap-1 font-medium text-[#38ABB1] hover:underline"
        >
          <span>All requests</span>
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
