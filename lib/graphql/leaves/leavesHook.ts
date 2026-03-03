import { useQuery, useMutation } from "@apollo/client/react"
import { GetLeaveBalanceResponse, GetLeaveRequestResponse, GetLeavesResponse, GetTeamLeavesResponse, LeaveType } from "./types";
import { GET_LEAVE_BALANCE, GET_LEAVE_REQUESTS, GET_LEAVES, GET_TEAM_LEAVES } from "./queries";
import { CANCEL_LEAVE_REQUEST, CREATE_LEAVE_REQUEST } from "./mutations";

export function useGraphQlLeaves(organizationId: string) {
   const { data, loading, error, refetch } = useQuery<GetLeavesResponse>(GET_LEAVES, {
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
   const { data, loading, error, refetch } = useQuery<GetLeaveBalanceResponse>(GET_LEAVE_BALANCE, {
      fetchPolicy: 'network-only',
   })

   return {
      leaveBalanceData: data?.leaveBalance ?? [],
      isLoading: loading,
      error,
      refetch
   }
}

export function useGraphQLLeaveRequests() {
   const { data, loading, error, refetch } = useQuery<GetLeaveRequestResponse>(GET_LEAVE_REQUESTS, {
      fetchPolicy: 'network-only',
   })

   return {
      leaveRequestData: data?.getLeaveRequests ?? [],
      isLoading: loading,
      error,
      refetch
   }
}

export function useGraphQLTeamLeaves() {
   const { data, loading, error, refetch } = useQuery<GetTeamLeavesResponse>(GET_TEAM_LEAVES, {
      fetchPolicy: 'network-only',
   })

   return {
      teamLeavesData: data?.teamLeaves ?? [],
      isLoading: loading,
      error,
      refetch
   }
}

// MUTATIONS

export function useGraphQLCreateLeaveRequest() {
   const [createLeaveRequestMutation, createLeaveRequestState] = useMutation(CREATE_LEAVE_REQUEST, {
      refetchQueries: [{ query: GET_LEAVE_BALANCE }, { query: GET_LEAVE_REQUESTS }]
   })

   const createLeaveRequest = async (input: {
      leave_type_id: string;
      start_date: string;
      end_date: string;
      reason: string;
   }) => {
      const response = await createLeaveRequestMutation({
         variables: {
            input: {
               leaveTypeId: input.leave_type_id,
               fromDate: input.start_date,
               toDate: input.end_date,
               reason: input.reason
            }
         },
      })
      return response.data
   }

   return {
      createLeaveRequest,
      createLeaveRequestLoading: createLeaveRequestState.loading,
      createLeaveRequestError: createLeaveRequestState.error,
   }

}

export function useGraphQLCancelLeaveRequest() {
   const [cancelLeaveRequestMutation, cancelLeaveRequestState] = useMutation(CANCEL_LEAVE_REQUEST, {
      refetchQueries: [{ query: GET_LEAVE_BALANCE }, { query: GET_LEAVE_REQUESTS }]
   })

   const cancelLeaveRequest = async (requestId: string) => {
      const response = await cancelLeaveRequestMutation({
         variables: { requestId },
      })
      return response.data
   }

   return {
      cancelLeaveRequest,
      cancelLeaveRequestLoading: cancelLeaveRequestState.loading,
      cancelLeaveRequestError: cancelLeaveRequestState.error,
   }
}