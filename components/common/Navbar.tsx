"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useState } from "react";

export function Navbar() {
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:inline">
              Payroll
            </span>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 hover:bg-gray-50 px-3 py-2 rounded-lg transition"
                >
                  <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.firstName?.charAt(0)}
                    {user.lastName?.charAt(0)}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.firstName} {user.lastName}
                  </span>
                </button>

                {/* Dropdown */}
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      👤 My Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 hover:bg-gray-50 text-sm"
                    >
                      ⚙️ Settings
                    </Link>
                    <hr className="my-2" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
