"use client";

import { useAttendance } from "@/lib/api/hooks";
import { useAttendanceMutations, useGraphQlAttendance } from "@/lib/graphql/attendance/attendanceHooks";
import { refresh } from "next/cache";
import { useEffect, useState } from "react";
import moment from "moment";
import { useRouter } from "next/navigation";

export default function AttendancePage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
  });

  const { checkIn, checkOut, checkInLoading, checkOutLoading } = useAttendanceMutations()
  const { attendance: attendanceData, refetchAttendance } = useGraphQlAttendance()
  const router = useRouter()

  useEffect(() => {
    if (!formData.startDate || !formData.endDate) return;
    refetchAttendance({
      startDate: formData.startDate,
      endDate: formData.endDate,
    })
  }, [formData])

  const todayAttendance = attendanceData[0];
  const loginDistance = parseInt(Math.round(todayAttendance?.loginDistance / 1000).toFixed(2));
  const logoutDistance = parseInt(Math.round(todayAttendance?.logoutDistance / 1000).toFixed(2));

  const STATUS_LABELS: Record<string, string> = {
    late_login: "Late Login",
    early_logout: "Early Logout",
    absent: "Absent",
    present: "Present",
  }

  const STATUS_COLORS: Record<string, string> = {
    late_login: "text-yellow-600",
    early_logout: "text-orange-600",
    absent: "text-red-600",
    present: "text-green-600",
  }


  // const getAttendance = (start_date: string, end_date: string) => {
  //   refetch({
  //     input: {
  //       start_date: today,
  //       end_date: today,
  //     },
  //   })
  // }

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

      alert("Check-in successful");
    } catch (error) {
      alert("Check-in failed");
      console.error(error);
    }
  };


  const handleCheckOut = async () => {
    try {
      const { latitude, longitude } = await getLocationAsync();

      await checkOut({ latitude, longitude, logoutTime: moment().format("HH:mm:ss").toString() });

      alert("Check-out successful");
    } catch (error) {
      alert("Check-out failed");
      console.error(error);
    }
  };


  return (
    <div className="space-y-6">
      <div className="w-full flex justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
        <button
          onClick={() => router.push("/attendance/attendance-correction")}
          className="btn-primary"
        >Attendance Correction</button>
      </div>
      {/* Check In/Out Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">
          Check In / Check Out
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleCheckIn}
            disabled={checkInLoading || todayAttendance?.loginTime}
            className="px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-bold text-lg"
          >
            {checkInLoading ? "Processing..." : "✓ Check In"}
          </button>
          <button
            onClick={handleCheckOut}
            disabled={checkOutLoading || todayAttendance?.logoutTime}
            className="px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-bold text-lg"
          >
            {checkOutLoading ? "Processing..." : "✗ Check Out"}
          </button>
        </div>
      </div>

      <div className="flex gap-x-3">
        <input type="date" className="border rounded-lg p-2 text-black" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
        <input type="date" className="border rounded-lg p-2 text-black" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
      </div>

      {/* Attendance Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Today's Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border rounded-lg p-4">
            <div className="text-gray-600 text-sm font-medium">
              Check In Time
            </div>
            <div className={`text-2xl font-bold capitalize ${["late_login", "absent"].includes(todayAttendance?.status) ? "text-red-600" : "text-black"}`}>
              {todayAttendance?.loginTime
                ? todayAttendance?.loginTime
                : "--:--"}
            </div>
          </div>
          <div className="border rounded-lg p-4">
            <div className="text-gray-600 text-sm font-medium">
              Check Out Time
            </div>
            <div className={`mt-2 text-2xl font-bold ${["early_logout", "absent"].includes(todayAttendance?.status) ? "text-red-600" : "text-black"}`}>{todayAttendance?.logoutTime
              ? todayAttendance.logoutTime
              : "--:--"}</div>
          </div>
          {todayAttendance?.status && <div className="border rounded-lg p-4">
            <div className="text-gray-600 text-sm font-medium">Status</div>
            <div className="mt-2 flex items-center text-2xl font-bold">
              <span className={STATUS_COLORS[todayAttendance?.status] ?? "text-gray-500"}>
                {STATUS_LABELS[todayAttendance?.status] ?? "--"}
              </span>
            </div>
          </div>}
          {todayAttendance?.loginDistance && <div className="border rounded-lg p-4">
            <div className="text-gray-600 text-sm font-medium">Login Distance</div>
            <div className="mt-2 flex items-center">
              <span className={`text-lg font-bold text-green-600 capitalize ${loginDistance > 10 ? "text-red-600" : ""}`}>{loginDistance}km</span>
            </div>
          </div>}
          {todayAttendance?.loginDistance && <div className="border rounded-lg p-4">
            <div className="text-gray-600 text-sm font-medium">Logout Distance</div>
            <div className="mt-2 flex items-center">
              <span className={`text-lg font-bold text-green-600 capitalize ${logoutDistance > 10 ? "text-red-600" : ""}`}>{logoutDistance}km</span>
            </div>
          </div>}
        </div>
      </div>
    </div >
  );
}
