import { useQuery, useMutation } from "@apollo/client/react"
import { GetLeaveBalanceResponse, GetLeaveRequestResponse, GetLeavesResponse, GetTeamLeavesResponse, LeaveType } from "./types";
import { GET_LEAVE_BALANCE, GET_LEAVE_REQUESTS, GET_LEAVES, GET_TEAM_LEAVES, GET_COMPANY_HOLIDAYS } from "./queries";
import { CANCEL_LEAVE_REQUEST, CREATE_LEAVE_REQUEST, LEAVE_REQUEST_PROCESS } from "./mutations";

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
      half_day_period?: string;
   }) => {
      const response = await createLeaveRequestMutation({
         variables: {
            input: {
               leaveTypeId: input.leave_type_id,
               fromDate: input.start_date,
               toDate: input.end_date,
               reason: input.reason,
               halfDayPeriod: input.half_day_period
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

export function useGraphQLLeaveRequestProcess() {
   const [processLeaveRequestMutation, processLeaveRequestState] = useMutation(LEAVE_REQUEST_PROCESS, {
      refetchQueries: [{ query: GET_LEAVE_BALANCE }, { query: GET_LEAVE_REQUESTS }]
   })

   const processLeaveRequest = async (input: {
      request_id: string;
      status: string;
      comments: string;
   }) => {
      const response = await processLeaveRequestMutation({
         variables: {
            input: {
               requestId: input.request_id,
               status: input.status,
               comments: input.comments
            }
         },
      })
      return response.data
   }

   return {
      processLeaveRequest,
      processLeaveRequestLoading: processLeaveRequestState.loading,
      processLeaveRequestError: processLeaveRequestState.error,
   }
}

export function useGraphQLCompanyHolidays() {
   interface CompanyHolidaysResponse {
      companyHolidays: Array<{
         id: string;
         name: string;
         holidayDate: string;
         isOptional: boolean;
         description: string;
      }>;
   }
   const { data, loading, error, refetch } = useQuery<CompanyHolidaysResponse>(GET_COMPANY_HOLIDAYS, {
      fetchPolicy: 'network-only',
   });

   return {
      companyHolidaysData: data?.companyHolidays ?? [],
      isLoading: loading,
      error,
      refetch,
   };
}
