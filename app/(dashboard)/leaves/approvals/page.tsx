"use client";

import React, { useMemo } from "react";
import { useGraphQLLeaveRequests, useGraphQLLeaveRequestProcess } from "@/lib/graphql/leaves/leavesHook";
import { PageHeader } from "@/components/common/PageHeader";
import { StatsCard } from "@/components/common/Stats";
import { Clock, CheckCircle2, XCircle, FileText } from "lucide-react";
import { LeaveRequestMasterDetail } from "@/components/leaves/LeaveRequestMasterDetail";
import { useNotifications } from "@/lib/hooks/useNotifications";

export default function ApprovalsPage() {
  const { leaveRequestData: requests, isLoading, refetch } = useGraphQLLeaveRequests(true);
  const { processLeaveRequest, processLeaveRequestLoading } = useGraphQLLeaveRequestProcess();

  useNotifications(
    (msg) => {
      if (msg.target_type === "Leave Request") {
        refetch();
      }
    },
    { silent: true }
  );

  const requestList = useMemo(() => requests || [], [requests]);

  const pendingRequests = useMemo(
    () => requestList.filter((r: any) => r.status?.toLowerCase() === "pending"),
    [requestList]
  );
  const approvedRequests = useMemo(
    () => requestList.filter((r: any) => r.status?.toLowerCase() === "approved"),
    [requestList]
  );
  const rejectedRequests = useMemo(
    () => requestList.filter((r: any) => r.status?.toLowerCase() === "rejected"),
    [requestList]
  );

  const handleApprove = async (id: string, comments: string) => {
    await processLeaveRequest({
      request_id: id,
      status: "approved",
      comments: comments || "",
    });
    refetch();
  };

  const handleReject = async (id: string, comments: string) => {
    await processLeaveRequest({
      request_id: id,
      status: "rejected",
      comments: comments || "",
    });
    refetch();
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      <PageHeader
        title="Leave Approvals & Team Inbox"
        description="Review and resolve pending leave requests from your team members with full schedule and resolution progress."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending Approvals"
          value={pendingRequests.length}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Approved Leaves"
          value={approvedRequests.length}
          icon={CheckCircle2}
          color="green"
        />
        <StatsCard
          title="Rejected Leaves"
          value={rejectedRequests.length}
          icon={XCircle}
          color="red"
        />
        <StatsCard
          title="Total Team Requests"
          value={requestList.length}
          icon={FileText}
          color="blue"
        />
      </div>

      <LeaveRequestMasterDetail
        requests={requestList as any}
        isLoading={isLoading}
        onRefresh={refetch}
        mode="manager"
        onApprove={handleApprove}
        onReject={handleReject}
        isProcessing={processLeaveRequestLoading}
        title="Team Leave Requests"
        subtitle="Select a request to inspect absence reason, policy compliance, and finalize approval."
      />
    </div>
  );
}
