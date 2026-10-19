"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import moment from "moment";
import {
  Target,
  ClipboardCheck,
  Users,
  Send,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
  Briefcase,
  User,
  Inbox,
  Check,
  Building2,
  ShieldCheck,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store/useStore";
import {
  useGraphQLPerformanceGoals,
  useGraphQLPerformanceReviews,
  useGraphQLUpdateGoal,
  useGraphQLUpdatePerformanceReview,
} from "@/lib/graphql/performance/performanceHook";
import type {
  PerformanceGoal,
  PerformanceReview,
} from "@/lib/graphql/performance/types";
import { PlanFeatureGate } from "@/components/common/PlanFeatureGate";

const GOAL_STATUSES = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "at_risk", label: "At risk" },
  { value: "completed", label: "Completed" },
];

function goalStatusVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "completed":
      return "success";
    case "at_risk":
      return "warning";
    case "in_progress":
      return "info";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
}

function reviewStatusVariant(
  status: string
): "success" | "warning" | "danger" | "info" | "default" {
  switch (status) {
    case "completed":
      return "success";
    case "self_submitted":
      return "info";
    case "pending":
      return "warning";
    default:
      return "default";
  }
}

function formatStatusLabel(status: string) {
  return status.replace(/_/g, " ");
}

function GoalCard({
  goal,
  onSave,
  saving,
}: {
  goal: PerformanceGoal;
  onSave: (id: string, progress: number, status: string) => Promise<void>;
  saving: boolean;
}) {
  const [progress, setProgress] = useState(goal.progress);
  const [status, setStatus] = useState(goal.status);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-foreground">{goal.title}</h3>
          {goal.target && (
            <p className="mt-0.5 text-xs text-muted-foreground">{goal.target}</p>
          )}
        </div>
        <Badge variant={goalStatusVariant(goal.status)}>
          {formatStatusLabel(goal.status)}
        </Badge>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[100px] flex-1">
          <label className="text-xs text-muted-foreground">Progress %</label>
          <input
            type="range"
            min={0}
            max={100}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="mt-1 w-full"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GOAL_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          className="h-9"
          disabled={saving}
          onClick={() => onSave(goal.id, progress, status)}
        >
          Save
        </Button>
      </div>
    </div>
  );
}

/** Arjun: self-assessment only — does not rate Sandhya. */
function SelfReviewCard({
  review,
  onSubmit,
  submitting,
}: {
  review: PerformanceReview;
  onSubmit: (id: string, selfScore: number, selfComments: string) => Promise<void>;
  submitting: boolean;
}) {
  const isPending = review.status === "pending";
  const [selfScore, setSelfScore] = useState(
    review.selfScore != null ? String(review.selfScore) : ""
  );
  const [selfComments, setSelfComments] = useState(review.selfComments || "");

  const handleSubmit = async () => {
    const score = parseFloat(selfScore);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      toast.error("Self score must be between 1 and 5");
      return;
    }
    if (!selfComments.trim()) {
      toast.error("Please add self-assessment comments");
      return;
    }
    await onSubmit(review.id, score, selfComments.trim());
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{review.cycleName}</h3>
        </div>
        <Badge variant={reviewStatusVariant(review.status)}>
          {formatStatusLabel(review.status)}
        </Badge>
      </div>

      {isPending ? (
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/20 p-4">
          <p className="text-sm text-muted-foreground">
            Complete your self-assessment for this review cycle.
          </p>
          <Input
            label="Self score (1–5)"
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={selfScore}
            onChange={(e) => setSelfScore(e.target.value)}
            placeholder="e.g. 4.0"
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Self-assessment comments
            </label>
            <Textarea
              value={selfComments}
              onChange={(e) => setSelfComments(e.target.value)}
              placeholder="Describe your achievements, challenges, and growth areas..."
              rows={4}
            />
          </div>
          <Button className="h-9" disabled={submitting} onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Submit self-assessment
          </Button>
        </div>
      ) : (
        <div className="space-y-3 text-sm">
          {review.selfScore != null && (
            <p>
              <span className="text-muted-foreground">Self score: </span>
              <span className="font-semibold tabular-nums">{review.selfScore}</span>
            </p>
          )}
          {review.selfComments && (
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Your comments</p>
              <p className="leading-relaxed text-foreground/90">{review.selfComments}</p>
            </div>
          )}
          {review.status === "self_submitted" && (
            <p className="text-xs text-muted-foreground">
              Submitted awaiting feedback from{" "}
              {review.reviewerName || "your manager"}.
            </p>
          )}
          {review.status === "completed" && review.managerScore != null && (
            <p>
              <span className="text-muted-foreground">Manager score: </span>
              <span className="font-semibold tabular-nums">{review.managerScore}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/** Sandhya: manager feedback on team members with compact expandable design. */
function TeamReviewCard({
  review,
  onComplete,
  submitting,
  defaultExpanded = false,
}: {
  review: PerformanceReview;
  onComplete: (
    id: string,
    managerScore: number,
    managerComments: string
  ) => Promise<void>;
  submitting: boolean;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [mgrScore, setMgrScore] = useState(
    review.managerScore != null ? String(review.managerScore) : ""
  );
  const [mgrComments, setMgrComments] = useState(review.managerComments || "");

  const isCompleted = review.status === "completed";
  const isReady = review.status === "self_submitted";
  const isPending = review.status === "pending";

  const handleComplete = async () => {
    const score = parseFloat(mgrScore);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      toast.error("Manager score must be between 1 and 5");
      return;
    }
    await onComplete(review.id, score, mgrComments.trim());
    setIsExpanded(false);
  };

  // Get initials for avatar
  const initials = review.employeeName
    ? review.employeeName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "EM";

  return (
    <div className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
      isReady 
        ? "border-emerald-500/30 bg-gradient-to-b from-emerald-500/[0.03] to-transparent shadow-sm hover:border-emerald-500/50" 
        : isCompleted 
        ? "border-border/70 bg-card hover:border-primary/30"
        : "border-border/60 bg-card/60 hover:border-border"
    }`}>
      {/* Top Header Row */}
      <div className="p-5 pb-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 border ${
              isReady 
                ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/25 dark:text-emerald-400" 
                : isCompleted
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-muted text-muted-foreground border-border"
            }`}>
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-foreground truncate">
                  {review.employeeName}
                </h3>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {review.cycleName} {review.department ? `· ${review.department}` : ""}
              </p>
            </div>
          </div>

          <Badge variant={reviewStatusVariant(review.status)}>
            {isReady ? "Ready for Review" : isPending ? "Awaiting Employee" : formatStatusLabel(review.status)}
          </Badge>
        </div>

        {/* Score Badges Row */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {review.selfScore != null ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Self Score:</span>
              <span className="font-bold tabular-nums">{review.selfScore} / 5</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-muted-foreground bg-muted/40 border border-border/40">
              <span className="text-[10px]">Self Score:</span>
              <span>Not submitted</span>
            </div>
          )}

          {review.managerScore != null ? (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20">
              <span className="text-[10px] text-primary/80">Manager Score:</span>
              <span className="font-bold tabular-nums">{review.managerScore} / 5</span>
            </div>
          ) : null}
        </div>

        {/* Self-Assessment Quote snippet */}
        {review.selfComments && (
          <div className="mt-2 rounded-xl bg-muted/40 border border-border/50 p-3 text-xs text-foreground/90 leading-relaxed">
            <span className="font-medium text-muted-foreground block mb-0.5 text-[11px] uppercase tracking-wider">
              Employee Self-Assessment:
            </span>
            <p className="line-clamp-2 italic text-foreground/80">
              "{review.selfComments}"
            </p>
          </div>
        )}

        {isPending && !review.selfComments && (
          <p className="text-xs text-muted-foreground italic bg-muted/20 rounded-lg p-2.5 border border-dashed border-border/60">
            Waiting for {review.employeeName} to submit self-assessment. You may also provide pre-cycle coaching notes below.
          </p>
        )}

        {/* Completed feedback preview when collapsed */}
        {isCompleted && review.managerComments && !isExpanded && (
          <div className="mt-2 rounded-xl bg-primary/[0.04] border border-primary/15 p-3 text-xs leading-relaxed">
            <span className="font-medium text-primary block mb-0.5 text-[11px] uppercase tracking-wider">
              Submitted Manager Feedback:
            </span>
            <p className="line-clamp-2 text-foreground/90">
              {review.managerComments}
            </p>
          </div>
        )}
      </div>

      {/* Expandable Review Section */}
      <div className="px-5 pb-5 pt-0">
        {!isExpanded ? (
          <div className="pt-2 border-t border-border/40 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {isCompleted ? "Feedback recorded" : isReady ? "Action required" : "Optional early feedback"}
            </span>
            <Button
              variant={isReady ? "default" : "outline"}
              size="sm"
              onClick={() => setIsExpanded(true)}
              className={`h-8 gap-1.5 text-xs font-medium ${isReady ? "shadow-sm shadow-emerald-500/20" : ""}`}
            >
              {isCompleted ? (
                <>Edit Feedback</>
              ) : isReady ? (
                <>Score & Review Employee</>
              ) : (
                <>Provide Early Feedback</>
              )}
            </Button>
          </div>
        ) : (
          <div className="pt-3 border-t border-border/60 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {isCompleted ? "Edit Manager Evaluation" : "Enter Manager Evaluation"}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-7 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>

            <div className="space-y-3 rounded-xl bg-muted/20 border border-border/60 p-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">
                    Performance Score (1.0 – 5.0)
                  </label>
                  {mgrScore && (
                    <span className="text-xs font-bold text-primary tabular-nums">
                      {mgrScore} / 5.0
                    </span>
                  )}
                </div>
                {/* Score Quick-select pills */}
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setMgrScore(String(val))}
                      className={`px-3 py-1 text-xs rounded-lg border font-medium transition-all ${
                        Number(mgrScore) === val
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                      }`}
                    >
                      {val}.0
                    </button>
                  ))}
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={mgrScore}
                    onChange={(e) => setMgrScore(e.target.value)}
                    placeholder="Custom score (e.g. 4.5)"
                    className="h-7 w-28 text-xs ml-auto"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Evaluation Feedback & Coaching Notes
                </label>
                <Textarea
                  value={mgrComments}
                  onChange={(e) => setMgrComments(e.target.value)}
                  placeholder="Highlight key achievements, competencies, coaching feedback, and next development goals..."
                  rows={3}
                  className="text-xs bg-background"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsExpanded(false)}
                  className="h-8 text-xs"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={submitting}
                  onClick={handleComplete}
                  className="h-8 text-xs font-medium"
                >
                  {submitting ? "Saving..." : isCompleted ? "Update Evaluation" : "Submit Evaluation"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PerformancePage() {
  const { user } = useStore();
  const myId = user?.id ? String(user.id) : "";

  const { goalsData, isLoading: goalsLoading, error: goalsError } =
    useGraphQLPerformanceGoals();
  const { reviewsData, isLoading: reviewsLoading, error: reviewsError } =
    useGraphQLPerformanceReviews();
  const { updateGoal, updateGoalLoading } = useGraphQLUpdateGoal();
  const { updatePerformanceReview, updateReviewLoading } =
    useGraphQLUpdatePerformanceReview();

  const myGoals = goalsData.filter((g) => String(g.userId) === myId);
  const myReviews = reviewsData.filter((r) => String(r.employeeId) === myId);
  const myTeamReviews = reviewsData.filter(
    (r) => String(r.employeeId) !== myId && String(r.reviewerId) === myId
  );

  const actionableMine = myReviews.filter(
    (r) =>
      r.status === "pending" ||
      r.status === "self_submitted" ||
      r.status === "completed"
  );

  const handleSaveGoal = async (id: string, progress: number, status: string) => {
    try {
      await updateGoal({ id, progress, status });
      toast.success("Goal updated");
    } catch {
      toast.error("Failed to update goal");
    }
  };

  const handleSubmitSelf = async (
    id: string,
    selfScore: number,
    selfComments: string
  ) => {
    try {
      await updatePerformanceReview({
        id,
        self_score: selfScore,
        self_comments: selfComments,
        status: "self_submitted",
      });
      toast.success("Self-assessment submitted");
    } catch {
      toast.error("Failed to submit self-assessment");
    }
  };

  const handleManagerFeedback = async (
    id: string,
    managerScore: number,
    managerComments: string
  ) => {
    try {
      await updatePerformanceReview({
        id,
        manager_score: managerScore,
        manager_comments: managerComments,
        status: "completed",
      });
      toast.success("Manager feedback submitted");
    } catch {
      toast.error("Failed to submit feedback");
    }
  };

  const isLoading = goalsLoading || reviewsLoading;
  const hasError = goalsError || reviewsError;
  const showTeam = myTeamReviews.length > 0;

  // Team Reviews Filtering & Pagination
  // Team Reviews Filtering & State
  const [activeTab, setActiveTab] = useState<"team" | "personal">(showTeam ? "team" : "personal");
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<"all" | "ready" | "pending" | "completed">("all");
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<string>("");
  const [commentsInput, setCommentsInput] = useState<string>("");

  useEffect(() => {
    if (!showTeam && activeTab === "team") {
      setActiveTab("personal");
    }
  }, [showTeam]);

  const readyCount = myTeamReviews.filter((r) => r.status === "self_submitted").length;
  const pendingCount = myTeamReviews.filter((r) => r.status === "pending").length;
  const completedCount = myTeamReviews.filter((r) => r.status === "completed").length;

  const filteredTeamReviews = myTeamReviews.filter((r) => {
    if (teamFilter === "ready" && r.status !== "self_submitted") return false;
    if (teamFilter === "pending" && r.status !== "pending") return false;
    if (teamFilter === "completed" && r.status !== "completed") return false;

    if (teamSearch.trim()) {
      const q = teamSearch.toLowerCase().trim();
      const matchesName = r.employeeName?.toLowerCase().includes(q);
      const matchesDept = r.department?.toLowerCase().includes(q);
      const matchesCycle = r.cycleName?.toLowerCase().includes(q);
      if (!matchesName && !matchesDept && !matchesCycle) return false;
    }
    return true;
  });

  const selectedReview =
    filteredTeamReviews.find((r) => r.id === selectedReviewId) ||
    filteredTeamReviews[0] ||
    null;

  useEffect(() => {
    if (selectedReview) {
      setScoreInput(
        selectedReview.managerScore != null ? String(selectedReview.managerScore) : ""
      );
      setCommentsInput(selectedReview.managerComments || "");
    }
  }, [selectedReview?.id]);

  return (
    <PlanFeatureGate
      feature="advanced_analytics"
      title="Elite plan required"
      description="Performance goals and reviews are available on Elite. Ask your admin to upgrade in Settings → Plan & billing."
    >
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      <PageHeader
        title={showTeam ? "Performance & Reports" : "Performance"}
        description={showTeam ? "Evaluate team performance, submit reviews, and manage growth cycles." : "Submit your self-assessment."}
        eyebrow="Growth"
      />

      {hasError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load performance data. Your organization may need the Elite plan for
          this feature.
        </div>
      )}

      {/* Segmented Tab Navigation matching Feedback */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center bg-muted/40 p-1 rounded-xl border border-border/80">
          {[
            ...(showTeam
              ? [
                  {
                    id: "team" as const,
                    label: "Direct Reports",
                    icon: Users,
                    count: myTeamReviews.length,
                  },
                ]
              : []),
            {
              id: "personal" as const,
              label: "My Goals & Reviews",
              icon: Target,
              count: myGoals.length + actionableMine.length,
            },
          ].map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  active
                    ? "bg-background text-foreground shadow-xs font-semibold border border-border/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", active && "text-primary")} />
                <span>{t.label}</span>
                {t.count !== undefined && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-muted font-mono">
                    {t.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === "team" && readyCount > 0 && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {readyCount} review{readyCount > 1 ? "s" : ""} awaiting your evaluation
          </span>
        )}
      </div>

      {/* VIEW: Direct Reports Master-Detail Split Pane */}
      {activeTab === "team" && showTeam && (
        <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-sm">
          {/* Top Filter & Search Toolbar */}
          <div className="p-4 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => setTeamSearch(e.target.value)}
                placeholder="Search employee by name, department, or cycle..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-xs border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted-foreground/60"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => setTeamSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Status Filters */}
            <div className="flex items-center gap-1 p-0.5 bg-background rounded-lg border border-border/60">
              {[
                { id: "all", label: "All" },
                { id: "ready", label: "Ready to Review" },
                { id: "pending", label: "Awaiting Employee" },
                { id: "completed", label: "Completed" },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTeamFilter(s.id as any)}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                    teamFilter === s.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Master-Detail Split Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] min-h-[580px] h-[680px] divide-y lg:divide-y-0 lg:divide-x divide-border/70">
            {/* Left Section: Employee List */}
            <div className="overflow-y-auto divide-y divide-border/60 bg-muted/[0.08] custom-scrollbar flex flex-col">
              {filteredTeamReviews.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      {teamSearch || teamFilter !== "all"
                        ? "No matching employees"
                        : "No direct reports assigned"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto">
                      {teamSearch || teamFilter !== "all"
                        ? "Try adjusting search or status filters."
                        : "When review cycles open for your direct reports, they will appear here."}
                    </p>
                  </div>
                  {(teamSearch || teamFilter !== "all") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setTeamSearch("");
                        setTeamFilter("all");
                      }}
                      className="h-8 text-xs"
                    >
                      Reset Filters
                    </Button>
                  )}
                </div>
              ) : (
                filteredTeamReviews.map((review) => {
                  const isSelected = selectedReview?.id === review.id;
                  const isReady = review.status === "self_submitted";
                  const isCompleted = review.status === "completed";
                  const isPending = review.status === "pending";
                  const initials = (review.employeeName || "EM")
                    .split(" ")
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "EM";

                  return (
                    <button
                      key={review.id}
                      type="button"
                      onClick={() => setSelectedReviewId(review.id)}
                      className={cn(
                        "w-full text-left p-4 transition-all duration-150 relative flex flex-col gap-2 hover:bg-muted/40",
                        isSelected
                          ? "bg-card border-l-4 border-l-primary shadow-xs"
                          : "border-l-4 border-l-transparent"
                      )}
                    >
                      {/* Top Badges Row */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border bg-muted/40 border-border/60 text-muted-foreground">
                          <Briefcase className="w-3 h-3 text-primary" />
                          <span className="truncate max-w-[140px]">{review.department || review.cycleName}</span>
                        </span>

                        <span
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                            isReady
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isCompleted
                              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                              : "bg-muted text-muted-foreground border-border"
                          )}
                        >
                          <span
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              isReady
                                ? "bg-emerald-500 animate-pulse"
                                : isCompleted
                                ? "bg-blue-500"
                                : "bg-muted-foreground/60"
                            )}
                          />
                          <span>
                            {isReady
                              ? "Ready to Review"
                              : isPending
                              ? "Awaiting Employee"
                              : "Completed"}
                          </span>
                        </span>
                      </div>

                      {/* Employee Details */}
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7 rounded-lg shrink-0">
                          <AvatarFallback className="rounded-lg bg-primary/10 text-[10px] font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <h4
                            className={cn(
                              "text-xs sm:text-sm font-semibold line-clamp-1 leading-snug",
                              isSelected ? "text-primary" : "text-foreground"
                            )}
                          >
                            {review.employeeName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {review.cycleName}
                          </p>
                        </div>
                      </div>

                      {/* Self-Assessment Excerpt */}
                      {review.selfComments ? (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed italic">
                          "{review.selfComments}"
                        </p>
                      ) : (
                        <p className="text-[11px] text-muted-foreground/70 italic">
                          {isPending
                            ? "Self-assessment pending submission"
                            : "No self-assessment comments provided"}
                        </p>
                      )}

                      {/* Bottom Metadata */}
                      <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1 font-mono text-[10px]">
                          <Clock className="w-3 h-3 text-muted-foreground/70" />
                          <span>Active Review Cycle</span>
                        </span>

                        <div className="flex items-center gap-2">
                          {review.selfScore != null && (
                            <span className="text-[10px] font-mono bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                              Self: {review.selfScore}/5
                            </span>
                          )}
                          {review.managerScore != null && (
                            <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-bold">
                              Mgr: {review.managerScore}/5
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Right Section: Selected Employee Details & Info */}
            <div className="overflow-y-auto bg-card p-6 flex flex-col justify-between custom-scrollbar">
              {!selectedReview ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-muted-foreground space-y-2">
                  <Inbox className="w-8 h-8 text-muted-foreground/60" />
                  <p className="text-sm font-medium text-foreground">Select an employee review</p>
                  <p className="text-xs text-muted-foreground">
                    Choose any direct report from the list on the left to evaluate performance.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Top Metadata Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border bg-primary/10 border-primary/20 text-primary">
                        <Briefcase className="w-3.5 h-3.5" />
                        <span>{selectedReview.department || "General"}</span>
                      </span>

                      {(() => {
                        const isReady = selectedReview.status === "self_submitted";
                        const isCompleted = selectedReview.status === "completed";
                        return (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                              isReady
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : isCompleted
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            )}
                          >
                            <span
                              className={cn(
                                "w-2 h-2 rounded-full",
                                isReady
                                  ? "bg-emerald-500 animate-pulse"
                                  : isCompleted
                                  ? "bg-blue-500"
                                  : "bg-muted-foreground"
                              )}
                            />
                            <span>
                              {isReady
                                ? "Ready for Review"
                                : isCompleted
                                ? "Completed"
                                : "Awaiting Employee"}
                            </span>
                          </span>
                        );
                      })()}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{moment().format("MMM D, YYYY · h:mm A")}</span>
                    </div>
                  </div>

                  {/* Title & Employee Info */}
                  <div className="space-y-2">
                    <h2 className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                      {selectedReview.employeeName}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-semibold text-[10px]">
                        <User className="w-3 h-3" />
                      </div>
                      <span>
                        Direct Report · Cycle:{" "}
                        <strong className="text-foreground">{selectedReview.cycleName}</strong>
                      </span>
                      {selectedReview.department && (
                        <>
                          <span>·</span>
                          <span>{selectedReview.department}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Visual Review Progress Tracker (matches Feedback Screenshot 2) */}
                  <div className="rounded-xl bg-muted/30 border border-border/70 p-4 space-y-3">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Review Progress
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                          <Check className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          1. Cycle Initiated
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Completed
                        </span>
                      </div>

                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs",
                            selectedReview.selfComments || selectedReview.selfScore != null
                              ? "bg-emerald-500 text-white"
                              : "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                          )}
                        >
                          {selectedReview.selfComments || selectedReview.selfScore != null ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          2. Self-Review
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedReview.selfScore != null
                            ? `Score: ${selectedReview.selfScore}/5`
                            : "In queue"}
                        </span>
                      </div>

                      {/* Step 3 */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={cn(
                            "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs",
                            selectedReview.status === "completed"
                              ? "bg-emerald-500 text-white"
                              : selectedReview.status === "self_submitted"
                              ? "bg-primary text-primary-foreground animate-pulse"
                              : "bg-muted text-muted-foreground border border-border"
                          )}
                        >
                          {selectedReview.status === "completed" ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <span className="text-[11px]">3</span>
                          )}
                        </div>
                        <span className="font-semibold text-foreground text-[11px]">
                          3. Evaluation
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {selectedReview.status === "completed"
                            ? "Recorded"
                            : selectedReview.status === "self_submitted"
                            ? "Action needed"
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Section: Description / Employee Self-Assessment */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Description & Self-Assessment
                    </span>
                    {selectedReview.selfComments ? (
                      <div className="rounded-xl bg-muted/20 border border-border/60 p-4 text-xs text-foreground/90 leading-relaxed space-y-2">
                        <p className="italic text-foreground/85">"{selectedReview.selfComments}"</p>
                        {selectedReview.selfScore != null && (
                          <div className="pt-2 border-t border-border/40 flex items-center gap-2">
                            <span className="text-[11px] text-muted-foreground font-medium">Self Score:</span>
                            <span className="text-xs font-bold text-foreground tabular-nums">
                              {selectedReview.selfScore} / 5.0
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl bg-muted/10 border border-dashed border-border/60 p-4 text-xs text-muted-foreground italic">
                        The employee has not yet submitted their self-assessment text. You can still input preliminary coaching notes and score below.
                      </div>
                    )}
                  </div>

                  {/* Section: Manager Evaluation Form (Clean, no color cards/borders) */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                        Manager Evaluation & Coaching
                      </span>
                      {selectedReview.managerScore != null && (
                        <span className="text-xs font-bold text-primary font-mono">
                          Recorded Score: {selectedReview.managerScore} / 5.0
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 rounded-xl bg-muted/20 border border-border/60 p-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">
                          Performance Score (1.0 – 5.0)
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          {[1, 2, 3, 4, 5].map((val) => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => setScoreInput(String(val))}
                              className={cn(
                                "px-3 py-1.5 text-xs rounded-lg border font-medium transition-all",
                                Number(scoreInput) === val
                                  ? "bg-primary text-primary-foreground border-primary shadow-xs font-bold"
                                  : "bg-background hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                              )}
                            >
                              {val}.0
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground">
                          Manager Feedback & Coaching Notes
                        </label>
                        <Textarea
                          value={commentsInput}
                          onChange={(e) => setCommentsInput(e.target.value)}
                          placeholder="Highlight key accomplishments, strengths, growth areas, and recommendations..."
                          rows={3}
                          className="text-xs bg-background"
                        />
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          disabled={updateReviewLoading || !scoreInput}
                          onClick={async () => {
                            const score = parseFloat(scoreInput);
                            if (Number.isNaN(score) || score < 1 || score > 5) {
                              toast.error("Manager score must be between 1 and 5");
                              return;
                            }
                            await handleManagerFeedback(
                              selectedReview.id,
                              score,
                              commentsInput.trim()
                            );
                          }}
                          className="h-8 px-4 text-xs font-semibold gap-1.5 shadow-sm"
                        >
                          {updateReviewLoading ? (
                            <>
                              <div className="w-3 h-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>
                                {selectedReview.status === "completed"
                                  ? "Update Feedback"
                                  : "Submit Evaluation"}
                              </span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Status Callout Box (matches Feedback Screenshot 2) */}
                  <div className="rounded-xl bg-muted/20 border border-border/60 p-3.5 flex items-start gap-3 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {selectedReview.status === "completed"
                          ? "Evaluation Recorded"
                          : selectedReview.status === "self_submitted"
                          ? "Awaiting Manager Review"
                          : "Awaiting Employee Submission"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {selectedReview.status === "completed"
                          ? "Official evaluation is visible to the employee and saved to organizational records."
                          : selectedReview.status === "self_submitted"
                          ? "The employee has submitted their self-review and is awaiting your assessment."
                          : "The employee will receive reminders until their self-review is submitted."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW: Personal Goals & Reviews */}
      {(!showTeam || activeTab === "personal") && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <Card title="My Goals">
            <Separator className="mb-4 -mt-2" />
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-xl border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : myGoals.length === 0 ? (
              <EmptyState
                icon="🎯"
                title="No goals yet"
                description="Your manager or HR will assign goals for you. Check back later."
              />
            ) : (
              <div className="space-y-4">
                {myGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onSave={handleSaveGoal}
                    saving={updateGoalLoading}
                  />
                ))}
              </div>
            )}
          </Card>

          <Card title="My Reviews">
            <Separator className="mb-4 -mt-2" />
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-36 animate-pulse rounded-xl border border-border bg-muted/40"
                  />
                ))}
              </div>
            ) : actionableMine.length === 0 ? (
              <EmptyState
                icon="📋"
                title="No active reviews"
                description="When a review cycle opens, your self-assessment will appear here. Your manager reviews you after you submit."
              />
            ) : (
              <div className="space-y-4">
                {actionableMine.map((review) => (
                  <SelfReviewCard
                    key={review.id}
                    review={review}
                    onSubmit={handleSubmitSelf}
                    submitting={updateReviewLoading}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
    </PlanFeatureGate>
  );
}
