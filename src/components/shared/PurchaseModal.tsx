"use client";

import { useCreateSubscriptionMutation } from "@/redux/services/userServices/purchaseSubscriptionService";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import Button from "./Button";
import Input from "./Input";

interface PurchaseModalProps {
  packageId: string;
  packageName: string;
  onClose: () => void;
  user: any;
  replaceExisting?: boolean;
}

export default function PurchaseModal({
  packageId,
  packageName,
  onClose,
  user,
  replaceExisting = false,
}: PurchaseModalProps) {
  const [mounted, setMounted] = useState(false);
  const [createSubscription, { isLoading }] = useCreateSubscriptionMutation();
  const [formData, setFormData] = useState({
    phoneNumber: "",
    transactionId: "",
    paymentMethod: "bkash",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const BKASH_NUMBER = "01870186441";
  const BKASH_ICON = "📱";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.phoneNumber.trim()) {
      toast.error("Phone number is required");
      return;
    }

    if (!formData.transactionId.trim()) {
      toast.error("Transaction ID is required");
      return;
    }

    if (!/^[0-9]{10,15}$/.test(formData.phoneNumber)) {
      toast.error("Phone number must be between 10-15 digits");
      return;
    }

    try {
      await createSubscription({
        packageId,
        phoneNumber: formData.phoneNumber,
        transactionId: formData.transactionId,
        paymentMethod: formData.paymentMethod,
        replaceExisting,
      }).unwrap();

      toast.success(
        "Payment initiated successfully. Waiting for admin verification.",
      );
      onClose();
    } catch (error: any) {
      const errorMessage =
        error?.data?.message || "Failed to create subscription";
      toast.error(errorMessage);
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="animate-in fade-in zoom-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-8 shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h2 className="mb-2 text-2xl font-bold text-gray-800">
              {packageName} প্যাকেজ কিনুন
            </h2>
            <p className="text-sm text-gray-600">
              আপনার নাম: <span className="font-semibold">{user?.name}</span>
            </p>
            <p className="text-sm text-gray-600">
              ইমেইল: <span className="font-semibold">{user?.email}</span>
            </p>
          </div>

          {/* Payment Method Section */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{BKASH_ICON}</span>
              <div>
                <p className="font-semibold text-gray-800">bKash পেমেন্ট</p>
                <p className="text-sm text-gray-600">
                  নিরাপদ এবং দ্রুত পেমেন্ট
                </p>
              </div>
            </div>

            {/* bKash Number */}
            <div className="mb-3 rounded border-2 border-blue-300 bg-white p-3">
              <p className="mb-1 text-xs text-gray-600">bKash নম্বর:</p>
              <div className="flex items-center justify-between">
                <p className="text-lg font-bold text-gray-800">
                  {BKASH_NUMBER}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(BKASH_NUMBER);
                    toast.info("Copied to clipboard!");
                  }}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-800"
                >
                  কপি করুন
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              ⚠️ উপরের নম্বরে bKash এর মাধ্যমে টাকা পাঠান এবং নীচে Transaction
              ID এবং আপনার নম্বর লিখুন।
            </p>
          </div>

          {/* Form Fields */}
          <div className="mb-6 space-y-4">
            {/* Phone Number */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                আপনার ফোন নম্বর *
              </label>
              <Input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="01xxxxxxxxx"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                যে নম্বর দিয়ে bKash এ টাকা পাঠিয়েছেন সেই নম্বর লিখুন
              </p>
            </div>

            {/* Transaction ID */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Transaction ID *
              </label>
              <Input
                type="text"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleInputChange}
                placeholder="e.g., ABC123XYZ789"
                disabled={isLoading}
              />
              <p className="mt-1 text-xs text-gray-500">
                bKash থেকে পাওয়া Transaction ID / Receipt Number
              </p>
            </div>
          </div>

          {/* Payment Info */}
          <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <p className="text-xs text-yellow-800">
              ℹ️ আপনার পেমেন্ট প্রক্রিয়া করা হবে এবং admin verification এর জন্য
              অপেক্ষা করতে হবে। Verification এর পর আপনার সাবস্ক্রিপশন active
              হবে।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gray-300 px-4 py-2 font-semibold text-gray-800 transition-all hover:bg-gray-400"
            >
              বাতিল করুন
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700"
            >
              {isLoading ? "প্রক্রিয়া করছে..." : "পেমেন্ট কনফার্ম করুন"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
