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
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { FormSelect } from "@/components/common/FormSelect";
import { DatePickerSimple } from "@/components/ui/datePicker";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import ConfirmationModal from "@/components/common/ConfirmationModal";

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
      const diff = to.diff(from, "days") + 1;
      return diff > 0 ? diff : 0;
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
        <span className="font-black italic text-primary group-hover:px-2 transition-all">{name}</span>
      )
    },
    {
      key: "fromDate",
      label: "Duration",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center gap-2 w-2/3 bg-gray-200 p-1 rounded-lg border border-gray-300">
          <span className="font-bold tabular-nums text-foreground/70">{moment(row.fromDate).format("MMM DD")}</span>
          <ArrowRight className="w-3 h-3 text-muted-foreground/30" />
          <span className="font-bold tabular-nums text-foreground/70">{moment(row.toDate).format("MMM DD")}</span>
        </div>
      )
    },
    {
      key: "durationDays",
      label: "Days",
      render: (val: number) => <span className="font-black tabular-nums">{val}</span>
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
      className: "text-right",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-end gap-2">
          {row.status === "pending" && (
            <Button
              variant="destructive"
              size="sm"
              className="h-8 px-3 text-[9px] transition-all font-black"
              onClick={(e) => {
                e.stopPropagation();
                setLeaveToCancel(row);
              }}
            >
              Cancel
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-[9px] font-black tracking-widest bg-muted/20 border-border group-hover:border-primary/50"
            onClick={() => setViewDetails(row)}
          >
            REVIEW
          </Button>
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
                    <p className="text-3xl font-black text-foreground tabular-nums opacity-20 group-hover:opacity-100 transition-opacity">{balance.used}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
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
        <div className="lg:col-span-4 space-y-8 p-5 bg-card border border-border shadow-xl rounded-4xl h-2/3">
          <Card title="System Insights">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Annual Usage</span>
                  <span className="text-primary font-black">72.5%</span>
                </div>
                <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[72.5%] shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
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
                    val: `${leaveRequestData?.filter((r: any) => r.status === "pending").length || 0} Events`,
                    icon: Clock,
                    color: "text-orange-500"
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
      {/* Logical Review Modal */}
      {
        viewDetails && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="relative p-10 pb-8 bg-linear-to-br from-primary/10 via-background to-background text-primary">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <FileText className="w-32 h-32 rotate-12" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl text-black font-black tracking-tighter italic leading-none mb-3">
                      Request Leave
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                        #{viewDetails.id.slice(-8)}
                      </span>
                      <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Leave Request</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewDetails(null)}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Leave Type</label>
                    <p className="text-lg font-black italic text-primary">{viewDetails.leaveType.name}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Duration</label>
                    <p className="text-lg font-black tabular-nums">{viewDetails.durationDays}</p>
                  </div>
                  <div className="space-y-1">
                    <Badge variant={getStatusVariant(viewDetails.status)}>{viewDetails.status}</Badge>
                  </div>
                </div>

                <div className="space-y-2 bg-muted/30 p-6 rounded-3xl border border-border/50 w-2/3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" /> Duration
                  </label>
                  <p className="text-sm font-black text-foreground tracking-widest uppercase flex items-center gap-3">
                    {moment(viewDetails.fromDate).format("MMMM DD")}
                    <ArrowRight className="w-4 h-4 text-primary opacity-30" />
                    {moment(viewDetails.toDate).format("MMMM DD, YYYY")}
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Info className="w-3 h-3 text-primary" /> Reason
                  </label>
                  <p className="text-sm font-medium text-foreground/80 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                    "{viewDetails.reason}"
                  </p>
                </div>

                <div className="flex justify-end pt-4 gap-4">
                  {viewDetails.status.toLowerCase() === 'pending' && (
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setLeaveToCancel(viewDetails);
                        setViewDetails(null);
                      }}
                      className="px-8 font-black text-[10px] uppercase tracking-widest flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Cancel Request
                    </Button>
                  )}
                  <Button variant="secondary" onClick={() => setViewDetails(null)} className="px-10 font-black text-[10px] uppercase tracking-widest">
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Leave Request Form Modal */}
      {
        showForm && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-card rounded-[3rem] w-full max-w-2xl shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] border border-border overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="relative p-10 pb-8 bg-linear-to-br from-primary/10 via-background to-background text-primary">
                <div className="absolute top-0 right-0 p-10 opacity-10">
                  <FileText className="w-32 h-32 rotate-12" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div>
                    <h2 className="text-4xl font-black text-black tracking-tighter leading-none mb-3">
                      Initiate Leave
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/10">
                        NEW REQUEST
                      </span>
                      <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest">Leave Protocol</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowForm(false)}
                    className="w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all duration-300 flex items-center justify-center active:scale-90"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-10 overflow-y-auto max-h-[70vh]">
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormSelect
                      label="Leave Type"
                      value={formData.leaveTypeId}
                      onValueChange={(value) => setFormData({ ...formData, leaveTypeId: value })}
                      placeholder="Select Category"
                      options={leaveBalanceData?.map((b: any) => ({
                        label: `${b.leaveType.name} (${b.availableBalance} units)`,
                        value: b.leaveType.id
                      })) || []}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <DatePickerSimple
                        label="Start Phase"
                        value={formData.fromDate}
                        onChange={(date) => setFormData({ ...formData, fromDate: moment(date).format("YYYY-MM-DD") })}
                      />
                      <DatePickerSimple
                        label="End Phase"
                        value={formData.toDate}
                        onChange={(date) => setFormData({ ...formData, toDate: moment(date).format("YYYY-MM-DD") })}
                      />
                    </div>
                  </div>

                  {calculateDays() > 0 && (
                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-between animate-in zoom-in-95">
                      <div className="space-y-1">
                        <p className="text-premium-label text-primary">Calculated Duration</p>
                        <p className="text-2xl font-black">{calculateDays()} Operational Days</p>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-primary opacity-20" />
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-premium-label ml-1">Reason</label>
                    <Textarea
                      value={formData.reason}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Enter detailed reason (min 10 chars)..."
                    />
                  </div>

                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 flex items-start gap-4">
                    <Info className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      Submission of this request triggers a validation sequence with the regional head.
                      Ensure your <span className="text-primary font-bold">Leave Policy</span> supports the requested units.
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 gap-4">
                    <Button variant="outline" type="button" onClick={() => setShowForm(false)} className="px-10 h-14 rounded-2xl font-black text-[11px] uppercase tracking-widest">
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-primary px-12 h-14 rounded-2xl shadow-xl shadow-primary/20" disabled={createLeaveRequestLoading}>
                      {createLeaveRequestLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ChevronRight className="w-4 h-4 mr-2" />}
                      Submit Request
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )
      }

      <ConfirmationModal
        isOpen={!!leaveToCancel}
        onClose={() => setLeaveToCancel(null)}
        onConfirm={() => {
          if (leaveToCancel) {
            cancelLeaveRequest(leaveToCancel.id);
          }
        }}
        title="Cancel Leave Request"
        description={`Are you sure you want to cancel this ${leaveToCancel?.leaveType.name} request? This operation will restore your allocated balance and notify the administration.`}
        confirmText="Confirm Cancel"
        cancelText="Go Back"
        variant="destructive"
      />

    </div >
  );
}
