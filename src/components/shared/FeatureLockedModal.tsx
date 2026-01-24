"use client";

import React from "react";
import ModalLayout from "@/components/Layouts/ModalLayout";
import Button from "@/components/shared/Button";
import { Package } from "@/types/package";
import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";

interface FeatureLockedModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
  featureKey: string;
  currentPackage: Package | null;
  suggestedUpgradePackage?: Package | null;
}

/**
 * Generic modal shown when user tries to use a locked feature
 * Explains which package has the feature and provides upgrade link
 */
export default function FeatureLockedModal({
  isOpen,
  onClose,
  featureName,
  featureKey,
  currentPackage,
  suggestedUpgradePackage,
}: FeatureLockedModalProps) {
  return (
    <ModalLayout
      isOpen={isOpen}
      onChange={onClose}
      title="Feature Locked"
      description={`${featureName} is not available in your current plan`}
      modalSize="sm"
    >
      <div className="space-y-4 px-4 py-5">
        {/* Icon & Message */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Lock className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">
              {featureName} Locked
            </h3>
            <p className="mt-1 text-xs text-gray-600">
              Upgrade to unlock this feature
            </p>
          </div>
        </div>

        {/* Upgrade Suggestion - Compact */}
        {suggestedUpgradePackage ? (
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-900">
                  {suggestedUpgradePackage.displayName}
                </p>
                <p className="text-xs text-gray-600">
                  {suggestedUpgradePackage.duration === "lifetime"
                    ? "One-time"
                    : suggestedUpgradePackage.duration}
                </p>
              </div>
              {suggestedUpgradePackage.price > 0 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-900">
                    {suggestedUpgradePackage.offerPrice || suggestedUpgradePackage.price} {suggestedUpgradePackage.currency}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Action Buttons - Compact */}
        <div className="flex gap-2">
          <Link href="/user/subscriptions" className="flex-1">
            <Button className="w-full bg-primary text-white text-sm py-2">
              <span className="flex items-center justify-center gap-1">
                Upgrade
                <ArrowRight className="h-3 w-3" />
              </span>
            </Button>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-200 px-3 py-2 text-xs font-medium text-gray-900 hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </ModalLayout>
  );
}
