"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Clock,
  LayoutDashboard,
  Users,
  Calendar,
  CircleDollarSign,
  BarChart2,
  Settings,
  FileText,
  Award,
  Folder,
  MessageSquare,
  Bell,
  Shield,
  Radio,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
  rootLabel?: string;
  rootHref?: string;
}

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  employees: "Employees",
  attendance: "Attendance",
  "attendance-correction": "Correction",
  request: "Request",
  leaves: "Leaves",
  approvals: "Approvals",
  payroll: "Payroll",
  onboarding: "Onboarding",
  offboarding: "Offboarding",
  reports: "Reports",
  settings: "Settings",
  policies: "Policies",
  performance: "Performance",
  documents: "Documents",
  feedback: "Feedback",
  notifications: "Notifications",
  team: "Team",
  feed: "Feed",
  exit: "Exit",
  vault: "Documents Vault",
};

const ROUTE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  employees: Users,
  attendance: Clock,
  leaves: Calendar,
  payroll: CircleDollarSign,
  onboarding: Clock,
  offboarding: Clock,
  reports: BarChart2,
  settings: Settings,
  policies: FileText,
  performance: Award,
  documents: Folder,
  feedback: MessageSquare,
  notifications: Bell,
  team: Users,
  feed: Radio,
  exit: LogOut,
};

function formatSegmentLabel(segment: string): string {
  if (ROUTE_LABELS[segment.toLowerCase()]) {
    return ROUTE_LABELS[segment.toLowerCase()];
  }
  if (/^[0-9a-fA-F-]{8,}$/.test(segment) || /^\d+$/.test(segment)) {
    return "Details";
  }
  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function Breadcrumbs({
  items,
  icon: PropIcon,
  className,
  rootLabel = "Dashboard",
  rootHref = "/dashboard",
}: BreadcrumbsProps) {
  const pathname = usePathname();

  const generatedItems = useMemo(() => {
    if (items && items.length > 0) return items;

    if (!pathname || pathname === "/" || pathname === "/dashboard") {
      return [{ label: rootLabel }];
    }

    const segments = pathname.split("/").filter(Boolean);
    const result: BreadcrumbItem[] = [];

    result.push({ label: rootLabel, href: rootHref });

    let cumulativePath = "";
    segments.forEach((seg, idx) => {
      cumulativePath += `/${seg}`;
      const isLast = idx === segments.length - 1;
      if (idx === 0 && seg.toLowerCase() === rootLabel.toLowerCase()) {
        return;
      }
      result.push({
        label: formatSegmentLabel(seg),
        href: isLast ? undefined : cumulativePath,
      });
    });

    return result;
  }, [items, pathname, rootLabel, rootHref]);

  const Icon = useMemo(() => {
    if (PropIcon) return PropIcon;
    if (items && items[0]?.icon) return items[0].icon;

    if (pathname) {
      const segments = pathname.split("/").filter(Boolean);
      for (const seg of segments) {
        if (ROUTE_ICONS[seg.toLowerCase()]) {
          return ROUTE_ICONS[seg.toLowerCase()];
        }
      }
    }
    return Clock;
  }, [PropIcon, items, pathname]);

  if (!generatedItems || generatedItems.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "flex items-center gap-2 text-xs sm:text-sm text-muted-foreground",
        className
      )}
    >
      <div className="h-5 w-5 rounded-full border border-border flex items-center justify-center shrink-0 text-muted-foreground">
        <Icon className="h-3 w-3" />
      </div>

      {generatedItems.map((item, index) => {
        const isLast = index === generatedItems.length - 1;

        return (
          <React.Fragment key={index}>
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[180px]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate max-w-[140px] sm:max-w-[240px]",
                  isLast ? "font-semibold text-foreground" : "text-muted-foreground"
                )}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight className="h-3 w-3 text-muted-foreground/60 shrink-0" />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
