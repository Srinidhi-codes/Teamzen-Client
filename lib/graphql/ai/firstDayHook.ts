"use client";

import { useQuery } from "@apollo/client/react";
import { FIRST_DAY_WIZARD } from "@/lib/graphql/ai/queries";
import type { FirstDayWizardData } from "@/lib/graphql/ai/types";

export function useFirstDayWizard(enabled = true) {
  const { data, loading, error, refetch } = useQuery(FIRST_DAY_WIZARD, {
    skip: !enabled,
    fetchPolicy: "cache-first",
  }) as {
    data?: { firstDayWizard?: FirstDayWizardData };
    loading: boolean;
    error?: Error;
    refetch: () => Promise<unknown>;
  };

  return {
    wizard: data?.firstDayWizard ?? null,
    isLoading: loading,
    error,
    refetch,
  };
}
