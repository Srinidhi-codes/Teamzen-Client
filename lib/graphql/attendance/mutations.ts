import { gql } from "@apollo/client";

export const CHECK_IN = gql`
  mutation CheckIn($input: CheckInInput!) {
    checkIn(input: $input) {
      id
      loginTime
      status
      faceVerified
      faceMatchScore
      isWithinGeofence
    }
  }
`;

export const CHECK_OUT = gql`
  mutation CheckOut($input: CheckOutInput!) {
    checkOut(input: $input) {
      id
      logoutTime
      status
      faceVerified
      faceMatchScore
      isWithinGeofence
    }
  }
`;

export const ENROLL_FACE = gql`
  mutation EnrollFace($input: EnrollFaceInput!) {
    enrollFace(input: $input) {
      success
      error
      user {
        id
        faceEnrolled
        faceDescriptor
        faceEnrolledAt
      }
    }
  }
`;

export const REQUEST_ATTENDANCE_CORRECTION = gql`
  mutation RequestAttendanceCorrection($input: AttendanceCorrectionInput!) {
    requestAttendanceCorrection(input: $input) {
      id
      status
    }
  }
`;

export const CANCEL_ATTENDANCE_CORRECTION = gql`
  mutation CancelAttendanceCorrection($correctionId: ID!) {
    cancelAttendanceCorrection(correctionId: $correctionId) {
      id
      status
    }
  }
`;