"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  BookCheck,
  Bell,
  TrendingUp,
  Briefcase,
  MessageSquare,
  ClipboardList,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Team", href: "/team", icon: Users },
  { name: "Leaves", href: "/leaves", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Payroll", href: "/payroll", icon: DollarSign },
  { name: "Employees", href: "/employees", icon: Briefcase },
  { name: "Onboarding", href: "/onboarding", icon: ClipboardList },
  { name: "Performance", href: "/performance", icon: TrendingUp },
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Policies", href: "/policies", icon: BookCheck },
  { name: "Feedback", href: "/feedback", icon: MessageSquare },
  { name: "Notifications", href: "/notifications", icon: Bell },
];

export interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export function Sidebar({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-90 bg-foreground/20 md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-100 flex flex-col overflow-x-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200 ease-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isCollapsed ? "md:w-16" : "md:w-60",
          "w-60"
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-sidebar-border px-3">
          {(!isCollapsed || isMobileOpen) && (
            <Link
              href="/dashboard"
              className="flex min-w-0 items-center gap-2.5 px-1"
              onClick={() => isMobileOpen && closeMobile()}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white ring-1 ring-border">
                <Image
                  src="/images/teamzen_zoomed.png"
                  alt="Teamzen"
                  width={28}
                  height={28}
                  className="h-7 w-7 object-contain"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Teamzen</p>
                <p className="truncate text-xs text-muted-foreground">Employee</p>
              </div>
            </Link>
          )}

          <button
            onClick={toggleCollapse}
            className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:flex"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          <button
            onClick={closeMobile}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                !navItems.some(
                  (other) =>
                    other.href !== item.href &&
                    pathname.startsWith(other.href) &&
                    other.href.length > item.href.length
                ));
            const Icon = item.icon;
            const showLabel = !isCollapsed || isMobileOpen;

            return (
              <Link
                key={item.href}
                href={item.href}
                id={`nav-${item.name.toLowerCase()}`}
                onClick={() => isMobileOpen && closeMobile()}
                title={!showLabel ? item.name : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                  showLabel ? "" : "justify-center px-0",
                  isActive
                    ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {showLabel && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border px-3 py-3">
          {(!isCollapsed || isMobileOpen) ? (
            <p className="px-1 text-xs text-muted-foreground">
              © {new Date().getFullYear()} Teamzen
            </p>
          ) : (
            <div className="flex justify-center">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
