import { gql } from "@apollo/client";

export const FEEDBACK_LIST = gql`
  query FeedbackList($status: String, $category: String) {
    feedbackList(status: $status, category: $category) {
      id
      title
      message
      category
      status
      visibility
      adminReply
      repliedAt
      createdAt
      updatedAt
      author {
        id
        firstName
        lastName
        email
      }
      repliedBy {
        id
        firstName
        lastName
      }
      attachments {
        id
        fileName
        fileUrl
        createdAt
      }
    }
  }
`;
