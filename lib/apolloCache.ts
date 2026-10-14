import type { InMemoryCacheConfig } from "@apollo/client";

export const apolloCacheConfig: InMemoryCacheConfig = {
  typePolicies: {
    Query: {
      fields: {
        me: {
          keyArgs: false,
        },
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
        companyHolidays: {
          keyArgs: false,
        },
        myPayslips: {
          keyArgs: false,
        },
        myOffboarding: {
          keyArgs: false,
        },
        performanceGoals: {
          keyArgs: ["cycleId", "search"],
        },
        performanceReviews: {
          keyArgs: ["cycleId", "status"],
        },
        myIssuedDocuments: {
          keyArgs: false,
        },
        myDocumentRequests: {
          keyArgs: false,
        },
        myVaultUploads: {
          keyArgs: false,
        },
        myEmployeeDocumentRequests: {
          keyArgs: false,
        },
        myOnboarding: {
          keyArgs: false,
        },
        myAssignedOnboardingTasks: {
          keyArgs: false,
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
    fetchPolicy: "cache-first" as const,
    nextFetchPolicy: "cache-first" as const,
  },
  query: {
    fetchPolicy: "cache-first" as const,
  },
  mutate: {
    awaitRefetchQueries: true,
  },
};
