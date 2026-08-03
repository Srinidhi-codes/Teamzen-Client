export interface PerformanceGoal {
  id: string;
  title: string;
  description: string;
  target: string;
  progress: number;
  status: string;
  dueDate?: string | null;
  userId: string;
  userName: string;
  department?: string | null;
  cycleId?: string | null;
  cycleName?: string | null;
}

export interface PerformanceReview {
  id: string;
  cycleId: string;
  cycleName: string;
  employeeId: string;
  employeeName: string;
  reviewerId?: string | null;
  reviewerName?: string | null;
  selfScore?: number | null;
  managerScore?: number | null;
  selfComments: string;
  managerComments: string;
  status: string;
  department?: string | null;
}

export interface PerformanceGoalsResponse {
  performanceGoals: PerformanceGoal[];
}

export interface PerformanceReviewsResponse {
  performanceReviews: PerformanceReview[];
}
