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
    checkInSelfieUrl
    checkOutSelfieUrl
    correctionStatus
    correctionId
    correctionReason
    correctionCategory
    isPayrollLocked
    approvalComment
  }
}
`;

export const GET_MY_REGULARIZATION_QUOTA = gql`
  query MyRegularizationQuota($targetDate: Date) {
    myRegularizationQuota(targetDate: $targetDate) {
      monthlyLimit
      usedCount
      remainingCount
      deadlineDays
      isExhausted
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

export const GET_ATTENDANCE_RECORD = gql`
  query GetAttendanceRecord($id: ID!) {
    attendanceRecord(id: $id) {
      id
      attendanceDate
      loginTime
      logoutTime
      actualLoginTime
      actualLogoutTime
      loginDistance
      logoutDistance
      loginLatitude
      loginLongitude
      logoutLatitude
      logoutLongitude
      isVerified
      workedHours
      status
      faceVerified
      faceMatchScore
      isWithinGeofence
      checkInSelfieUrl
      checkOutSelfieUrl
      correctionStatus
      correctionId
      correctionReason
      correctionCategory
      isPayrollLocked
      approvalComment
      officeLocation {
        id
        name
        loginTime
        logoutTime
      }
    }
  }
`;

