"use client";

import Link from "next/link";
import { Lock, Sparkles } from "lucide-react";
import { useOrgPlan } from "@/lib/hooks/useOrgPlan";
import { planLabel, type PlanFeature } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface PlanFeatureGateProps {
  feature: PlanFeature;
  children: React.ReactNode;
  /** Compact inline lock (e.g. inside a page section). */
  compact?: boolean;
  className?: string;
  title?: string;
  description?: string;
}

/**
 * Soft-locks a feature for orgs below the required plan.
 * Employees see an upgrade nudge (admins manage billing in admin panel).
 */
export function PlanFeatureGate({
  feature,
  children,
  compact = false,
  className,
  title,
  description,
}: PlanFeatureGateProps) {
  const { can, requiredPlan, planKnown, activePlan } = useOrgPlan();

  if (!planKnown) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-xl border border-border bg-muted/40",
          compact ? "h-24" : "h-48",
          className
        )}
      />
    );
  }

  if (can(feature)) {
    return <>{children}</>;
  }

  const needed = planLabel(requiredPlan(feature));
  const current = planLabel(activePlan);

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-card text-center",
        compact ? "gap-2 px-4 py-8" : "gap-3 px-6 py-16",
        className
      )}
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Lock className="h-5 w-5" />
      </div>
      <div className="max-w-md space-y-1.5">
        <p className="text-base font-semibold text-foreground">
          {title || `${needed} plan required`}
        </p>
        <p className="text-sm text-muted-foreground">
          {description ||
            `Your organization is on ${current}. Ask your admin to upgrade to ${needed} in Settings → Plan & billing to unlock this.`}
        </p>
      </div>
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
        <Sparkles className="h-3.5 w-3.5" />
        Current plan: {current}
      </div>
      <Link
        href="/dashboard"
        className="mt-2 text-sm font-medium text-primary hover:underline"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
