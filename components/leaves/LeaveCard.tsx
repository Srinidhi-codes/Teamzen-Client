"use client";

import { Badge } from "@/components/common/Badge";

interface LeaveCardProps {
  id: number;
  userName: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  reason?: string;
  onReview?: () => void;
}

export function LeaveCard({
  id,
  userName,
  leaveType,
  fromDate,
  toDate,
  days,
  status,
  reason,
  onReview,
}: LeaveCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-gray-900">{userName}</h3>
          <p className="text-sm text-gray-600">{leaveType}</p>
        </div>
        <Badge variant={status as any}>{status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 py-3 border-y border-gray-100">
        <div>
          <p className="text-xs text-gray-600">From</p>
          <p className="font-medium text-gray-900">{fromDate}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600">To</p>
          <p className="font-medium text-gray-900">{toDate}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-600 mb-1">Duration</p>
        <p className="font-medium text-gray-900">{days} days</p>
      </div>

      {reason && (
        <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-700">
          <p className="font-medium mb-1">Reason:</p>
          <p>{reason}</p>
        </div>
      )}

      {onReview && status === "pending" && (
        <button onClick={onReview} className="w-full btn-primary text-sm">
          Review Request
        </button>
      )}
    </div>
  );
}
