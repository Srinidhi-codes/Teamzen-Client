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
    leaveType: string;
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

export type LeaveInput = {
  organizationId: string;
};

export type GetLeaveBalanceResponse = {
    leaveBalance: LeaveBalance[];
}

export type GetLeavesResponse = {
    leaveTypes: LeaveType[];
}