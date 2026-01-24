"use client";

import { useGetActiveSubscriptionQuery } from "@/redux/services/userServices/purchaseSubscriptionService";
import { useMemo } from "react";

interface UseQuotaReturn {
  totalQuestionSets: number;
  limit: number;
  remaining: number;
  percentage: number;
  isLimited: boolean;
  isNearLimit: boolean;
  isLoading: boolean;
}

/**
 * Hook to check user's question set quota
 * Usage: const { remaining, limit, percentage } = useQuota()
 */
export function useQuota(): UseQuotaReturn {
  const { data: subscriptionData, isLoading } = useGetActiveSubscriptionQuery();

  return useMemo(() => {
    if (isLoading || !subscriptionData) {
      return {
        totalQuestionSets: 0,
        limit: 0,
        remaining: 0,
        percentage: 0,
        isLimited: false,
        isNearLimit: false,
        isLoading: true,
      };
    }

    const usageCount = (subscriptionData.subscription?.usageCount || {}) as Record<
      string,
      any
    >;
    const totalQuestionSets = usageCount.questionSetsCreated || 0;
    const limit = subscriptionData.package?.numberOfQuestions || 0;
    const remaining = Math.max(0, limit - totalQuestionSets);
    const percentage = limit ? Math.round((totalQuestionSets / limit) * 100) : 0;

    // Show warning if near limit (80% or more)
    const isNearLimit = percentage >= 80;
    const isLimited = limit > 0; // Has a limit (not unlimited)

    return {
      totalQuestionSets,
      limit,
      remaining,
      percentage,
      isLimited,
      isNearLimit,
      isLoading: false,
    };
  }, [subscriptionData, isLoading]);
}
