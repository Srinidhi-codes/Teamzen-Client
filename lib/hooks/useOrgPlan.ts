"use client";

import { useGraphQLUser } from "@/lib/api/graphqlHooks";
import { useStore } from "@/lib/store/useStore";
import {
  effectivePlan,
  hasPlanFeature,
  minPlanForFeature,
  type PlanFeature,
} from "@/lib/plans";

export function useOrgPlan() {
  const { user: storeUser, hasHydrated } = useStore();
  const { user: graphqlUser, isLoading } = useGraphQLUser();
  const user = graphqlUser || storeUser;

  const plan = user?.organization?.plan;
  const expiresAt = user?.organization?.planExpiresAt ?? null;
  const planKnown =
    Boolean(plan) || (hasHydrated && !isLoading && !!user);

  const activePlan = planKnown
    ? effectivePlan(plan, expiresAt)
    : "elite";

  return {
    user,
    plan,
    expiresAt,
    activePlan,
    planKnown,
    // Until plan is known, allow features to avoid Free-plan lock flash.
    can: (feature: PlanFeature) =>
      !planKnown || hasPlanFeature(plan, expiresAt, feature),
    requiredPlan: (feature: PlanFeature) => minPlanForFeature(feature),
  };
}
