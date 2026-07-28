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
  LayoutList,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, Column } from "@/components/common/DataTable";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { LeaveReviewModal } from "@/components/leaves/LeaveReviewModal";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

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

  const handleCancelLeave = async (requestId: string) => {
    try {
      await cancelLeaveRequest(requestId);
      toast.success("Leave request cancelled");
      refetchTeam();
    } catch {
      toast.error("Failed to cancel leave request");
    }
  };

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
        <span className="font-medium text-sm">{name}</span>
      )
    },
    {
      key: "fromDate",
      label: "Duration",
      render: (_: any, row: any) => (
        <div className="flex items-center justify-center gap-2 p-1 w-34">
          <span className="font-bold tabular-nums">{moment(row.fromDate).format("MMM DD")}</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-bold tabular-nums">{moment(row.toDate).format("MMM DD")}</span>
        </div>
      )
    },
    {
      key: "durationDays",
      label: "Days",
      render: (val: number) => <span className="font-medium tabular-nums text-sm">{Number(val)}</span>
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
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setViewDetails(row)}
            title="View details"
            aria-label="View details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.status === "pending" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelLeave(row.id);
              }}
              disabled={cancelLeaveRequestLoading}
              title="Cancel request"
              aria-label="Cancel request"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Leave management"
        description="View your balance, request time off, and track leave history."
        actions={
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                refetchBalance();
                refetchRequests();
                refetchTeam();
              }}
              className="h-9 w-9 rounded-md border border-border"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className={cn("h-9 rounded-md", showForm ? "btn-secondary" : "btn-primary")}
            >
              {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
              {showForm ? "Cancel request" : "Request leave"}
            </Button>
          </>
        }
      />
      {/* Tab Bar */}
      <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border w-fit">
        {([
          { key: "overview", label: "Overview", icon: LayoutList },
          { key: "calendar", label: "Calendar", icon: CalendarDays },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key
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
                  <div key={i} className="rounded-xl border border-border h-40 animate-pulse bg-muted/50" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {leaveBalanceData?.map((balance: any) => (
                  <div key={balance.id} className="rounded-xl border border-border bg-card p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-base font-semibold truncate">{balance.leaveType.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Total allocation</span>
                          <span className="font-medium text-foreground">{balance.totalAllocation}</span>
                        </div>
                      </div>
                      <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border">
                      <div className="space-y-0.5">
                        <p className="text-sm text-muted-foreground">Available</p>
                        <p className="text-2xl font-semibold text-emerald-600 tabular-nums">{balance.availableBalance}</p>
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm text-muted-foreground">Used</p>
                        <p className="text-2xl font-semibold text-foreground tabular-nums">
                          {Number(balance.used) + Number(balance.pendingApproval)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Remaining</span>
                        <span className="font-medium text-primary">{balance.totalAllocation > 0 ? Math.round((balance.availableBalance / balance.totalAllocation) * 100) : (balance.availableBalance > 0 ? 100 : 0)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-500 rounded-full"
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
                  <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Leave history
                  </h2>
                  <div className="px-3 py-1 bg-primary/5 text-primary rounded-md text-xs font-medium border border-primary/10">
                    {pendingCount} pending
                  </div>
                </div>
                <DataTable
                  columns={columns}
                  data={paginatedData}
                  isLoading={leaveRequestLoading}
                  total={total}
                  currentPage={currentPage}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onRowClick={setViewDetails}
                  paginationLabel="requests"
                />
              </div>
            </div>

            {/* Right Column: Insights */}
            <div className="lg:col-span-4 space-y-6 p-5 bg-card border border-border rounded-xl h-fit">
              <Card title="Summary">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Annual usage</span>
                      <span className="font-medium text-primary">
                        {Math.round(
                          ((leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.used), 0) || 0) /
                            (leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.totalEntitled), 0) || 1)) * 100
                        )}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{
                          width: `${Math.round(
                            ((leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.used), 0) || 0) /
                              (leaveBalanceData?.reduce((acc: number, b: any) => acc + Number(b.totalEntitled), 0) || 1)) * 100
                          )}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        label: "Approval rate",
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
                        label: "Pending requests",
                        val: `${leaveRequestData?.filter((r: any) => r.status === "pending").length || 0}`,
                        icon: Clock,
                        color: "text-orange-500"
                      },
                      {
                        label: "Rejected requests",
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
                        <span className="text-sm font-medium tabular-nums">{insight.val}</span>
                      </div>
                    ))}
                  </div>

                  {leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1) && (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
                      <div className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Low leave balance</span>
                      </div>
                      <p className="text-sm text-destructive/80 leading-relaxed">
                        Your {leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1)?.leaveType.name} balance is running low ({leaveBalanceData?.find((b: any) => b.availableBalance <= 2 && b.availableBalance >= 1)?.availableBalance} days remaining).
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Team on Leave Section */}
          <div className="space-y-6">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team on leave
            </h2>
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {teamLeavesLoading ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner />
                </div>
              ) : teamLeavesData.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <Users className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground">No colleagues are currently on leave.</p>
                </div>
              ) : (
                <div className="overflow-x-auto no-scrollbar">
                  <div className="flex gap-4 p-4 min-w-max">
                    {teamLeavesData.map((leave: any) => (
                      <div key={leave.id} className="w-64 border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                            {leave.user.profilePicture ? (
                              <Image src={leave.user.profilePicture.url as string} alt={leave.user.firstName} width={40} height={40} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-primary font-medium text-sm">
                                {leave.user.firstName.charAt(0)}{leave.user.lastName ? leave.user.lastName.charAt(0) : ''}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                              {leave.user.firstName} {leave.user.lastName || ''}
                            </span>
                            <span className="text-xs text-muted-foreground">{leave.leaveType.name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                            <span className="tabular-nums">{moment(leave.fromDate).format("MMM DD")}</span>
                            <ArrowRight className="w-2 h-2 opacity-40" />
                            <span className="tabular-nums">{moment(leave.toDate).format("MMM DD")}</span>
                          </div>
                          <div className="ml-auto bg-primary/10 px-1.5 py-0.5 rounded-md text-primary text-[11px] font-medium">
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
