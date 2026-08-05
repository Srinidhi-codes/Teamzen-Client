"use client";

import { useState } from "react";
import moment from "moment";
import { Badge } from "@/components/common/Badge";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/Stats";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";

function displayName(user?: { firstName?: string; lastName?: string } | null) {
  if (!user) return "Team member";
  return [user.firstName, user.lastName].filter(Boolean).join(" ") || "Team member";
}

function formatLeaveDate(value?: string | null) {
  if (!value) return "—";
  const m = moment(value);
  return m.isValid() ? m.format("DD MMM YYYY") : String(value);
}

export default function ApprovalsPage() {
  const { leaveRequestData: requests, isLoading } = useGraphQLLeaveRequests(true);
  const { processLeaveRequest, processLeaveRequestLoading } = useGraphQLLeaveRequestProcess();
  const [comments, setComments] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pendingRequests = requests?.filter((r: any) => r.status === "pending");

  const handleProcess = async (id: string, status: "approved" | "rejected") => {
    try {
      await processLeaveRequest({
        request_id: id,
        status,
        comments,
      });
      setSelectedId(null);
      setComments("");
      alert(status === "approved" ? "Leave approved successfully" : "Leave rejected");
    } catch {
      alert(status === "approved" ? "Failed to approve leave" : "Failed to reject leave");
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-8 pb-20 animate-fade-in">
      <PageHeader
        title="Leave approvals"
        description="Review and approve pending leave requests from your team."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Pending approvals"
          value={pendingRequests?.length || 0}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved this month"
          value={requests?.filter((r: any) => r.status === "approved").length || 0}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Rejected this month"
          value={requests?.filter((r: any) => r.status === "rejected").length || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      <Card title="Pending requests">
        {isLoading && !requests?.length ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        ) : pendingRequests?.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests?.map((request: any) => (
              <div
                key={request.id}
                className="border border-border rounded-xl p-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-foreground">
                      {displayName(request.user)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {request.leaveType?.name || "Leave"}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">From: </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatLeaveDate(request.fromDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">To: </span>
                    <span className="text-sm font-medium tabular-nums">
                      {formatLeaveDate(request.toDate)}
                    </span>
                  </div>
                </div>
                {request.durationDays != null && (
                  <p className="text-xs text-muted-foreground mb-2">
                    {Number(request.durationDays)} day(s)
                  </p>
                )}
                <p className="text-sm text-foreground mb-3">{request.reason}</p>

                {selectedId === request.id ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add approval comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleProcess(request.id, "approved")}
                        disabled={processLeaveRequestLoading}
                        className="h-9 rounded-md bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleProcess(request.id, "rejected")}
                        disabled={processLeaveRequestLoading}
                        className="h-9 rounded-md"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedId(null)}
                        className="h-9 rounded-md"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setSelectedId(request.id)}
                    className="h-9 rounded-md"
                  >
                    Review
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
