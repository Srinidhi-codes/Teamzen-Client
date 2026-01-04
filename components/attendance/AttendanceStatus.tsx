"use client";

interface AttendanceStatusProps {
  status: "present" | "absent" | "half_day" | "leave" | "holiday";
  loginTime?: string;
  logoutTime?: string;
  workedHours?: number;
}

export function AttendanceStatus({
  status,
  loginTime,
  logoutTime,
  workedHours,
}: AttendanceStatusProps) {
  const statusConfig = {
    present: { color: "bg-green-100 text-green-800", icon: "✓" },
    absent: { color: "bg-red-100 text-red-800", icon: "✕" },
    half_day: { color: "bg-yellow-100 text-yellow-800", icon: "◐" },
    leave: { color: "bg-blue-100 text-blue-800", icon: "📅" },
    holiday: { color: "bg-purple-100 text-purple-800", icon: "🎉" },
  };

  const config = statusConfig[status];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-center space-x-3 mb-4">
        <div
          className={`w-12 h-12 rounded-full ${config.color} flex items-center justify-center text-xl font-bold`}
        >
          {config.icon}
        </div>
        <div>
          <p className="text-sm text-gray-600">Status</p>
          <p className="font-bold text-gray-900 capitalize">
            {status.replace("_", " ")}
          </p>
        </div>
      </div>

      {(loginTime || logoutTime || workedHours) && (
        <div className="space-y-2">
          {loginTime && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check In:</span>
              <span className="font-medium text-gray-900">{loginTime}</span>
            </div>
          )}
          {logoutTime && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Check Out:</span>
              <span className="font-medium text-gray-900">{logoutTime}</span>
            </div>
          )}
          {workedHours && (
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600">Hours Worked:</span>
              <span className="font-bold text-indigo-600">
                {workedHours.toFixed(2)}h
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
