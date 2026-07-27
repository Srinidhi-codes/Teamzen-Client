"use client";

import { cn } from "@/lib/utils";

interface CardProps {
  title?: string;
  icon?: any;
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
  action?: React.ReactNode;
}

export function Card({
  title,
  icon: Icon,
  children,
  className = "",
  hover = false,
  action,
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-5 sm:p-6",
        hover && "transition-colors hover:bg-muted/30",
        className
      )}
    >
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground">
            {Icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
            )}
            {title}
          </h2>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-sm leading-relaxed text-foreground/80">{children}</div>
    </div>
  );
}
