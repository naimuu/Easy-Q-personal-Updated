"use client";

import React from "react";
import { Lock } from "lucide-react";

interface FeatureLockBadgeProps {
  show: boolean;
  featureName?: string;
  className?: string;
}

/**
 * Small badge/icon shown on locked buttons or features
 * Usage: <FeatureLockBadge show={!hasFeature} featureName="Drag and Drop" />
 */
export default function FeatureLockBadge({
  show,
  featureName,
  className = "",
}: FeatureLockBadgeProps) {
  if (!show) return null;

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-700 ${className}`}
      title={featureName ? `${featureName} - upgrade required` : "Feature locked - upgrade required"}
    >
      <Lock className="h-3 w-3" />
      <span>Locked</span>
    </div>
  );
}
