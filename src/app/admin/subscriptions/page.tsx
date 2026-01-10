"use client";

import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import { useVerifyPaymentMutation } from "@/redux/services/adminServices/paymentService";
import {
  SubscriptionFilter,
  useDeleteSubscriptionMutation,
  useGetAdminSubscriptionsQuery,
  useVerifySubscriptionMutation,
} from "@/redux/services/adminServices/subscriptionService";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";

interface VerifyModalData {
  subscriptionId: string;
  subscription: any;
  payment: any;
}

export default function AdminSubscriptionsPage() {
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isActive, setIsActive] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  // Sorting State
  const [sortBy, setSortBy] = useState<"createdAt" | "endDate" | "startDate">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyModalData, setVerifyModalData] =
    useState<VerifyModalData | null>(null);
  const [verifyNotes, setVerifyNotes] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [togglingSubscription, setTogglingSubscription] = useState<
    string | null
  >(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // API Hooks
  const filters: SubscriptionFilter = useMemo(
    () => ({
      page,
      limit,
      isActive: isActive ? isActive === "true" : undefined,
      paymentStatus: paymentStatus || undefined,
      paymentMethod: paymentMethod || undefined,
      search: searchQuery || undefined,
      sortBy,
      sortOrder,
    }),
    [
      page,
      limit,
      isActive,
      paymentStatus,
      paymentMethod,
      searchQuery,
      sortBy,
      sortOrder,
    ],
  );

  const { data: subscriptionData, isLoading } =
    useGetAdminSubscriptionsQuery(filters);
  const [verifySubscription] = useVerifySubscriptionMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [deleteSubscription] = useDeleteSubscriptionMutation();

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteModalData, setDeleteModalData] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Derived data
  const subscriptions = subscriptionData?.data || [];
  const pagination = subscriptionData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  };

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1);
  }, []);

  const handleActiveFilterChange = useCallback((value: string) => {
    setIsActive(value);
    setPage(1);
  }, []);

  const handlePaymentStatusFilterChange = useCallback((value: string) => {
    setPaymentStatus(value);
    setPage(1);
  }, []);

  const handlePaymentMethodFilterChange = useCallback((value: string) => {
    setPaymentMethod(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (field: "createdAt" | "endDate" | "startDate") => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    },
    [sortBy, sortOrder],
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number | undefined, currency: string = "BDT") => {
    return price !== undefined
      ? `${currency} ${price.toLocaleString()}`
      : "N/A";
  };

  const getPaymentStatusBadge = (status: string, paymentMethod?: string) => {
    // Check if it's a free package
    if (paymentMethod === "free") {
      return (
        <span className="inline-block rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200 sm:px-3 sm:text-sm">
          বিনামূল্যে
        </span>
      );
    }

    const statusMap: {
      [key: string]: { bg: string; text: string; label: string };
    } = {
      pending: {
        bg: "bg-yellow-100 dark:bg-yellow-900/30",
        text: "text-yellow-800 dark:text-yellow-200",
        label: "অপেক্ষমাণ",
      },
      completed: {
        bg: "bg-green-100 dark:bg-green-900/30",
        text: "text-green-800 dark:text-green-200",
        label: "সম্পন্ন",
      },
      failed: {
        bg: "bg-red-100 dark:bg-red-900/30",
        text: "text-red-800 dark:text-red-200",
        label: "ব্যর্থ",
      },
      refunded: {
        bg: "bg-gray-100 dark:bg-gray-900/30",
        text: "text-gray-800 dark:text-gray-200",
        label: "রিফান্ড করা",
      },
    };

    const style = statusMap[status] || statusMap.pending;
    return (
      <span
        className={`inline-block rounded-full px-2 py-1 text-xs font-semibold sm:px-3 sm:text-sm ${style.bg} ${style.text}`}
      >
        {style.label}
      </span>
    );
  };

  const getSubscriptionStatusBadge = (
    isActive: boolean,
    paymentStatus: string,
    paymentMethod?: string,
  ) => {
    // Check if it's a free package
    const isFree = paymentMethod === "free";

    if (paymentStatus !== "completed" && !isFree) {
      return (
        <span className="inline-block rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 sm:px-3 sm:text-sm">
          অপেক্ষমাণ
        </span>
      );
    }
    if (isActive) {
      if (isFree) {
        return (
          <span className="inline-block rounded-full bg-cyan-100 px-2 py-1 text-xs font-semibold text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-200 sm:px-3 sm:text-sm">
            সক্রিয় (ফ্রি)
          </span>
        );
      }
      return (
        <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-200 sm:px-3 sm:text-sm">
          সক্রিয়
        </span>
      );
    }
    return (
      <span className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-900/30 dark:text-gray-200 sm:px-3 sm:text-sm">
        নিষ্ক্রিয়
      </span>
    );
  };

  const handleVerifyClick = (subscription: any) => {
    setVerifyModalData({
      subscriptionId: subscription.id,
      subscription,
      payment: subscription.payment,
    });
    setVerifyNotes("");
    setShowVerifyModal(true);
  };

  const handleToggleSubscriptionStatus = async (subscription: any) => {
    const newStatus = !subscription.isActive;
    setTogglingSubscription(subscription.id);

    try {
      await verifySubscription({
        subscriptionId: subscription.id,
        data: { isActive: newStatus },
      }).unwrap();

      toast.success(
        newStatus
          ? "সাবস্ক্রিপশন সক্রিয় করা হয়েছে!"
          : "সাবস্ক্রিপশন নিষ্ক্রিয় করা হয়েছে!",
      );
    } catch (error: any) {
      const errorMsg = error?.data?.message || "অপারেশন ব্যর্থ হয়েছে";
      toast.error(errorMsg);
    } finally {
      setTogglingSubscription(null);
    }
  };

  const handleVerifySubmit = async () => {
    if (!verifyModalData) return;

    const payment = verifyModalData.payment;

    // If payment is not completed, verify payment first
    if (payment.paymentStatus !== "completed") {
      setIsVerifying(true);
      try {
        // Verify the payment first
        await verifyPayment({
          paymentId: payment.id,
          data: {
            paymentStatus: "completed",
            notes: verifyNotes,
          },
        }).unwrap();

        toast.success("পেমেন্ট যাচাই করা হয়েছে!");

        // Then verify the subscription
        await verifySubscription({
          subscriptionId: verifyModalData.subscriptionId,
          data: { isActive: true },
        }).unwrap();

        toast.success("সাবস্ক্রিপশন সক্রিয় করা হয়েছে!");
        setShowVerifyModal(false);
      } catch (error: any) {
        const errorMsg = error?.data?.message || "যাচাইকরণ ব্যর্থ হয়েছে";
        toast.error(errorMsg);
      } finally {
        setIsVerifying(false);
      }
    } else {
      // Payment already completed, just activate subscription
      setIsVerifying(true);
      try {
        await verifySubscription({
          subscriptionId: verifyModalData.subscriptionId,
          data: { isActive: true },
        }).unwrap();

        toast.success("সাবস্ক্রিপশন সক্রিয় করা হয়েছে!");
        setShowVerifyModal(false);
      } catch (error: any) {
        const errorMsg = error?.data?.message || "যাচাইকরণ ব্যর্থ হয়েছে";
        toast.error(errorMsg);
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const getSortIcon = (field: "createdAt" | "endDate" | "startDate") => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  const handleDeleteClick = (subscription: any) => {
    setDeleteModalData(subscription);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalData) return;

    setIsDeleting(true);
    try {
      await deleteSubscription(deleteModalData.id).unwrap();
      toast.success("সাবস্ক্রিপশন সফলভাবে মুছে ফেলা হয়েছে!");
      setShowDeleteModal(false);
      setDeleteModalData(null);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "মুছে ফেলতে ব্যর্থ হয়েছে";
      toast.error(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-2 py-4 dark:bg-gray-900 sm:px-4 sm:py-6 lg:px-6 lg:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl lg:text-4xl">
            📋 সাবস্ক্রিপশন ব্যবস্থাপনা
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 sm:text-base">
            সকল সাবস্ক্রিপশন দেখুন এবং পরিচালনা করুন
          </p>
        </div>

        {/* Filters & Search Section */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:mb-8 sm:p-6">
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                অনুসন্ধান
              </label>
              <input
                type="text"
                placeholder="নাম, ইমেইল বা ফোন..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:text-sm"
              />
            </div>

            {/* Subscription Status Filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                স্ট্যাটাস
              </label>
              <select
                value={isActive}
                onChange={(e) => handleActiveFilterChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">সব স্ট্যাটাস</option>
                <option value="true">সক্রিয়</option>
                <option value="false">নিষ্ক্রিয়</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                পেমেন্ট স্ট্যাটাস
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  handlePaymentStatusFilterChange(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">সব পেমেন্ট</option>
                <option value="pending">অপেক্ষমাণ</option>
                <option value="completed">সম্পন্ন</option>
                <option value="failed">ব্যর্থ</option>
                <option value="refunded">রিফান্ড করা</option>
              </select>
            </div>

            {/* Payment Method Filter (Free/Paid) */}
            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                প্যাকেজ ধরন
              </label>
              <select
                value={paymentMethod}
                onChange={(e) =>
                  handlePaymentMethodFilterChange(e.target.value)
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value="">সব প্যাকেজ</option>
                <option value="free">বিনামূল্যে</option>
                <option value="bkash">পেইড (bKash)</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
            মোট:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {pagination.total}
            </span>{" "}
            | পৃষ্ঠা{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {page} / {pagination.pages}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex min-h-screen items-center justify-center">
            <Loader />
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow dark:bg-gray-800 sm:p-8">
            <p className="text-gray-500 dark:text-gray-400">
              কোনো সাবস্ক্রিপশন পাওয়া যায়নি
            </p>
          </div>
        ) : (
          <>
            {/* Desktop & Tablet Table View (hidden on mobile) */}
            <div className="hidden overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800 md:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  {/* Table Header */}
                  <thead className="border-b border-gray-200 bg-gray-100 dark:border-gray-600 dark:bg-gray-700">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        ব্যবহারকারী
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        প্যাকেজ
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        পেমেন্ট স্থিতি
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        সাবস্ক্রিপশন স্থিতি
                      </th>
                      <th
                        onClick={() => handleSortChange("startDate")}
                        className="cursor-pointer px-3 py-3 text-left text-xs font-semibold text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600 lg:px-6 lg:text-sm"
                      >
                        শুরু {getSortIcon("startDate")}
                      </th>
                      <th
                        onClick={() => handleSortChange("endDate")}
                        className="cursor-pointer px-3 py-3 text-left text-xs font-semibold text-gray-900 hover:bg-gray-200 dark:text-white dark:hover:bg-gray-600 lg:px-6 lg:text-sm"
                      >
                        শেষ {getSortIcon("endDate")}
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        মূল্য
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white lg:px-6 lg:text-sm">
                        অ্যাকশন
                      </th>
                    </tr>
                  </thead>

                  {/* Table Body */}
                  <tbody>
                    {subscriptions.map((subscription: any) => (
                      <tr
                        key={subscription.id}
                        className="border-b border-gray-200 transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700/50"
                      >
                        <td className="px-3 py-4 lg:px-6">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">
                              {subscription.user?.name}
                            </p>
                            <div className="max-w-[150px] text-xs text-gray-500 dark:text-gray-400 lg:text-sm">
                              {subscription.user?.email && (
                                <div className="truncate">
                                  {subscription.user.email}
                                </div>
                              )}
                              {subscription.user?.phone && (
                                <div className="truncate">
                                  {subscription.user.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-4 lg:px-6">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">
                              {subscription.package?.displayName}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 lg:text-sm">
                              {subscription.package?.numberOfQuestions} সেট
                            </p>
                          </div>
                        </td>

                        <td className="px-3 py-4 lg:px-6">
                          {getPaymentStatusBadge(
                            subscription.payment?.paymentStatus,
                            subscription.payment?.paymentMethod,
                          )}
                        </td>

                        <td className="px-3 py-4 lg:px-6">
                          <button
                            onClick={() =>
                              handleToggleSubscriptionStatus(subscription)
                            }
                            disabled={togglingSubscription === subscription.id}
                            className="inline-flex cursor-pointer items-center gap-2 transition hover:opacity-80 disabled:opacity-50"
                            title="সাবস্ক্রিপশন স্থিতি পরিবর্তন করতে ক্লিক করুন"
                          >
                            {togglingSubscription === subscription.id ? (
                              <>
                                <svg
                                  className="h-4 w-4 animate-spin"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                <span className="text-xs">লোড হচ্ছে...</span>
                              </>
                            ) : (
                              getSubscriptionStatusBadge(
                                subscription.isActive,
                                subscription.payment?.paymentStatus,
                                subscription.payment?.paymentMethod,
                              )
                            )}
                          </button>
                        </td>

                        <td className="px-3 py-4 text-xs lg:px-6 lg:text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(subscription.startDate)}
                          </p>
                        </td>

                        <td className="px-3 py-4 text-xs lg:px-6 lg:text-sm">
                          <p className="text-gray-900 dark:text-white">
                            {formatDate(subscription.endDate)}
                          </p>
                        </td>

                        <td className="px-3 py-4 lg:px-6">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">
                              {formatPrice(
                                subscription.payment?.finalPrice,
                                subscription.package?.currency,
                              )}
                            </p>
                            {subscription.payment?.discount !== 0 && (
                              <p className="text-xs text-green-600 dark:text-green-400 lg:text-sm">
                                ছাড়:{" "}
                                {formatPrice(
                                  Math.abs(subscription.payment?.discount || 0),
                                  subscription.package?.currency,
                                )}
                              </p>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-4 lg:px-6">
                          <div className="flex items-center gap-2">
                            {!subscription.isActive ||
                            subscription.payment?.paymentStatus !==
                              "completed" ? (
                              <Button
                                onClick={() => handleVerifyClick(subscription)}
                                className="whitespace-nowrap rounded bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 lg:px-4 lg:py-2 lg:text-sm"
                              >
                                যাচাই করুন
                              </Button>
                            ) : (
                              <span className="text-xs text-gray-500 dark:text-gray-400 lg:text-sm">
                                সম্পন্ন
                              </span>
                            )}
                            <button
                              onClick={() => handleDeleteClick(subscription)}
                              className="rounded px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 lg:px-4 lg:py-2 lg:text-sm"
                              title="সাবস্ক্রিপশন মুছে ফেলুন"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View (visible only on mobile) */}
            <div className="space-y-4 md:hidden">
              {subscriptions.map((subscription: any) => (
                <div
                  key={subscription.id}
                  className="space-y-3 rounded-lg bg-white p-4 shadow dark:bg-gray-800"
                >
                  {/* User Info */}
                  <div className="border-b border-gray-200 pb-3 dark:border-gray-700">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">
                      {subscription.user?.name}
                    </p>
                    <p className="break-all text-sm text-gray-500 dark:text-gray-400">
                      {subscription.user?.email}
                    </p>
                  </div>

                  {/* Package Info */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      প্যাকেজ:
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {subscription.package?.displayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {subscription.package?.numberOfQuestions} সেট
                      </p>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      পেমেন্ট স্থিতি:
                    </span>
                    {getPaymentStatusBadge(
                      subscription.payment?.paymentStatus,
                      subscription.payment?.paymentMethod,
                    )}
                  </div>

                  {/* Subscription Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      সাবস্ক্রিপশন স্থিতি:
                    </span>
                    <button
                      onClick={() =>
                        handleToggleSubscriptionStatus(subscription)
                      }
                      disabled={togglingSubscription === subscription.id}
                      className="inline-flex cursor-pointer items-center gap-2 transition hover:opacity-80 disabled:opacity-50"
                      title="সাবস্ক্রিপশন স্থিতি পরিবর্তন করতে ক্লিক করুন"
                    >
                      {togglingSubscription === subscription.id ? (
                        <>
                          <svg
                            className="h-4 w-4 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          <span className="text-xs">লোড হচ্ছে...</span>
                        </>
                      ) : (
                        getSubscriptionStatusBadge(
                          subscription.isActive,
                          subscription.payment?.paymentStatus,
                          subscription.payment?.paymentMethod,
                        )
                      )}
                    </button>
                  </div>

                  {/* Dates */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      সময়কাল:
                    </span>
                    <div className="text-right text-xs">
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(subscription.startDate)}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {formatDate(subscription.endDate)}
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-start justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      মূল্য:
                    </span>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(
                          subscription.payment?.finalPrice,
                          subscription.package?.currency,
                        )}
                      </p>
                      {subscription.payment?.discount !== 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">
                          ছাড়:{" "}
                          {formatPrice(
                            Math.abs(subscription.payment?.discount || 0),
                            subscription.package?.currency,
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex gap-2 pt-2">
                    {!subscription.isActive ||
                    subscription.payment?.paymentStatus !== "completed" ? (
                      <Button
                        onClick={() => handleVerifyClick(subscription)}
                        className="flex-1 rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
                      >
                        যাচাই করুন
                      </Button>
                    ) : (
                      <div className="flex-1 py-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        সম্পন্ন
                      </div>
                    )}
                    <button
                      onClick={() => handleDeleteClick(subscription)}
                      className="rounded px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
                      title="সাবস্ক্রিপশন মুছে ফেলুন"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:mt-8 sm:flex-row">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600 dark:text-gray-400 sm:text-sm">
                প্রতি পৃষ্ঠায়:
              </label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white sm:text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="rounded bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-400 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                পূর্ববর্তী
              </Button>

              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(5, pagination.pages) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`rounded px-2 py-2 text-xs font-semibold transition sm:px-3 sm:text-sm ${
                          page === pageNum
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  },
                )}
              </div>

              <Button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="rounded bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-800 transition hover:bg-gray-400 disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                পরবর্তী
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Verify Modal */}
      {showVerifyModal && verifyModalData && mounted
        ? createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={() => setShowVerifyModal(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="animate-in fade-in zoom-in max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-4 shadow-2xl dark:bg-gray-800 sm:p-6 lg:p-8">
                  <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white sm:mb-6 sm:text-2xl">
                    যাচাইকরণ
                  </h2>

                  {/* Subscription Info */}
                  <div className="mb-4 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-gray-700 sm:mb-6 sm:p-6">
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ব্যবহারকারী:
                      </span>
                      <span className="break-all text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        {verifyModalData.subscription.user?.name}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        প্যাকেজ:
                      </span>
                      <span className="text-right text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        {verifyModalData.subscription.package?.displayName}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        মূল্য:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white sm:text-base">
                        {formatPrice(
                          verifyModalData.payment?.finalPrice,
                          verifyModalData.subscription.package?.currency,
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-900/30 sm:mb-6 sm:p-6">
                    <h3 className="mb-3 text-base font-bold text-gray-900 dark:text-white sm:mb-4 sm:text-lg">
                      পেমেন্ট বিবরণ
                    </h3>
                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                        <span className="text-gray-600 dark:text-gray-400">
                          পেমেন্ট পদ্ধতি:
                        </span>
                        <span className="font-semibold capitalize text-gray-900 dark:text-white">
                          {verifyModalData.payment?.paymentMethod}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                        <span className="text-gray-600 dark:text-gray-400">
                          লেনদেন আইডি:
                        </span>
                        <span className="break-all font-mono text-gray-900 dark:text-white">
                          {verifyModalData.payment?.transactionId}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-0">
                        <span className="text-gray-600 dark:text-gray-400">
                          ফোন নম্বর:
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {verifyModalData.payment?.phoneNumber}
                        </span>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-0">
                        <span className="text-gray-600 dark:text-gray-400">
                          পেমেন্ট স্থিতি:
                        </span>
                        <span>
                          {getPaymentStatusBadge(
                            verifyModalData.payment?.paymentStatus,
                            verifyModalData.payment?.paymentMethod,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Not Completed Warning */}
                  {verifyModalData.payment?.paymentStatus !== "completed" && (
                    <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-700 dark:bg-yellow-900/30 sm:mb-6 sm:p-4">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200 sm:text-sm">
                        ⚠️ পেমেন্ট এখনও সম্পন্ন হয়নি। যাচাই করলে পেমেন্ট
                        সম্পন্ন করা হবে এবং সাবস্ক্রিপশন সক্রিয় হবে।
                      </p>
                    </div>
                  )}

                  {/* Notes Field */}
                  <div className="mb-4 sm:mb-6">
                    <label className="mb-2 block text-xs font-semibold text-gray-700 dark:text-gray-300 sm:text-sm">
                      যাচাইয়ের নোট (ঐচ্ছিক)
                    </label>
                    <textarea
                      value={verifyNotes}
                      onChange={(e) => setVerifyNotes(e.target.value)}
                      placeholder="এই যাচাইকরণের জন্য কোনো নোট যোগ করুন..."
                      disabled={isVerifying}
                      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 sm:px-4"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      onClick={() => setShowVerifyModal(false)}
                      disabled={isVerifying}
                      className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-400 disabled:opacity-50 sm:text-base"
                    >
                      বাতিল করুন
                    </Button>
                    <Button
                      onClick={handleVerifySubmit}
                      disabled={isVerifying}
                      className="flex-1 rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50 sm:text-base"
                    >
                      {isVerifying ? "যাচাই করছে..." : "যাচাই করুন ✓"}
                    </Button>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deleteModalData && mounted
        ? createPortal(
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50"
                onClick={() => !isDeleting && setShowDeleteModal(false)}
              />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
                <div className="animate-in fade-in zoom-in w-full max-w-md rounded-lg bg-white p-4 shadow-2xl dark:bg-gray-800 sm:p-6">
                  <div className="mb-4 text-center">
                    <div className="mb-3 text-5xl">🗑️</div>
                    <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
                      সাবস্ক্রিপশন মুছে ফেলবেন?
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      এই সাবস্ক্রিপশন এবং সংশ্লিষ্ট পেমেন্ট স্থায়ীভাবে মুছে
                      ফেলা হবে।
                    </p>
                  </div>

                  {/* Subscription Details */}
                  <div className="mb-4 space-y-2 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ব্যবহারকারী:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {deleteModalData.user?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        প্যাকেজ:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {deleteModalData.package?.displayName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        মূল্য:
                      </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatPrice(
                          deleteModalData.payment?.finalPrice,
                          deleteModalData.package?.currency,
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-700 dark:bg-red-900/30">
                    <p className="text-xs text-red-700 dark:text-red-300">
                      ⚠️ এই কাজটি অপরিবর্তনীয়! মুছে ফেলার পর ডাটা পুনরুদ্ধার
                      করা সম্ভব হবে না।
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 transition-all hover:bg-gray-400 disabled:opacity-50"
                    >
                      বাতিল করুন
                    </Button>
                    <Button
                      onClick={handleDeleteConfirm}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white transition-all disabled:opacity-50"
                    >
                      {isDeleting ? "মুছে ফেলছে..." : "মুছে ফেলুন"}
                    </Button>
                  </div>
                </div>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
