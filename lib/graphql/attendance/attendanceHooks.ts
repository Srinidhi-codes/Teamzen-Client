import { useQuery, useMutation } from "@apollo/client/react"
import { GET_ATTENDANCE, GET_TEAM_ATTENDANCE_TODAY } from "./queries"
import { CANCEL_ATTENDANCE_CORRECTION, CHECK_IN, CHECK_OUT, ENROLL_FACE, REQUEST_ATTENDANCE_CORRECTION } from "./mutations"
import { GET_USER_DASHBOARD_STATS } from "../dashboard/queries"
import { GET_ME } from "../users/queries"
import {
  AttendanceInput,
  GetAttendanceResponse,
  GetAttendanceVars,
  GetTeamAttendanceTodayResponse,
} from "./types"

const ATTENDANCE_MUTATION_REFETCH = [
  { query: GET_ATTENDANCE },
  { query: GET_TEAM_ATTENDANCE_TODAY },
  { query: GET_USER_DASHBOARD_STATS },
];

export function useGraphQlAttendance() {
  const { data, loading, error, refetch } = useQuery<
    GetAttendanceResponse,
    GetAttendanceVars
  >(GET_ATTENDANCE);

  return {
    attendance: data?.myAttendance ?? [],
    isLoading: loading && !data,
    isRefetching: loading && !!data,
    error,
    refetchAttendance: (input?: AttendanceInput ) =>
      refetch(input ? { input } : {}),
    refetch
  };
}

export function useGraphQLTeamAttendanceToday() {
  const { data, loading, error, refetch } = useQuery<GetTeamAttendanceTodayResponse>(
    GET_TEAM_ATTENDANCE_TODAY,
    {
      pollInterval: 60_000,
    }
  );

  return {
    teamAttendanceToday: data?.teamAttendanceToday ?? [],
    isLoading: loading && !data,
    isRefetching: loading && !!data,
    error,
    refetch,
  };
}

/**
 * Attendance mutations: check-in / check-out
 */
export function useAttendanceMutations() {
    const [checkInMutation, checkInState] = useMutation(CHECK_IN, {
        refetchQueries: ATTENDANCE_MUTATION_REFETCH,
        awaitRefetchQueries: true,
    });

    const [checkOutMutation, checkOutState] = useMutation(CHECK_OUT, {
        refetchQueries: ATTENDANCE_MUTATION_REFETCH,
        awaitRefetchQueries: true,
    });

    const [requestCorrectionMutation, requestCorrectionState] = useMutation(REQUEST_ATTENDANCE_CORRECTION, {
        refetchQueries: ATTENDANCE_MUTATION_REFETCH,
        awaitRefetchQueries: true,
    });

    const checkIn = async (input: {
        officeLocationId: string;
        latitude: number;
        longitude: number;
        loginTime: string;
        faceVerified?: boolean;
        faceMatchScore?: number;
        faceDescriptor?: number[];
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
        faceVerified?: boolean;
        faceMatchScore?: number;
        faceDescriptor?: number[];
    }) => {
        const response = await checkOutMutation({
        variables: { input },
        });

        return response.data;
    };

    const [enrollFaceMutation, enrollFaceState] = useMutation<{
        enrollFace: {
            success: boolean;
            error?: string | null;
            user?: {
                id: string;
                faceEnrolled: boolean;
                faceDescriptor?: number[] | null;
                faceEnrolledAt?: string | null;
            } | null;
        };
    }>(ENROLL_FACE);

    const enrollFace = async (input: { descriptor: number[]; imageBase64?: string }) => {
        const response = await enrollFaceMutation({
            variables: { input },
            refetchQueries: [{ query: GET_ME }],
            awaitRefetchQueries: false,
        });
        return response.data?.enrollFace;
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
        enrollFace,

        checkInLoading: checkInState.loading,
        checkInError: checkInState.error,

        checkOutLoading: checkOutState.loading,
        checkOutError: checkOutState.error,

        enrollFaceLoading: enrollFaceState.loading,

        requestCorrectionLoading: requestCorrectionState.loading,
        requestCorrectionError: requestCorrectionState.error
    };
}

export function useCancelAttendanceCorrection() {
    const [cancelAttendanceCorrectionMutation, cancelAttendanceCorrectionState] = useMutation(CANCEL_ATTENDANCE_CORRECTION, {
        refetchQueries: ATTENDANCE_MUTATION_REFETCH,
        awaitRefetchQueries: true,
    });

    const cancelAttendanceCorrection = async (correctionId: string) => {
        const response = await cancelAttendanceCorrectionMutation({
            variables: { correctionId },
        });
        return response.data;
    }

    return {
        cancelAttendanceCorrection,
        cancelAttendanceCorrectionLoading: cancelAttendanceCorrectionState.loading,
        cancelAttendanceCorrectionError: cancelAttendanceCorrectionState.error,
    }
}
