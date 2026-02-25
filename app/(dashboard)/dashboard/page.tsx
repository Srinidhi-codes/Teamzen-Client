"use strict";
"use client";

import { useState } from "react";
import Link from "next/link";
import moment from "moment";
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  Zap,
  CheckCircle2,
  AlertCircle,
  MoreHorizontal,
  FileText,
  Briefcase,
  ChevronRight,
  Plane,
  XCircle,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useGraphQLLeaveRequests } from "@/lib/graphql/leaves/leavesHook";
import { useGraphQlAttendance } from "@/lib/graphql/attendance/attendanceHooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { ModernStat } from "@/components/common/Stats";
import { FAB } from "@/components/common/FAB";
import { Badge } from "@/components/common/Badge";

// Attendance Trend Chart imports handled below

import { useQuery } from "@apollo/client/react";
import { GET_USER_DASHBOARD_STATS } from "@/lib/graphql/dashboard/queries";

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useGraphQLUser();
  const { data: dashboardData, loading: isDashboardLoading } = useQuery(GET_USER_DASHBOARD_STATS);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const isLoading = isUserLoading || isDashboardLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-premium-label animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  const stats = (dashboardData as any)?.userDashboardStats || {};

  // Recent Activity: Use data from backend
  const recentActivity = stats.recentActivities?.map((item: any) => {
    const isLeave = item.action.toLowerCase().includes('leave');
    const isNotif = item.id.includes('notif');

    return {
      ...item,
      title: isLeave ? 'Leave Request' : isNotif ? 'System Message' : 'Attendance Log',
      desc: item.action,
      date: item.time,
      icon: isLeave ? Calendar : isNotif ? Zap : Clock,
      color: 'text-primary',
      bg: 'bg-primary/10'
    };
  }) || [];

  return (
    <div className="p-6 space-y-8 animate-fade-in relative min-h-screen bg-background/50">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Welcome back, <span className="text-primary italic">{user?.firstName || 'User'}!</span> 👋
          </h1>
          <p className="text-muted-foreground font-medium mt-2">
            {moment().format('dddd, MMMM DD, YYYY')}
          </p>
        </div>
        <div className="flex items-center">
          <Badge variant="success">System Online</Badge>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/attendance/attendance-correction">
          <ModernStat
            icon={TrendingUp}
            label="Attendance Rate"
            value={`${stats.attendanceRate || 0}%`}
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
        </Link>
        <Link href="/leaves">
          <ModernStat
            icon={Calendar}
            label="Leave Balance"
            value={stats.leaveBalances?.[0]?.balance || 0}
            color="text-blue-500"
            bg="bg-blue-500/10"
          />
        </Link>
        <Link href="/leaves">
          <ModernStat
            icon={Clock}
            label="Pending Requests"
            value={stats.pendingRequestsCount || 0}
            color="text-orange-500"
            bg="bg-orange-500/10"
          />
        </Link>
        <Link href="/attendance/attendance-correction">
          <ModernStat
            icon={Users}
            label="Days Present"
            value={stats.daysPresent || 0}
            color="text-purple-500"
            bg="bg-purple-500/10"
          />
        </Link>
        <Link href="/payroll">
          <ModernStat
            icon={DollarSign}
            label="Monthly Salary"
            value={`$${(user as any)?.salary || '8,500'}`} // Mock/User salary
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent Activity Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black tracking-tight">Recent Activity</h2>
              <Link href="/notifications" className="text-primary text-xs font-bold uppercase tracking-widest cursor-pointer">View All</Link>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
                <Link
                  key={i}
                  href={item.id.includes('notif') ? '/notifications' : item.id.includes('leave') ? '/leaves' : '/attendance'}
                  className="flex items-center justify-between p-4 rounded-3xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground/60">
                    <span>{moment(item.date).fromNow()}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-10 text-muted-foreground text-sm">No recent activity detected.</div>
              )}
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="bg-card rounded-4xl p-6 border border-border/40 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-500/10 rounded-xl">
                <TrendingUp className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="font-black text-lg">Attendance Trend</h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)' }}
                    itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                  />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="5 5" opacity={0.5} />
                  <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="space-y-6">
            <h2 className="text-lg font-black tracking-tight flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Calendar className="w-4 h-4 text-blue-500" /></div>
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { date: "15", month: "FEB", title: "Payroll Processing", type: "Finance", color: "text-emerald-500" },
                { date: "20", month: "FEB", title: "Performance Review", type: "HR", color: "text-blue-500" },
                { date: "25", month: "FEB", title: "Team Meeting", type: "Event", color: "text-purple-500" },
                { date: "28", month: "FEB", title: "Salary Credit", type: "Finance", color: "text-emerald-500" },
              ].map((ev, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-3xl bg-card border border-border/40 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 flex flex-col items-center justify-center border border-border/50 group-hover:bg-primary/5 transition-colors">
                    <span className="text-lg font-black text-foreground leading-none">{ev.date}</span>
                    <span className="text-[9px] font-black text-muted-foreground uppercase mt-0.5">{ev.month}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm text-foreground">{ev.title}</p>
                    <div className="mt-1">
                      <Badge variant={ev.type === 'Finance' ? 'success' : ev.type === 'HR' ? 'info' : ev.type === 'Event' ? 'warning' : 'default'}>
                        {ev.type}
                      </Badge>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1 space-y-8">

          {/* Last 7 Days Widget */}
          <div className="bg-card rounded-4xl p-6 border border-border/40 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-xl text-blue-500">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm uppercase tracking-wider">Last 7 Days</h3>
            </div>

            <div className="flex justify-between items-center px-1">
              {stats.last7Days?.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <Link href="/attendance/attendance-correction" className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-all hover:scale-110 cursor-default ${d.status === 'present' ? 'bg-emerald-500' :
                    d.status === 'leave' ? 'bg-orange-500' :
                      d.status === 'weekend' ? 'bg-muted text-muted-foreground opacity-30 shadow-none' :
                        d.status === 'pending' ? 'bg-amber-500' :
                          d.status === 'not_started' ? 'bg-muted/30 border border-dashed border-muted-foreground/20' :
                            'bg-red-500'
                    }`}>
                    {d.status === 'present' && <CheckCircle2 className="w-4 h-4" />}
                    {d.status === 'leave' && <Plane className="w-4 h-4" />}
                    {d.status === 'absent' && <XCircle className="w-4 h-4" />}
                    {d.status === 'pending' && <Clock className="w-3 h-3" />}
                    {d.status === 'weekend' && <span className="text-[10px] text-muted-foreground font-black">W</span>}
                    {d.status === 'not_started' && <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />}
                  </Link>
                  <div className="text-center">
                    <span className="block text-xs font-bold text-foreground">{d.date}</span>
                    <span className="block text-[9px] font-bold text-muted-foreground uppercase">{d.dayStr}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payroll Summary */}
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-4xl p-6 border border-emerald-100 dark:border-emerald-900/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20">
                  <DollarSign className="w-5 h-5" />
                </div>
                <h3 className="font-black text-sm uppercase tracking-wider text-emerald-900 dark:text-emerald-100">Payroll Summary</h3>
              </div>
              <button className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                <FileText className="w-3 h-3" /> Payslip
              </button>
            </div>

            <div className="space-y-6 relative z-10">
              <div>
                <p className="text-xs text-muted-foreground font-semibold mb-1">February 2026</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-black text-emerald-950 dark:text-emerald-50 tracking-tight">$8,750</h2>
                  <Badge variant="warning">Processing</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-emerald-200/50 dark:border-emerald-800/30">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Base</p>
                  <p className="font-bold text-foreground">$8,500</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Allowances</p>
                  <p className="font-bold text-emerald-600">+$1,200</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Deductions</p>
                  <p className="font-bold text-red-500">-$950</p>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-muted-foreground">YTD Earnings</span>
                </div>
                <span className="font-black tabular-nums">$17,400</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-bold text-muted-foreground">Next Payment</span>
                </div>
                <span className="font-black tabular-nums">Feb 28</span>
              </div>
            </div>
          </div>


          {/* Performance Insights Card */}
          <div className="relative overflow-hidden rounded-4xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-8 shadow-xl shadow-purple-500/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" />

            <div className="relative z-10 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md border border-white/30 mb-2">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-black tracking-tight">Performance Insights</h3>
              <p className="text-sm text-white/90 font-medium leading-relaxed">
                Your attendance and productivity metrics are looking great this month. Keep up the excellent work!
              </p>
              <Button className="w-full bg-white text-purple-600 hover:bg-white/90 font-black tracking-wide border-none mt-4 shadow-lg shadow-black/10">
                View Detailed Report
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* Floating Action Buttons */}
      {/* Floating Action Buttons */}
      <div className="fixed bottom-8 right-5 flex flex-col gap-3 z-50 items-end">
        {isFabOpen && (
          <div className="flex flex-col gap-3 animate-in slide-in-from-bottom-10 fade-in duration-300 mb-2 mr-5 items-end">
            <Link href="/attendance">
              <FAB icon={Clock} label="Attendance" color="bg-emerald-500 shadow-emerald-500/40" />
            </Link>
            <Link href="/leaves">
              <FAB icon={Calendar} label="Leaves" color="bg-blue-500 shadow-blue-500/40" />
            </Link>
            <Link href="/payroll">
              <FAB icon={DollarSign} label="Payroll" color="bg-purple-500 shadow-purple-500/40" />
            </Link>
          </div>
        )}
        <button
          onClick={() => setIsFabOpen(!isFabOpen)}
          className={`w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-300 ${isFabOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

    </div>
  );
}

// Inline Components removed - imported from shared components
