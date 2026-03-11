"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import {
  LayoutDashboard,
  Calendar,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  BookCheck,
  Bell
} from "lucide-react";
import Image from "next/image";

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
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Policies", href: "/policies", icon: BookCheck },
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

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40
    flex flex-col
    bg-sidebar text-sidebar-foreground
    transition-all duration-500 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${isCollapsed ? "md:w-24" : "md:w-72"}
    w-72
    border-r border-sidebar-border
    shadow-2xl md:shadow-none
  `;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-55 md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border/50">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-24 h-24 rounded-lg flex items-center justify-center">
                <Image src={"/images/teamzen_zoomed.png"} alt="Logo" width={60} height={60} style={{ width: "auto", height: "auto" }} />
              </div>
              <h1 className="text-sm font-black text-foreground uppercase text-nowrap">Teamzen <span className="text-primary">CORE</span></h1>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all active:scale-90"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobile}
            className="md:hidden p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => isMobileOpen && closeMobile()}
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl ${isCollapsed ? "justify-center" : ""} transition-all duration-300 relative group ${isActive
                  ? "bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]"
                  : "text-sidebar-foreground/60 hover:bg-primary/5 hover:text-primary"
                  }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                title={isCollapsed && !isMobileOpen ? item.name : ""}
              >
                <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'scale-110' : ''}`} />
                {(!isCollapsed || isMobileOpen) && (
                  <span className={`font-black text-[13px] uppercase tracking-wider truncate transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
                    {item.name}
                  </span>
                )}
                {isActive && !isCollapsed && (
                  <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-primary-foreground animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-sidebar-border/50">
          {(!isCollapsed || isMobileOpen) ? (
            <div className="animate-in fade-in duration-700">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">© 2025 Teamzen <span className="text-primary/50">Core</span></p>
              <div className="mt-3 flex items-center space-x-2 bg-muted/30 p-2 rounded-xl border border-border/50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-bold text-muted-foreground uppercase truncate">System Active</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
