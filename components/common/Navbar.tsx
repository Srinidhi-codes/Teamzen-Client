"use client";

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
  Calendar,
  CircleDollarSign,
  Clock,
  Compass,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
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

function roleLabel(role?: string) {
  if (!role) return "";
  if (role === "admin") return "Admin";
  if (role === "manager") return "Manager";
  if (role === "hr") return "HR";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { logoutUser, user } = useStore();
  const { data } = useQuery<SecurityLogResponse>(GET_MY_LOGIN_HISTORY, {
    variables: { page: 1, pageSize: 1 },
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
      localStorage.clear();
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

  return (
    <header className="sticky top-0 z-70 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-primary text-primary-foreground">
              {user?.organization?.logo?.url ? (
                <Image
                  src={user.organization.logo.url as string}
                  alt="Organization"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <span className="text-xs font-semibold">
                  {user?.organization?.name?.charAt(0) || "T"}
                </span>
              )}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-semibold text-foreground">
                {user?.organization?.name || "Teamzen"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{roleLabel(user?.role)}</p>
            </div>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {IMPORTANT_ROUTES.map((route) => {
            const isActive =
              route.href === "/dashboard" ? pathname === route.href : pathname.startsWith(route.href);
            return (
              <Link
                key={route.href}
                href={route.href}
                id={`navbar-nav-${route.name.toLowerCase()}`}
                onClick={(e) => handleNavClick(e, route.href)}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors",
                  isActive
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                )}
              >
                <route.icon className="h-4 w-4" />
                <span className="hidden xl:inline">{route.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <NotificationBell />
          <ThemeSelector />

          {user && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  id="user-menu-trigger"
                  className="ml-1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-md border border-border bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label="Account menu"
                >
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
                    <span className="text-xs font-medium text-foreground">
                      {user.firstName?.charAt(0)}
                      {user.lastName?.charAt(0)}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1">
                <DropdownMenuLabel className="px-2 py-2 font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {user.firstName} {user.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground">{roleLabel(user.role)}</span>
                    <span
                      className={cn(
                        "mt-1 w-fit rounded px-1.5 py-0.5 text-[10px] font-medium",
                        locationVerified
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      )}
                    >
                      {locationVerified ? "Location verified" : "Location unverified"}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex cursor-pointer items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                {(user.role === "admin" || user.role === "manager" || user.role === "hr") && (
                  <DropdownMenuItem asChild>
                    <a
                      href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001/dashboard"}
                      className="flex cursor-pointer items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Admin panel
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={startTour}
                  className="flex cursor-pointer items-center gap-2"
                >
                  <Compass className="h-4 w-4" />
                  Take a tour
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
