"use client";

import { useAttendanceMutations, useGraphQlAttendance } from "@/lib/graphql/attendance/attendanceHooks";
import { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertCircle,
  TrendingUp,
  Fingerprint,
  Zap,
  Navigation,
  Check,
  X,
  Edit,
  NotebookText,
  LogIn,
  LogOut
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/useStore";
import { cn } from "@/lib/utils";

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));
  const { checkIn, checkOut, checkInLoading, checkOutLoading } = useAttendanceMutations();
  const { attendance: attendanceData, isLoading } = useGraphQlAttendance();
  const router = useRouter();
  const { user } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("hh:mm:ss A"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayAttendance = attendanceData[0];
  const loginDistance = todayAttendance?.loginDistance ? (todayAttendance.loginDistance / 1000).toFixed(2) : "0";
  const logoutDistance = todayAttendance?.logoutDistance ? (todayAttendance.logoutDistance / 1000).toFixed(2) : "0";

  const STATUS_CONFIG: Record<string, { label: string; variant: "success" | "warning" | "danger" | "info"; icon: any }> = {
    late_login: { label: "Late Entry", variant: "warning", icon: AlertCircle },
    early_logout: { label: "Early Exit", variant: "warning", icon: AlertCircle },
    absent: { label: "Absent", variant: "danger", icon: X },
    present: { label: "Active", variant: "success", icon: Check },
  };

  const getLocationAsync = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) reject("Geolocation not supported");
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => reject(err.message)
      );
    });
  };

  const handleAction = async (type: 'in' | 'out') => {
    try {
      const { latitude, longitude } = await getLocationAsync();
      if (type === 'in') {
        await checkIn({ latitude, longitude, officeLocationId: "2", loginTime: moment().format("HH:mm:ss") });
        toast.success("Identity verified. Access granted.");
      } else {
        await checkOut({ latitude, longitude, logoutTime: moment().format("HH:mm:ss") });
        toast.success("Protocol complete. Session terminated.");
      }
    } catch (error) {
      toast.error(error instanceof String ? error : "Location verification failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-6">
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-premium-label animate-pulse">Syncing Biometric Data...</p>
      </div>
    );
  }

  const statusConfig = todayAttendance?.status ? STATUS_CONFIG[todayAttendance.status] : null;

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Attendance Management</h1>
          <p className="text-muted-foreground font-medium text-sm sm:text-base flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Station: <span className="text-foreground font-bold">{user?.officeLocation?.name}</span>
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push("/attendance/attendance-correction")}
          className={cn("w-full sm:w-auto btn-primary text-primary")}
        >
          <Edit className="w-4 h-4 mr-2" />
          Data Correction Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Actions & Status */}
        <div className="lg:col-span-8 space-y-10">

          {/* Main Visualizer */}
          <div className="premium-card bg-primary text-primary-foreground relative overflow-hidden flex flex-col items-center justify-center py-10 sm:py-16 shadow-2xl shadow-primary/40">
            <div className="absolute inset-0 bg-linear-to-b from-white/10 to-transparent pointer-events-none" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-20" />
            <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-white/5 rounded-full blur-3xl opacity-20" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4 px-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md border border-white/20">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em]">Current Time</span>
              </div>
              <div className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter tabular-nums drop-shadow-2xl">
                {currentTime}
              </div>
              <p className="text-xs sm:text-sm font-medium opacity-60 italic">{moment().format("dddd, MMMM Do YYYY")}</p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className={`premium-card p-1 group transition-all duration-500 ${!todayAttendance?.loginTime ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}
              onClick={() => !todayAttendance?.loginTime && handleAction('in')}
            >
              <div className="p-6 sm:p-8 rounded-3xl sm:rounded-4xl border border-border/50 flex flex-col items-center text-center space-y-4 sm:space-y-6 group-hover:bg-primary/5 transition-colors">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">{checkInLoading ? "Verifying..." : "Check In"}</h3>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2 uppercase tracking-widest">Mark Attendance (IN)</p>
                </div>
                {todayAttendance?.loginTime && (
                  <Badge variant="success">Logged at {todayAttendance.loginTime}</Badge>
                )}
              </div>
            </div>

            <div
              className={`premium-card p-1 group transition-all duration-500 ${todayAttendance?.loginTime && !todayAttendance?.logoutTime ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}
              onClick={() => todayAttendance?.loginTime && !todayAttendance?.logoutTime && handleAction('out')}
            >
              <div className="p-6 sm:p-8 rounded-3xl sm:rounded-4xl border border-border/50 flex flex-col items-center text-center space-y-4 sm:space-y-6 group-hover:bg-primary/5 transition-colors">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                  <X className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">{checkOutLoading ? "Verifying..." : "Check Out"}</h3>
                  <p className="text-[10px] sm:text-xs font-medium text-muted-foreground mt-1 sm:mt-2 uppercase tracking-widest">Mark Attendance (OUT)</p>
                </div>
                {todayAttendance?.logoutTime && (
                  <Badge variant="danger">Exited at {todayAttendance.logoutTime}</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status & Telemetry */}
        <div className="lg:col-span-4 space-y-10">
          <Card title="Today's Attendance">
            <div className="space-y-8">
              {statusConfig && (
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/40 tracking-widest">System Status</span>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'} flex items-center justify-center`}>
                      <statusConfig.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-tight">Status Validation</p>
                      <p className="text-xs text-muted-foreground font-medium italic">Confirmed at HQ</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="premium-card p-4 sm:p-6 bg-muted/10 border-none space-y-3 sm:space-y-4">
                  <LogIn className="w-4 h-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">IN Distance</p>
                    <p className={`${(parseFloat(loginDistance) * 1000) > (user?.officeLocation?.geoRadiusMeters || 0) ? 'text-red-500' : 'text-green-500'} text-lg sm:text-xl font-black tabular-nums`}>{loginDistance}<span className="text-[10px] ml-1">km</span></p>
                  </div>
                </div>
                <div className="premium-card p-4 sm:p-6 bg-muted/10 border-none space-y-3 sm:space-y-4">
                  <LogOut className="w-4 h-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">OUT Distance</p>
                    <p className={`${(parseFloat(logoutDistance) * 1000) > (user?.officeLocation?.geoRadiusMeters || 0) ? 'text-red-500' : 'text-green-500'} text-lg sm:text-xl font-black tabular-nums`}>{logoutDistance}<span className="text-[10px] ml-1">km</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/50">
                <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Session Summary</h4>
                <div className="space-y-4">
                  {[
                    { label: "Login Marker", val: todayAttendance?.loginTime || "N/A", icon: Clock },
                    { label: "Logout Marker", val: todayAttendance?.logoutTime || "N/A", icon: Clock },
                    { label: "Total Duration", val: todayAttendance?.workingHours || "0.0h", icon: TrendingUp },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{item.label}</span>
                      </div>
                      <span className="text-xs font-black tabular-nums">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="premium-card relative overflow-hidden p-8 border border-primary/20 bg-primary/5">
            <div className="relative z-10 space-y-6 text-center">
              <div className="w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto shadow-xl shadow-primary/20">
                <NotebookText className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black tracking-tight italic text-primary">Location Based Attendance Sync</h3>
                <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                  Always ensure your location services are active for precise distance calculation.
                </p>
              </div>
              <button className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-all">
                Read Policy Docs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}