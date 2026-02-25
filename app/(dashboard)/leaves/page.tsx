"use client";

import { useGraphQLCancelLeaveRequest, useGraphQLCreateLeaveRequest, useGraphQlLeaveBalance, useGraphQLLeaveRequests } from "@/lib/graphql/leaves/leavesHook";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";
import { Card } from "@/components/common/Card";
import moment from "moment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import {
  Plus,
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Info,
  ArrowRight,
  TrendingDown,
  ChevronRight,
  AlertCircle,
  Zap,
  History,
  FileText,
  User,
  MoreVertical,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { LeaveReviewModal } from "@/components/leaves/LeaveReviewModal";

export default function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [leaveToCancel, setLeaveToCancel] = useState<any>(null);
  const { user } = useStore();
  const { leaveBalanceData, isLoading: leaveBalanceLoading } = useGraphQlLeaveBalance();
  const { leaveRequestData, isLoading: leaveRequestLoading } = useGraphQLLeaveRequests();
  const { cancelLeaveRequest, cancelLeaveRequestLoading } = useGraphQLCancelLeaveRequest();
  const { createLeaveRequest, createLeaveRequestLoading } = useGraphQLCreateLeaveRequest();
  const router = useRouter();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const total = leaveRequestData?.length || 0;
  const paginatedData = leaveRequestData?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Required";
    if (!formData.fromDate) newErrors.fromDate = "Required";
    if (!formData.toDate) newErrors.toDate = "Required";
    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = "Minimum 10 characters required";
    }

    if (formData.fromDate && formData.toDate) {
      if (moment(formData.toDate).isBefore(moment(formData.fromDate))) {
        newErrors.toDate = "Invalid range";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    createLeaveRequest({
      leave_type_id: formData.leaveTypeId,
      start_date: formData.fromDate,
      end_date: formData.toDate,
      reason: formData.reason,
    });

    setShowForm(false);
    setFormData({ leaveTypeId: "", fromDate: "", toDate: "", reason: "" });
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate);
      const to = moment(formData.toDate);
      let count = 0;
      let curr = from.clone();
      while (curr.isSameOrBefore(to)) {
        if (curr.day() !== 0 && curr.day() !== 6) {
          count++;
        }
        curr.add(1, "days");
      }
      return count;
    }
    return 0;
  };

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved": return "success";
      case "pending": return "warning";
      case "rejected": return "danger";
      default: return "info";
    }
  };

  const columns: Column<any>[] = [
    {
      key: "leaveType.name",
      label: "Leave Type",
      render: (name: string) => (
        <span className="font-black italic group-hover:px-2 transition-all">{name}</span>
      )
    },
    {
      key: "fromDate",
      label: "Duration",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center gap-2 bg-gray-200 p-1 w-34 rounded-xl border border-border">
          <span className="font-bold tabular-nums">{moment(row.fromDate).format("MMM DD")}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold tabular-nums">{moment(row.toDate).format("MMM DD")}</span>
        </div>
      )
    },
    {
      key: "durationDays",
      label: "Days",
      render: (val: number) => <span className="font-black tabular-nums">{Number(val)}</span>
    },
    {
      key: "status",
      label: "Status",
      render: (status: string) => (
        <Badge variant={getStatusVariant(status)}>
          {status}
        </Badge>
      )
    },
    {
      key: "actions",
      label: "Action",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-start gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[9px] font-black tracking-widest bg-muted/20 border-border group-hover:border-primary/50"
            onClick={() => setViewDetails(row)}
          >
            REVIEW
          </Button>
          {row.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-3 text-[9px] transition-all font-black"
              onClick={(e) => {
                e.stopPropagation();
                cancelLeaveRequest(row.id);
              }}
              disabled={cancelLeaveRequestLoading}
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-premium-h1">Leave Management</h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            Validate and monitor your operational downtime.
          </p>
        </div>
        <div className="flex items-center gap-2 ">
          <Button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "btn-secondary" : "btn-primary"}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel Request" : "Request Leave"}
          </Button>
        </div>
      </div>

      {/* Leave Balance Grid */}
      <div className="space-y-6">
        {leaveBalanceLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="premium-card h-48 animate-pulse bg-muted/50" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {leaveBalanceData?.map((balance: any) => (
              <div key={balance.id} className="premium-card card-hover group cursor-default">
                <div className="flex justify-between items-start mb-8">
                  <div className="space-y-1">
                    <h3 className="text-premium-h2 group-hover:text-primary transition-colors italic">{balance.leaveType.name}</h3>
                    <p className="text-premium-label opacity-40">Entitlement</p>
                    <span className="text-foreground/70 font-black">{balance.totalEntitled}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                    <Calendar className="w-6 h-6" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pb-6 border-b border-border/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Available</p>
                    <p className="text-3xl font-black text-emerald-500 tabular-nums">{balance.availableBalance}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Utilized</p>
                    <p className="text-3xl font-black text-foreground tabular-nums opacity-20 group-hover:opacity-100 transition-opacity">
                      {Number(balance.used) + Number(balance.pendingApproval)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted-foreground">Allocation efficiency</span>
                    <span className="text-primary">{Math.round((balance.availableBalance / balance.totalEntitled) * 100)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden shadow-inner">
                    <div
                      className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                      style={{ width: `${(balance.availableBalance / balance.totalEntitled) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Form or History */}
        <div className="lg:col-span-8 space-y-8">
          <div className="space-y-6">
            <h2 className="text-premium-label flex items-center gap-3">
              <History className="w-4 h-4 text-primary" />
              History Protocol
            </h2>
            <div className="bg-card rounded-4xl border border-border shadow-xl overflow-hidden p-2">
              <DataTable
                columns={columns}
                data={paginatedData}
                isLoading={leaveRequestLoading}
                total={total}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onRowClick={setViewDetails}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-4 space-y-8 p-5 bg-card border border-border shadow-xl rounded-4xl min-h-1/2">
          <Card title="System Insights">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Annual Usage</span>
                  <span className="text-primary font-black">
                    {Math.round(
                      ((leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.used), 0) || 0) /
                        (leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.totalEntitled), 0) || 1)) * 100
                    )}%
                  </span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)] transition-all duration-1000"
                    style={{
                      width: `${Math.round(
                        ((leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.used), 0) || 0) /
                          (leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.totalEntitled), 0) || 1)) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>

              <div className="space-y-5">
                {[
                  {
                    label: "Optimal Approval Rate",
                    val: `${leaveRequestData && leaveRequestData.length > 0
                      ? Math.round(
                        (leaveRequestData.filter((r: any) => r.status === "approved").length /
                          (leaveRequestData.filter((r: any) => r.status !== "pending").length || 1)) *
                        100
                      )
                      : 0
                      }%`,
                    icon: CheckCircle2,
                    color: "text-emerald-500"
                  },
                  {
                    label: "Pending Evaluations",
                    val: `${leaveRequestData?.filter((r: any) => r.status === "pending").length || 0}`,
                    icon: Clock,
                    color: "text-orange-500"
                  },
                  {
                    label: "Rejected Requests",
                    val: `${leaveRequestData?.filter((r: any) => r.status === "rejected").length || 0}`,
                    icon: XCircle,
                    color: "text-red-500"
                  },
                ].map((insight, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <insight.icon className={`w-4 h-4 ${insight.color}`} />
                      <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">{insight.label}</span>
                    </div>
                    <span className="text-xs font-black tabular-nums">{insight.val}</span>
                  </div>
                ))}
              </div>

              {leaveBalanceData?.find((b: any) => b.availableBalance <= 2) && (
                <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Critical Alert</span>
                  </div>
                  <p className="text-[11px] font-medium text-destructive/80 leading-relaxed">
                    Your <span className="font-bold underline italic">{leaveBalanceData?.find((b: any) => b.availableBalance <= 2)?.leaveType.name}</span> balance is nearing critical threshold ({leaveBalanceData?.find((b: any) => b.availableBalance <= 2)?.availableBalance} units remaining).
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <LeaveReviewModal
        isOpen={!!viewDetails}
        onClose={() => setViewDetails(null)}
        viewDetails={viewDetails}
        getStatusVariant={getStatusVariant}
      />

      <LeaveRequestModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        leaveBalanceData={leaveBalanceData}
        isLoading={createLeaveRequestLoading}
        calculateDays={calculateDays}
      />
    </div >
  );
}
