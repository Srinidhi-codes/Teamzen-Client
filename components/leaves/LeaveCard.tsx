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
    <div className="rounded-xl border border-border bg-card p-4 hover:bg-muted/20 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-medium text-foreground">{userName}</h3>
          <p className="text-sm text-muted-foreground">{leaveType}</p>
        </div>
        <Badge variant={status as any}>{status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3 py-3 border-y border-border">
        <div>
          <p className="text-xs text-muted-foreground">From</p>
          <p className="text-sm font-medium text-foreground">{fromDate}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">To</p>
          <p className="text-sm font-medium text-foreground">{toDate}</p>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-muted-foreground mb-1">Duration</p>
        <p className="text-sm font-medium text-foreground">{days} days</p>
      </div>

      {reason && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg text-sm text-foreground">
          <p className="font-medium mb-1 text-muted-foreground">Reason</p>
          <p>{reason}</p>
        </div>
      )}

      {onReview && status === "pending" && (
        <button onClick={onReview} className="w-full h-9 rounded-md btn-primary text-sm font-medium">
          Review request
        </button>
      )}
    </div>
  );
}
