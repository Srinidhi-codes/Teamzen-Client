"use client";

import { useGraphQLCancelLeaveRequest, useGraphQLCreateLeaveRequest, useGraphQlLeaveBalance, useGraphQLLeaveRequests, useGraphQLTeamLeaves, useGraphQLCompanyHolidays } from "@/lib/graphql/leaves/leavesHook";
import { useStore } from "@/lib/store/useStore";
import { useEffect, useState } from "react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { Card } from "@/components/common/Card";
import moment from "moment";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Pagination } from "@/components/common/Pagination";
import { LeaveRequestModal } from "@/components/leaves/LeaveRequestModal";
import { LeaveReviewModal } from "@/components/leaves/LeaveReviewModal";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { EmptyImages } from "@/lib/brand-images";
import Image from "next/image";
import { PageHeader } from "@/components/common/PageHeader";
import { toast } from "sonner";

const getLeaveTypeStyle = (name: string = "") => {
  const lower = name.toLowerCase();
  let label = "Standard Policy";
  if (lower.includes("casual") || lower.includes("vacation") || lower.includes("annual")) {
    label = "Annual Cycle";
  } else if (lower.includes("sick") || lower.includes("medical")) {
    label = "Health & Care";
  } else if (lower.includes("complementary") || lower.includes("comp") || lower.includes("earned")) {
    label = "Comp Off";
  }
  return {
    gradient: "from-primary/10 via-primary/5 to-transparent",
    accentBorder: "hover:border-primary/40",
    progressBg: "bg-primary",
    tagBg: "bg-primary/10 text-primary border-primary/20",
    label,
  };
};

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
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const searchParams = useSearchParams();

  useEffect(() => {
    const action = searchParams.get("action");
    const tab = searchParams.get("tab");
    if (action === "apply") {
      setShowForm(true);
      setSubmissionError(null);
    }
    if (tab === "calendar") {
      setActiveTab("calendar");
    } else if (tab === "overview") {
      setActiveTab("overview");
    }
  }, [searchParams]);

  const handleFormDataChange = (newData: any) => {
    setFormData(newData);
    if (submissionError) setSubmissionError(null);
    if (Object.keys(errors).length > 0) setErrors({});
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSubmissionError(null);
    setErrors({});
  };

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

  const orgWeekendDays: number[] = user?.organization?.weekendDays?.length
    ? user.organization.weekendDays
    : [5, 6];

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

      // Check if the requested range falls entirely on organization weekend days
      const from = moment(formData.fromDate).startOf("day");
      const to = moment(formData.toDate).startOf("day");
      if (to.isSameOrAfter(from)) {
        const weekendSet = new Set<number>(orgWeekendDays);
        let allWeekend = true;
        let c = from.clone();
        while (c.isSameOrBefore(to)) {
          if (!weekendSet.has(c.isoWeekday() - 1)) {
            allWeekend = false;
            break;
          }
          c.add(1, "days");
        }
        if (allWeekend) {
          newErrors.fromDate = "Falls on weekend";
          newErrors.toDate = "Falls on weekend";
          setSubmissionError(
            "The selected dates fall entirely on your organization's non-working weekend days (Saturday & Sunday). Leave cannot be requested for weekly offs."
          );
        }
      }
    }

    // 1. Balance soft error & hard validation
    const days = calculateDays();
    const selectedBalance = leaveBalanceData?.find(
      (b: any) => String(b.leaveType?.id) === String(formData.leaveTypeId)
    );
    const available = selectedBalance ? Number(selectedBalance.availableBalance ?? 0) : null;
    if (selectedBalance && days > 0 && available !== null && days > available) {
      newErrors.leaveTypeId = `Exceeds available balance (${available} days available)`;
      setSubmissionError(
        `Insufficient leave balance: You are requesting ${days} day(s), but only have ${available} day(s) available for ${selectedBalance.leaveType?.name || "this category"}.`
      );
    }

    // 2. Check duplicate / overlapping existing requests by the current user
    if (formData.fromDate && formData.toDate && leaveRequestData?.length) {
      const start = moment(formData.fromDate).startOf("day");
      const end = moment(formData.toDate).startOf("day");
      const conflict = leaveRequestData.find((req: any) => {
        const s = (req.status || "").toLowerCase();
        if (s !== "pending" && s !== "approved") return false;
        const reqStart = moment(req.fromDate).startOf("day");
        const reqEnd = moment(req.toDate).startOf("day");
        return reqStart.isSameOrBefore(end) && reqEnd.isSameOrAfter(start);
      });

      if (conflict) {
        newErrors.fromDate = "Overlaps with existing leave";
        newErrors.toDate = "Overlaps with existing leave";
        setSubmissionError(
          `You already have a ${conflict.status} request for ${conflict.leaveType?.name || "Leave"} from ${moment(conflict.fromDate).format("MMM DD, YYYY")} to ${moment(conflict.toDate).format("MMM DD, YYYY")}. Overlapping requests cannot be submitted.`
        );
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmissionError(null);
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      await createLeaveRequest({
        leave_type_id: formData.leaveTypeId,
        start_date: formData.fromDate,
        end_date: formData.toDate,
        reason: formData.reason.trim(),
        half_day_period: formData.halfDayPeriod,
      });

      toast.success("Leave request submitted successfully");
      setShowForm(false);
      setFormData({ leaveTypeId: "", fromDate: "", toDate: "", reason: "", halfDayPeriod: "full_day" });
      setErrors({});
      setSubmissionError(null);
      refetchRequests();
      refetchBalance();
      refetchTeam();
    } catch (err: any) {
      console.error("Failed to submit leave request:", err);
      const errorMsg =
        err?.graphQLErrors?.[0]?.message ||
        err?.networkError?.result?.errors?.[0]?.message ||
        err?.message ||
        "Failed to submit leave request";
      setSubmissionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate);
      const to = moment(formData.toDate);
      if (to.isBefore(from)) return 0;

      const holidayDates = new Set(
        (companyHolidaysData || [])
          .filter((h: any) => !h.isOptional)
          .map((h: any) => moment(h.holidayDate).format("YYYY-MM-DD"))
      );

      const weekendSet = new Set<number>(orgWeekendDays);

      let count = 0;
      let curr = from.clone();
      while (curr.isSameOrBefore(to)) {
        const dateStr = curr.format("YYYY-MM-DD");
        const pyWeekday = curr.isoWeekday() - 1; // 0=Mon ... 5=Sat, 6=Sun
        // Exclude organization weekend days and company holidays from billable working duration
        if (!weekendSet.has(pyWeekday) && !holidayDates.has(dateStr)) {
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
      label: "Actions",
      render: (_: any, row: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="group relative h-8 w-20 overflow-hidden text-xs font-medium border-border/80 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
            onClick={() => setViewDetails(row)}
            title="View details"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-2">View</span>
            <ArrowRight className="absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 text-primary" />
          </Button>
          {row.status === "pending" && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-2.5 text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleCancelLeave(row.id);
              }}
              disabled={cancelLeaveRequestLoading}
              title="Cancel request"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in relative min-h-screen pb-20">
      <PageHeader
        eyebrow="Time Off"
        title="Leave management"
        description="View your balance, request time off, and track leave history."
        actions={
          <>
            <Button
              onClick={() => setShowForm(!showForm)}
              className={cn("h-9 flex-1 sm:flex-none rounded-md", showForm ? "btn-secondary" : "btn-primary")}
            >
              {showForm ? <X className="w-4 h-4 mr-2" /> : null}
              {showForm ? "Cancel request" : "Request leave"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                refetchBalance();
                refetchRequests();
                refetchTeam();
              }}
              className="h-9 w-9 shrink-0 rounded-md border border-border"
              title="Refresh"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </>
        }
      />
      <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/80 w-full sm:w-fit">
        {([
          { key: "overview", label: "Overview", icon: LayoutList },
          { key: "calendar", label: "Calendar", icon: CalendarDays },
        ] as const).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex flex-1 sm:flex-none items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                active
                  ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl border border-border h-48 animate-pulse bg-muted/40" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
                {leaveBalanceData?.map((balance: any) => {
                  const theme = getLeaveTypeStyle(balance.leaveType?.name);
                  const total = Number(balance.totalAllocation) || 0;
                  const available = Number(balance.availableBalance) || 0;
                  const used = Number(balance.used) || 0;
                  const pending = Number(balance.pendingApproval) || 0;
                  const remainingPercent = total > 0
                    ? Math.round((available / total) * 100)
                    : (available > 0 ? 100 : 0);

                  return (
                    <div
                      key={balance.id}
                      className={cn(
                        "group relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col justify-between",
                        theme.accentBorder
                      )}
                    >
                      {/* Ambient background glow on top-right */}
                      <div
                        className={cn(
                          "absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl pointer-events-none opacity-40 transition-opacity group-hover:opacity-75 bg-gradient-to-br",
                          theme.gradient
                        )}
                      />

                      {/* Header: Title + Tag */}
                      <div className="space-y-1 relative z-10">
                        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight truncate">
                          {balance.leaveType.name}
                        </h3>
                        <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border tracking-wide uppercase", theme.tagBg)}>
                          {theme.label}
                        </span>
                      </div>

                      {/* Hero Section: Big Available Days */}
                      <div className="mt-4 relative z-10">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground tabular-nums">
                            {available}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                            / {total} days left
                          </span>
                        </div>
                      </div>

                      {/* Micro-metrics strip */}
                      <div className="mt-4 grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 border border-border/70 relative z-10">
                        <div className="space-y-0.5 text-center sm:text-left">
                          <p className="text-[11px] font-medium text-muted-foreground">Allocated</p>
                          <p className="text-sm font-bold text-foreground tabular-nums">{total}d</p>
                        </div>
                        <div className="space-y-0.5 text-center sm:text-left border-x border-border/70 px-2">
                          <p className="text-[11px] font-medium text-muted-foreground">Used</p>
                          <p className="text-sm font-bold text-foreground tabular-nums">{used}d</p>
                        </div>
                        <div className="space-y-0.5 text-center sm:text-left pl-1">
                          <p className="text-[11px] font-medium text-muted-foreground">In Review</p>
                          <p className={cn("text-sm font-bold tabular-nums", pending > 0 ? "text-amber-500" : "text-foreground")}>
                            {pending}d
                          </p>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mt-4 space-y-2 relative z-10">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground font-medium">
                            {used} day{used !== 1 ? 's' : ''} consumed
                          </span>
                          <span className="font-semibold text-foreground tabular-nums">
                            {remainingPercent}% available
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden p-0.5 border border-border/40">
                          <div
                            className={cn("h-full rounded-full transition-all duration-500", theme.progressBg)}
                            style={{ width: `${Math.min(100, Math.max(0, remainingPercent))}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Quota info + Quick Action */}
                      <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between relative z-10">
                        <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                          {Number(balance.carriedForward) > 0 ? `+${balance.carriedForward}d carried forward` : "Standard quota"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev: any) => ({ ...prev, leaveTypeId: String(balance.leaveType.id) }));
                            setShowForm(true);
                          }}
                          className="inline-flex items-end gap-1 text-xs font-semibold text-primary cursor-pointer hover:translate-x-0.5 transition-transform duration-300"
                        >
                          Apply
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10">
            {/* Left Column: History */}
            <div className="lg:col-span-8 space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                      My Requests
                    </h2>
                    <div className="px-3 py-1 bg-primary/5 text-primary rounded-md text-xs font-medium border border-primary/10 whitespace-nowrap shrink-0">
                      {pendingCount} pending
                    </div>
                  </div>
                  <div className="h-px w-full bg-border" />
                </div>
                
                {/* Desktop View */}
                <div className="hidden sm:block">
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

                {/* Mobile View */}
                <div className="block sm:hidden space-y-3">
                  {leaveRequestLoading ? (
                     <div className="space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-xl border border-border bg-muted/50 animate-pulse" />)}
                     </div>
                  ) : paginatedData.length === 0 ? (
                     <div className="text-center py-8 text-muted-foreground text-sm border border-border rounded-xl bg-card">No requests found</div>
                  ) : (
                     <>
                        <div className="space-y-3">
                          {paginatedData.map((row: any) => (
                            <div 
                              key={row.id} 
                              onClick={() => setViewDetails(row)}
                              className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 active:bg-muted/50 transition-colors"
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="space-y-1">
                                  <h4 className="font-medium text-sm text-foreground">{row.leaveType?.name}</h4>
                                  <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <span>{moment(row.fromDate).format("MMM DD")}</span>
                                    <ArrowRight className="w-3 h-3" />
                                    <span>{moment(row.toDate).format("MMM DD")}</span>
                                  </div>
                                </div>
                                <Badge variant={getStatusVariant(row.status) as any} className="capitalize text-[10px] px-2 py-0.5">
                                  {row.status}
                                </Badge>
                              </div>
                              <div className="flex justify-between items-center pt-3 border-t border-border/60">
                                <span className="text-xs text-muted-foreground font-medium">{row.durationDays} day{row.durationDays !== 1 ? 's' : ''}</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="group relative h-7 w-16 overflow-hidden text-[11px] font-medium border-border/80 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewDetails(row);
                                    }}
                                  >
                                    <span className="transition-transform duration-200 group-hover:-translate-x-1.5">View</span>
                                    <ArrowRight className="absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:opacity-100 text-primary" />
                                  </Button>
                                  {row.status === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 px-2 text-[11px] font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all cursor-pointer"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancelLeave(row.id);
                                      }}
                                      disabled={cancelLeaveRequestLoading}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {total > pageSize && (
                          <div className="pt-2">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={Math.ceil(total / pageSize)}
                              onPageChange={setCurrentPage}
                              total={total}
                              pageSize={pageSize}
                              label="requests"
                            />
                          </div>
                        )}
                     </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Insights */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="p-5 bg-card border border-border rounded-xl h-fit" title="Summary">
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                  Team status
                </h2>
              </div>
              <div className="h-px w-full bg-border" />
            </div>
            {teamLeavesLoading ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <div className="flex gap-4 p-4 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-64 h-32 border border-border rounded-xl bg-muted/50 animate-pulse shrink-0" />
                  ))}
                </div>
              </div>
            ) : teamLeavesData.length === 0 ? (
              <EmptyState
                src={EmptyImages.leaves}
                title="All team members are present"
                description="Everyone is currently at work and accounted for. Any scheduled team time-offs or absences will appear here."
                size="wide"
              />
            ) : (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
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
              </div>
            )}
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
        onClose={handleCloseForm}
        formData={formData}
        setFormData={handleFormDataChange}
        onSubmit={handleSubmit}
        leaveBalanceData={leaveBalanceData}
        isLoading={createLeaveRequestLoading || isSubmitting}
        calculateDays={calculateDays}
        errors={errors}
        teamLeavesData={teamLeavesData}
        myLeavesData={leaveRequestData}
        serverError={submissionError}
      />
    </div>
  );
}
