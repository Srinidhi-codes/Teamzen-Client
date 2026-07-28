export interface AttendanceRecord {
  id: string;
  attendanceDate: string;

  loginTime?: string | null;
  logoutTime?: string | null;
  loginDistance?: number;
  logoutDistance?: number;
  loginLatitude?: number | null;
  loginLongitude?: number | null;
  logoutLatitude?: number | null;
  logoutLongitude?: number | null;

  status: "present" | "absent" | "half_day" | "leave" | "holiday";
  workedHours?: number | null;

  workingHours?: number | null;
  isWithinGeofence: boolean;
  remarks?: string | null;

  correctionStatus?: string;
  correctionId?: string;
  correctionReason?: string;
  approvalComment?: string;
}

export interface AttendanceCorrection {
  id: string;
  reason: string;
  status: "pending" | "approved" | "rejected";

  correctedLoginTime?: string | null;
  correctedLogoutTime?: string | null;

  createdAt: string;
}

export type AttendanceInput = {
  startDate?: string;
  endDate?: string;
};

export type GetAttendanceResponse = {
  myAttendance: AttendanceRecord[];
};

export type GetAttendanceVars = {
  input?: AttendanceInput;
};

export type TeamAttendanceTodayItem = {
  status: "present" | "absent" | "leave" | string;
  loginTime?: string | null;
  logoutTime?: string | null;
  recordStatus?: string | null;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string | null;
    designation?: { name: string } | null;
    department?: { name: string } | null;
  };
};

export type GetTeamAttendanceTodayResponse = {
  teamAttendanceToday: TeamAttendanceTodayItem[];
};
