import type { InMemoryCacheConfig } from "@apollo/client";

export const apolloCacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        getLeaveRequests: {
          keyArgs: ["approvalsOnly", "search"],
        },
        teamLeaves: {
          keyArgs: false,
        },
        teamHierarchy: {
          keyArgs: false,
        },
        myAttendance: {
          keyArgs: ["input"],
        },
        leaveBalance: {
          keyArgs: false,
        },
        teamAttendanceToday: {
          keyArgs: false,
        },
        userDashboardStats: {
          keyArgs: false,
        },
        myNotifications: {
          keyArgs: ["level", "isRead", "page", "pageSize"],
        },
        unreadNotificationCount: {
          keyArgs: ["level"],
        },
      },
    },
    User: {
      keyFields: ["id"],
    },
    AttendanceRecord: {
      keyFields: ["id"],
    },
  },
};

export const apolloDefaultOptions = {
  watchQuery: {
    fetchPolicy: "cache-and-network" as const,
    nextFetchPolicy: "cache-first" as const,
  },
  mutate: {
    awaitRefetchQueries: true,
  },
};
