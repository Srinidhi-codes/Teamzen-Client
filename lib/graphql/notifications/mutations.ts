import { gql } from "@apollo/client";

export const MARK_NOTIFICATION_READ = gql`
  mutation MarkNotificationRead($id: ID!) {
    markNotificationAsRead(id: $id)
  }
`;

export const MARK_ALL_READ = gql`
  mutation MarkAllRead {
    markAllNotificationsAsRead
  }
`;

export const DELETE_NOTIFICATION = gql`
  mutation DeleteNotification($id: ID!) {
    deleteNotification(id: $id)
  }
`;

export const DELETE_ALL_READ_NOTIFICATIONS = gql`
  mutation DeleteAllReadNotifications {
    deleteAllReadNotifications
  }
`;
