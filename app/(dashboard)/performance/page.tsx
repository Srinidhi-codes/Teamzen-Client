"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target, ClipboardCheck, Users, Send, Search, X, ChevronLeft, ChevronRight, CheckCircle2, Clock, Sparkles, Filter } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const [teamSearch, setTeamSearch] = useState("");
  const [teamFilter, setTeamFilter] = useState<"all" | "ready" | "pending" | "completed">("all");
  const [teamPage, setTeamPage] = useState(1);
  const PAGE_SIZE = 4;

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

  const totalPages = Math.max(1, Math.ceil(filteredTeamReviews.length / PAGE_SIZE));
  const currentPage = Math.min(teamPage, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedTeamReviews = filteredTeamReviews.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <PlanFeatureGate
      feature="advanced_analytics"
      title="Elite plan required"
      description="Performance goals and reviews are available on Elite. Ask your admin to upgrade in Settings → Plan & billing."
    >
    <div className="animate-fade-in space-y-8 p-4 pb-20 sm:p-8">
      <PageHeader
        title="Performance"
        description="Submit your self-assessment."
        eyebrow="Growth"
      />

      {hasError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load performance data. Your organization may need the Elite plan for
          this feature.
        </div>
      )}

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

      {showTeam && (
        <Card title="Team reviews" icon={Users}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <p className="text-sm text-muted-foreground">
              Give feedback on people you manage. You review them — they do not review you here.
            </p>
            {readyCount > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {readyCount} review{readyCount > 1 ? "s" : ""} awaiting your evaluation
              </span>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <button
              type="button"
              onClick={() => { setTeamFilter("all"); setTeamPage(1); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                teamFilter === "all"
                  ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-xs"
                  : "bg-card hover:bg-muted/30 border-border"
              }`}
            >
              <div className="text-xs text-muted-foreground font-medium">All Direct Reports</div>
              <div className="text-xl font-bold text-foreground mt-1 tabular-nums">{myTeamReviews.length}</div>
            </button>

            <button
              type="button"
              onClick={() => { setTeamFilter("ready"); setTeamPage(1); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                teamFilter === "ready"
                  ? "bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-xs"
                  : "bg-card hover:bg-muted/30 border-border"
              }`}
            >
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Ready to Review
              </div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">{readyCount}</div>
            </button>

            <button
              type="button"
              onClick={() => { setTeamFilter("pending"); setTeamPage(1); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                teamFilter === "pending"
                  ? "bg-amber-500/10 border-amber-500/40 ring-1 ring-amber-500/20 shadow-xs"
                  : "bg-card hover:bg-muted/30 border-border"
              }`}
            >
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                Awaiting Self-Review
              </div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">{pendingCount}</div>
            </button>

            <button
              type="button"
              onClick={() => { setTeamFilter("completed"); setTeamPage(1); }}
              className={`p-3.5 rounded-xl border text-left transition-all ${
                teamFilter === "completed"
                  ? "bg-blue-500/10 border-blue-500/40 ring-1 ring-blue-500/20 shadow-xs"
                  : "bg-card hover:bg-muted/30 border-border"
              }`}
            >
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">{completedCount}</div>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border/60">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={teamSearch}
                onChange={(e) => {
                  setTeamSearch(e.target.value);
                  setTeamPage(1);
                }}
                placeholder="Search employee by name, department, or cycle..."
                className="w-full pl-9 pr-8 py-2 rounded-xl text-sm border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/60"
              />
              {teamSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setTeamSearch("");
                    setTeamPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-md"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/60 self-start sm:self-auto overflow-x-auto max-w-full">
              {[
                { id: "all", label: "All", count: myTeamReviews.length },
                { id: "ready", label: "Ready", count: readyCount },
                { id: "pending", label: "Pending", count: pendingCount },
                { id: "completed", label: "Completed", count: completedCount },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setTeamFilter(tab.id as any);
                    setTeamPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    teamFilter === tab.id
                      ? "bg-background text-foreground shadow-xs border border-border/50 font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full tabular-nums ${
                    teamFilter === tab.id
                      ? "bg-primary/10 text-primary font-bold"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredTeamReviews.length === 0 ? (
            <div className="p-8 text-center border border-dashed rounded-2xl bg-muted/15 space-y-3">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">No matching team reviews</h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                No team reviews match your search query or filter selection.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTeamSearch("");
                  setTeamFilter("all");
                  setTeamPage(1);
                }}
                className="h-8 text-xs"
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {paginatedTeamReviews.map((review) => (
                <TeamReviewCard
                  key={review.id}
                  review={review}
                  onComplete={handleManagerFeedback}
                  submitting={updateReviewLoading}
                />
              ))}
            </div>
          )}

          {/* Pagination Footer */}
          {filteredTeamReviews.length > PAGE_SIZE && (
            <div className="mt-6 pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                <span className="font-semibold text-foreground">
                  {Math.min(startIndex + PAGE_SIZE, filteredTeamReviews.length)}
                </span>{" "}
                of <span className="font-semibold text-foreground">{filteredTeamReviews.length}</span> employees
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setTeamPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-xs font-medium transition-all ${
                          currentPage === pageNum
                            ? "bg-primary text-primary-foreground font-bold shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50 border border-transparent hover:border-border"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTeamPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2.5 text-xs gap-1"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
    </PlanFeatureGate>
  );
}
