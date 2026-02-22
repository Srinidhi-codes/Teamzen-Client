import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications {
    myNotifications {
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
  query GetUnreadCount {
    unreadNotificationCount
  }
`;
