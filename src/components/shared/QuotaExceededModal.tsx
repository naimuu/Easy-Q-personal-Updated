"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface QuotaExceededModalProps {
  isOpen: boolean;
  onClose: () => void;
  current: number;
  limit: number;
}

/**
 * Modal shown when user tries to create question set but has reached quota
 */
export default function QuotaExceededModal({
  isOpen,
  onClose,
  current,
  limit,
}: QuotaExceededModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const remaining = limit - current;
  const percentage = Math.round((current / limit) * 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 px-6 py-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📊</div>
            <h2 className="text-xl font-bold text-white">Quota Reached</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Stats */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Question Sets Created:</span>
              <span className="text-2xl font-bold text-gray-900">{current}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium">Your Limit:</span>
              <span className="text-2xl font-bold text-orange-600">{limit}</span>
            </div>
            {/* Progress Bar */}
            <div className="pt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1 text-right">{percentage}% used</p>
            </div>
          </div>

          {/* Message */}
          <div className="text-gray-700 space-y-2">
            <p className="font-medium">
              You&apos;ve reached your question set limit in your current plan.
            </p>
            <p className="text-sm text-gray-600">
              Upgrade to a higher plan to create more question sets and unlock premium features like:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>✨ Create more question sets ({limit}+ sets)</li>
              <li>🎨 Advanced customization</li>
              <li>📤 Export to multiple formats</li>
              <li>☁️ Cloud synchronization</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              router.push("/pricing");
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg"
          >
            🚀 Upgrade Plan
          </button>
        </div>
      </div>
    </div>
  );
}
