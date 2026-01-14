import {gql} from "@apollo/client";

export const GET_ATTENDANCE = gql`  
    query MyAttendance($input: AttendanceInput) {
    myAttendance(input: $input) {
    id
    attendanceDate
    loginTime
    logoutTime
    loginDistance
    logoutDistance
    isVerified
    workedHours
    status
    correctionStatus
    correctionReason
    approvalComment
  }
}
`;

