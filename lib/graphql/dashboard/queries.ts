import { gql } from "@apollo/client";

export const GET_USER_DASHBOARD_STATS = gql`
  query GetUserDashboardStats {
    userDashboardStats {
      attendanceRate
      leaveBalances {
        name
        leaveType
        balance
        total
      }
      pendingRequestsCount
      daysPresent
      recentActivities {
        id
        user
        action
        time
      }
      last7Days {
        date
        dayStr
        status
      }
      attendanceTrend {
        month
        value
      }
      upcomingEvents {
        id
        user
        type
        date
        profilePicture
        daysUntil
      }
      aiInsights {
        title
        message
        type
        query
      }
      wishMessage
    }
  }
`;

export const GET_USER_ACTIVITIES = gql`
  query GetUserActivities {
    userActivities {
      id
      user
      action
      time
    }
  }
`;
