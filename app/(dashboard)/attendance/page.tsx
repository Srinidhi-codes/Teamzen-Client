"use client";

import { useAttendanceMutations, useGraphQlAttendance } from "@/lib/graphql/attendance/attendanceHooks";
import { useEffect, useState } from "react";
import { format, parse, differenceInSeconds } from "date-fns";
import { useRouter } from "next/navigation";
import {
  Clock,
  AlertCircle,
  TrendingUp,
  Navigation,
  Check,
  X,
  Edit,
  NotebookText,
  LogIn,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store/useStore";
import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { FaceCaptureModal } from "@/components/attendance/FaceCaptureModal";
import axios from "axios";
import { ScanFace } from "lucide-react";

const AttendanceMap = dynamic(() => import("@/components/attendance/AttendanceMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[220px] w-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-muted/40 text-sm text-muted-foreground">
      <div className="h-[18px] w-[18px] animate-spin rounded-full border-2 border-primary border-t-transparent" />
      Loading map…
    </div>
  ),
});

function formatWorkedDuration(attendanceDate: string, loginTime: string): string {
  try {
    const start = parse(`${attendanceDate} ${loginTime}`, "yyyy-MM-dd HH:mm:ss", new Date());
    const total = Math.max(0, differenceInSeconds(new Date(), start));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  } catch {
    return "—";
  }
}

export default function AttendancePage() {
  const { checkIn, checkOut, checkInLoading, checkOutLoading, enrollFace, enrollFaceLoading } =
    useAttendanceMutations();
  const { attendance: attendanceData, isLoading } = useGraphQlAttendance();
  const { refetch: refetchMe } = useGraphQLUser();
  const router = useRouter();
  const { user } = useStore();

  const [currentCoords, setCurrentCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [mapTab, setMapTab] = useState<"live" | "checkin" | "checkout">("live");
  const [showMap, setShowMap] = useState(false);
  const [faceModal, setFaceModal] = useState<"enroll" | "verify-in" | "verify-out" | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{ latitude: number; longitude: number } | null>(null);

  const faceEnabled = !!user?.organization?.faceAttendanceEnabled;
  const faceEnrolled =
    !!user?.faceEnrolled && Array.isArray(user?.faceDescriptor) && user.faceDescriptor.length === 128;
  const enrolledDescriptor = (user as any)?.faceDescriptor as number[] | undefined;

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
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const run = () => requestCurrentLocation();
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(run, { timeout: 2000 });
    } else {
      timeoutId = setTimeout(run, 0);
    }
    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId) clearTimeout(timeoutId);
    };
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

  const isWithinGeofenceNow = (): boolean => {
    const office = user?.officeLocation;
    if (!office?.latitude || !office?.longitude || !currentCoords) return false;
    const km = getDistanceKM(
      currentCoords.latitude,
      currentCoords.longitude,
      Number(office.latitude),
      Number(office.longitude)
    );
    return km * 1000 <= Number(office.geoRadiusMeters || 100);
  };

  const uploadSelfie = async (recordId: string, kind: "check_in" | "check_out", imageBase64: string) => {
    try {
      const blob = await (await fetch(imageBase64)).blob();
      const form = new FormData();
      form.append("attendance_record_id", recordId);
      form.append("kind", kind);
      form.append("selfie", blob, `${kind}.jpg`);
      await axios.post("/api/attendance/selfie/", form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
    } catch {
      // Non-blocking — punch already succeeded
    }
  };

  const handleAction = async (type: "in" | "out") => {
    try {
      const coords = await getLocationAsync();
      setCurrentCoords(coords);

      if (faceEnabled) {
        if (!faceEnrolled) {
          toast.message("Enroll your face first to punch attendance.");
          setFaceModal("enroll");
          return;
        }
        setPendingCoords(coords);
        setFaceModal(type === "in" ? "verify-in" : "verify-out");
        return;
      }

      if (type === "in") {
        await checkIn({
          latitude: coords.latitude,
          longitude: coords.longitude,
          officeLocationId: user?.officeLocation?.id || "",
          loginTime: format(new Date(), "HH:mm:ss"),
        });
        toast.success("Checked in successfully.");
      } else {
        await checkOut({
          latitude: coords.latitude,
          longitude: coords.longitude,
          logoutTime: format(new Date(), "HH:mm:ss"),
        });
        toast.success("Checked out successfully.");
      }
      requestCurrentLocation();
    } catch (error) {
      toast.error(
        typeof error === "string"
          ? error
          : (error as any)?.message || "Location verification failed"
      );
    }
  };

  const completePunchWithFace = async (
    type: "in" | "out",
    result: { matchScore: number; verified: boolean; imageBase64: string; descriptor: number[] }
  ) => {
    const coords = pendingCoords || currentCoords || (await getLocationAsync());
    try {
      if (type === "in") {
        const data: any = await checkIn({
          latitude: coords.latitude,
          longitude: coords.longitude,
          officeLocationId: user?.officeLocation?.id || "",
          loginTime: format(new Date(), "HH:mm:ss"),
          faceVerified: result.verified,
          faceMatchScore: result.matchScore,
          faceDescriptor: result.descriptor,
        });
        const id = data?.checkIn?.id;
        if (id) await uploadSelfie(String(id), "check_in", result.imageBase64);
        toast.success("Checked in with face verification.");
      } else {
        const data: any = await checkOut({
          latitude: coords.latitude,
          longitude: coords.longitude,
          logoutTime: format(new Date(), "HH:mm:ss"),
          faceVerified: result.verified,
          faceMatchScore: result.matchScore,
          faceDescriptor: result.descriptor,
        });
        const id = data?.checkOut?.id;
        if (id) await uploadSelfie(String(id), "check_out", result.imageBase64);
        toast.success("Checked out with face verification.");
      }
      setFaceModal(null);
      setPendingCoords(null);
      requestCurrentLocation();
    } catch (error: any) {
      toast.error(error?.message || "Attendance punch failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const statusConfig = todayAttendance?.status ? STATUS_CONFIG[todayAttendance.status] : null;
  const todayLabel = format(new Date(), "EEEE, MMMM do yyyy");

  return (
    <div className="space-y-10 animate-fade-in pb-20 p-4 sm:p-8">
      <PageHeader
        title="Attendance"
        description={
          user?.officeLocation?.name
            ? `Office: ${user.officeLocation.name}`
            : "Mark check-in and check-out for today."
        }
        actions={
          <Button
            onClick={() => router.push("/attendance/attendance-correction")}
            className="h-9 rounded-md w-full sm:w-auto"
          >
            <Edit className="w-4 h-4 mr-2 shrink-0" />
            Request correction
          </Button>
        }
      />

      {faceEnabled && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <ScanFace className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">
                Face attendance {faceEnrolled ? "enrolled" : "required"}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {faceEnrolled
                  ? "Check-in/out requires face verification. Location is still recorded and flagged if outside the geofence."
                  : "Enroll your face once before you can punch attendance."}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            className="h-9 w-full sm:w-auto"
            disabled={enrollFaceLoading}
            onClick={() => setFaceModal("enroll")}
          >
            {faceEnrolled ? "Re-enroll face" : "Enroll face"}
          </Button>
        </div>
      )}

      <FaceCaptureModal
        open={faceModal !== null}
        mode={faceModal === "enroll" ? "enroll" : "verify"}
        enrolledDescriptor={enrolledDescriptor}
        onClose={() => {
          setFaceModal(null);
          setPendingCoords(null);
        }}
        onSuccess={async (result) => {
          if (faceModal === "enroll") {
            const res = await enrollFace({
              descriptor: result.descriptor,
              imageBase64: result.imageBase64,
            });
            if (res?.error) {
              toast.error(res.error);
              return;
            }
            toast.success("Face enrolled successfully.");
            setFaceModal(null);
            await refetchMe();
            return;
          }
          if (faceModal === "verify-in") {
            await completePunchWithFace("in", result);
          } else if (faceModal === "verify-out") {
            await completePunchWithFace("out", result);
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Actions & Status */}
        <div className="lg:col-span-8 space-y-10">

          {/* Main Visualizer */}
          <div className="premium-card bg-primary text-primary-foreground relative overflow-hidden flex flex-col items-center justify-center py-10 sm:py-14">
            <div className="relative z-10 flex flex-col items-center text-center space-y-3 sm:space-y-4 px-4">
              <div className="flex items-center gap-2 sm:gap-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/20">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Today</span>
              </div>
              <p className="text-lg sm:text-xl font-semibold tracking-tight">{todayLabel}</p>
            </div>
          </div>

          {/* Action Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className={`premium-card p-1 group transition-all duration-500 ${!todayAttendance?.loginTime ? 'hover:scale-[1.02] cursor-pointer' : 'opacity-40 grayscale pointer-events-none'}`}
              onClick={() => !todayAttendance?.loginTime && handleAction('in')}
            >
              <div className="p-6 sm:p-8 rounded-xl border border-border/50 flex flex-col items-center text-center space-y-4 sm:space-y-6 group-hover:bg-primary/5 transition-colors">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Check className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight">{checkInLoading ? "Checking in…" : "Check in"}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Mark your arrival</p>
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
              <div className="p-6 sm:p-8 rounded-xl border border-border/50 flex flex-col items-center text-center space-y-4 sm:space-y-6 group-hover:bg-primary/5 transition-colors">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center group-hover:scale-105 transition-transform">
                  <X className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold tracking-tight">{checkOutLoading ? "Checking out…" : "Check out"}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">Mark your departure</p>
                </div>
                {todayAttendance?.logoutTime && (
                  <Badge variant="danger">Exited at {todayAttendance.logoutTime}</Badge>
                )}
              </div>
            </div>
          </div>

          {/* Geofence Map Card — map mounts only when expanded */}
          <div className="premium-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-semibold tracking-tight flex items-center gap-2">
                  Location map
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  See how your location compares to the office area
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="h-9 rounded-md shrink-0"
                onClick={() => setShowMap((v) => !v)}
              >
                {showMap ? "Hide map" : "Show map"}
                <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform", showMap && "rotate-180")} />
              </Button>
            </div>

            {!showMap && mapTab === "live" && (locationError || isLocating || currentCoords) && (
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 text-xs font-medium",
                  locationError
                    ? "border-rose-500/20 bg-rose-500/10 text-rose-500"
                    : currentCoords
                      ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700"
                      : "border-border/50 bg-muted/10 text-muted-foreground"
                )}
              >
                {isLocating ? (
                  <>
                    <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <span>Getting your location…</span>
                  </>
                ) : locationError ? (
                  <>
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span className="grow">{locationError}</span>
                    <Button size="sm" variant="outline" onClick={requestCurrentLocation}>
                      Retry
                    </Button>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 shrink-0" />
                    <span>Location ready — expand the map to verify the geofence.</span>
                  </>
                )}
              </div>
            )}

            {showMap && (
              <>
              <div className="flex bg-muted/60 p-1 rounded-xl border border-border shrink-0 w-fit">
                <button
                  type="button"
                  onClick={() => setMapTab("live")}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                    mapTab === "live" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                  )}
                >
                  Current
                </button>
                {todayAttendance?.loginTime && todayAttendance?.loginLatitude && (
                  <button
                    type="button"
                    onClick={() => setMapTab("checkin")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                      mapTab === "checkin" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Check-in
                  </button>
                )}
                {todayAttendance?.logoutTime && todayAttendance?.logoutLatitude && (
                  <button
                    type="button"
                    onClick={() => setMapTab("checkout")}
                    className={cn(
                      "px-3 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer",
                      mapTab === "checkout" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
                    )}
                  >
                    Check-out
                  </button>
                )}
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
                          <span>Getting your location…</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 shrink-0 animate-pulse text-rose-500" />
                          <span className="grow">
                            {locationError || "Location access is required to verify you're within the office area."}
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
                      "p-4 rounded-xl text-sm font-medium border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all",
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
                          <p className="font-semibold text-sm capitalize">{mapTab === "live" ? "Current" : mapTab === "checkin" ? "Check-in" : "Check-out"}: {isWithin ? "Within range" : "Outside range"}</p>
                          <p className="text-xs text-muted-foreground">
                            Distance: <span className="font-medium text-foreground">{activeDistanceKm.toFixed(2)} km</span> · Allowed: <span className="font-medium text-foreground">{(radiusMeters / 1000).toFixed(2)} km</span>
                          </p>
                        </div>
                      </div>
                      
                      {mapTab === "live" && (
                        <button 
                          onClick={requestCurrentLocation}
                          disabled={isLocating}
                          className="px-3 py-1.5 bg-background hover:bg-muted border border-border rounded-md text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed h-9"
                        >
                          {isLocating ? "Updating…" : "Refresh location"}
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
                    <div className="h-[220px] w-full bg-muted/20 border border-border/50 rounded-xl flex flex-col items-center justify-center text-sm text-muted-foreground gap-2">
                      <Navigation className="w-8 h-8 opacity-30 text-primary" />
                      Waiting for location
                    </div>
                  )}
                </div>
              );
            })()}
              </>
            )}
          </div>
        </div>

        {/* Right Column: Status & Telemetry */}
        <div className="lg:col-span-4 space-y-10">
          <Card title="Today's Attendance">
            <div className="space-y-8">
              {statusConfig && (
                <div className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Status</span>
                    <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl ${statusConfig.variant === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'} flex items-center justify-center`}>
                      <statusConfig.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm tracking-tight">Today&apos;s status</p>
                      <p className="text-xs text-muted-foreground">Based on your office location</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="premium-card p-4 sm:p-6 bg-muted/10 border-none space-y-3 sm:space-y-4">
                  <LogIn className="w-4 h-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Check-in distance</p>
                    <p className={`${(parseFloat(loginDistance) * 1000) > (user?.officeLocation?.geoRadiusMeters || 0) ? 'text-red-500' : 'text-green-500'} text-lg sm:text-xl font-semibold tabular-nums`}>{loginDistance}<span className="text-xs ml-1">km</span></p>
                  </div>
                </div>
                <div className="premium-card p-4 sm:p-6 bg-muted/10 border-none space-y-3 sm:space-y-4">
                  <LogOut className="w-4 h-4 text-primary" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Check-out distance</p>
                    <p className={`${(parseFloat(logoutDistance) * 1000) > (user?.officeLocation?.geoRadiusMeters || 0) ? 'text-red-500' : 'text-green-500'} text-lg sm:text-xl font-semibold tabular-nums`}>{logoutDistance}<span className="text-xs ml-1">km</span></p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 pt-4 border-t border-border/50">
                <h4 className="text-xs font-medium text-muted-foreground">Session summary</h4>
                <div className="space-y-4">
                  {[
                    { label: "Check in", val: todayAttendance?.loginTime || "—", icon: Clock },
                    { label: "Check out", val: todayAttendance?.logoutTime || "—", icon: Clock },
                    { 
                      label: "Hours worked", 
                      val: todayAttendance?.loginTime && !todayAttendance?.logoutTime 
                        ? formatWorkedDuration(
                            todayAttendance.attendanceDate,
                            todayAttendance.loginTime
                          )
                        : todayAttendance?.workedHours 
                          ? `${Number(todayAttendance.workedHours).toFixed(1)}h`
                          : "0.0h", 
                      icon: TrendingUp 
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div className="flex items-center gap-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <item.icon className="w-3.5 h-3.5" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </div>
                      <span className="text-xs font-semibold tabular-nums">{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <div className="premium-card p-8 border border-primary/20 bg-primary/5 rounded-xl">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto">
                <NotebookText className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-primary">Location-based attendance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Keep location services enabled so your check-in distance can be calculated accurately.
                </p>
              </div>
              <Link href={'/policies'} className="text-sm font-medium text-primary hover:underline transition-all">
                View policies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}