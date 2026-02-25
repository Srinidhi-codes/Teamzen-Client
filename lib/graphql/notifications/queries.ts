import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($level: String) {
    myNotifications(level: $level) {
      id
      verb
      message
      targetType
      targetId
      isRead
      createdAt
      actor {
        id
        firstName
        lastName
      }
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($level: String) {
    unreadNotificationCount(level: $level)
  }
`;
