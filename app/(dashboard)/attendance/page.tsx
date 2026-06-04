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
import dynamic from "next/dynamic";
import Link from "next/link";

const AttendanceMap = dynamic(() => import("@/components/attendance/AttendanceMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full bg-muted/40 animate-pulse rounded-3xl flex flex-col items-center justify-center text-xs font-black uppercase tracking-widest text-muted-foreground gap-3 border border-border">
      <div className="w-[18px] h-[18px] border-2 border-primary border-t-transparent rounded-full animate-spin" />
      Synchronizing Geofence Vectors...
    </div>
  )
});

export default function AttendancePage() {
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));
  const { checkIn, checkOut, checkInLoading, checkOutLoading } = useAttendanceMutations();
  const { attendance: attendanceData, isLoading } = useGraphQlAttendance();
  const router = useRouter();
  const { user } = useStore();

  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapTab, setMapTab] = useState<"live" | "checkin" | "checkout">("live");

  const getDistanceKM = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const requestCurrentLocation = () => {
    setIsLocating(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
        setIsLocating(false);
      },
      (err) => {
        let msg = "Failed to fetch coordinates.";
        if (err.code === 1) msg = "Location permission denied. Please allow location access.";
        else if (err.code === 2) msg = "Position unavailable. Ensure your GPS/network location is enabled.";
        else if (err.code === 3) msg = "Timeout getting location.";
        setLocationError(msg);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("hh:mm:ss A"));
    }, 1000);
    
    requestCurrentLocation();

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
        await checkIn({ latitude, longitude, officeLocationId: user?.officeLocation?.id || "2", loginTime: moment().format("HH:mm:ss") });
        toast.success("Identity verified. Access granted.");
      } else {
        await checkOut({ latitude, longitude, logoutTime: moment().format("HH:mm:ss") });
        toast.success("Protocol complete. Session terminated.");
      }
      requestCurrentLocation();
    } catch (error) {
      toast.error(typeof error === "string" ? error : (error as any)?.message || "Location verification failed");
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
    <div className="space-y-10 animate-fade-in pb-20 p-4 sm:p-8">
      {/* Header Section */}
      <div className="animate-fade-in">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pl-5">
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-primary rounded-full shadow-sm shadow-primary/20" />
            <h1 className="text-3xl sm:text-3xl font-black text-foreground tracking-tight">Attendance Management</h1>
            <p className="text-premium-label mt-2 opacity-60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Location: <span className="text-foreground font-bold">{user?.officeLocation?.name}</span>
            </p>
          </div>
          <div className="mt-4 lg:mt-0 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/attendance/attendance-correction")}
              className="btn-primary w-full sm:w-auto h-11 sm:h-12 px-6 rounded-2xl shadow-lg shadow-primary/20 text-xs uppercase tracking-widest font-black"
            >
              <Edit className="w-4 h-4 mr-2 shrink-0" />
              Data Correction Request
            </Button>
          </div>
        </div>
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

          {/* Geofence Map Card */}
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                  Geofence Verification Map
                </h3>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Validate your alignment with the office perimeter
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border shrink-0">
                <button
                  type="button"
                  onClick={() => setMapTab("live")}
                  className={cn(
                    "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer",
                    mapTab === "live" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  Live Position
                </button>
                {todayAttendance?.loginTime && todayAttendance?.loginLatitude && (
                  <button
                    type="button"
                    onClick={() => setMapTab("checkin")}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer",
                      mapTab === "checkin" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Check-In
                  </button>
                )}
                {todayAttendance?.logoutTime && todayAttendance?.logoutLatitude && (
                  <button
                    type="button"
                    onClick={() => setMapTab("checkout")}
                    className={cn(
                      "px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all cursor-pointer",
                      mapTab === "checkout" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Check-Out
                  </button>
                )}
              </div>
            </div>

            {/* Map & Telemetry Render */}
            {(() => {
              const office = user?.officeLocation;
              if (!office) {
                return (
                  <div className="p-6 rounded-2xl bg-muted/10 text-center text-xs font-semibold text-muted-foreground">
                    No office location is assigned to your profile.
                  </div>
                );
              }

              const officeLat = Number(office.latitude);
              const officeLng = Number(office.longitude);
              const radiusMeters = office.geoRadiusMeters || 200;

              let activeLat: number | null = null;
              let activeLng: number | null = null;
              let activeDistanceMeters: number | null = null;
              let isWithin = false;

              if (mapTab === "live") {
                if (currentCoords) {
                  activeLat = currentCoords.latitude;
                  activeLng = currentCoords.longitude;
                  const distanceKm = getDistanceKM(activeLat, activeLng, officeLat, officeLng);
                  activeDistanceMeters = distanceKm * 1000;
                  isWithin = activeDistanceMeters <= radiusMeters;
                }
              } else if (mapTab === "checkin") {
                activeLat = todayAttendance?.loginLatitude || null;
                activeLng = todayAttendance?.loginLongitude || null;
                activeDistanceMeters = todayAttendance?.loginDistance || null;
                isWithin = activeDistanceMeters !== null ? activeDistanceMeters <= radiusMeters : false;
              } else if (mapTab === "checkout") {
                activeLat = todayAttendance?.logoutLatitude || null;
                activeLng = todayAttendance?.logoutLongitude || null;
                activeDistanceMeters = todayAttendance?.logoutDistance || null;
                isWithin = activeDistanceMeters !== null ? activeDistanceMeters <= radiusMeters : false;
              }

              const activeDistanceKm = activeDistanceMeters !== null ? activeDistanceMeters / 1000 : null;

              return (
                <div className="space-y-6">
                  {/* Warning / Success Banner */}
                  {mapTab === "live" && !currentCoords && (
                    <div className={cn(
                      "p-4 rounded-2xl text-xs font-semibold flex items-center gap-3 border transition-all",
                      locationError 
                        ? "bg-rose-500/10 text-rose-500 border-rose-500/20" 
                        : "bg-muted/10 text-muted-foreground border-border/50"
                    )}>
                      {isLocating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                          <span>Determining geolocation coordinates from browser...</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
                          <span className="grow">
                            {locationError || "Location services are required to verify geofence. Please enable permissions."}
                          </span>
                          {!locationError && (
                            <Button size="sm" variant="outline" className="ml-auto" onClick={requestCurrentLocation}>
                              Grant Access
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {activeDistanceKm !== null && (
                    <div className={cn(
                      "p-4 rounded-2xl text-xs font-black tracking-tight border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all",
                      isWithin
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs",
                          isWithin ? "bg-emerald-500/20 text-emerald-600" : "bg-rose-500/20 text-rose-500"
                        )}>
                          {isWithin ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-black text-sm capitalize">{mapTab} Status: {isWithin ? "Within Geofence" : "Out of Geofence"}</p>
                          <p className="text-[10px] text-muted-foreground/60 font-medium">
                            Distance: <span className="font-bold text-foreground">{activeDistanceKm.toFixed(2)} km</span> / Allowed: <span className="font-bold text-foreground">{(radiusMeters / 1000).toFixed(2)} km</span>
                          </p>
                        </div>
                      </div>
                      
                      {mapTab === "live" && (
                        <button 
                          onClick={requestCurrentLocation}
                          disabled={isLocating}
                          className="px-3 py-1.5 bg-background hover:bg-muted border border-border rounded-xl text-[9px] uppercase tracking-widest font-black transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLocating ? "Syncing..." : "Refresh GPS"}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Map Component */}
                  {(activeLat && activeLng) ? (
                    <AttendanceMap
                      employeeLat={activeLat}
                      employeeLng={activeLng}
                      officeLat={officeLat}
                      officeLng={officeLng}
                      radiusMeters={radiusMeters}
                      employeeName={user?.firstName || "You"}
                      officeName={office.name || "Office"}
                    />
                  ) : (
                    <div className="h-[300px] w-full bg-muted/20 border border-border/50 rounded-3xl flex flex-col items-center justify-center text-xs text-muted-foreground font-black uppercase tracking-widest gap-2">
                      <Navigation className="w-8 h-8 opacity-20 animate-pulse text-primary" />
                      Pending GPS Coordinates
                    </div>
                  )}
                </div>
              );
            })()}
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
                    { 
                      label: "Total Duration", 
                      val: todayAttendance?.loginTime && !todayAttendance?.logoutTime 
                        ? (() => {
                            const loginStr = `${todayAttendance.attendanceDate} ${todayAttendance.loginTime}`;
                            const start = moment(loginStr);
                            const now = moment();
                            const diffMs = Math.max(0, now.diff(start));
                            const duration = moment.duration(diffMs);
                            const h = Math.floor(duration.asHours());
                            const m = duration.minutes();
                            const s = duration.seconds();
                            return `${h}h ${m}m ${s}s`;
                          })()
                        : todayAttendance?.workedHours 
                          ? `${Number(todayAttendance.workedHours).toFixed(1)}h`
                          : "0.0h", 
                      icon: TrendingUp 
                    },
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
              <Link href={'/policies'} className="text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:underline transition-all">
                Read Policy Docs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}