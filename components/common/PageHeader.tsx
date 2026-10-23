"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumbs, BreadcrumbItem } from "@/components/common/Breadcrumbs";

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  breadcrumbs?: BreadcrumbItem[];
  breadcrumbIcon?: React.ComponentType<{ className?: string }>;
  hideBreadcrumbs?: boolean;
  /** Deprecated - replaced by Breadcrumbs */
  eyebrow?: string;
  /** Optional back button link */
  backHref?: string;
}

/**
 * Shared page title — light, unboxed strip with reusable breadcrumbs used across employee portal routes.
 */
export function PageHeader({
  title,
  description,
  actions,
  className,
  breadcrumbs,
  breadcrumbIcon,
  hideBreadcrumbs = false,
  backHref,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-0">
        {backHref && (
          <Link
            href={backHref}
            className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            title="Go back"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        )}
        <div className="min-w-0 space-y-1.5">
          {!hideBreadcrumbs && (
            <Breadcrumbs
              items={breadcrumbs}
              icon={breadcrumbIcon}
              className="mb-1"
            />
          )}
          <h1 className="text-[1.65rem] font-semibold leading-none tracking-tight text-foreground sm:text-[1.85rem]">
            {title}
          </h1>
          {description && (
            <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {description}
            </div>
          )}
        </div>
      </div>

      {actions && (
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:pb-0.5">
          {actions}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
