export interface LeaveType {
    id: string;
    name: string;
    code: string;
    description: string;
    maxDaysPerYear: number;    
}

export interface LeaveBalance {
    id: string;
    user: string;
    leaveType: LeaveType;
    year: number;
    totalEntitled: number;
    used: number;
    pendingApproval: number;
    carriedForward: number;
    lastAccruedDate: string;
    accrued: number;
    expired: number;
    isLocked: boolean;
    lockedAt: string;
    lastUpdated: string;
}

export interface LeaveRequest {
    id: string;
    user: string;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    durationDays: number;
    reason: string;
    status: string;
    approvedBy: string;
    approvalComments: string;
    approvedAt: string;
}

export type LeaveInput = {
  organizationId: string;
};

export type LeaveRequestInput = {
    leaveTypeId: string;
    fromDate: string;
    toDate: string;
    reason: string;
}

export type GetLeaveRequestResponse = {
    getLeaveRequests: LeaveRequest[];
}

export type GetLeaveBalanceResponse = {
    leaveBalance: LeaveBalance[];
}

export type GetLeavesResponse = {
    leaveTypes: LeaveType[];
}