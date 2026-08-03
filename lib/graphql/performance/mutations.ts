import { gql } from "@apollo/client";

export const CREATE_GOAL = gql`
  mutation CreateGoal($input: GoalInput!) {
    createGoal(input: $input) {
      id
      title
      description
      target
      progress
      status
      dueDate
      cycleId
      cycleName
    }
  }
`;

export const UPDATE_GOAL = gql`
  mutation UpdateGoal($input: UpdateGoalInput!) {
    updateGoal(input: $input) {
      id
      title
      description
      target
      progress
      status
      dueDate
      cycleId
      cycleName
    }
  }
`;

export const UPDATE_PERFORMANCE_REVIEW = gql`
  mutation UpdatePerformanceReview($input: UpdateReviewInput!) {
    updatePerformanceReview(input: $input) {
      id
      cycleId
      cycleName
      selfScore
      managerScore
      selfComments
      managerComments
      status
    }
  }
`;
