"use client";

import { useState, useCallback, useMemo } from "react";
import { useGetAdminPaymentsQuery, useVerifyPaymentMutation, PaymentFilter } from "@/redux/services/adminServices/paymentService";
import Loader from "@/components/shared/Loader";
import Button from "@/components/shared/Button";
import Input from "@/components/shared/Input";
import { toast } from "react-toastify";
import { createPortal } from "react-dom";

interface StatusChangeModalData {
  paymentId: string;
  currentStatus: string;
  payment: any;
}

export default function AdminPaymentsPage() {
  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filter & Search State
  const [status, setStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchType, setSearchType] = useState<"all" | "phone" | "txId" | "paymentId">("all");

  // Sorting State
  const [sortBy, setSortBy] = useState<"createdAt" | "finalPrice">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal State
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusModalData, setStatusModalData] = useState<StatusChangeModalData | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // API Hooks
  const filters: PaymentFilter = useMemo(
    () => ({
      page,
      limit,
      status: status || undefined,
      search: searchQuery || undefined,
      searchType,
      sortBy,
      sortOrder,
    }),
    [page, limit, status, searchQuery, searchType, sortBy, sortOrder]
  );

  const { data: paymentData, isLoading } = useGetAdminPaymentsQuery(filters);
  const [verifyPayment] = useVerifyPaymentMutation();

  // Derived data
  const payments = paymentData?.data || [];
  const pagination = paymentData?.pagination || { total: 0, page: 1, limit: 10, pages: 0 };

  // Handlers
  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setPage(1); // Reset to first page on search
  }, []);

  const handleStatusFilterChange = useCallback((value: string) => {
    setStatus(value);
    setPage(1);
  }, []);

  const handleSortChange = useCallback(
    (field: "createdAt" | "finalPrice") => {
      if (sortBy === field) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(field);
        setSortOrder("desc");
      }
    },
    [sortBy, sortOrder]
  );

  const handleStatusChangeClick = (payment: any) => {
    setStatusModalData({
      paymentId: payment.id,
      currentStatus: payment.paymentStatus,
      payment,
    });
    setNewStatus("");
    setNotes("");
    setShowStatusModal(true);
  };

  const handleStatusSubmit = async () => {
    if (!statusModalData || !newStatus) {
      toast.error("অনুগ্রহ করে একটি স্ট্যাটাস নির্বাচন করুন");
      return;
    }

    setIsUpdating(true);
    try {
      await verifyPayment({
        paymentId: statusModalData.paymentId,
        data: {
          paymentStatus: newStatus as "pending" | "completed" | "failed" | "refunded",
          notes: notes || undefined,
        },
      }).unwrap();

      toast.success("পেমেন্ট স্ট্যাটাস আপডেট করা হয়েছে!");
      setShowStatusModal(false);
    } catch (error: any) {
      const errorMsg = error?.data?.message || "অপারেশন ব্যর্থ হয়েছে";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number | undefined, currency: string = "BDT") => {
    return price !== undefined ? `${currency} ${price.toLocaleString()}` : "N/A";
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; label: string } } = {
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
      <span className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  const getSortIcon = (field: "createdAt" | "finalPrice") => {
    if (sortBy !== field) return "⇅";
    return sortOrder === "asc" ? "↑" : "↓";
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">💳 পেমেন্ট ব্যবস্থাপনা</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">সকল পেমেন্ট দেখুন এবং পরিচালনা করুন</p>
        </div>

        {/* Filters & Search Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
            {/* Search Input */}
            <div className="sm:col-span-2 lg:col-span-2">
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">অনুসন্ধান করুন</label>
              <Input
                type="text"
                placeholder="সার্চ করুন..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Search Type Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">সার্চ ধরন</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">সব ক্ষেত্র</option>
                <option value="phone">মোবাইল নম্বর</option>
                <option value="txId">লেনদেন আইডি</option>
                <option value="paymentId">পেমেন্ট আইডি</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">স্ট্যাটাস</label>
              <select
                value={status}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">সব স্ট্যাটাস</option>
                <option value="pending">অপেক্ষমাণ</option>
                <option value="completed">সম্পন্ন</option>
                <option value="failed">ব্যর্থ</option>
                <option value="refunded">রিফান্ড করা</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            মোট: <span className="font-semibold text-gray-900 dark:text-white">{pagination.total}</span> | পৃষ্ঠা{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {page} / {pagination.pages}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <Loader />
          </div>
        ) : payments.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 sm:p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">কোনো পেমেন্ট পাওয়া যায়নি</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                    <tr>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">আইডি</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">ব্যবহারকারী</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">মোবাইল নম্বর</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">লেনদেন আইডি</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">প্যাকেজ</th>
                      <th
                        onClick={() => handleSortChange("finalPrice")}
                        className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        মূল্য {getSortIcon("finalPrice")}
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">পদ্ধতি</th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">স্ট্যাটাস</th>
                      <th
                        onClick={() => handleSortChange("createdAt")}
                        className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                      >
                        তারিখ {getSortIcon("createdAt")}
                      </th>
                      <th className="px-4 lg:px-6 py-3 text-left text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">অ্যাকশন</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment: any) => (
                      <tr
                        key={payment.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition"
                      >
                        <td className="px-4 lg:px-6 py-4">
                          <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white break-all">
                            {payment.id.slice(0, 8)}
                          </code>
                        </td>
                        <td className="px-4 lg:px-6 py-4">
                          <div>
                            <p className="font-semibold text-xs lg:text-sm text-gray-900 dark:text-white">{payment.user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{payment.user?.email}</p>
                          </div>
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-mono text-gray-900 dark:text-white">{payment.phoneNumber}</td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-mono text-gray-900 dark:text-white break-all max-w-[120px]">
                          {payment.transactionId}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-900 dark:text-white">{payment.package?.displayName}</td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm font-semibold text-gray-900 dark:text-white">
                          {formatPrice(payment.finalPrice, payment.package?.currency)}
                        </td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm capitalize text-gray-900 dark:text-white">{payment.paymentMethod}</td>
                        <td className="px-4 lg:px-6 py-4">{getPaymentStatusBadge(payment.paymentStatus)}</td>
                        <td className="px-4 lg:px-6 py-4 text-xs lg:text-sm text-gray-600 dark:text-gray-400">{formatDate(payment.createdAt)}</td>
                        <td className="px-4 lg:px-6 py-4">
                          <Button
                            onClick={() => handleStatusChangeClick(payment)}
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded text-xs transition whitespace-nowrap"
                          >
                            পরিবর্তন করুন
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tablet & Mobile Card View */}
            <div className="lg:hidden space-y-3 sm:space-y-4">
              {payments.map((payment: any) => (
                <div key={payment.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                  {/* Header with ID and Status */}
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">আইডি</p>
                      <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-900 dark:text-white">
                        {payment.id.slice(0, 12)}
                      </code>
                    </div>
                    <div>{getPaymentStatusBadge(payment.paymentStatus)}</div>
                  </div>

                  {/* User Info */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">ব্যবহারকারী</p>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{payment.user?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 break-all">{payment.user?.email}</p>
                  </div>

                  {/* Contact & Package */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">মোবাইল</p>
                      <p className="text-xs font-mono text-gray-900 dark:text-white">{payment.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold mb-1">প্যাকেজ</p>
                      <p className="text-xs text-gray-900 dark:text-white">{payment.package?.displayName}</p>
                    </div>
                  </div>

                  {/* Transaction & Payment Details */}
                  <div className="bg-gray-50 dark:bg-gray-700/30 rounded p-3 space-y-2">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold">লেনদেন আইডি</p>
                      <p className="text-xs font-mono text-gray-900 dark:text-white break-all">{payment.transactionId}</p>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">মূল্য</p>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {formatPrice(payment.finalPrice, payment.package?.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 dark:text-gray-400">পদ্ধতি</p>
                        <p className="text-xs capitalize font-semibold text-gray-900 dark:text-white">{payment.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  {/* Date & Action */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(payment.createdAt)}</p>
                    <Button
                      onClick={() => handleStatusChangeClick(payment)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 px-3 rounded text-xs transition"
                    >
                      পরিবর্তন করুন
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">প্রতি পৃষ্ঠায়:</label>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-xs sm:text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded text-xs sm:text-sm transition"
              >
                পূর্ববর্তী
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
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
                      className={`px-2 sm:px-3 py-2 rounded text-xs sm:text-sm font-semibold transition ${
                        page === pageNum
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <Button
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page === pagination.pages}
                className="bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-2 px-3 sm:px-4 rounded text-xs sm:text-sm transition"
              >
                পরবর্তী
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && statusModalData
        ? createPortal(
            <>
              {/* Overlay */}
              <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setShowStatusModal(false)} />

              {/* Modal */}
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">স্ট্যাটাস পরিবর্তন করুন</h2>

                  {/* Payment Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6 mb-6 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">পেমেন্ট আইডি:</span>
                      <code className="text-sm font-mono text-gray-900 dark:text-white break-all">{statusModalData.paymentId.slice(0, 16)}</code>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">ব্যবহারকারী:</span>
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{statusModalData.payment.user?.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">বর্তমান স্ট্যাটাস:</span>
                      <span>{getPaymentStatusBadge(statusModalData.currentStatus)}</span>
                    </div>
                  </div>

                  {/* Status Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">নতুন স্ট্যাটাস</label>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {["pending", "completed", "failed", "refunded"].map((s) => (
                        <button
                          key={s}
                          onClick={() => setNewStatus(s)}
                          className={`p-3 rounded-lg border-2 transition text-xs sm:text-sm font-semibold ${
                            newStatus === s
                              ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:border-blue-300"
                          }`}
                        >
                          {s === "pending"
                            ? "অপেক্ষমাণ"
                            : s === "completed"
                              ? "সম্পন্ন"
                              : s === "failed"
                                ? "ব্যর্থ"
                                : "রিফান্ড"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes Field */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">নোট (ঐচ্ছিক)</label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="এই পরিবর্তনের জন্য কোনো নোট যোগ করুন..."
                      disabled={isUpdating}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      onClick={() => setShowStatusModal(false)}
                      disabled={isUpdating}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 text-gray-800 font-semibold py-2 px-4 rounded-lg transition text-sm sm:text-base"
                    >
                      বাতিল করুন
                    </Button>
                    <Button
                      onClick={handleStatusSubmit}
                      disabled={isUpdating || !newStatus}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg transition text-sm sm:text-base"
                    >
                      {isUpdating ? "আপডেট হচ্ছে..." : "স্ট্যাটাস আপডেট করুন"}
                    </Button>
                  </div>
                </div>
              </div>
            </>,
            document.body
          )
        : null}
    </div>
  );
}
