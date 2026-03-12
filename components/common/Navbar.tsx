"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store/useStore";
import { ThemeSelector } from "./ThemeSelector";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { cn } from "@/lib/utils";

import { NotificationBell } from "./NotificationBell";
import {
  LogOut,
  Menu,
  Plane,
  Settings,
  User,
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  CircleDollarSign,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";

interface NavbarProps {
  onMenuClick?: () => void;
  isSidebarCollapsed?: boolean;
}

const IMPORTANT_ROUTES = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leaves", href: "/leaves", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Payroll", href: "/payroll", icon: CircleDollarSign },
];

export function Navbar({ onMenuClick, isSidebarCollapsed = false }: NavbarProps) {
  const { navbarTabs, activeNavbarTab, setActiveNavbarTab, logoutUser, user } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Clear store significantly
      logoutUser();
      localStorage.clear();
      // Use window.location.href to force a full page refresh and clear in-memory state
      window.location.href = "/login";
    }
  };

  // Scroll-aware state
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top if clicking the currently active route
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isActive = href === '/dashboard' ? pathname === href : pathname.startsWith(href);
    if (isActive) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-500 ease-in-out",
      isScrolled ? "px-4 sm:px-6 py-4" : "px-0 py-0"
    )}>
      <div className={cn(
        "flex justify-between items-center pointer-events-auto transition-all duration-500 ease-in-out",
        isScrolled
          ? "gap-4 bg-background px-4 sm:px-6 py-3 rounded-2xl sm:rounded-3xl shadow-2xl shadow-primary/10 border-border/40 max-w-7xl mx-auto w-full"
          : "gap-4 bg-background border-b border-border/30 px-4 sm:px-8 py-4 shadow-xs"
      )}>
        <div className="flex justify-between items-center w-full gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
            {/* Mobile Menu Toggle */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="md:hidden p-2 hover:bg-muted/50 rounded-xl transition-all active:scale-95 text-foreground"
              >
                <Menu className="w-6 h-6" />
              </button>
            )}

            {/* Logo */}
            <Link
              href="/dashboard"
              onClick={(e) => handleNavClick(e, "/dashboard")}
              className="flex items-center space-x-3 group shrink-0"
            >
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform overflow-hidden">
                {user?.organization?.logo?.url ? (
                  <Image src={user.organization.logo.url as string} alt="Logo" width={48} height={48} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-primary-foreground font-black text-xl">
                    {user?.organization?.name?.charAt(0) || 'P'}
                  </span>
                )}
              </div>
              <div className="flex-col hidden sm:flex">
                <span className="font-black text-sm text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                  {user?.organization?.name || 'Teamzen'}
                </span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">
                  {user?.role === 'admin' ? 'Strategic Intelligence' : 'Workforce Cluster'}
                </span>
              </div>
            </Link>
          </div>

          {/* Center Navigation - Contextual tabs OR Important routes when sidebar is collapsed */}
          <div className="flex-1 flex justify-center px-4 overflow-hidden">
            {isSidebarCollapsed ? (
              /* Important Routes (Show only when sidebar is collapsed) */
              <div className="flex items-center bg-muted/40 p-1 rounded-2xl border border-border/50 backdrop-blur-md max-w-full overflow-x-auto scrollbar-hide animate-slide-up duration-300">
                {IMPORTANT_ROUTES.map((route) => {
                  const isActive = route.href === '/dashboard' ? pathname === route.href : pathname.startsWith(route.href);
                  return (
                    <Link
                      key={route.href}
                      href={route.href}
                      onClick={(e) => handleNavClick(e, route.href)}
                      className={cn(
                        "flex items-center space-x-2.5 px-4 sm:px-6 py-2 rounded-xl transition-all duration-300 group whitespace-nowrap",
                        isActive
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                      )}
                    >
                      <route.icon className={cn("w-5 h-5 transition-transform group-hover:scale-125", isActive && "scale-110")} />
                      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">
                        {route.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              /* Contextual Navbar Tabs (Show when sidebar is open or if contextual tabs exist) */
              navbarTabs.length > 0 && (
                <div className="flex items-center bg-muted/30 p-1 rounded-2xl border border-border/50 backdrop-blur-md max-w-full overflow-x-auto scrollbar-hide animate-fade-in duration-500">
                  {navbarTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveNavbarTab(tab.id)}
                      className={cn(
                        "flex items-center space-x-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap",
                        activeNavbarTab === tab.id
                          ? `bg-linear-to-r ${tab.color || 'from-primary to-primary/80'} text-white shadow-xl shadow-primary/20 -translate-y-0.5`
                          : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span className="text-base">{tab.iconElement}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest hidden xl:block">{tab.label}</span>
                    </button>
                  ))}
                </div>
              )
            )}
          </div>

          {/* Right Section: User Menu & Tools */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center bg-muted/30 p-1 rounded-xl sm:rounded-2xl border border-border/50 space-x-1">
              <NotificationBell />
              <ThemeSelector />
            </div>

            {user && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 px-1 sm:px-2 py-2 rounded-2xl transition-all hover:bg-muted/50 text-foreground group focus:outline-none">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50 shadow-sm ${!user.profilePictureUrl ? 'bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-[10px] sm:text-xs font-black' : ''}`}>
                      {user.profilePictureUrl ? (
                        <Image
                          src={user.profilePictureUrl as string}
                          alt="Profile"
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <>
                          {user.firstName?.charAt(0)}
                          {user.lastName?.charAt(0)}
                        </>
                      )}
                    </div>
                    <div className="flex-col items-start hidden xl:flex">
                      <span className="text-[11px] font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                        {user.role} Member
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl shadow-2xl border-border bg-card/80 backdrop-blur-xl">
                  <DropdownMenuLabel className="px-4 py-3 bg-muted/20 rounded-2xl mb-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Account Protocol</p>
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform"><User className="w-5 h-5" /></span>
                      <span className="text-sm font-bold">Personal Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {(user.role === 'admin' || user.role === 'manager') && (
                    <DropdownMenuItem asChild>
                      <a
                        href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001/dashboard"}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 cursor-pointer group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform"><Plane className="w-5 h-5" /></span>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">Admin Panel</span>
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Manager View</span>
                        </div>
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link
                      href="/settings"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform"><Settings className="w-5 h-5" /></span>
                      <span className="text-sm font-bold">System Configuration</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer group focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform"><LogOut className="w-5 h-5" /></span>
                    <span className="text-sm font-bold">Terminate Session</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
