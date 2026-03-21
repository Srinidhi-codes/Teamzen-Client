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
  LogOut
} from "lucide-react";
import Image from "next/image";
import { useStore } from "@/lib/store/useStore";

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
  const { logoutUser } = useStore();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logoutUser();
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const sidebarClasses = `
    fixed inset-y-0 left-0 z-100
    flex flex-col
    bg-background
    transition-all duration-500 ease-in-out
    ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
    ${isCollapsed ? "md:w-24" : "md:w-72"}
    w-72
    border-r border-sidebar-border
    shadow-2xl
    overflow-x-hidden
  `;

  return (
    <>
      {/* Overlay Backdrop */}
      {(isMobileOpen || !isCollapsed) && (
        <div
          className="fixed inset-0 bg-black/50 z-90 transition-opacity duration-500"
          onClick={isMobileOpen ? closeMobile : toggleCollapse}
        />
      )}

      <aside className={sidebarClasses}>
        {/* Header */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-sidebar-border/50">
          {(!isCollapsed || isMobileOpen) && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                <Image
                  src={"/images/teamzen_zoomed.png"}
                  alt="Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8 object-contain"
                />
              </div>
              <h1 className="text-sm font-black text-foreground uppercase text-nowrap tracking-tight">
                Teamzen <span className="text-primary">CORE</span>
              </h1>
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
                id={`nav-${item.name.toLowerCase()}`}
                onClick={() => isMobileOpen && closeMobile()}
                className={`flex items-center space-x-4 px-4 py-3.5 rounded-2xl ${isCollapsed && !isMobileOpen ? "justify-center" : "justify-start"} transition-all duration-300 relative group ${isActive
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
                  <span className={`font-black text-[11px] uppercase tracking-wider truncate transition-all ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'}`}>
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
        <div className={`p-4 sm:p-6 border-t border-sidebar-border/50 transition-all duration-300 space-y-3 ${isCollapsed ? 'px-3' : ''}`}>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Logout"
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-300 group text-destructive/70 hover:bg-destructive/10 hover:text-destructive active:scale-95 ${isCollapsed && !isMobileOpen ? 'justify-center' : 'justify-start'
              }`}
          >
            <LogOut className="w-5 h-5 shrink-0 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5" />
            {(!isCollapsed || isMobileOpen) && (
              <span className="font-black text-[11px] uppercase tracking-wider">Logout</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
