"use client";

import { useState } from "react";
import { Badge } from "@/components/common/Badge";
import { useLeaveRequests } from "@/lib/api/hooks";

export default function ApprovalsPage() {
  const { data: requests, isLoading, approve } = useLeaveRequests();
  const [comments, setComments] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const pendingRequests = requests?.filter((r: any) => r.status === "pending");

  const handleApprove = async (id: number) => {
    try {
      await approve.mutateAsync({ id, comments });
      setSelectedId(null);
      setComments("");
      alert("Leave approved successfully");
    } catch (error) {
      alert("Failed to approve leave");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Leave Approvals</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">
            Pending Approvals
          </div>
          <div className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingRequests?.length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">
            Approved This Month
          </div>
          <div className="mt-2 text-3xl font-bold text-green-600">
            {requests?.filter((r: any) => r.status === "approved").length || 0}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-600 text-sm font-medium">
            Rejected This Month
          </div>
          <div className="mt-2 text-3xl font-bold text-red-600">
            {requests?.filter((r: any) => r.status === "rejected").length || 0}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Pending Requests
        </h2>
        {isLoading ? (
          <p>Loading...</p>
        ) : pendingRequests?.length === 0 ? (
          <p className="text-gray-600">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {pendingRequests?.map((request: any) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">
                      {request.user_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {request.leave_type_name}
                    </p>
                  </div>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm text-gray-600">From: </span>
                    <span className="font-medium">{request.from_date}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">To: </span>
                    <span className="font-medium">{request.to_date}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{request.reason}</p>

                {selectedId === request.id ? (
                  <div className="space-y-3">
                    <textarea
                      placeholder="Add approval comments..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={approve.isPending}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedId(null)}
                        className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setSelectedId(request.id)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  >
                    Review
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
