import { useMutation, useQuery } from "@apollo/client/react";
import {
  ACCEPT_OFFER,
  COMPLETE_MY_ONBOARDING_TASK,
  MY_ASSIGNED_ONBOARDING_TASKS,
  MY_ONBOARDING,
  UPDATE_PREBOARDING_PROFILE,
} from "./queries";

export function useMyOnboarding() {
  const { data, loading, error, refetch } = useQuery(MY_ONBOARDING, {
    fetchPolicy: "cache-and-network",
  });
  return {
    onboarding: data?.myOnboarding ?? null,
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useMyAssignedOnboardingTasks() {
  const { data, loading, error, refetch } = useQuery(MY_ASSIGNED_ONBOARDING_TASKS, {
    fetchPolicy: "cache-and-network",
  });
  return {
    tasks: data?.myAssignedOnboardingTasks ?? [],
    isLoading: loading && !data,
    error,
    refetch,
  };
}

export function useOnboardingEmployeeMutations() {
  const [completeTask, completeState] = useMutation(COMPLETE_MY_ONBOARDING_TASK);
  const [acceptOffer, acceptState] = useMutation(ACCEPT_OFFER);
  const [updateProfile, profileState] = useMutation(UPDATE_PREBOARDING_PROFILE);
  return {
    completeTask,
    acceptOffer,
    updateProfile,
    loading: completeState.loading || acceptState.loading || profileState.loading,
  };
}
