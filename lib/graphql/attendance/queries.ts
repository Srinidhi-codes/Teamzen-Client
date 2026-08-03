import { gql } from "@apollo/client";

export const GET_ATTENDANCE = gql`  
    query MyAttendance($input: AttendanceInput) {
    myAttendance(input: $input) {
    id
    attendanceDate
    loginTime
    logoutTime
    loginDistance
    logoutDistance
    loginLatitude
    loginLongitude
    logoutLatitude
    logoutLongitude
    actualLoginTime
    actualLogoutTime
    isVerified
    workedHours
    status
    faceVerified
    faceMatchScore
    isWithinGeofence
    correctionStatus
    correctionId
    correctionReason
    approvalComment
  }
}
`;

export const GET_TEAM_ATTENDANCE_TODAY = gql`
  query TeamAttendanceToday {
    teamAttendanceToday {
      status
      loginTime
      logoutTime
      recordStatus
      user {
        id
        firstName
        lastName
        profilePictureUrl
        designation {
          name
        }
        department {
          name
        }
      }
    }
  }
`;
