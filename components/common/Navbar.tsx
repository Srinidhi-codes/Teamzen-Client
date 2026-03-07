"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { ThemeSelector } from "./ThemeSelector";
import client from "@/lib/api/client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

import { NotificationBell } from "./NotificationBell";
import { LogOut, Menu, Plane, Settings, User } from "lucide-react";
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
}

export function Navbar({ onMenuClick }: NavbarProps) {
  // const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const { navbarTabs, activeNavbarTab, setActiveNavbarTab, logoutUser, user } = useStore();
  const router = useRouter();

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

  return (
    <nav className="bg-background/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-50">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 gap-4">
          <div className="flex items-center space-x-4">
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
            <Link href="/dashboard" className="flex items-center space-x-3 group shrink-0">
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
                <span className="font-black text-lg text-foreground tracking-tighter leading-none group-hover:text-primary transition-colors">
                  {user?.organization?.name || 'Payroll'}
                </span>
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mt-1">
                  {user?.role === 'admin' ? 'Admin Panel' : 'User Panel'}
                </span>
              </div>
            </Link>
          </div>

          {/* Dynamic Tabs */}
          {navbarTabs.length > 0 && (
            <div className="flex-1 flex justify-center px-4 overflow-hidden">
              <div className="flex items-center bg-muted/20 p-1.5 rounded-2xl border border-border/50 backdrop-blur-md max-w-full overflow-x-auto no-scrollbar">
                {navbarTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveNavbarTab(tab.id)}
                    className={`flex items-center space-x-2.5 px-6 py-2.5 rounded-xl transition-all duration-500 whitespace-nowrap ${activeNavbarTab === tab.id
                      ? `bg-linear-to-r ${tab.color} text-white shadow-lg shadow-primary/20 -translate-y-0.5`
                      : 'hover:bg-background/50 text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    <span className="text-lg">{tab.iconElement}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}


          {/* User Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
            <div className="flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/50 space-x-1">
              <NotificationBell />
              <ThemeSelector />
            </div>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 px-2 py-2 rounded-2xl transition-all hover:bg-muted/50 text-foreground group focus:outline-hidden">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 border border-border/50 shadow-sm ${!user.profilePictureUrl ? 'bg-linear-to-br from-primary to-primary/60 text-primary-foreground text-sm font-black' : ''
                      }`}>
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
                    <div className="flex-col items-start hidden sm:flex">
                      <span className="text-sm font-black tracking-tight leading-none group-hover:text-primary transition-colors">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {user.role}
                      </span>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2 rounded-3xl shadow-2xl border-border bg-white/20 backdrop-blur-sm">
                  <DropdownMenuLabel className="px-4 py-3 bg-muted/20 rounded-2xl mb-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-foreground truncate">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 cursor-pointer group"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform"><User /></span>
                      <span className="text-sm font-bold">My Profile</span>
                    </Link>
                  </DropdownMenuItem>

                  {(user.role === 'admin' || user.role === 'manager') && (
                    <DropdownMenuItem asChild>
                      <a
                        href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001/dashboard"}
                        className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 cursor-pointer group"
                      >
                        <span className="text-lg group-hover:scale-110 transition-transform"><Plane /></span>
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
                      <span className="text-lg group-hover:scale-110 transition-transform"><Settings /></span>
                      <span className="text-sm font-bold">Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50 my-1" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-destructive/10 text-destructive cursor-pointer group focus:bg-destructive/10 focus:text-destructive"
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform"><LogOut /></span>
                    <span className="text-sm font-bold">Logout</span>
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
