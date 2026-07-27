"use client";

import dynamic from "next/dynamic";
import { Card } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { DataTable, Column } from "@/components/common/DataTable";
import {
  TrendingUp,
  Users,
  DollarSign,
  FileText,
  Download,
  Printer,
  Activity,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { departmentData } from "@/components/analytics/analyticsData";

const AnalyticsTrendCharts = dynamic(
  () =>
    import("@/components/analytics/AnalyticsCharts").then((m) => m.AnalyticsTrendCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-[400px] grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="animate-pulse rounded-xl border border-border bg-muted/40" />
        <div className="animate-pulse rounded-xl border border-border bg-muted/40" />
      </div>
    ),
  }
);

const LeaveUsageChart = dynamic(
  () => import("@/components/analytics/AnalyticsCharts").then((m) => m.LeaveUsageChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-[340px] animate-pulse rounded-xl border border-border bg-muted/40" />
    ),
  }
);

export default function AnalyticsPage() {
  const deptColumns: Column<any>[] = [
    {
      key: "name",
      label: "Department",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Layers className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">{val}</span>
        </div>
      ),
    },
    {
      key: "employees",
      label: "Employees",
      render: (val: number) => (
        <span className="text-sm font-medium tabular-nums">{val}</span>
      ),
    },
    {
      key: "cost",
      label: "Total cost",
      render: (val: number) => (
        <span className="text-sm font-semibold tabular-nums text-primary">
          ₹{val.toLocaleString()}
        </span>
      ),
    },
    {
      key: "avgSalary",
      label: "Avg. salary",
      render: (_: any, row: any) => (
        <span className="text-sm font-medium tabular-nums text-muted-foreground">
          ₹{Math.round(row.cost / row.employees).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="animate-fade-in space-y-8 p-4 pb-20 sm:p-8">
      <PageHeader
        title="Analytics"
        description="Payroll trends, leave usage, and department summaries."
        actions={
          <Button variant="outline" className="h-9 rounded-md px-4">
            <Calendar className="mr-2 h-4 w-4" />
            Q2 2024
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total payroll",
            val: "₹65,80,000",
            icon: DollarSign,
            color: "text-primary",
            bg: "bg-primary/10",
          },
          {
            label: "Employees",
            val: "108",
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
          },
          {
            label: "Attendance rate",
            val: "94.2%",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Data completeness",
            val: "99.9%",
            icon: Activity,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
          },
        ].map((stat, i) => (
          <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-6">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.bg} ${stat.color}`}
            >
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-semibold">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <AnalyticsTrendCharts />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <LeaveUsageChart />

          <div className="space-y-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-6">
            <Activity className="h-8 w-8 text-amber-600" />
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Budget notice</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Engineering payroll is 4.2% above budget this quarter. Review department costs if
                needed.
              </p>
            </div>
            <Button variant="outline" className="h-9 w-full rounded-md text-sm font-medium">
              View details
            </Button>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-8">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Activity className="h-4 w-4 text-primary" />
            Department summary
          </h2>

          <div className="overflow-hidden rounded-xl border border-border bg-card p-1">
            <DataTable columns={deptColumns} data={departmentData} isLoading={false} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/50 bg-muted/30 p-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Export reports</p>
              <p className="text-sm text-muted-foreground">
                Download summaries for sharing or records
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="h-9 rounded-md px-4 text-sm font-medium">
                <FileText className="mr-2 h-4 w-4 text-primary" />
                PDF
              </Button>
              <Button variant="outline" className="h-9 rounded-md px-4 text-sm font-medium">
                <Download className="mr-2 h-4 w-4 text-emerald-500" />
                Excel
              </Button>
              <Button variant="outline" className="h-9 rounded-md px-4 text-sm font-medium">
                <Printer className="mr-2 h-4 w-4 text-amber-500" />
                Print
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
