"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface SubscriptionUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal shown when user tries to add questions but doesn't have the feature
 */
export default function SubscriptionUpgradeModal({
  isOpen,
  onClose,
}: SubscriptionUpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">📝</div>
            <h2 className="text-xl font-bold text-white">আরও প্রশ্ন যোগ করুন</h2>
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
          {/* Message */}
          <div className="text-gray-700 space-y-3">
            <p className="font-semibold text-lg">
              প্রিমিয়াম সাবস্ক্রিপশন প্রয়োজন
            </p>
            <p className="text-gray-600">
              আপনার বর্তমান পরিকল্পনায় প্রশ্ন যোগ করার বৈশিষ্ট্য অন্তর্ভুক্ত নেই।
            </p>
            <p className="text-sm text-gray-500">
              আপগ্রেড করুন এবং পান:
            </p>
            <ul className="text-sm text-gray-600 space-y-2 ml-4">
              <li>✅ সীমাহীন প্রশ্ন যোগ করুন</li>
              <li>✅ উন্নত সম্পাদনা সরঞ্জাম</li>
              <li>✅ ড্র্যাগ এন্ড ড্রপ কার্যকারিতা</li>
              <li>✅ PDF এবং DOCX এক্সপোর্ট</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            পরে
          </button>
          <button
            onClick={() => {
              router.push("/pricing");
              onClose();
            }}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg whitespace-nowrap"
          >
            🚀 সাবস্ক্রাইব করুন
          </button>
        </div>
      </div>
    </div>
  );
}
