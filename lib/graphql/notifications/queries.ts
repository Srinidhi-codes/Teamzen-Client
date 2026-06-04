import { gql } from "@apollo/client";

export const GET_MY_NOTIFICATIONS = gql`
  query GetMyNotifications($level: String, $isRead: Boolean, $page: Int, $pageSize: Int) {
    myNotifications(level: $level, isRead: $isRead, page: $page, pageSize: $pageSize) {
      results {
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
      total
      page
      pageSize
    }
  }
`;

export const GET_UNREAD_COUNT = gql`
  query GetUnreadCount($level: String) {
    unreadNotificationCount(level: $level)
  }
`;
