"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Users,
  Clock,
  CircleDollarSign,
  CalendarDays,
  FileText,
  Network,
  ClipboardList,
  BookCheck,
  MessageSquare,
  Bell,
  Settings,
  ChevronLeft,
  LogOut,
  X,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store/useStore";
import { hasPlanFeature, type PlanFeature } from "@/lib/plans";
import { isExitOnlyHref, isInactiveEmployee } from "@/lib/exitAccess";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  section?: string;
  roles?: string[];
  feature?: PlanFeature;
  /** Only show for inactive (exited) employees */
  exitOnly?: boolean;
  /** Hide for inactive employees */
  hideWhenInactive?: boolean;
}

const navItems: NavItem[] = [
  // ── Primary Navigation (Matches Reference Mockup) ─────
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid, section: "Overview", hideWhenInactive: true },
  { name: "Feed", href: "/feed", icon: Network, section: "Overview", hideWhenInactive: true },


  { name: "Employees", href: "/team", icon: Users, section: "Organization", hideWhenInactive: true },
  { name: "Attendance", href: "/attendance", icon: Clock, section: "Organization", hideWhenInactive: true },
  { name: "Leave", href: "/leaves", icon: CalendarDays, section: "Organization", hideWhenInactive: true },
  { name: "Onboarding", href: "/onboarding", icon: ClipboardList, section: "Organization", hideWhenInactive: true },
  { name: "Exit / F&F", href: "/exit", icon: LogOut, section: "Organization", exitOnly: true },
  {
    name: "Payroll",
    href: "/payroll",
    icon: CircleDollarSign,
    section: "Finance & Records",
    feature: "payroll_basic",
    hideWhenInactive: true,
  },
  {
    name: "Reports",
    href: "/performance",
    icon: FileText,
    section: "Finance & Records",
    feature: "advanced_analytics",
    hideWhenInactive: true,
  },
  { name: "Documents", href: "/documents", icon: FileText, section: "Finance & Records" },
  { name: "Policies", href: "/policies", icon: BookCheck, section: "Finance & Records", feature: "policies", hideWhenInactive: true },
  { name: "Feedback", href: "/feedback", icon: MessageSquare, section: "Workspace" },

  // ── Additional Workspace & Portal Features ───────────

  // ── General ──────────────────────────────────────────
  { name: "Alerts", href: "/notifications", icon: Bell, section: "General" },
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
  const { user } = useStore();
  const inactive = isInactiveEmployee(user);

  const visibleNavItems = navItems.filter((item) => {
    if (item.exitOnly && !inactive) return false;
    if (inactive && item.hideWhenInactive) return false;
    if (inactive && !isExitOnlyHref(item.href) && !item.exitOnly) return false;
    if (item.roles && user?.role && !item.roles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())) {
      return false;
    }
    if (!item.feature) return true;
    return hasPlanFeature(
      user?.organization?.plan,
      user?.organization?.planExpiresAt,
      item.feature
    );
  });

  const isRailMode = isCollapsed && !isMobileOpen;

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-90 bg-foreground/20 backdrop-blur-xs md:hidden"
          onClick={closeMobile}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-100 flex flex-col overflow-x-hidden border-r border-border dark:border-slate-800/80 bg-card dark:bg-[#07111a] text-foreground dark:text-slate-200 transition-[width,transform] duration-200 ease-out shadow-xs dark:shadow-xl dark:shadow-black/20",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          isRailMode ? "md:w-[84px]" : "md:w-64",
          "w-64"
        )}
      >
        {/* ========================================================
            HEADER / BRAND LOGO
           ======================================================== */}
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border dark:border-white/10 px-3",
            isRailMode ? "justify-center" : "justify-between"
          )}
        >
          {isRailMode ? (
            <button
              type="button"
              onClick={toggleCollapse}
              className="group relative flex h-11 w-11 items-center justify-center rounded-2xl bg-muted/40 hover:bg-muted dark:bg-white/[0.04] dark:hover:bg-white/[0.08] p-2 border border-border/80 dark:border-white/10 shadow-xs hover:border-primary/50 dark:hover:border-[#38ABB1]/50 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              title="Expand sidebar"
              aria-label="Toggle sidebar"
            >
              <Image
                src="/images/teamzen_zoomed.webp"
                alt="Teamzen"
                width={28}
                height={28}
                className="h-7 w-7 object-contain group-hover:scale-105 transition-transform"
                priority
              />
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => (isMobileOpen ? closeMobile() : toggleCollapse())}
                className="flex min-w-0 items-center gap-3 px-1 text-left cursor-pointer group"
                title="Collapse sidebar"
                aria-label="Toggle sidebar"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 dark:bg-white/10 p-1.5 border border-primary/20 dark:border-white/10 group-hover:border-primary/50 dark:group-hover:border-[#38ABB1]/50 transition-colors">
                  <Image
                    src="/images/teamzen_zoomed.webp"
                    alt="Teamzen"
                    width={28}
                    height={28}
                    className="h-6 w-6 object-contain group-hover:scale-105 transition-transform"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-foreground dark:text-white tracking-tight group-hover:text-primary dark:group-hover:text-[#38ABB1] transition-colors">
                    Teamzen
                  </p>
                  <p className="truncate text-[11px] text-primary dark:text-[#38ABB1] font-medium">
                    {inactive ? "Exit Portal" : "Workforce Portal"}
                  </p>
                </div>
              </button>

              <button
                onClick={toggleCollapse}
                className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors md:flex cursor-pointer"
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                onClick={closeMobile}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white transition-colors md:hidden cursor-pointer"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* ========================================================
            NAVIGATION ITEMS
           ======================================================== */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-3",
            isRailMode ? "px-2 flex flex-col gap-1.5" : "px-3 space-y-1"
          )}
        >
          {visibleNavItems.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (pathname.startsWith(item.href + "/") &&
                !visibleNavItems.some(
                  (other) =>
                    other.href !== item.href &&
                    pathname.startsWith(other.href) &&
                    other.href.length > item.href.length
                ));
            const Icon = item.icon;
            const prevItem = index > 0 ? visibleNavItems[index - 1] : null;
            const isNewSection = !prevItem || prevItem.section !== item.section;

            if (isRailMode) {
              return (
                <Fragment key={item.href}>
                  {isNewSection && index > 0 && (
                    <div className="my-1.5 h-px bg-border dark:bg-white/10 mx-2" aria-hidden="true" />
                  )}
                  <Link
                    href={item.href}
                    id={`nav-${item.name.toLowerCase()}`}
                    title={item.name}
                    className={cn(
                      "group relative flex flex-col items-center justify-center w-full min-h-[58px] py-2 px-1 rounded-2xl transition-all duration-200 select-none",
                      isActive
                        ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] border border-primary/25 dark:border-[#38ABB1]/30 shadow-xs shadow-primary/10"
                        : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                    )}
                  >
                    {/* Glowing Left Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full bg-primary dark:bg-[#38ABB1] shadow-[0_0_12px_rgba(56,171,177,0.5)]" />
                    )}

                    {/* Nav Icon */}
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        isActive
                          ? "text-primary dark:text-[#4cd1d7] drop-shadow-[0_0_6px_rgba(56,171,177,0.5)]"
                          : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-slate-100"
                      )}
                    />

                    {/* Label below Icon */}
                    <span
                      className={cn(
                        "text-[10px] tracking-tight mt-1 truncate max-w-full text-center leading-tight transition-colors",
                        isActive
                          ? "font-bold text-primary dark:text-[#4cd1d7]"
                          : "font-medium text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-slate-100"
                      )}
                    >
                      {item.name}
                    </span>
                  </Link>
                </Fragment>
              );
            }

            // Expanded Mode (Row Layout)
            return (
              <Fragment key={item.href}>
                {isNewSection && item.section && (
                  <div className={cn("px-2.5 pb-1 select-none", index > 0 ? "pt-4" : "pt-1")}>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      {item.section}
                    </p>
                  </div>
                )}
                <Link
                  href={item.href}
                  id={`nav-${item.name.toLowerCase()}`}
                  onClick={() => isMobileOpen && closeMobile()}
                  className={cn(
                    "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] font-semibold border border-primary/25 dark:border-[#38ABB1]/25 shadow-xs"
                      : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-105",
                      isActive
                        ? "text-primary dark:text-[#4cd1d7]"
                        : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              </Fragment>
            );
          })}
        </nav>

        {/* ========================================================
            BOTTOM DOCKED ACTIONS: SETTINGS & CONTROLS
           ======================================================== */}
        <div className="border-t border-border dark:border-white/10 p-2 shrink-0">
          {isRailMode ? (
            <div className="flex flex-col items-center">
              {/* Settings Action matching Reference Image */}
              <Link
                href="/profile"
                id="nav-settings"
                title="Settings & Profile"
                className={cn(
                  "group relative flex flex-col items-center justify-center w-full min-h-[54px] py-1.5 px-1 rounded-2xl transition-all duration-200 select-none",
                  pathname === "/profile"
                    ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] border border-primary/25 dark:border-[#38ABB1]/30 shadow-xs"
                    : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06] border border-transparent"
                )}
              >
                {pathname === "/profile" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                )}
                <Settings
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-300 group-hover:rotate-45",
                    pathname === "/profile" ? "text-primary dark:text-[#38ABB1]" : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                  )}
                />
                <span className="text-[10px] font-medium tracking-tight mt-1">Settings</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              <Link
                href="/profile"
                id="nav-settings-expanded"
                onClick={() => isMobileOpen && closeMobile()}
                className={cn(
                  "group relative flex items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === "/profile"
                    ? "bg-primary/10 text-primary dark:bg-[#38ABB1]/20 dark:text-[#4cd1d7] font-semibold border border-primary/25 dark:border-[#38ABB1]/25"
                    : "text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-white hover:bg-muted/60 dark:hover:bg-white/[0.06]"
                )}
              >
                {pathname === "/profile" && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-md bg-primary dark:bg-[#38ABB1] shadow-[0_0_10px_rgba(56,171,177,0.5)]" />
                )}
                <Settings className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:rotate-45 duration-300",
                  pathname === "/profile"
                    ? "text-primary dark:text-[#38ABB1]"
                    : "text-muted-foreground group-hover:text-foreground dark:text-slate-400 dark:group-hover:text-white"
                )} />
                <span className="truncate">Settings &amp; Profile</span>
              </Link>

              <div className="flex items-center justify-between px-3 pt-2 text-[11px] text-muted-foreground/70 dark:text-slate-400/60 border-t border-border/50 dark:border-white/5">
                <span>© {new Date().getFullYear()} Teamzen</span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
