import { gql } from "@apollo/client";

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      username
      firstName
      lastName
      phoneNumber
      role
      isActive
      isVerified
      dateOfJoining
      dateOfBirth
      gender
      profilePictureUrl
      employeeId
      employmentType
      manager {
        id
        firstName
        lastName
      }
      department {
        id
        name
      }
      designation {
        id
        name
      }
      officeLocation {
        id
        name
        address
        geoRadiusMeters
        latitude
        longitude
        loginTime
        logoutTime
      }
      organization {
        id
        name
        logo{
          url
        }
      }
      bankAccountNumber
      bankIfscCode
      panNumber
      aadharNumber
      uanNumber
      attendanceRate
      leaveBalance
      totalLeaveEntitlement
      tenureDisplay
      createdAt
      updatedAt
    }
  }
`;

export const GET_TEAM_HIERARCHY = gql`
  query GetTeamHierarchy($userId: ID) {
    teamHierarchy(userId: $userId) {
      manager {
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
      peers {
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
      subordinates {
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
