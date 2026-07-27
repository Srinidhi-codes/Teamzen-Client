"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatProps {
  icon: any;
  label: string;
  value: string | number;
  index?: string | number;
  color?: string;
  gradient?: string;
}

export function Stat({
  icon: Icon,
  label,
  value,
  color = "text-primary",
  gradient = "bg-primary/10",
}: StatProps) {
  const isComponent =
    typeof Icon === "function" ||
    (typeof Icon === "object" && Icon !== null && (Icon.$$typeof || Icon.render));

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            gradient,
            color
          )}
        >
          {isComponent ? <Icon className="h-4 w-4" /> : <div className="h-4 w-4">{Icon}</div>}
        </div>
      </div>
    </div>
  );
}

interface ModernStatProps {
  icon: any;
  label: string;
  value: string | number;
  color?: string;
  bg?: string;
  trend?: string;
  className?: string;
}

export function ModernStat({
  icon: Icon,
  label,
  value,
  color = "text-primary",
  bg = "bg-primary/10",
  trend,
  className,
}: ModernStatProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-5", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            bg,
            color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        {trend && (
          <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "purple";
}

const iconTone = {
  blue: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  green: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  yellow: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  red: "bg-destructive/10 text-destructive",
  purple: "bg-primary/10 text-primary",
};

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "blue",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                "text-xs font-medium",
                trend.isPositive
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-destructive"
              )}
            >
              {trend.isPositive ? "↑" : "↓"} {trend.value}
              <span className="ml-1 font-normal text-muted-foreground">vs last period</span>
            </p>
          )}
        </div>
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            iconTone[color]
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
