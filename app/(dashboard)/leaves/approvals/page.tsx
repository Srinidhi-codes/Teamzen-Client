"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/Stats";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/common/Card";

export default function ApprovalsPage() {
  const { leaveRequestData: requests, isLoading } = useGraphQLLeaveRequests(true);
  const { processLeaveRequest, processLeaveRequestLoading } = useGraphQLLeaveRequestProcess();
  const [comments, setComments] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const pendingRequests = requests?.filter((r: any) => r.status === "pending");

  const handleApprove = async (id: number) => {
    try {
      await processLeaveRequest({ request_id: id.toString(), status: "approved", comments });
      setSelectedId(null);
      setComments("");
      alert("Leave approved successfully");
    } catch (error) {
      alert("Failed to approve leave");
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
        {isLoading ? (
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
                      {request.user_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {request.leave_type_name}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-muted-foreground">From: </span>
                    <span className="text-sm font-medium">{request.from_date}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">To: </span>
                    <span className="text-sm font-medium">{request.to_date}</span>
                  </div>
                </div>
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
                        onClick={() => handleApprove(request.id)}
                        disabled={processLeaveRequestLoading}
                        className="h-9 rounded-md bg-emerald-600 hover:bg-emerald-700"
                      >
                        Approve
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
