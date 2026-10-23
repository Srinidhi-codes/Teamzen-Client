"use client";

import React, { useState, useMemo, useEffect } from "react";
import moment from "moment";
import {
  Calendar,
  CalendarDays,
  Clock,
  Check,
  X,
  CheckCircle2,
  FileText,
  User,
  Building,
  ArrowRight,
  RotateCcw,
  Search,
  Zap,
  Heart,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pagination } from "@/components/common/Pagination";
import { toast } from "sonner";

export interface LeaveRequestItem {
  id: string;
  user?: {
    id: string;
    firstName: string;
    lastName?: string;
    email?: string;
    department?: { id: string; name: string } | null;
    organization?: { id: string; name: string } | null;
  } | null;
  leaveType?: {
    id: string;
    name: string;
    code?: string;
    isPaidLeave?: boolean;
  } | null;
  fromDate: string;
  toDate: string;
  durationDays?: number;
  halfDayPeriod?: string;
  reason?: string;
  status: string;
  approvedBy?: {
    id: string;
    firstName: string;
    lastName?: string;
  } | null;
  approvalComments?: string;
  approvedAt?: string;
  createdAt?: string;
}

export interface LeaveRequestMasterDetailProps {
  requests: LeaveRequestItem[];
  isLoading?: boolean;
  onRefresh?: () => void;
  mode?: "manager" | "employee";
  onApprove?: (id: string, comments: string) => Promise<void> | void;
  onReject?: (id: string, comments: string) => Promise<void> | void;
  onCancel?: (id: string) => Promise<void> | void;
  isProcessing?: boolean;
  title?: string;
  subtitle?: string;
  pageSize?: number;
}

const getLeaveTypeConfig = (name: string = "") => {
  const lower = name.toLowerCase();
  if (lower.includes("sick") || lower.includes("medical")) {
    return {
      label: "Health & Care",
      icon: Heart,
      badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
      colorClass: "text-rose-500",
    };
  }
  if (lower.includes("casual")) {
    return {
      label: "Casual Leave",
      icon: Calendar,
      badgeClass: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25",
      colorClass: "text-sky-500",
    };
  }
  if (lower.includes("annual") || lower.includes("vacation")) {
    return {
      label: "Annual Leave",
      icon: CalendarDays,
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
      colorClass: "text-emerald-500",
    };
  }
  if (lower.includes("comp") || lower.includes("earned")) {
    return {
      label: "Comp Off",
      icon: Zap,
      badgeClass: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
      colorClass: "text-purple-500",
    };
  }
  return {
    label: name || "Standard Leave",
    icon: FileText,
    badgeClass: "bg-primary/10 text-primary border-primary/25",
    colorClass: "text-primary",
  };
};

const STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    label: "Pending",
    badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
    dotClass: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
    dotClass: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
    dotClass: "bg-rose-500",
  },
  cancelled: {
    label: "Cancelled",
    badgeClass: "bg-muted text-muted-foreground border-border",
    dotClass: "bg-muted-foreground",
  },
};

export function LeaveRequestMasterDetail({
  requests = [],
  isLoading = false,
  onRefresh,
  mode = "employee",
  onApprove,
  onReject,
  onCancel,
  isProcessing = false,
  pageSize = 8,
}: LeaveRequestMasterDetailProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [leaveTypeFilter, setLeaveTypeFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [reviewerComments, setReviewerComments] = useState("");
  const [actionInProgress, setActionInProgress] = useState<"approve" | "reject" | "cancel" | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");

  // Extract unique leave types for quick filter pills
  const uniqueLeaveTypes = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    requests.forEach((r) => {
      if (r.leaveType?.id && !map.has(r.leaveType.id)) {
        map.set(r.leaveType.id, { id: r.leaveType.id, name: r.leaveType.name });
      }
    });
    return Array.from(map.values());
  }, [requests]);

  // Status counts
  const pendingCount = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === "pending").length,
    [requests]
  );
  const approvedCount = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === "approved").length,
    [requests]
  );
  const rejectedCount = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === "rejected").length,
    [requests]
  );
  const cancelledCount = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === "cancelled").length,
    [requests]
  );

  // Filter & Sort: Pending requests ALWAYS on top!
  const sortedAndFiltered = useMemo(() => {
    let list = [...requests];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const empName = `${r.user?.firstName || ""} ${r.user?.lastName || ""}`.toLowerCase();
        const empEmail = (r.user?.email || "").toLowerCase();
        const typeName = (r.leaveType?.name || "").toLowerCase();
        const reason = (r.reason || "").toLowerCase();
        return (
          empName.includes(q) ||
          empEmail.includes(q) ||
          typeName.includes(q) ||
          reason.includes(q)
        );
      });
    }

    if (statusFilter !== "all") {
      list = list.filter(
        (r) => (r.status || "").toLowerCase() === statusFilter.toLowerCase()
      );
    }

    if (leaveTypeFilter !== "all") {
      list = list.filter((r) => r.leaveType?.id === leaveTypeFilter);
    }

    // Sort: Pending items on top (rank 0), then others (rank 1), ordered by date descending
    list.sort((a, b) => {
      const aIsPending = (a.status || "").toLowerCase() === "pending" ? 0 : 1;
      const bIsPending = (b.status || "").toLowerCase() === "pending" ? 0 : 1;

      if (aIsPending !== bIsPending) {
        return aIsPending - bIsPending;
      }

      const timeA = new Date(a.createdAt || a.fromDate).getTime() || 0;
      const timeB = new Date(b.createdAt || b.fromDate).getTime() || 0;
      return timeB - timeA;
    });

    return list;
  }, [requests, searchQuery, statusFilter, leaveTypeFilter]);

  const totalPages = Math.ceil(sortedAndFiltered.length / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedAndFiltered.slice(start, start + pageSize);
  }, [sortedAndFiltered, page, pageSize]);

  // Auto-select first request or maintain valid selection
  useEffect(() => {
    if (sortedAndFiltered.length > 0) {
      if (!selectedId || !sortedAndFiltered.some((r) => r.id === selectedId)) {
        setSelectedId(sortedAndFiltered[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [sortedAndFiltered, selectedId]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, leaveTypeFilter]);

  const selected = useMemo(() => {
    return requests.find((r) => r.id === selectedId) || null;
  }, [requests, selectedId]);

  const handleApproveAction = async () => {
    if (!selected || !onApprove) return;
    try {
      setActionInProgress("approve");
      await onApprove(selected.id, reviewerComments.trim());
      setReviewerComments("");
      toast.success("Leave request approved successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to approve leave request");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectAction = async () => {
    if (!selected || !onReject) return;
    try {
      setActionInProgress("reject");
      await onReject(selected.id, reviewerComments.trim());
      setReviewerComments("");
      toast.success("Leave request rejected");
    } catch (err: any) {
      toast.error(err?.message || "Failed to reject leave request");
    } finally {
      setActionInProgress(null);
    }
  };

  const handleCancelAction = async () => {
    if (!selected || !onCancel) return;
    if (!confirm("Are you sure you want to cancel this leave request?")) return;
    try {
      setActionInProgress("cancel");
      await onCancel(selected.id);
      toast.success("Leave request cancelled");
    } catch (err: any) {
      toast.error(err?.message || "Failed to cancel leave request");
    } finally {
      setActionInProgress(null);
    }
  };

  const getHalfDayLabel = (period?: string) => {
    if (!period || period === "full_day") return null;
    if (period === "first_half") return "First Half (Morning)";
    if (period === "second_half") return "Second Half (Afternoon)";
    return period;
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
      {/* ========================================================
          TOP FILTER & SEARCH TOOLBAR (Feedback Pattern)
         ======================================================== */}
      <div className="p-3 sm:p-4 border-b border-border bg-muted/20 flex flex-col gap-3">
        {/* Row 1: Leave Type Filter Chips */}
        {uniqueLeaveTypes.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-border/40">
            <button
              type="button"
              onClick={() => setLeaveTypeFilter("all")}
              className={cn(
                "px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer",
                leaveTypeFilter === "all"
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              All Types
            </button>
            {uniqueLeaveTypes.map((type) => {
              const config = getLeaveTypeConfig(type.name);
              const Icon = config.icon;
              const isSelected = leaveTypeFilter === type.id;
              const count = requests.filter((r) => r.leaveType?.id === type.id).length;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setLeaveTypeFilter(type.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer",
                    isSelected
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-3 h-3" />
                  <span>{type.name}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums",
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-muted-foreground/15 text-muted-foreground"
                    )}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Row 2: Search Input & Status Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            {onRefresh && (
              <button
                type="button"
                onClick={onRefresh}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                title="Refresh requests"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
              <input
                type="text"
                placeholder={
                  mode === "employee"
                    ? "Search requests by leave type or reason..."
                    : "Search requests by employee, type, or reason..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex h-9 w-full rounded-xl border border-input bg-background pl-9 pr-9 py-2 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer z-10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-medium text-muted-foreground mr-1 shrink-0">
              Status:
            </span>
            <div className="flex items-center gap-1 p-0.5 bg-background rounded-xl border border-border/60 shrink-0">
              {[
                { id: "all", label: "All", count: requests.length },
                { id: "pending", label: "Pending", count: pendingCount, highlight: true },
                { id: "approved", label: "Approved", count: approvedCount },
                { id: "rejected", label: "Rejected", count: rejectedCount },
                { id: "cancelled", label: "Cancelled", count: cancelledCount },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStatusFilter(s.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap",
                    statusFilter === s.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{s.label}</span>
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.2 text-[10px] font-semibold tabular-nums leading-none",
                      statusFilter === s.id
                        ? "bg-white/20 text-white"
                        : s.highlight && s.count > 0
                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {s.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          MASTER-DETAIL SPLIT PANE
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[580px] h-[calc(100vh-300px)] min-h-[640px] divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* ── LEFT COLUMN: MASTER LIST ────────────────────────── */}
        <div
          className={cn(
            "overflow-y-auto divide-y divide-border/60 bg-muted/[0.08] custom-scrollbar flex flex-col",
            mobileView === "detail" ? "hidden lg:flex" : "flex"
          )}
        >
          {isLoading && (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="h-28 rounded-xl bg-muted/40 animate-pulse border border-border/50"
                />
              ))}
            </div>
          )}

          {!isLoading && sortedAndFiltered.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  {searchQuery || statusFilter !== "all" || leaveTypeFilter !== "all"
                    ? "No matching requests"
                    : "No leave requests found"}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px] mx-auto">
                  {searchQuery || statusFilter !== "all" || leaveTypeFilter !== "all"
                    ? "Try clearing filters to view all entries."
                    : "Applications will be listed here."}
                </p>
              </div>
              {(searchQuery || statusFilter !== "all" || leaveTypeFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setLeaveTypeFilter("all");
                  }}
                  className="h-8 text-xs cursor-pointer"
                >
                  Reset Filters
                </Button>
              )}
            </div>
          )}

          {!isLoading &&
            paginatedList.map((item) => {
              const isSelected = selected?.id === item.id;
              const typeConfig = getLeaveTypeConfig(item.leaveType?.name);
              const TypeIcon = typeConfig.icon;
              const statusCfg =
                STATUS_CONFIG[item.status?.toLowerCase()] || STATUS_CONFIG.pending;
              const isPending = item.status?.toLowerCase() === "pending";
              const authorName =
                `${item.user?.firstName || ""} ${item.user?.lastName || ""}`.trim() ||
                "Employee";

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(item.id);
                    setMobileView("detail");
                  }}
                  className={cn(
                    "w-full text-left p-4 transition-all duration-150 cursor-pointer flex flex-col gap-2 hover:bg-muted/30 border-l-4",
                    isSelected
                      ? "bg-card border-l-primary dark:border-l-[#38ABB1] shadow-xs"
                      : "border-l-transparent bg-transparent"
                  )}
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border",
                          typeConfig.badgeClass
                        )}
                      >
                        <TypeIcon className="w-3 h-3" />
                        <span>{item.leaveType?.name || "Leave"}</span>
                      </span>

                      {item.durationDays && (
                        <span className="inline-flex items-center gap-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground border border-border">
                          {item.durationDays}d
                        </span>
                      )}
                    </div>

                    <span
                      className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        statusCfg.badgeClass
                      )}
                    >
                      <span className={cn("w-1.5 h-1.5 rounded-full", statusCfg.dotClass)} />
                      <span>{statusCfg.label}</span>
                    </span>
                  </div>

                  {/* Subject / User */}
                  <div>
                    {mode !== "employee" && (
                      <h4
                        className={cn(
                          "text-sm font-bold tracking-tight transition-colors line-clamp-1",
                          isSelected
                            ? "text-primary dark:text-[#38ABB1]"
                            : "text-foreground"
                        )}
                      >
                        {authorName}
                      </h4>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-foreground/80 font-medium mt-0.5">
                      <span>{moment(item.fromDate).format("DD MMM")}</span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground" />
                      <span>{moment(item.toDate).format("DD MMM, YYYY")}</span>
                      {item.halfDayPeriod && item.halfDayPeriod !== "full_day" && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          (Half Day)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reason excerpt */}
                  <p className="text-xs text-muted-foreground line-clamp-2 italic leading-relaxed">
                    "{item.reason || "No reason provided"}"
                  </p>

                  {/* Bottom Footer */}
                  <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/40">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="w-3 h-3 text-muted-foreground/70" />
                      {moment(item.createdAt || item.fromDate).fromNow()}
                    </span>

                    {isPending ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                        <Clock className="w-2.5 h-2.5" />
                        Awaiting Review
                      </span>
                    ) : item.approvedBy ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                        <Check className="w-2.5 h-2.5" />
                        Reviewed
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}

          {totalPages > 1 && (
            <div className="p-2 border-t border-border/80 bg-card/60 shrink-0 mt-auto">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                total={sortedAndFiltered.length}
                pageSize={pageSize}
                label="requests"
              />
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: DETAIL VIEW & WORKFLOW ────────────── */}
        <div
          className={cn(
            "overflow-y-auto bg-card p-5 sm:p-6 flex flex-col justify-between custom-scrollbar",
            mobileView === "list" ? "hidden lg:flex" : "flex"
          )}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden pb-3 border-b border-border mb-4">
            <button
              type="button"
              onClick={() => setMobileView("list")}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to all requests</span>
            </button>
          </div>

          {!selected ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border flex items-center justify-center text-primary dark:text-[#38ABB1]">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Select a Leave Request
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Choose any request from the list to view full dates, reason, approval progress, and review notes.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header Badges */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => {
                    const cfg = getLeaveTypeConfig(selected.leaveType?.name);
                    const Icon = cfg.icon;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border",
                          cfg.badgeClass
                        )}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{selected.leaveType?.name || "Leave"}</span>
                      </span>
                    );
                  })()}

                  {(() => {
                    const stat =
                      STATUS_CONFIG[selected.status?.toLowerCase()] ||
                      STATUS_CONFIG.pending;
                    return (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                          stat.badgeClass
                        )}
                      >
                        <span className={cn("w-2 h-2 rounded-full", stat.dotClass)} />
                        <span>{stat.label}</span>
                      </span>
                    );
                  })()}

                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted/60 text-muted-foreground border border-border">
                    <Clock className="w-3 h-3 text-primary" />
                    <span>{selected.durationDays || 1} Day(s)</span>
                  </span>

                  {getHalfDayLabel(selected.halfDayPeriod) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                      <span>{getHalfDayLabel(selected.halfDayPeriod)}</span>
                    </span>
                  )}
                </div>

                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {moment(selected.createdAt || selected.fromDate).format(
                      "MMM D, YYYY · h:mm A"
                    )}
                  </span>
                </div>
              </div>

              {/* Title & Submitter */}
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                  {selected.leaveType?.name || "Leave"} Request
                </h2>
                <div className="flex items-center gap-2.5 text-xs text-muted-foreground flex-wrap">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                    {(selected.user?.firstName || "E").charAt(0).toUpperCase()}
                  </div>
                  <span>
                    {mode === "employee" ? (
                      <>
                        Requested by <strong className="text-foreground">You</strong>
                      </>
                    ) : (
                      <>
                        Submitted by{" "}
                        <strong className="text-foreground">
                          {selected.user?.firstName} {selected.user?.lastName || ""}
                        </strong>
                      </>
                    )}
                  </span>
                  {selected.user?.email && (
                    <span className="text-muted-foreground font-mono">
                      ({selected.user.email})
                    </span>
                  )}
                </div>
              </div>

              {/* Resolution Stepper with Connected Progress Line */}
              <div className="rounded-2xl bg-muted/30 border border-border/70 p-4 sm:p-5 space-y-4">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Workflow & Resolution Progress
                </span>

                <div className="relative pt-1 pb-0.5">
                  {/* Connecting Progress Line Track */}
                  <div
                    className="absolute top-[18px] left-[16.67%] right-[16.67%] h-1 -translate-y-1/2 z-0"
                    aria-hidden="true"
                  >
                    <div className="h-full w-full bg-muted-foreground/20 dark:bg-muted/60 rounded-full overflow-hidden flex">
                      {/* Segment 1: Step 1 (Submitted) -> Step 2 (Reviewing) */}
                      <div
                        className={cn(
                          "h-full w-1/2 transition-all duration-500",
                          selected.status?.toLowerCase() === "approved" ||
                            selected.status?.toLowerCase() === "rejected" ||
                            selected.approvedBy
                            ? "bg-emerald-500"
                            : selected.status?.toLowerCase() === "pending"
                            ? "bg-gradient-to-r from-emerald-500 to-amber-500"
                            : "bg-muted-foreground/20"
                        )}
                      />
                      {/* Segment 2: Step 2 (Reviewing) -> Step 3 (Resolution) */}
                      <div
                        className={cn(
                          "h-full w-1/2 transition-all duration-500",
                          selected.status?.toLowerCase() === "approved"
                            ? "bg-emerald-500"
                            : selected.status?.toLowerCase() === "rejected"
                            ? "bg-rose-500"
                            : selected.status?.toLowerCase() === "cancelled"
                            ? "bg-slate-500"
                            : "bg-transparent"
                        )}
                      />
                    </div>
                  </div>

                  {/* Stepper Nodes */}
                  <div className="relative z-10 grid grid-cols-3 gap-2 text-center text-xs">
                    {/* Step 1: Submitted */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs ring-4 ring-card">
                        <Check className="w-4 h-4" />
                      </div>
                      <span className="font-semibold text-foreground text-[11px]">
                        1. Submitted
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {moment(selected.createdAt || selected.fromDate).format("MMM D")}
                      </span>
                    </div>

                    {/* Step 2: Reviewing */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ring-4 ring-card",
                          selected.status?.toLowerCase() === "approved" ||
                            selected.status?.toLowerCase() === "rejected" ||
                            selected.approvedBy
                            ? "bg-emerald-500 text-white shadow-xs"
                            : selected.status?.toLowerCase() === "pending"
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {selected.status?.toLowerCase() === "approved" ||
                        selected.status?.toLowerCase() === "rejected" ||
                        selected.approvedBy ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground text-[11px]">
                        2. Reviewing
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {selected.approvedBy
                          ? `By ${selected.approvedBy.firstName || "Manager"}`
                          : selected.status?.toLowerCase() === "pending"
                          ? "In Review Queue"
                          : "Processed"}
                      </span>
                    </div>

                    {/* Step 3: Resolution */}
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ring-4 ring-card",
                          selected.status?.toLowerCase() === "approved"
                            ? "bg-emerald-500 text-white shadow-xs"
                            : selected.status?.toLowerCase() === "rejected"
                            ? "bg-rose-500 text-white shadow-xs"
                            : selected.status?.toLowerCase() === "cancelled"
                            ? "bg-slate-500 text-white shadow-xs"
                            : "bg-muted text-muted-foreground border border-border"
                        )}
                      >
                        {selected.status?.toLowerCase() === "approved" ? (
                          <Check className="w-4 h-4" />
                        ) : selected.status?.toLowerCase() === "rejected" ? (
                          <X className="w-4 h-4" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground text-[11px]">
                        3. Resolution
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {selected.status?.toLowerCase() === "approved"
                          ? "Approved"
                          : selected.status?.toLowerCase() === "rejected"
                          ? "Rejected"
                          : selected.status?.toLowerCase() === "cancelled"
                          ? "Cancelled"
                          : "Pending Action"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Absence Details: Schedule & Reason */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                {/* 1. Schedule & Duration Card */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Absence Schedule
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-bold text-primary">
                        <Clock className="w-3.5 h-3.5" />
                        {selected.durationDays || 1} Day(s)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">From</span>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {moment(selected.fromDate).format("ddd, MMM D, YYYY")}
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">To</span>
                        <p className="text-sm font-bold text-foreground mt-0.5">
                          {moment(selected.toDate).format("ddd, MMM D, YYYY")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-3 border-t border-border/40">
                    <span>
                      Expected back:{" "}
                      <strong className="text-foreground">
                        {moment(selected.toDate).add(1, "day").format("dddd, MMM D, YYYY")}
                      </strong>
                    </span>
                    {selected.leaveType?.isPaidLeave && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        ✓ Paid Leave
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Reason for Absence Card */}
                <div className="rounded-2xl border border-border/80 bg-muted/20 p-4 sm:p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                        Reason for Absence
                      </span>
                      {selected.halfDayPeriod && (
                        <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                          {getHalfDayLabel(selected.halfDayPeriod)}
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-foreground leading-relaxed pt-1">
                      {selected.reason || "No written reason provided."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/40">
                    <span>
                      Category: <strong className="text-foreground">{selected.leaveType?.name || "General Leave"}</strong>
                    </span>
                    {selected.user?.firstName && (
                      <span className="text-[11px] text-muted-foreground">
                        Applied by {selected.user.firstName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Reviewer Feedback Notes */}
              {selected.approvalComments && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reviewer Feedback & Notes
                    </span>
                    {selected.approvedAt && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {moment(selected.approvedAt).format("MMM D, YYYY · h:mm A")}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed font-mono bg-background/50 p-2.5 rounded-lg border border-primary/10">
                    {selected.approvalComments}
                  </p>
                  {selected.approvedBy && (
                    <p className="text-[11px] text-muted-foreground">
                      Processed by:{" "}
                      <strong className="text-foreground">
                        {selected.approvedBy.firstName} {selected.approvedBy.lastName || ""}
                      </strong>
                    </p>
                  )}
                </div>
              )}

              {/* Actions Footer */}
              <div className="pt-4 border-t border-border/80">
                {mode === "manager" && (
                  <>
                    {selected.status?.toLowerCase() === "pending" ? (
                      <div className="space-y-3.5 bg-muted/20 p-4 rounded-2xl border border-border">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
                            Manager Actions & Approval
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Provide comments or finalize decision
                          </span>
                        </div>

                        <Textarea
                          value={reviewerComments}
                          onChange={(e) => setReviewerComments(e.target.value)}
                          rows={3}
                          placeholder="Add approval comments or feedback for your team member…"
                          className="text-xs rounded-xl bg-background resize-none"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={actionInProgress !== null || isProcessing}
                            onClick={handleRejectAction}
                            className="h-9 px-4 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30 border-destructive/20 cursor-pointer"
                          >
                            {actionInProgress === "reject" ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                <span>Rejecting…</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5 mr-1" />
                                <span>Reject</span>
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            disabled={actionInProgress !== null || isProcessing}
                            onClick={handleApproveAction}
                            className="h-9 px-5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
                          >
                            {actionInProgress === "approve" ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                                <span>Approving…</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Approve</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/30 p-3.5 flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>
                            This leave request is{" "}
                            <strong className="text-foreground capitalize">
                              {selected.status}
                            </strong>
                            .
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {mode === "employee" && (
                  <>
                    {selected.status?.toLowerCase() === "pending" ? (
                      <div className="flex items-center justify-between bg-muted/20 p-4 rounded-2xl border border-border">
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-foreground">
                            Withdraw Application
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            You can cancel this request while it is still pending review.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionInProgress !== null || isProcessing}
                          onClick={handleCancelAction}
                          className="h-8 px-4 text-xs font-semibold text-destructive hover:bg-destructive/10 hover:border-destructive/30 border-destructive/20 cursor-pointer"
                        >
                          {actionInProgress === "cancel" ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                              <span>Cancelling…</span>
                            </>
                          ) : (
                            <span>Cancel Request</span>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border bg-muted/30 p-3.5 text-xs text-muted-foreground">
                        Application status:{" "}
                        <strong className="text-foreground capitalize">
                          {selected.status}
                        </strong>
                        .
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
