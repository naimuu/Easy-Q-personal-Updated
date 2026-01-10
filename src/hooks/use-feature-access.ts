import { useGetActiveSubscriptionQuery } from "@/redux/services/userServices/purchaseSubscriptionService";
import { Package, PackageFeatures } from "@/types/package";
import { useMemo } from "react";

interface UseFeatureAccessReturn {
  hasFeature: (featureKey: string) => boolean;
  getFeatures: () => PackageFeatures;
  isLoading: boolean;
  error: string | null;
  package: Package | null;
  isFree: boolean;
  isActive: boolean;
  questionLimit?: number;
}

/**
 * Hook to check feature access based on user's subscription
 * Usage: const { hasFeature, package } = useFeatureAccess()
 *        if (!hasFeature('dragAndDrop')) showModal()
 */
export function useFeatureAccess(): UseFeatureAccessReturn {
  const { data: subscriptionData, isLoading, error } = useGetActiveSubscriptionQuery();

  // console.log("Subscription Data in useFeatureAccess:", subscriptionData);

  return useMemo(() => {
    if (isLoading) {
      return {
        hasFeature: () => false,
        getFeatures: () => ({}),
        isLoading: true,
        error: null,
        package: null,
        isFree: false,
        isActive: false,
        questionLimit: undefined,
      };
    }

    if (error || !subscriptionData) {
      return {
        hasFeature: () => false,
        getFeatures: () => ({}),
        isLoading: false,
        error: "Failed to load subscription data",
        package: null,
        isFree: false,
        isActive: false,
        questionLimit: undefined,
      };
    }

    const pkg = subscriptionData.package;
    const features = (subscriptionData.features || {}) as PackageFeatures;
    const isFree = subscriptionData.isFree ?? true;
    const isActive = subscriptionData.isActive ?? false;

    return {
      hasFeature: (featureKey: string) => {
        return features[featureKey] === true;
      },
      getFeatures: () => features,
      isLoading: false,
      error: null,
      package: pkg || null,
      isFree,
      isActive,
      questionLimit: pkg?.numberOfQuestions,
    };
  }, [subscriptionData, isLoading, error]);
}
