"use client";

import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Sidebar } from "../common/Sidebar";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: "📊" },
  { name: "Leaves", href: "/leaves", icon: "📅" },
  { name: "Attendance", href: "/attendance", icon: "📍" },
  { name: "Payroll", href: "/payroll", icon: "💰" },
  { name: "Employees", href: "/employees", icon: "👥" },
  { name: "Analytics", href: "/analytics", icon: "📈" },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useGraphQLUser();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Also clear Apollo store? Ideally.
    router.push("/login");
  };

  return (
    <div className="flex h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarCollapsed ? "w-20 items-center" : "w-72"
          } bg-linear-to-b from-purple-600 via-indigo-600 to-black text-white 
        transition-all duration-150 flex flex-col shadow-2xl relative z-20`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-indigo-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-linear-to-br from-white to-indigo-100 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-indigo-900 font-bold text-2xl">P</span>
            </div>
            {!sidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-xl font-bold">Payroll</h1>
                <p className="text-xs text-indigo-200">Management System</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white text-indigo-900 rounded-full 
          shadow-lg hover:scale-110 transition-transform duration-200 flex items-center justify-center z-30"
        >
          <span className="text-sm font-bold">
            {sidebarCollapsed ? "→" : "←"}
          </span>
        </button>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${isActive
                    ? "bg-white text-indigo-900 shadow-lg"
                    : "text-indigo-100 hover:bg-indigo-700/50"
                  }`}
                title={sidebarCollapsed ? item.name : ""}
              >
                <span className="text-2xl">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="font-semibold animate-fade-in">
                    {item.name}
                  </span>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="ml-auto w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        {!sidebarCollapsed && (
          <div className="p-4 border-t border-indigo-700/50 animate-fade-in">
            <div className="text-xs text-indigo-200 space-y-1">
              <p>© 2025 Payroll System</p>
              <p className="text-indigo-300">Version 1.0.0</p>
            </div>
          </div>
        )}
      </aside>
      {/* <Sidebar /> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {navItems.find((item) => pathname === item.href)?.name ||
                    "Dashboard"}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                {/* User Dropdown */}
                {user && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center space-x-3 hover:bg-gray-50 px-4 py-2 rounded-xl transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                        {user.firstName?.charAt(0)}
                        {user.lastName?.charAt(0)}
                      </div>
                      <div className="text-left hidden sm:block">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? "rotate-180" : ""
                          }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-2xl py-2 z-20 animate-scale-in">
                        <Link
                          href="/profile"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors no-underline text-gray-700"
                        >
                          <span className="text-xl">👤</span>
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-indigo-50 transition-colors no-underline text-gray-700"
                        >
                          <span className="text-xl">⚙️</span>
                          <span className="font-medium">Settings</span>
                        </Link>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <span className="text-xl">🚪</span>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-full mx-auto animate-fade-in">{children}</div>
        </main>
      </div>
    </div>
  );
}
