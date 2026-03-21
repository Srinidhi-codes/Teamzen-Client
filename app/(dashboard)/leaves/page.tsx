"use client";

import { useGraphQLCancelLeaveRequest, useGraphQLCreateLeaveRequest, useGraphQlLeaveBalance, useGraphQLLeaveRequests, useGraphQLTeamLeaves, useGraphQLCompanyHolidays } from "@/lib/graphql/leaves/leavesHook";
import { useStore } from "@/lib/store/useStore";
import { useEffect, useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Card } from "@/components/common/Card";
import moment from "moment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/common/Badge";
import { LeaveCalendar } from "@/components/leaves/LeaveCalendar";
import {
  Plus,
  X,
  Calendar,
  CalendarDays,
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
  XCircle,
  Users,
  RotateCcw,
  LayoutList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { LeaveReviewModal } from "@/components/leaves/LeaveReviewModal";
import { cn } from "@/lib/utils";
import Image from "next/image";

export default function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
    halfDayPeriod: "full_day",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewDetails, setViewDetails] = useState<any>(null);
  const [leaveToCancel, setLeaveToCancel] = useState<any>(null);
  const { user } = useStore();
  const { leaveBalanceData, isLoading: leaveBalanceLoading, refetch: refetchBalance } = useGraphQlLeaveBalance();
  const { leaveRequestData, isLoading: leaveRequestLoading, refetch: refetchRequests } = useGraphQLLeaveRequests();
  const { cancelLeaveRequest, cancelLeaveRequestLoading } = useGraphQLCancelLeaveRequest();
  const { createLeaveRequest, createLeaveRequestLoading } = useGraphQLCreateLeaveRequest();
  const { teamLeavesData, isLoading: teamLeavesLoading, refetch: refetchTeam } = useGraphQLTeamLeaves();
  const { companyHolidaysData } = useGraphQLCompanyHolidays();
  const [activeTab, setActiveTab] = useState<"overview" | "calendar">("overview");
  const router = useRouter();

  // Socket-based Real-time Refresh
  useNotifications((msg) => {
    if (msg.target_type === "Leave Request") {
      refetchBalance();
      refetchRequests();
      refetchTeam();
    }
  }, { silent: true });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const total = leaveRequestData?.length || 0;
  const paginatedData = leaveRequestData?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];
  const pendingCount = leaveRequestData?.filter((r: any) => r.status === "pending").length || 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveTypeId) newErrors.leaveTypeId = "Required";
    if (!formData.fromDate) newErrors.fromDate = "Required";
    if (!formData.toDate) newErrors.toDate = "Required";
    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = "Minimum 10 characters required";
    }

    if (formData.fromDate && moment(formData.fromDate).isBefore(moment().startOf("day"))) {
      newErrors.fromDate = "Cannot request leave for a past date";
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
      half_day_period: formData.halfDayPeriod,
    });

    setShowForm(false);
    setFormData({ leaveTypeId: "", fromDate: "", toDate: "", reason: "", halfDayPeriod: "full_day" });
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate);
      const to = moment(formData.toDate);
      let count = 0;
      let curr = from.clone();
      while (curr.isSameOrBefore(to)) {
        if (curr.day() !== 0) { // Only exclude Sundays
          if (from.isSame(to) && formData.halfDayPeriod !== "full_day") {
            count += 0.5;
          } else {
            count++;
          }
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
        <div className="flex items-center justify-center gap-2 bg-foreground/5 p-1 w-34 rounded-xl border border-border">
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
    <div className="p-4 sm:p-6 space-y-8 sm:space-y-10 animate-fade-in relative min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Leave Management</h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base flex items-center gap-2">
            Validate and monitor your operational downtime.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              refetchBalance();
              refetchRequests();
              refetchTeam();
            }}
            className="rounded-xl h-10 w-10 hover:bg-primary/10 hover:text-primary transition-all active:rotate-180 duration-500 border border-border"
            title="Refresh Ecosystem"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className={cn("flex-1 sm:w-auto", showForm ? "btn-secondary" : "btn-primary")}
          >
            {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {showForm ? "Cancel Request" : "Request Leave"}
          </Button>
        </div>
      </div>
      {/* Tab Bar */}
      <div className="flex items-center bg-muted/40 p-1 rounded-2xl border border-border/50 w-fit">
        {([
          { key: "overview", label: "Overview", icon: LayoutList },
          { key: "calendar", label: "Calendar", icon: CalendarDays },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.key
              ? "bg-background text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "calendar" && (
        <LeaveCalendar
          myLeaves={leaveRequestData || []}
          teamLeaves={teamLeavesData || []}
          holidays={companyHolidaysData || []}
        />
      )}

      {activeTab === "overview" && (
        <>
          {/* Leave Balance Grid */}
          <div className="space-y-6">
            {leaveBalanceLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="premium-card h-40 sm:h-48 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                {leaveBalanceData?.map((balance: any) => (
                  <div key={balance.id} className="premium-card card-hover group cursor-default p-4 sm:p-6 overflow-hidden">
                    <div className="flex justify-between items-start mb-4 sm:mb-8">
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-black group-hover:text-primary transition-colors italic truncate">{balance.leaveType.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">Total Grant</p>
                          <span className="text-[10px] sm:text-xs font-black text-foreground/70">{balance.totalAllocation}</span>
                        </div>
                      </div>
                      <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-border/50">
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Available</p>
                        <p className="text-2xl sm:text-3xl font-black text-emerald-500 tabular-nums">{balance.availableBalance}</p>
                      </div>
                      <div className="space-y-0.5 sm:space-y-1">
                        <p className="text-[9px] sm:text-[10px] font-black uppercase text-muted-foreground tracking-widest">Utilized</p>
                        <p className="text-2xl sm:text-3xl font-black text-foreground tabular-nums opacity-20 group-hover:opacity-100 transition-opacity">
                          {Number(balance.used) + Number(balance.pendingApproval)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                      <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                        <span className="text-muted-foreground">Allocation efficiency</span>
                        <span className="text-primary">{balance.totalAllocation > 0 ? Math.round((balance.availableBalance / balance.totalAllocation) * 100) : (balance.availableBalance > 0 ? 100 : 0)}%</span>
                      </div>
                      <div className="w-full h-1 sm:h-1.5 bg-muted rounded-full overflow-hidden shadow-inner p-px sm:p-0">
                        <div
                          className="h-full bg-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--primary),0.5)] rounded-full"
                          style={{
                            width: balance.totalAllocation > 0
                              ? `${(balance.availableBalance / balance.totalAllocation) * 100}%`
                              : (balance.availableBalance > 0 ? "100%" : "0%")
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
            {/* Left Column: History */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
                    <History className="w-4 h-4 text-primary" />
                    History Protocol
                  </h2>
                  <div className="px-6 py-2 bg-primary/5 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest border border-primary/10">
                    {pendingCount} Pending Requests
                  </div>
                </div>
                <div className="bg-card rounded-3xl sm:rounded-4xl border border-border shadow-xl overflow-hidden p-1 sm:p-2">
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
            <div className="lg:col-span-4 space-y-6 sm:space-y-8 p-6 sm:p-8 bg-card border border-border shadow-xl rounded-3xl sm:rounded-4xl min-h-1/2">
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

                  {leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1) && (
                    <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/20 space-y-3">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Critical Alert</span>
                      </div>
                      <p className="text-[11px] font-medium text-destructive/80 leading-relaxed">
                        Your <span className="font-bold underline italic">{leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1)?.leaveType.name}</span> balance is nearing critical threshold ({leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1)?.availableBalance} units remaining).
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Team on Leave Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-3">
              <Users className="w-4 h-4 text-primary" />
              Team on Leave
            </h2>
            <div className="premium-card rounded-3xl sm:rounded-4xl overflow-hidden px-1">
              {teamLeavesLoading ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : teamLeavesData.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Users className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-sm text-muted-foreground font-medium italic">No colleagues currently on leave. Maximum operational capacity.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-6 p-2 min-w-max">
                    {teamLeavesData.map((leave: any) => (
                      <div key={leave.id} className="w-64 border border-border shadow-md rounded-3xl p-6 relative group hover:border-primary/30 transition-all hover:bg-muted/30">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden border border-border/40">
                            {leave.user.profilePicture ? (
                              <Image src={leave.user.profilePicture.url as string} alt={leave.user.firstName} width={48} height={48} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-black text-sm">
                                {leave.user.firstName.charAt(0)}{leave.user.lastName ? leave.user.lastName.charAt(0) : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-foreground truncate max-w-[120px]">
                              {leave.user.firstName} {leave.user.lastName || ''}
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{leave.leaveType.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-background/50 p-2 rounded-xl border border-border">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <div className="flex items-center gap-1.5 text-[10px] font-black tracking-tight text-foreground/80">
                            <span className="tabular-nums">{moment(leave.fromDate).format("MMM DD")}</span>
                            <ArrowRight className="w-2 h-2 opacity-30" />
                            <span className="tabular-nums">{moment(leave.toDate).format("MMM DD")}</span>
                          </div>
                          <div className="ml-auto bg-primary/10 px-1.5 py-0.5 rounded-lg text-primary text-[9px] font-black">
                            {Math.round(leave.durationDays)}d
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

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
        errors={errors}
        teamLeavesData={teamLeavesData}
      />
    </div >
  );
}
