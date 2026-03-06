"use client";

import { usePayrollRuns } from "@/lib/api/hooks";
import { useState } from "react";
import { Card } from "@/components/common/Card";
import { Stat } from "@/components/common/Stats";
import { Badge } from "@/components/common/Badge";
import {
  DollarSign,
  Plus,
  Calculator,
  Users,
  FileText,
  TrendingUp,
  History,
  Zap,
  ArrowRight,
  Download,
  Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { DataTable } from "@/components/common/DataTable";

export default function PayrollPage() {
  const { data: payrollRuns, isLoading, create, calculate } = usePayrollRuns();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    payroll_month: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const total = payrollRuns?.length || 0;
  const paginatedPayrollRuns = payrollRuns?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  const handleCreatePayroll = async () => {
    try {
      await create.mutateAsync(formData);
      setShowForm(false);
      // Replace with toast later
    } catch (error) {
      console.error(error);
    }
  };

  const handleCalculate = async (runId: number) => {
    try {
      await calculate.mutateAsync(runId);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    {
      key: "payroll_month",
      label: "Cycle Month",
      render: (val: string) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Calendar className="w-4 h-4" />
          </div>
          <span className="font-bold">
            {new Date(val).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
          </span>
        </div>
      )
    },
    {
      key: "total_employees",
      label: "Connectivity",
      render: (val: number) => <span className="font-black tabular-nums">{val} Nodes</span>
    },
    {
      key: "total_gross_salary",
      label: "Gross Value",
      render: (val: number) => <span className="font-black tabular-nums text-primary">₹{val?.toLocaleString()}</span>
    },
    {
      key: "status",
      label: "State",
      render: (val: string) => (
        <Badge variant={val === 'approved' ? 'success' : val === 'draft' ? 'default' : 'info'}>
          {val}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Operations",
      render: (_: any, run: any) => (
        <div className="flex items-center gap-2">
          {run.status === "draft" ? (
            <Button size="sm" onClick={() => handleCalculate(run.id)} disabled={calculate.isPending}>
              Calculate
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="h-8 px-3 text-[9px]">
              <Download className="w-3 h-3 mr-1" />
              Report
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-premium-h1">Ledger Console</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Financial distribution and cycle management.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Synchronize Cycle
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Stat
          icon={Users}
          label="Active Nodes"
          value={payrollRuns?.[0]?.total_employees || "0"}
          color="text-blue-500"
          gradient="bg-blue-500/10"
        />
        <Stat
          icon={TrendingUp}
          label="Gross Yield"
          value={`₹${(payrollRuns?.[0]?.total_gross_salary || 0).toLocaleString()}`}
          color="text-primary"
          gradient="bg-primary/10"
        />
        <Stat
          icon={TrendingUp}
          label="Total Deductions"
          value={`₹${(payrollRuns?.[0]?.total_deductions || 0).toLocaleString()}`}
          color="text-destructive"
          gradient="bg-destructive/10"
        />
        <Stat
          icon={DollarSign}
          label="Net Distribution"
          value={`₹${(payrollRuns?.[0]?.total_net_salary || 0).toLocaleString()}`}
          color="text-emerald-500"
          gradient="bg-emerald-500/10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          {showForm && (
            <div className="animate-in slide-in-from-top-4 duration-500">
              <Card title="Initialize New Cycle" icon={Calculator}>
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1 space-y-2">
                    <label className="text-premium-label ml-1">Cycle Pointer (Month)</label>
                    <input
                      type="month"
                      value={formData.payroll_month}
                      onChange={(e) => setFormData({ ...formData, payroll_month: e.target.value })}
                      className="input"
                    />
                  </div>
                  <Button onClick={handleCreatePayroll} disabled={create.isPending} className="btn-primary px-10">
                    {create.isPending ? "Syncing..." : "Execute"}
                  </Button>
                </div>
              </Card>
            </div>
          )}

          <div className="space-y-6">
            <h2 className="text-premium-label flex items-center gap-3">
              <History className="w-4 h-4 text-primary" />
              Historical Ledgers
            </h2>
            <div className="bg-card rounded-4xl border border-border shadow-2xl overflow-hidden p-2">
              <DataTable
                columns={columns}
                data={paginatedPayrollRuns || []}
                isLoading={isLoading}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                paginationLabel="Ledgers"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <Card title="Financial Insights" icon={Zap}>
            <div className="space-y-6">
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-premium-label text-primary">Budget Integrity</p>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <p className="text-2xl font-black italic">NOMINAL</p>
                <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                  Distribution cycles are currently aligned with the annual projected variance.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Processing Latency", val: "1.2ms" },
                  { label: "Tax Compliance", val: "Validated" },
                  { label: "Ledger Consistency", val: "99.9%" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-black tabular-nums">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <div className="premium-card bg-muted/30 border-dashed border-2 flex flex-col items-center justify-center py-10 text-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center">
              <FileText className="w-6 h-6 text-muted-foreground/40" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-black italic">Archive Portal</p>
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Legacy Data coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
