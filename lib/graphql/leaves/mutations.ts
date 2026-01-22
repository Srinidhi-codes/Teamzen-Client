import { gql } from "@apollo/client";

export const CREATE_LEAVE_REQUEST = gql `
    mutation CreateLeaveRequest($input: LeaveRequestInput!) {
        createLeaveRequest(input: $input){
        id
        leaveType{
        id
        name
        }
        fromDate
        toDate
        reason
        durationDays
        status
        }}
`

export const CANCEL_LEAVE_REQUEST = gql `
    mutation CancelLeaveRequest($requestId: ID!){
        cancelLeaveRequest(requestId: $requestId){
            id
            leaveType{
            id
            name
            }
            fromDate
            toDate
            reason
            durationDays
            status
            }
        }
`