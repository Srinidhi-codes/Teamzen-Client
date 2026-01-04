"use client";

import { useUser } from "@/lib/api/hooks";
import { Stat } from "@/components/common/Stats";
import { Card } from "@/components/common/Card";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useUser();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-2xl border border-white/30 shadow-xl animate-slide-up">
        <div className="w-full h-full p-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.first_name}! 👋
            </h1>
            <p className="text-gray-600">
              Here&apos;s what&apos;s happening with your team today.
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Stat
          icon="👥"
          label="Total Employees"
          value="245"
          change={{ value: 12, type: "increase" }}
          gradient="from-blue-500 to-cyan-600"
        />
        <Stat
          icon="📅"
          label="Pending Requests"
          value="12"
          change={{ value: 3, type: "decrease" }}
          gradient="from-yellow-500 to-orange-500"
        />
        <Stat
          icon="📊"
          label="Attendance Rate"
          value="94.2%"
          change={{ value: 2.5, type: "increase" }}
          gradient="from-green-500 to-emerald-600"
        />
        <Stat
          icon="💰"
          label="Payroll Status"
          value="Jan 2025"
          gradient="from-purple-500 to-pink-600"
        />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions" hover gradient>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/leaves"
            className="btn-primary flex items-center justify-center space-x-2 group"
          >
            <span>📝</span>
            <span>Request Leave</span>
          </Link>
          <Link
            href="/attendance"
            className="btn-success flex items-center justify-center space-x-2 group"
          >
            <span>✅</span>
            <span>Check In/Out</span>
          </Link>
          <Link
            href="/payroll"
            className="btn-secondary flex items-center justify-center space-x-2 group"
          >
            <span>📄</span>
            <span>View Payslip</span>
          </Link>
          <Link
            href="/profile"
            className="btn-profile flex items-center justify-center space-x-2 group"
          >
            <span>👤</span>
            <span>My Profile</span>
          </Link>
        </div>
      </Card>

      {/* Recent Activity & Upcoming Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="Recent Activity" hover gradient>
          <div className="space-y-4">
            <div className="flex items-start space-x-4 p-4 bg-indigo-50 rounded-xl border-l-4 border-indigo-600 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                ✓
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Leave Request Approved
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Your leave request for Jan 15-17 has been approved
                </p>
                <p className="text-xs text-gray-400 mt-2">2 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border-l-4 border-green-600 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                💰
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Payslip Generated</p>
                <p className="text-sm text-gray-600 mt-1">
                  December 2024 payslip is ready for download
                </p>
                <p className="text-xs text-gray-400 mt-2">5 hours ago</p>
              </div>
            </div>

            <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-xl border-l-4 border-blue-600 hover:shadow-md transition-all duration-200">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                📊
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Performance Review
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Q4 2024 performance review is now available
                </p>
                <p className="text-xs text-gray-400 mt-2">1 day ago</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Upcoming Events */}
        <Card title="Upcoming Events" hover gradient>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-xl hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                15
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Team Meeting</p>
                <p className="text-sm text-gray-600">
                  Monthly sync-up at 10:00 AM
                </p>
              </div>
              <span className="badge badge-primary">Tomorrow</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-xl hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                20
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Training Session</p>
                <p className="text-sm text-gray-600">
                  New HR software training
                </p>
              </div>
              <span className="badge badge-warning">In 5 days</span>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-xl hover:shadow-md transition-all duration-200">
              <div className="w-12 h-12 bg-linear-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0">
                31
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">
                  Payroll Processing
                </p>
                <p className="text-sm text-gray-600">
                  January payroll deadline
                </p>
              </div>
              <span className="badge badge-success">In 2 weeks</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
