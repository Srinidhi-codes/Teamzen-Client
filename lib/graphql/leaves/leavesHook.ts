import { useQuery, useMutation } from "@apollo/client/react"
import { GetLeaveBalanceResponse, GetLeavesResponse, LeaveType } from "./types";
import { GET_LEAVE_BALANCE, GET_LEAVES } from "./queries";

export function useGraphQlLeaves(organizationId: string) {
 const { data, loading, error, refetch } = useQuery<GetLeavesResponse>(GET_LEAVES,{
    variables: { organizationId },
    fetchPolicy: 'network-only',
 })   

 return {
    leavesData: data?.leaveTypes ?? [],
    isLoading: loading,
    error,
    refetch
 }
}

export function useGraphQlLeaveBalance() {
    const { data, loading, error, refetch } = useQuery<GetLeaveBalanceResponse>(GET_LEAVE_BALANCE,{
        fetchPolicy: 'network-only',
     })   
    
    return {
        leaveBalanceData: data?.leaveBalance ?? [],
        isLoading: loading,
        error,
        refetch
     }
}