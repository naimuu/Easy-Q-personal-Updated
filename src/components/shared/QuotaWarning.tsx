"use client";

import { useQuota } from "@/hooks/use-quota";
import { AlertCircle } from "lucide-react";

/**
 * Displays quota warning when user is near their limit
 */
export default function QuotaWarning() {
  const { remaining, limit, percentage, isLimited, isNearLimit, isLoading } =
    useQuota();

  if (isLoading || !isLimited || !isNearLimit) {
    return null;
  }

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-300 p-4 mb-4 flex items-center gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold text-amber-900">Quota Warning</h3>
        <p className="text-sm text-amber-800">
          You have created <strong>{10 - remaining}</strong> out of{" "}
          <strong>{limit}</strong> question sets ({percentage}% used).{" "}
          {remaining > 0
            ? `Only ${remaining} remaining.`
            : "You've reached your limit."}
        </p>
      </div>
      {remaining === 0 && (
        <a
          href="/user/subscriptions"
          className="text-sm font-semibold text-amber-600 hover:text-amber-700 whitespace-nowrap ml-2"
        >
          Upgrade
        </a>
      )}
    </div>
  );
}
