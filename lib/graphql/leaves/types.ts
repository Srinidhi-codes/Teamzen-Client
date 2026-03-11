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
    availableBalance: number;
    accrued: number;
    expired: number;
    isLocked: boolean;
    lockedAt: string;
    lastUpdated: string;
}

export interface UserSummary {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: { url: string };
}

export interface LeaveRequest {
    id: string;
    user: UserSummary;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    durationDays: number;
    reason: string;
    status: string;
    approvedBy: UserSummary | null;
    approvalComments: string;
    approvedAt: string;
}

export interface TeamLeave {
    id: string;
    user: UserSummary;
    leaveType: LeaveType;
    fromDate: string;
    toDate: string;
    durationDays: number;
    status: string;
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

export interface GetLeaveRequestResponse {
    getLeaveRequests: LeaveRequest[];
}

export interface GetTeamLeavesResponse {
    teamLeaves: TeamLeave[];
}

export type GetLeaveBalanceResponse = {
    leaveBalance: LeaveBalance[];
}

export type GetLeavesResponse = {
    leaveTypes: LeaveType[];
}