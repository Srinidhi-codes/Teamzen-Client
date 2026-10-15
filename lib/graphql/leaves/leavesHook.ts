import { useQuery, useMutation } from "@apollo/client/react"
import { GetLeaveBalanceResponse, GetLeaveRequestResponse, GetLeavesResponse, GetTeamLeavesResponse, LeaveType, LeaveBalance, LeaveRequest, TeamLeave } from "./types";
import { GET_LEAVE_BALANCE, GET_LEAVE_REQUESTS, GET_LEAVES, GET_TEAM_LEAVES, GET_COMPANY_HOLIDAYS } from "./queries";
import { CANCEL_LEAVE_REQUEST, CREATE_LEAVE_REQUEST, LEAVE_REQUEST_PROCESS } from "./mutations";
import { GET_USER_DASHBOARD_STATS } from "../dashboard/queries";

export const LEAVE_MUTATION_REFETCH = [
   { query: GET_LEAVE_BALANCE },
   { query: GET_LEAVE_REQUESTS, variables: { approvalsOnly: false } },
   { query: GET_LEAVE_REQUESTS, variables: { approvalsOnly: true } },
   { query: GET_TEAM_LEAVES },
   { query: GET_USER_DASHBOARD_STATS },
];

export function useGraphQlLeaves(organizationId: string, options?: any) {
   const { data, loading, error, refetch } = useQuery<GetLeavesResponse>(GET_LEAVES, {
      variables: { organizationId },
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
      ...options,
   }) as any

   return {
      leavesData: (data?.leaveTypes ?? []) as LeaveType[],
      isLoading: loading && !data,
      isRefetching: loading && !!data,
      error,
      refetch
   }
}

export function useGraphQlLeaveBalance(options?: any) {
   const { data, loading, error, refetch } = useQuery<GetLeaveBalanceResponse>(GET_LEAVE_BALANCE, {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
      ...options,
   }) as any

   return {
      leaveBalanceData: (data?.leaveBalance ?? []) as LeaveBalance[],
      isLoading: loading && !data,
      isRefetching: loading && !!data,
      error,
      refetch
   }
}

export function useGraphQLLeaveRequests(approvalsOnly: boolean = false, options?: any) {
   const { data, loading, error, refetch } = useQuery<GetLeaveRequestResponse>(GET_LEAVE_REQUESTS, {
      variables: { approvalsOnly },
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
      ...options,
   }) as any

   return {
      leaveRequestData: (data?.getLeaveRequests ?? []) as LeaveRequest[],
      isLoading: loading && !data,
      isRefetching: loading && !!data,
      error,
      refetch
   }
}

export function useGraphQLTeamLeaves(options?: any) {
   const { data, loading, error, refetch } = useQuery<GetTeamLeavesResponse>(GET_TEAM_LEAVES, {
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
      ...options,
   }) as any

   return {
      teamLeavesData: (data?.teamLeaves ?? []) as TeamLeave[],
      isLoading: loading && !data,
      isRefetching: loading && !!data,
      error,
      refetch
   }
}

// MUTATIONS

export function useGraphQLCreateLeaveRequest() {
   const [createLeaveRequestMutation, createLeaveRequestState] = useMutation(CREATE_LEAVE_REQUEST, {
      refetchQueries: LEAVE_MUTATION_REFETCH,
      awaitRefetchQueries: true,
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
      const res = response as any;
      if (res.errors && res.errors.length > 0) {
         throw new Error(res.errors.map((e: any) => e.message).join(", "));
      }
      if (res.error) {
         throw res.error;
      }
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
      refetchQueries: LEAVE_MUTATION_REFETCH,
      awaitRefetchQueries: true,
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
      refetchQueries: LEAVE_MUTATION_REFETCH,
      awaitRefetchQueries: true,
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

export function useGraphQLCompanyHolidays(options?: any) {
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
      fetchPolicy: "cache-first",
      nextFetchPolicy: "cache-first",
      ...options,
   }) as any;

   return {
      companyHolidaysData: (data?.companyHolidays ?? []) as CompanyHolidaysResponse["companyHolidays"],
      isLoading: loading && !data,
      isRefetching: loading && !!data,
      error,
      refetch,
   };
}
