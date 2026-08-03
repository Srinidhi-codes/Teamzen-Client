import { gql } from "@apollo/client";

export const GET_PERFORMANCE_GOALS = gql`
  query PerformanceGoals($cycleId: ID, $search: String) {
    performanceGoals(cycleId: $cycleId, search: $search) {
      id
      title
      description
      target
      progress
      status
      dueDate
      userId
      userName
      department
      cycleId
      cycleName
    }
  }
`;

export const GET_PERFORMANCE_REVIEWS = gql`
  query PerformanceReviews($cycleId: ID, $status: String) {
    performanceReviews(cycleId: $cycleId, status: $status) {
      id
      cycleId
      cycleName
      employeeId
      employeeName
      reviewerId
      reviewerName
      selfScore
      managerScore
      selfComments
      managerComments
      status
      department
    }
  }
`;
