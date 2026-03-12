"use strict";
"use client";

import { useState, useEffect } from "react";
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
  Briefcase,
  ChevronRight,
  Plane,
  XCircle,
  Plus,
  Cake,
  PartyPopper,
  Star,
  Award,
  UserPlus,
  Gift,
  PartyPopperIcon
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
import Image from "next/image";

export default function DashboardPage() {
  const { user, isLoading: isUserLoading, error: userError } = useGraphQLUser();
  const { data: dashboardData, loading: isDashboardLoading, error: dashboardError } = useQuery(GET_USER_DASHBOARD_STATS);
  const [isFabOpen, setIsFabOpen] = useState(false);

  const isLoading = isUserLoading || isDashboardLoading;

  // 🛡️ Redirect to login if user session is invalid after loading
  useEffect(() => {
    if (!isLoading && !user && userError) {
      window.location.href = "/login";
    }
  }, [isLoading, user, userError]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-premium-label animate-pulse">Initializing Dashboard...</p>
      </div>
    );
  }

  if (dashboardError && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <h2 className="text-xl font-bold">Session Encountered an Issue</h2>
        <p className="text-muted-foreground">Refreshing your access...</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  const stats = (dashboardData as any)?.userDashboardStats || {};
  const wishMessage = stats.wishMessage;
  const upcomingEvents = stats.upcomingEvents || [];

  // Recent Activity: Use data from backend
  const recentActivity = stats.recentActivities?.map((item: any) => {
    const isLeave = item.action.toLowerCase().includes('leave');
    const isNotif = item.id.includes('notif');
    const isAnniv = item.action.toLowerCase().includes('celebrates');
    const isJoin = item.action.toLowerCase().includes('joined');

    return {
      ...item,
      title: isLeave ? 'Leave Request' : isNotif ? 'System Message' : isAnniv ? 'Work Anniversary' : isJoin ? 'New Member' : 'Attendance Log',
      desc: item.action,
      date: item.time,
      icon: isLeave ? Calendar : isNotif ? Zap : isAnniv ? Award : isJoin ? UserPlus : Clock,
      color: isAnniv ? 'text-amber-500' : isJoin ? 'text-blue-500' : 'text-primary',
      bg: isAnniv ? 'bg-amber-500/10' : isJoin ? 'bg-blue-500/10' : 'bg-primary/10'
    };
  }) || [];

  return (
    <div className="p-4 sm:p-6 space-y-8 animate-fade-in relative min-h-screen bg-background/50">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
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

      {/* Wish Message Banner */}
      {wishMessage && (
        <div className="relative overflow-hidden bg-linear-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl sm:rounded-4xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 animate-in slide-in-from-top-4 duration-1000 shadow-xl shadow-primary/5">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <PartyPopper className="w-32 h-32 rotate-12" />
          </div>
          <div className="shrink-0 w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
            {wishMessage.includes('birthday') ? <Cake className="w-7 h-7" /> : <PartyPopper className="w-7 h-7" />}
          </div>
          <div className="relative z-10">
            <h2 className="text-xl font-black text-foreground tracking-tight mb-1">Congratulations!</h2>
            <p className="text-base font-medium text-muted-foreground">{wishMessage}</p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
            className="hidden md:block"
          />
        </Link>
        <Link href="/attendance/attendance-correction">
          <ModernStat
            icon={Users}
            label="Days Present"
            value={stats.daysPresent || 0}
            color="text-purple-500"
            bg="bg-purple-500/10"
            className="hidden md:block"
          />
        </Link>
        {/* <Link href="/payroll">
          <ModernStat
            icon={DollarSign}
            label="Monthly Salary"
            value={`$${(user as any)?.salary || '8,500'}`} // Mock/User salary
            color="text-emerald-500"
            bg="bg-emerald-500/10"
          />
        </Link> */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-8">

          {/* Recent Activity Section */}
          <Card
            title="Recent Activity"
            icon={Zap}
            gradient
            hover
            action={<Link href="/notifications" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">View All</Link>}
          >
            <div className="space-y-4 max-h-[400px] overflow-y-auto -mx-1 px-1">
              {recentActivity.length > 0 ? recentActivity.map((item: any, i: number) => (
                <Link
                  key={i}
                  href={item.id.includes('notif') ? '/notifications' : item.id.includes('leave') ? '/leaves' : '/attendance'}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl sm:rounded-3xl bg-card border border-border hover:border-primary/20 hover:shadow-lg transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                      <item.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground text-wrap mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-medium text-muted-foreground/60 shrink-0">
                    <span>{moment(item.date).fromNow()}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </Link>
              )) : (
                <div className="text-center py-10 text-muted-foreground text-sm">No recent activity detected.</div>
              )}
            </div>
          </Card>

          {/* Attendance Trend Chart */}
          <Card
            title="Attendance Trend"
            icon={TrendingUp}
            gradient
            hover
          >
            <div className="h-[250px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.attendanceTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)', backgroundColor: 'var(--card)', color: 'var(--card-foreground)' }}
                    itemStyle={{ color: 'var(--primary)', fontWeight: 'bold' }}
                  />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="5 5" opacity={0.5} />
                  <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorTrend)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card
            title="Upcoming Events"
            icon={Calendar}
            gradient
            hover
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 p-2 sm:p-4 rounded-3xl sm:rounded-4xl bg-card">
              {upcomingEvents.length > 0 ? upcomingEvents.slice(0, 4).map((event: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 w-full rounded-2xl sm:rounded-3xl border border-border hover:border-primary/20 hover:shadow-md hover:translate-y-[-4px] transition-all duration-300 cursor-pointer group">
                  <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border border-border/50 overflow-hidden shrink-0 ${!event.profilePicture ? (event.type === 'birthday' ? 'bg-amber-500/10 text-amber-600' : 'bg-blue-500/10 text-blue-600') : ''
                    }`}>
                    {event.profilePicture ? (
                      <Image
                        src={event.profilePicture.startsWith('http') ? event.profilePicture : `${process.env.NEXT_PUBLIC_API_URL || ''}${event.profilePicture}`}
                        alt={event.user}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-black uppercase">
                        {event.user.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{event.user}</p>
                    <div className="mt-1 flex flex-col lg:flex-row items-start lg:items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-muted-foreground">
                        {moment(event.date).format('MMM D')}
                      </span>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${event.daysUntil === 0 ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'
                        }`}>
                        {event.daysUntil === 0 ? 'Today' : `In ${event.daysUntil} d`}
                      </span>
                    </div>
                    <div>
                      {event.type === 'birthday' ? (
                        <div className="flex items-center gap-2">
                          <Gift className="w-4 h-4 text-amber-500" />
                          <p className="text-[10px] font-black uppercase text-amber-500">Birthday</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <PartyPopperIcon className="w-4 h-4 text-amber-500" />
                          <p className="text-[10px] font-black uppercase text-amber-500">{event.type}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </div>
              )) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-card border border-border/40 rounded-4xl space-y-3">
                  <Gift className="w-10 h-10 text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground font-medium">No upcoming celebrations</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1 space-y-8">

          {/* Last 7 Days Widget */}
          <Card title="Last 7 Days" icon={Calendar} gradient hover>
            <div className="flex justify-between items-center px-1 overflow-x-auto pb-2 scrollbar-hide md:pb-0 md:overflow-hidden">
              {stats.last7Days?.map((d: any, i: number) => (
                <div key={i} className="w-full flex flex-col items-center gap-2 px-1 xl:px-0">
                  <Link
                    href="/attendance/attendance-correction"
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-white shadow-sm transition-all hover:scale-110 ${d.status === 'present' ? 'bg-emerald-500 shadow-emerald-500/30' :
                      d.status === 'leave' ? 'bg-orange-500 shadow-orange-500/30' :
                        d.status === 'weekend' ? 'bg-muted text-muted-foreground opacity-30 shadow-none' :
                          d.status === 'pending' ? 'bg-amber-500 shadow-amber-500/30' :
                            d.status === 'not_started' ? 'bg-muted/30 border-2 border-dashed border-muted-foreground/20' :
                              'bg-red-500 shadow-red-500/30'
                      }`}
                  >
                    {d.status === 'present' && <CheckCircle2 className="w-4 h-4" />}
                    {d.status === 'leave' && <Plane className="w-4 h-4" />}
                    {d.status === 'absent' && <XCircle className="w-4 h-4" />}
                    {d.status === 'pending' && <Clock className="w-3 h-3" />}
                    {d.status === 'weekend' && <span className="text-[10px] text-muted-foreground font-black">W</span>}
                    {d.status === 'not_started' && <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />}
                  </Link>
                  <div className="text-center">
                    <span className="block text-xs font-black text-foreground">{d.date}</span>
                    <span className="block text-[9px] font-bold text-muted-foreground uppercase">{d.dayStr}</span>
                  </div>
                </div>
              ))}
            </div>
            {/* Status legend */}
            <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border/40">
              {[
                { label: 'Present', color: 'bg-emerald-500' },
                { label: 'Holiday', color: 'bg-orange-500' },
                { label: 'Absent', color: 'bg-red-500' },
                { label: 'Pending', color: 'bg-amber-500' },
                { label: 'Weekend', color: 'bg-gray-500' },
              ].map(({ label, color }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Leave Summary */}
          <Card
            title="Leave Summary"
            icon={Calendar}
            gradient
            hover
            className="group"
          >
            <div className="flex justify-end mb-4 relative z-10 -mt-5">
              <Link href="/leaves" className="text-[10px] font-bold uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
                <ChevronRight className="w-3 h-3" /> View All
              </Link>
            </div>

            <div className="space-y-4 relative z-10">
              {stats.leaveBalances?.length > 0 ? (
                stats.leaveBalances.slice(0, 3).map((balance: any, i: number) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-foreground">{balance.name}</span>
                      <span className="text-xs font-black tabular-nums">
                        <span className="text-emerald-500">{balance.balance}</span>
                        <span className="text-muted-foreground"> / {balance.total}</span>
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-700"
                        style={{ width: `${balance.total > 0 ? Math.round((balance.balance / balance.total) * 100) : 0}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-4">No leave balances found</p>
              )}

              <div className="pt-3 border-t border-border/40 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <span className="text-xs font-bold text-muted-foreground">Pending Approvals</span>
                </div>
                <span className="font-black tabular-nums text-orange-500">{stats.pendingRequestsCount || 0}</span>
              </div>

              <Link
                href="/leaves"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Request Leave
              </Link>
            </div>
          </Card>


          {/* Performance Insights Card */}
          <div className="relative overflow-hidden rounded-3xl sm:rounded-4xl bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-6 sm:p-8 shadow-xl shadow-purple-500/20 hover:translate-y-[-8px] transition-all duration-500 ease-out">
            {/* <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl" /> */}
            {/* <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full -ml-10 -mb-10 blur-xl" /> */}

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
