"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import { GET_MY_LOGIN_HISTORY } from "@/lib/graphql/users/queries";
import { SecurityLogResponse } from "@/lib/graphql/users/types";
import { useStore } from "@/lib/store/useStore";
import { ThemeSelector } from "./ThemeSelector";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { useOnboardingTour } from "./OnboardingTour";
import {
  CalendarDays,
  CircleDollarSign,
  Clock,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  ShieldCheck,
  User,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  { name: "Leaves", href: "/leaves", icon: CalendarDays },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Payroll", href: "/payroll", icon: CircleDollarSign },
];

function roleLabel(role?: string) {
  if (!role) return "";
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "hr") return "HR";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { logoutUser, user } = useStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { data } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
    variables: { page: 1, pageSize: 1 },
    skip: !userMenuOpen,
    fetchPolicy: "cache-first",
  });
  const { startTour } = useOnboardingTour();
  const pathname = usePathname();
  const locationVerified = Boolean(data?.mySecurityLogs?.results?.[0]?.latitude);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      logoutUser();
      localStorage.removeItem("payroll-app-storage");
      window.location.href = "/login";
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    const isActive = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    if (isActive) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const canAccessAdmin =
    user?.role === "admin" || user?.role === "manager" || user?.role === "hr";

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-md transition-colors">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Left Section: Mobile toggle & Org Brand */}
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-muted/20 text-muted-foreground transition-all hover:bg-muted/60 hover:text-foreground md:hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link
            href="/dashboard"
            className="group flex min-w-0 items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-xs ring-1 ring-border/50">
              {user?.organization?.logo?.url ? (
                <Image
                  src={user.organization.logo.url as string}
                  alt="Organization"
                  width={36}
                  height={36}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-bold tracking-tight">
                  {user?.organization?.name?.charAt(0) || "T"}
                </span>
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {user?.organization?.name || "Teamzen"}
                </p>
                {user?.organization?.plan && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {user.organization.plan}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="truncate">
                  {user?.department?.name || roleLabel(user?.role) || "Workspace"}
                </span>
                {user?.officeLocation?.name && (
                  <>
                    <span className="text-muted-foreground/40">•</span>
                    <span className="truncate flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5 text-muted-foreground/70" />
                      {user.officeLocation.name}
                    </span>
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Center Section: Floating Segmented Navigation Track */}
        <nav className="hidden items-center lg:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 p-1 shadow-xs backdrop-blur-md">
            {IMPORTANT_ROUTES.map((route) => {
              const isActive =
                route.href === "/dashboard"
                  ? pathname === route.href
                  : pathname.startsWith(route.href);
              return (
                <Link
                  key={route.href}
                  href={route.href}
                  id={`navbar-nav-${route.name.toLowerCase()}`}
                  onClick={(e) => handleNavClick(e, route.href)}
                  className={cn(
                    "relative flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-150",
                    isActive
                      ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border/80"
                      : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
                  )}
                >
                  <route.icon
                    className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{route.name}</span>
                  {isActive && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Right Section: Live Time, Admin Launcher, Theme, Notifications, User Menu */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        
          {/* Quick Admin Console Launcher */}
          {canAccessAdmin && (
            <a
              href={
                process.env.NEXT_PUBLIC_ADMIN_URL ||
                (typeof window !== "undefined"
                  ? `${window.location.origin.replace("3000", "3001")}/dashboard`
                  : "http://localhost:3001/dashboard")
              }
              target="_blank"
              rel="noopener noreferrer"
              className="hidden xl:inline-flex items-center gap-1.5 rounded-xl border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-all hover:bg-primary/20 hover:border-primary/30"
              title="Open Admin Console in a new tab"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Admin Console</span>
              <ExternalLink className="h-3 w-3 opacity-70" />
            </a>
          )}

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Notifications */}
          <NotificationBell />

          {/* User Profile Pill & Dropdown */}
          {user && (
            <DropdownMenu modal={false} onOpenChange={setUserMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-menu-trigger"
                  className="group ml-0.5 flex items-center gap-2 rounded-xl border border-border/70 bg-muted/30 p-1 sm:pr-3 transition-all hover:bg-muted/60 hover:border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer"
                  aria-label="Account menu"
                >
                  <div className="relative flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl as string}
                        alt=""
                        width={32}
                        height={32}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </span>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
                  </div>

                  <div className="hidden min-w-0 text-left sm:block">
                    <p className="truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground leading-tight">
                      {roleLabel(user.role)}
                    </p>
                  </div>

                  <ChevronDown
                    className={cn(
                      "hidden h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 sm:block",
                      userMenuOpen && "rotate-180"
                    )}
                  />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 p-2 rounded-2xl border-border bg-card/95 backdrop-blur-md shadow-xl"
              >
                {/* Profile Card Header */}
                <div className="flex items-center gap-3 p-2 rounded-xl bg-muted/40 border border-border/50 mb-1.5">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary text-primary-foreground font-bold text-sm">
                    {user.profilePictureUrl ? (
                      <Image
                        src={user.profilePictureUrl as string}
                        alt=""
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <span>
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-1 mb-1.5 text-[11px]">
                  <span className="font-medium text-muted-foreground">Location</span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-medium",
                      locationVerified
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        locationVerified ? "bg-emerald-500" : "bg-amber-500"
                      )}
                    />
                    {locationVerified ? "Verified" : "Unverified"}
                  </span>
                </div>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem asChild>
                  <Link
                    href="/profile"
                    className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                  >
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>

                {canAccessAdmin && (
                  <DropdownMenuItem asChild>
                    <a
                      href={
                        process.env.NEXT_PUBLIC_ADMIN_URL ||
                        (typeof window !== "undefined"
                          ? `${window.location.origin.replace("3000", "3001")}/dashboard`
                          : "http://localhost:3001/dashboard")
                      }
                      className="flex cursor-pointer items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                    >
                      <span className="flex items-center gap-2.5">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        <span>Admin Console</span>
                      </span>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </a>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={startTour}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors hover:bg-muted"
                >
                  <Compass className="h-4 w-4 text-muted-foreground" />
                  <span>Feature Tour</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 focus:bg-destructive/10 focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}

