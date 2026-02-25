import { gql } from "@apollo/client";

export const GET_USER_DASHBOARD_STATS = gql`
  query GetUserDashboardStats {
    userDashboardStats {
      attendanceRate
      leaveBalances {
        leaveType
        balance
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
    }
  }
`;
