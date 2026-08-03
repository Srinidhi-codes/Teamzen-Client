"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Target, ClipboardCheck, Users, Send } from "lucide-react";
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
          <p className="text-xs text-muted-foreground">
            {review.reviewerName
              ? `Your manager ${review.reviewerName} will review you after you submit.`
              : "Complete your self-assessment for this cycle."}
          </p>
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
              Submitted — awaiting feedback from{" "}
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

/** Sandhya: manager feedback on Arjun. */
function TeamReviewCard({
  review,
  onComplete,
  submitting,
}: {
  review: PerformanceReview;
  onComplete: (
    id: string,
    managerScore: number,
    managerComments: string
  ) => Promise<void>;
  submitting: boolean;
}) {
  const [mgrScore, setMgrScore] = useState(
    review.managerScore != null ? String(review.managerScore) : ""
  );
  const [mgrComments, setMgrComments] = useState(review.managerComments || "");

  const handleComplete = async () => {
    const score = parseFloat(mgrScore);
    if (Number.isNaN(score) || score < 1 || score > 5) {
      toast.error("Manager score must be between 1 and 5");
      return;
    }
    await onComplete(review.id, score, mgrComments.trim());
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {review.employeeName}
          </h3>
          <p className="text-xs text-muted-foreground">
            {review.cycleName}
            {review.department ? ` · ${review.department}` : ""}
          </p>
        </div>
        <Badge variant={reviewStatusVariant(review.status)}>
          {formatStatusLabel(review.status)}
        </Badge>
      </div>

      {(review.selfScore != null || review.selfComments) && (
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3 text-sm">
          <p className="text-xs font-medium text-muted-foreground">Their self-assessment</p>
          {review.selfScore != null && (
            <p className="mt-1 tabular-nums">Score: {review.selfScore}</p>
          )}
          {review.selfComments && (
            <p className="mt-1 text-foreground/90">{review.selfComments}</p>
          )}
        </div>
      )}

      {review.status === "pending" && !review.selfScore && (
        <p className="text-xs text-muted-foreground">
          Waiting for {review.employeeName} to submit their self-assessment. You can
          still leave manager feedback when ready.
        </p>
      )}

      {review.status !== "completed" ? (
        <div className="space-y-3">
          <Input
            label="Your score for this employee (1–5)"
            type="number"
            min={1}
            max={5}
            step={0.1}
            value={mgrScore}
            onChange={(e) => setMgrScore(e.target.value)}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Feedback for {review.employeeName}
            </label>
            <Textarea
              value={mgrComments}
              onChange={(e) => setMgrComments(e.target.value)}
              placeholder="Share strengths, coaching notes, and next steps..."
              rows={3}
            />
          </div>
          <Button className="h-9" disabled={submitting} onClick={handleComplete}>
            Submit manager feedback
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Feedback submitted
          {review.managerScore != null ? ` · score ${review.managerScore}` : ""}.
        </p>
      )}
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

  return (
    <div className="animate-fade-in space-y-8 p-4 pb-20 sm:p-8">
      <PageHeader
        title="Performance"
        description="Submit your self-assessment. Managers review their direct reports — not the other way around."
        eyebrow="Growth"
      />

      {hasError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          Unable to load performance data. Your organization may need the Elite plan for
          this feature.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Card title="My Goals" icon={Target}>
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

        <Card title="My Reviews" icon={ClipboardCheck}>
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
          <p className="mb-4 text-sm text-muted-foreground">
            Give feedback on people you manage. You review them — they do not review you
            here.
          </p>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {myTeamReviews.map((review) => (
              <TeamReviewCard
                key={review.id}
                review={review}
                onComplete={handleManagerFeedback}
                submitting={updateReviewLoading}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
