"use client";

import { useGraphQLCancelLeaveRequest, useGraphQLCreateLeaveRequest, useGraphQlLeaveBalance, useGraphQLLeaveRequests, useGraphQlLeaves } from "@/lib/graphql/leaves/leavesHook";
import { useStore } from "@/lib/store/useStore";
import { useState } from "react";
import { Card } from "@/components/common/Card";
import moment from "moment";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import router from "next/router";
import { useRouter } from "next/navigation";

export default function LeavesPage() {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    reason: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [viewDetails, setViewDetails] = useState("");
  const { user, isAuthenticated } = useStore();
  const { leaveBalanceData, isLoading: leaveBalanceLoading } = useGraphQlLeaveBalance();
  const { leaveRequestData, isLoading: leaveRequestLoading } = useGraphQLLeaveRequests();
  const { cancelLeaveRequest, cancelLeaveRequestLoading, cancelLeaveRequestError } = useGraphQLCancelLeaveRequest();
  const { createLeaveRequest, createLeaveRequestLoading, createLeaveRequestError } = useGraphQLCreateLeaveRequest();
  const router = useRouter();
  // Mock leave requests data - Replace with actual API call
  const leaveRequests = [
    {
      id: "1",
      leave_type_name: "Casual Leave",
      fromDate: "2025-01-15",
      toDate: "2025-01-17",
      status: "approved",
      reason: "Family function",
      days: 3,
    },
    {
      id: "2",
      leave_type_name: "Earned Leave",
      fromDate: "2025-01-20",
      toDate: "2025-01-22",
      status: "pending",
      reason: "Personal work",
      days: 3,
    },
    {
      id: "3",
      leave_type_name: "Sick Leave",
      fromDate: "2025-01-10",
      toDate: "2025-01-10",
      status: "rejected",
      reason: "Medical checkup",
      days: 1,
    },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.leaveTypeId) {
      newErrors.leaveTypeId = "Please select a leave type";
    }
    if (!formData.fromDate) {
      newErrors.fromDate = "From date is required";
    }
    if (!formData.toDate) {
      newErrors.toDate = "To date is required";
    }
    if (!formData.reason || formData.reason.trim().length < 10) {
      newErrors.reason = "Reason must be at least 10 characters";
    }

    // Validate date range
    if (formData.fromDate && formData.toDate) {
      const fromDate = moment(formData.fromDate);
      const toDate = moment(formData.toDate);

      if (toDate.isBefore(fromDate)) {
        newErrors.toDate = "To date must be after from date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setShowForm(false);
    setFormData({
      leaveTypeId: "",
      fromDate: "",
      toDate: "",
      reason: "",
    });
    createLeaveRequest({
      leave_type_id: formData.leaveTypeId,
      start_date: formData.fromDate,
      end_date: formData.toDate,
      reason: formData.reason,
    });
    setErrors({});
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      approved: { label: "Approved", className: "badge-success" },
      pending: { label: "Pending", className: "badge-warning" },
      rejected: { label: "Rejected", className: "badge-danger" },
    };

    const config = statusConfig[status] || { label: status, className: "badge-info" };
    return <span className={`badge ${config.className}`}>{config.label}</span>;
  };

  const calculateDays = () => {
    if (formData.fromDate && formData.toDate) {
      const from = moment(formData.fromDate);
      const to = moment(formData.toDate);
      return to.diff(from, "days") + 1;
    }
    return 0;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-600 mt-1">Manage your leave requests and balance</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>{showForm ? "Cancel" : "Request Leave"}</span>
        </button>
      </div>

      {/* Leave Balance Cards */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Leave Balance
        </h2>
        {leaveBalanceLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaveBalanceData?.map((balance: any) => (
              <div
                key={balance.id}
                className="glass p-6 rounded-2xl border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {balance.leaveType.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Annual Allocation</p>
                  </div>
                  <div className="w-12 h-12 bg-linear-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Entitled</span>
                    <span className="text-lg font-bold text-gray-900">{balance.totalEntitled}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Used</span>
                    <span className="text-lg font-bold text-red-600">{balance.used}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="text-lg font-bold text-yellow-600">{balance.pendingApproval}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Available</span>
                      <span className="text-2xl font-bold text-green-600">{balance.availableBalance}</span>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-linear-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(balance.availableBalance / balance.totalEntitled) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 text-right">
                    {Math.round((balance.availableBalance / balance.totalEntitled) * 100)}% remaining
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Leave Request Form */}
      {showForm && (
        <Card title="New Leave Request" hover gradient>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Leave Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.leaveTypeId}
                onChange={(e) => {
                  setFormData({ ...formData, leaveTypeId: e.target.value });
                  setErrors({ ...errors, leaveTypeId: "" });
                }}
                className={`w-full text-gray-800 ${errors.leaveTypeId ? "input-error" : ""}`}
              >
                <option value="">Select leave type</option>
                {leaveBalanceData?.map((balance: any) => (
                  <option key={balance.id} value={balance.leaveType.id}>
                    {balance.leaveType.name} (Available: {balance.availableBalance})
                  </option>
                ))}
              </select>
              {errors.leaveTypeId && (
                <p className="text-red-600 text-sm mt-1">{errors.leaveTypeId}</p>
              )}
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  From Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.fromDate}
                  onChange={(e) => {
                    setFormData({ ...formData, fromDate: e.target.value });
                    setErrors({ ...errors, fromDate: "" });
                  }}
                  className={`input w-full ${errors.fromDate ? "input-error" : ""}`}
                  min={moment().format("YYYY-MM-DD")}
                />
                {errors.fromDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.fromDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  To Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.toDate}
                  onChange={(e) => {
                    setFormData({ ...formData, toDate: e.target.value });
                    setErrors({ ...errors, toDate: "" });
                  }}
                  className={`w-full ${errors.toDate ? "input-error" : ""}`}
                  min={formData.fromDate || moment().format("YYYY-MM-DD")}
                />
                {errors.toDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.toDate}</p>
                )}
              </div>
            </div>

            {/* Days Calculation */}
            {formData.fromDate && formData.toDate && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-700">Total Days</span>
                  <span className="text-2xl font-bold text-indigo-900">{calculateDays()} days</span>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => {
                  setFormData({ ...formData, reason: e.target.value });
                  setErrors({ ...errors, reason: "" });
                }}
                className={`w-full min-h-[120px] text-gray-800 ${errors.reason ? "input-error" : ""}`}
                placeholder="Please provide a detailed reason for your leave request (minimum 10 characters)"
              />
              {errors.reason && (
                <p className="text-red-600 text-sm mt-1">{errors.reason}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {formData.reason.length} / 10 characters minimum
              </p>
            </div>

            {/* Info Box */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm text-blue-800 font-semibold">Important Information</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Your leave request will be sent to your manager for approval. Please ensure you have sufficient leave balance before submitting.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormData({
                    leaveTypeId: "",
                    fromDate: "",
                    toDate: "",
                    reason: "",
                  });
                  setErrors({});
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Submit Request</span>
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Leave Requests History */}
      <Card title="Leave Requests History" hover gradient>
        {leaveRequestLoading ? <LoadingSpinner /> : <div className="space-y-4 min-h-34">
          {leaveRequestData?.length > 0 ? leaveRequestData?.map((request) => (
            <div
              key={request.id}
              className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{request.leaveType.name}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">
                        From: <span className="font-semibold text-gray-900">{moment(request.fromDate).format("MMM DD, YYYY")}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">
                        To: <span className="font-semibold text-gray-900">{moment(request.toDate).format("MMM DD, YYYY")}</span>
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">
                        Duration: <span className="font-semibold text-gray-900">{Number(request.durationDays)} day{Number(request.durationDays) > 1 ? "s" : ""}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">Reason:</span> {request.reason}
                    </p>
                  </div>
                  <div className="mt-3">
                    {request.approvalComments && viewDetails === request.id && <p className="text-sm text-gray-600">
                      <span className="font-semibold">Comment:</span> {request.approvalComments}
                    </p>}
                  </div>
                </div>
                <div className="flex md:flex-col gap-2 pt-4">
                  <button onClick={() => { setViewDetails(request.id) }} className="btn-secondary text-sm cursor-pointer">
                    View Details
                  </button>
                  {request.status === "pending" && (
                    <button onClick={() => { cancelLeaveRequest(request.id) }} className="btn-danger text-sm cursor-pointer">
                      Cancel
                    </button>
                  )}
                  {true &&
                    <button onClick={() => { router.push(`/leaves/approvals`) }} className="btn-primary text-sm cursor-pointer">
                      Approve/Reject
                    </button>
                  }
                </div>
              </div>
            </div>
          )) : <p className="text-center my-32 font-md text-xl text-gray-800">No leave requests found 🧾</p>}
        </div>}
      </Card>
    </div>
  );
}