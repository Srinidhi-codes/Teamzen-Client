"use client";

import { useAttendance } from "@/lib/api/hooks";
import { useAttendanceMutations, useGraphQlAttendance } from "@/lib/graphql/attendance/attendanceHooks";
import { refresh } from "next/cache";
import { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Clock, MapPin, CheckCircle2, XCircle, AlertCircle, Calendar, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AttendancePage() {
  const [showForm, setShowForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(moment().format("hh:mm:ss A"));

  const { checkIn, checkOut, checkInLoading, checkOutLoading } = useAttendanceMutations()
  const { attendance: attendanceData, refetchAttendance, isLoading } = useGraphQlAttendance()
  const router = useRouter()

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format("hh:mm:ss A"));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const todayAttendance = attendanceData[0];
  const loginDistance = todayAttendance?.loginDistance ? parseInt(Math.round(todayAttendance.loginDistance / 1000).toFixed(2)) : 0;
  const logoutDistance = todayAttendance?.logoutDistance ? parseInt(Math.round(todayAttendance.logoutDistance / 1000).toFixed(2)) : 0;

  const STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
    late_login: {
      label: "Late Login",
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-200",
      icon: AlertCircle
    },
    early_logout: {
      label: "Early Logout",
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      icon: AlertCircle
    },
    absent: {
      label: "Absent",
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      icon: XCircle
    },
    present: {
      label: "Present",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-200",
      icon: CheckCircle2
    },
  }

  const getLocationAsync = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => reject(error.message)
      );
    });
  };

  const handleCheckIn = async () => {
    try {
      const { latitude, longitude } = await getLocationAsync();

      await checkIn({
        latitude,
        longitude,
        officeLocationId: "2",
        loginTime: moment().format("HH:mm:ss").toString()
      });

      toast.success("Check-in successful");
    } catch (error) {
      toast.error("Check-in failed");
      console.error(error);
    }
  };

  const handleCheckOut = async () => {
    try {
      const { latitude, longitude } = await getLocationAsync();

      await checkOut({ latitude, longitude, logoutTime: moment().format("HH:mm:ss").toString() });

      toast.success("Check-out successful");
    } catch (error) {
      toast.error("Check-out failed");
      console.error(error);
    }
  };

  const statusConfig = todayAttendance?.status ? STATUS_CONFIG[todayAttendance.status] : null;
  const StatusIcon = statusConfig?.icon;

  return (
    <>
      {isLoading ? <LoadingSpinner /> : (
        <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  Attendance
                </h1>
              </div>
              <button
                onClick={() => router.push("/attendance/attendance-correction")}
                className="px-6 py-3 bg-linear-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold transform hover:scale-105"
              >
                Attendance Correction
              </button>
            </div>

            {/* Live Clock Card */}
            <div className="bg-linear-to-br from-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-6 h-6" />
                  <span className="text-lg font-medium opacity-90">Current Time</span>
                </div>
                <div className="text-6xl font-bold tracking-tight">{currentTime}</div>
              </div>
            </div>

            {/* Check In/Out Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={handleCheckIn}
                disabled={checkInLoading || !!todayAttendance?.loginTime}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:scale-105 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-green-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors duration-300">
                      {checkInLoading ? "Processing..." : "Check In"}
                    </div>
                    <div className="text-sm text-slate-600 group-hover:text-white/80 transition-colors duration-300 mt-1">
                      {todayAttendance?.loginTime ? "Already checked in" : "Start your day"}
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={handleCheckOut}
                disabled={checkOutLoading || !!todayAttendance?.logoutTime}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transform hover:scale-105 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-linear-to-br from-rose-500 to-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-rose-100 group-hover:bg-white/20 flex items-center justify-center transition-colors duration-300">
                    <XCircle className="w-8 h-8 text-rose-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-slate-900 group-hover:text-white transition-colors duration-300">
                      {checkOutLoading ? "Processing..." : "Check Out"}
                    </div>
                    <div className="text-sm text-slate-600 group-hover:text-white/80 transition-colors duration-300 mt-1">
                      {todayAttendance?.logoutTime ? "Already checked out" : "End your day"}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Today's Status */}
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                Today's Status
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Check In Time */}
                <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${["late_login", "absent"].includes(todayAttendance?.status ?? "")
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300"
                  }`}>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
                    <Clock className="w-4 h-4" />
                    Check In Time
                  </div>
                  <div className={`text-3xl font-bold ${["late_login", "absent"].includes(todayAttendance?.status ?? "")
                    ? "text-red-600"
                    : "text-slate-900"
                    }`}>
                    {todayAttendance?.loginTime || "--:--:--"}
                  </div>
                </div>

                {/* Check Out Time */}
                <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${["early_logout", "absent"].includes(todayAttendance?.status ?? "")
                  ? "border-red-200 bg-red-50"
                  : "border-slate-200 bg-slate-50 hover:border-indigo-300"
                  }`}>
                  <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
                    <Clock className="w-4 h-4" />
                    Check Out Time
                  </div>
                  <div className={`text-3xl font-bold ${["early_logout", "absent"].includes(todayAttendance?.status ?? "")
                    ? "text-red-600"
                    : "text-slate-900"
                    }`}>
                    {todayAttendance?.logoutTime || "--:--:--"}
                  </div>
                </div>

                {/* Status */}
                {todayAttendance?.status && statusConfig && (
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${statusConfig.bgColor}`}>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
                      Status
                    </div>
                    <div className="flex items-center gap-3">
                      {StatusIcon && <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />}
                      <span className={`text-2xl font-bold ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                  </div>
                )}

                {/* Login Distance */}
                {todayAttendance?.loginDistance && (
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${loginDistance > 10
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50"
                    }`}>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
                      <MapPin className="w-4 h-4" />
                      Login Distance
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${loginDistance > 10 ? "text-red-600" : "text-emerald-600"
                        }`}>
                        {loginDistance}
                      </span>
                      <span className="text-lg text-slate-600">km</span>
                    </div>
                  </div>
                )}

                {/* Logout Distance */}
                {todayAttendance?.logoutDistance && (
                  <div className={`border-2 rounded-xl p-6 transition-all duration-300 hover:shadow-lg ${logoutDistance > 10
                    ? "border-red-200 bg-red-50"
                    : "border-emerald-200 bg-emerald-50"
                    }`}>
                    <div className="flex items-center gap-2 text-slate-600 text-sm font-medium mb-3">
                      <MapPin className="w-4 h-4" />
                      Logout Distance
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-3xl font-bold ${logoutDistance > 10 ? "text-red-600" : "text-emerald-600"
                        }`}>
                        {logoutDistance}
                      </span>
                      <span className="text-lg text-slate-600">km</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}