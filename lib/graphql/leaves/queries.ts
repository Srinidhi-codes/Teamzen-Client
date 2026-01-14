import {gql} from "@apollo/client";

export const GET_LEAVES = gql`  
    query LeaveTypes($organizationId: LeaveInput!){
    leaveTypes(organizationId: $organizationId){
    id
    name
    code
    description
    maxDaysPerYear
  }
}
`;

export const GET_LEAVE_BALANCE = gql`
    query LeaveBalance {
    leaveBalance{
    id
    user{
        id
        firstName
    }
    leaveType{
        id
        name
    }
    year
    totalEntitled
    used
    pendingApproval
    accrued
    expired
    isLocked
    availableBalance
    lockedAt
    lastUpdated
  }
}
`;

export const GET_LEAVE_REQUESTS = gql`
    query LeaveRequests($organizationId: LeaveInput!){
    leaveRequests(organizationId: $organizationId){
    id
    user{
        id
        firstName
    }
    leaveType{
        id
        name
    }
    fromDate
    toDate
    durationDays
    reason
    status
    approvedBy
    approvalComments
    approvedAt
    createdAt
    updatedAt
  }
}
`;
