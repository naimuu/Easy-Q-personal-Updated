"use client";

import { useGetUserQuery } from "@/redux/services/authApi";
import {
  useCreateSubscriptionMutation,
  useGetActiveSubscriptionQuery,
} from "@/redux/services/userServices/purchaseSubscriptionService";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import Button from "./Button";
import PurchaseModal from "./PurchaseModal";

interface PurchaseButtonProps {
  packageId: string;
  packageName: string;
  packagePrice?: number;
  disabled?: boolean;
}

export default function PurchaseButton({
  packageId,
  packageName,
  packagePrice = 0,
  disabled = false,
}: PurchaseButtonProps) {
  const router = useRouter();
  const { data: userResponse } = useGetUserQuery();
  const { data: subscriptionData } = useGetActiveSubscriptionQuery();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();

  const user = userResponse?.result;
  const isLoggedIn = !!user;
  const isFreePackage = packagePrice === 0;

  // Check if user has active subscription
  const hasActiveSubscription =
    subscriptionData?.subscription?.isActive && !subscriptionData?.isFree;
  const currentPackageName = subscriptionData?.package?.displayName;
  const currentPackageId = subscriptionData?.package?.id;
  const isCurrentPackage = currentPackageId === packageId;

  const handlePurchaseClick = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }

    // If user is trying to purchase the same package they already have
    // if (isCurrentPackage && hasActiveSubscription) {
    //   toast.info("আপনি ইতিমধ্যে এই প্যাকেজটি ব্যবহার করছেন!");
    //   return;
    // }

    // If user has active subscription and trying to get a different package
    if (hasActiveSubscription) {
      setShowConfirmModal(true);
      return;
    }

    // Proceed with purchase
    await proceedWithPurchase();
  };

  const proceedWithPurchase = async () => {
    setShowConfirmModal(false);

    if (isFreePackage) {
      try {
        await createSubscription({
          packageId,
          isFreePackage: true,
          replaceExisting: true,
        }).unwrap();

        toast.success("বিনামূল্যে প্যাকেজ সক্রিয় করা হয়েছে!");
        router.push("/user");
      } catch (error: any) {
        const errorMessage =
          error?.data?.message || "Failed to activate free package";
        toast.error(errorMessage);
      }
      return;
    }

    setShowModal(true);
  };

  // Confirmation Modal for switching packages
  const ConfirmSwitchModal = () => {
    if (!showConfirmModal) return null;

    return createPortal(
      <>
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setShowConfirmModal(false)}
        />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="animate-in fade-in zoom-in w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-6 text-center">
              <div className="mb-4 text-5xl">⚠️</div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                প্যাকেজ পরিবর্তন নিশ্চিত করুন
              </h2>
            </div>

            <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="mb-2 text-sm text-yellow-800">
                <strong>বর্তমান প্যাকেজ:</strong> {currentPackageName}
              </p>
              <p className="mb-3 text-sm text-yellow-800">
                <strong>নতুন প্যাকেজ:</strong> {packageName}
              </p>
              <p className="text-xs text-yellow-700">
                {isFreePackage
                  ? "⚠️ বিনামূল্যে প্যাকেজ নেওয়ার পর আপনার বর্তমান সাবস্ক্রিপশন বাতিল হয়ে যাবে।"
                  : isCurrentPackage
                    ? "✅ একই প্যাকেজ আবার কিনলে আপনার প্রশ্ন সীমা বাড়বে।"
                    : "✅ নতুন প্যাকেজ কেনার পর অ্যাডমিন অনুমোদন না দেওয়া পর্যন্ত আপনার বর্তমান সাবস্ক্রিপশন সক্রিয় থাকবে। অনুমোদনের পর নতুন প্যাকেজ সক্রিয় হবে এবং বর্তমানটি বাতিল হবে।"}
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-800 transition-all hover:bg-gray-400"
              >
                বাতিল করুন
              </Button>
              <Button
                onClick={proceedWithPurchase}
                disabled={isLoading}
                className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700"
              >
                {isLoading ? "প্রক্রিয়া করছে..." : "নিশ্চিত করুন"}
              </Button>
            </div>
          </div>
        </div>
      </>,
      document.body,
    );
  };

  return (
    <>
      <Button
        onClick={handlePurchaseClick}
        disabled={disabled || isLoading}
        className={`transform rounded-lg px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 ${
          isCurrentPackage && hasActiveSubscription
            ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
        }`}
      >
        {isLoading
          ? "প্রক্রিয়া করছে..."
          : isCurrentPackage && hasActiveSubscription
            ? "🔄 প্রশ্ন সীমা বাড়ান"
            : isFreePackage
              ? "বিনামূল্যে নিন"
              : "এখনই কিনুন"}
      </Button>

      {/* Confirmation Modal for switching packages */}
      <ConfirmSwitchModal />

      {/* Purchase Modal - only for paid packages */}
      {showModal && isLoggedIn && !isFreePackage && (
        <PurchaseModal
          packageId={packageId}
          packageName={packageName}
          onClose={() => setShowModal(false)}
          user={user}
          replaceExisting={hasActiveSubscription}
        />
      )}
    </>
  );
}
