import { useQuery, useMutation } from "@apollo/client/react"
import { GET_ATTENDANCE, } from "./queries"
import { CHECK_IN, CHECK_OUT, REQUEST_ATTENDANCE_CORRECTION } from "./mutations"
import { AttendanceInput, AttendanceRecord, GetAttendanceResponse, GetAttendanceVars } from "./types"

export function useGraphQlAttendance() {
  const { data, loading, error, refetch } = useQuery<
    GetAttendanceResponse,
    GetAttendanceVars
  >(GET_ATTENDANCE, {
    fetchPolicy: "network-only", // 👈 avoids stale data
  });

  return {
    attendance: data?.myAttendance ?? [],
    isLoading: loading,
    error,
    refetchAttendance: (input?: AttendanceInput ) =>
      refetch(input ? { input } : {}),
    refetch
  };
}

/**
 * Attendance mutations: check-in / check-out
 */
export function useAttendanceMutations() {
    const [checkInMutation, checkInState] = useMutation(CHECK_IN, {
        refetchQueries: [{ query: GET_ATTENDANCE }],
    });

    const [checkOutMutation, checkOutState] = useMutation(CHECK_OUT, {
        refetchQueries: [{ query: GET_ATTENDANCE }],
    });

    const [requestCorrectionMutation, requestCorrectionState] = useMutation(REQUEST_ATTENDANCE_CORRECTION, {
        refetchQueries: [{ query: GET_ATTENDANCE }],
    });

    const checkIn = async (input: {
        officeLocationId: string;
        latitude: number;
        longitude: number;
        loginTime: string;
    }) => {
        const response = await checkInMutation({
        variables: { input },
        });

        return response.data;
    };

    const checkOut = async (input: {
        latitude: number;
        longitude: number;
        logoutTime: string;
    }) => {
        const response = await checkOutMutation({
        variables: { input },
        });

        return response.data;
    };

    const requestCorrection = async (input: {
        attendanceRecordId: string;
        correctedLoginTime: string;
        correctedLogoutTime: string;
        reason: string;
    }) => {
        const response = await requestCorrectionMutation({
            variables: { input: {
                attendanceRecordId: input.attendanceRecordId,
                correctedLoginTime: input.correctedLoginTime,
                correctedLogoutTime: input.correctedLogoutTime,
                reason: input.reason,
            }},
        });
        return response.data;
    }

    return {
        checkIn,
        checkOut,
        requestCorrection,

        checkInLoading: checkInState.loading,
        checkInError: checkInState.error,

        checkOutLoading: checkOutState.loading,
        checkOutError: checkOutState.error,

        requestCorrectionLoading: requestCorrectionState.loading,
        requestCorrectionError: requestCorrectionState.error
    };
}
