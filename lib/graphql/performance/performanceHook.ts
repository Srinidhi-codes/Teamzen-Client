import { useQuery, useMutation } from "@apollo/client/react";
import {
  PerformanceGoalsResponse,
  PerformanceReviewsResponse,
} from "./types";
import { GET_PERFORMANCE_GOALS, GET_PERFORMANCE_REVIEWS } from "./queries";
import {
  CREATE_GOAL,
  UPDATE_GOAL,
  UPDATE_PERFORMANCE_REVIEW,
} from "./mutations";

export const PERFORMANCE_MUTATION_REFETCH = [
  { query: GET_PERFORMANCE_GOALS },
  { query: GET_PERFORMANCE_REVIEWS },
];

export function useGraphQLPerformanceGoals(cycleId?: string, search?: string) {
  const { data, loading, error, refetch } = useQuery<PerformanceGoalsResponse>(
    GET_PERFORMANCE_GOALS,
    {
      variables: { cycleId: cycleId ?? null, search: search ?? null },
    }
  );

  return {
    goalsData: data?.performanceGoals ?? [],
    isLoading: loading && !data,
    isRefetching: loading && !!data,
    error,
    refetch,
  };
}

export function useGraphQLPerformanceReviews(cycleId?: string, status?: string) {
  const { data, loading, error, refetch } = useQuery<PerformanceReviewsResponse>(
    GET_PERFORMANCE_REVIEWS,
    {
      variables: { cycleId: cycleId ?? null, status: status ?? null },
    }
  );

  return {
    reviewsData: data?.performanceReviews ?? [],
    isLoading: loading && !data,
    isRefetching: loading && !!data,
    error,
    refetch,
  };
}

export function useGraphQLCreateGoal() {
  const [createGoalMutation, createGoalState] = useMutation(CREATE_GOAL, {
    refetchQueries: PERFORMANCE_MUTATION_REFETCH,
    awaitRefetchQueries: true,
  });

  const createGoal = async (input: {
    title: string;
    description?: string;
    target?: string;
    progress?: number;
    status?: string;
    due_date?: string;
    cycle_id?: string;
  }) => {
    const response = await createGoalMutation({
      variables: {
        input: {
          title: input.title,
          description: input.description,
          target: input.target,
          progress: input.progress,
          status: input.status,
          dueDate: input.due_date,
          cycleId: input.cycle_id,
        },
      },
    });
    return response.data;
  };

  return {
    createGoal,
    createGoalLoading: createGoalState.loading,
    createGoalError: createGoalState.error,
  };
}

export function useGraphQLUpdateGoal() {
  const [updateGoalMutation, updateGoalState] = useMutation(UPDATE_GOAL, {
    refetchQueries: PERFORMANCE_MUTATION_REFETCH,
    awaitRefetchQueries: true,
  });

  const updateGoal = async (input: {
    id: string;
    title?: string;
    description?: string;
    target?: string;
    progress?: number;
    status?: string;
    due_date?: string;
  }) => {
    const response = await updateGoalMutation({
      variables: {
        input: {
          id: input.id,
          title: input.title,
          description: input.description,
          target: input.target,
          progress: input.progress,
          status: input.status,
          dueDate: input.due_date,
        },
      },
    });
    return response.data;
  };

  return {
    updateGoal,
    updateGoalLoading: updateGoalState.loading,
    updateGoalError: updateGoalState.error,
  };
}

export function useGraphQLUpdatePerformanceReview() {
  const [updateReviewMutation, updateReviewState] = useMutation(
    UPDATE_PERFORMANCE_REVIEW,
    {
      refetchQueries: PERFORMANCE_MUTATION_REFETCH,
      awaitRefetchQueries: true,
    }
  );

  const updatePerformanceReview = async (input: {
    id: string;
    self_score?: number;
    self_comments?: string;
    manager_score?: number;
    manager_comments?: string;
    status?: string;
  }) => {
    const response = await updateReviewMutation({
      variables: {
        input: {
          id: input.id,
          selfScore: input.self_score,
          selfComments: input.self_comments,
          managerScore: input.manager_score,
          managerComments: input.manager_comments,
          status: input.status,
        },
      },
    });
    return response.data;
  };

  return {
    updatePerformanceReview,
    updateReviewLoading: updateReviewState.loading,
    updateReviewError: updateReviewState.error,
  };
}
