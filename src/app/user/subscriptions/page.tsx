"use client";

import Button from "@/components/shared/Button";
import Loader from "@/components/shared/Loader";
import { useGetFeaturesQuery } from "@/redux/services/userServices/featureService";
import {
  useGetActiveSubscriptionQuery,
  useSwitchSubscriptionMutation,
} from "@/redux/services/userServices/purchaseSubscriptionService";
import Link from "next/link";
import { useState } from "react";
import {
  FaCheck,
  FaChevronDown,
  FaLayerGroup,
  FaPrint,
  FaReceipt,
  FaStar,
} from "react-icons/fa6";
import {
  FaChartPie,
  FaRegCalendarCheck,
  FaRegClock,
} from "react-icons/fa6";
import { toast } from "react-toastify";

export default function SubscriptionsPage() {
  const {
    data: subscriptionData,
    isLoading,
    refetch,
  } = useGetActiveSubscriptionQuery();
  const { data: allFeatures = [] } = useGetFeaturesQuery();
  const [switchSubscription, { isLoading: isSwitching }] =
    useSwitchSubscriptionMutation();

  const [activeMobileTab, setActiveMobileTab] = useState<
    "overview" | "payment" | "features"
  >("overview");
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [switchingSubscriptionId, setSwitchingSubscriptionId] = useState<
    string | null
  >(null);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );
  }

  const subscription = subscriptionData?.subscription;
  const payment = subscriptionData?.payment;
  const pkg = subscriptionData?.package;
  const features = subscriptionData?.features || {};
  const isActive = subscriptionData?.isActive;
  // const isFree = subscriptionData?.isFree; // Not using simplified view for free users anymore to keep consistent design
  const allSubscriptions = subscriptionData?.allSubscriptions || [];
  const questionLimit =
    subscriptionData?.questionLimit || pkg?.numberOfQuestions || 0;
  const questionSetsCreated = subscriptionData?.questionSetsCreated || 0;

  // Handle subscription switch
  const handleSwitchSubscription = async (subscriptionId: string) => {
    setSwitchingSubscriptionId(subscriptionId);
    try {
      await switchSubscription({ subscriptionId }).unwrap();
      toast.success("সাবস্ক্রিপশন সফলভাবে পরিবর্তন করা হয়েছে!");
      refetch();
    } catch (error: any) {
      toast.error(error?.data?.message || "সাবস্ক্রিপশন পরিবর্তন করতে ব্যর্থ");
    } finally {
      setSwitchingSubscriptionId(null);
    }
  };

  // Format date
  const formatDate = (dateString: string | undefined, locale = "bn-BD") => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format price
  const formatPrice = (price: number | undefined) => {
    return price !== undefined
      ? `৳${price.toLocaleString()}` // Using Taka symbol as in design
      : "N/A";
  };

  // Calculate days remaining
  const getDaysRemaining = (endDate: string | undefined) => {
    if (!endDate) return 0;
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const daysRemaining = getDaysRemaining(subscription?.endDate);

  // Invoice Generation
  const generateInvoice = (data: any) => {
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
      alert("Please allow popups to view the invoice.");
      return;
    }

    const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="bn">
        <head>
            <meta charset="UTF-8">
            <title>Invoice - ${data.id}</title>
            <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                 tailwind.config = {
                    theme: {
                        extend: {
                            fontFamily: {
                                bangla: ['"Hind Siliguri"', 'sans-serif'],
                            },
                            colors: {
                                primary: '#4F46E5',
                            }
                        }
                    }
                }
            </script>
            <style>
                body { font-family: 'Hind Siliguri', sans-serif; }
                @media print {
                    .no-print { display: none !important; }
                    body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    @page { margin: 0; size: auto; }
                }
            </style>
        </head>
        <body class="bg-gray-100 min-h-screen flex items-center justify-center p-4 print:p-0 print:bg-white">
            
            <div class="bg-white w-full max-w-2xl p-8 rounded-lg shadow-lg print:shadow-none print:w-full print:max-w-none">
                
                <!-- Actions -->
                <div class="flex justify-end gap-2 mb-6 no-print">
                    <button onclick="window.print()" class="px-4 py-2 bg-primary text-white rounded hover:bg-indigo-700 transition shadow-sm font-medium flex items-center gap-2">
                        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"></path></svg> প্রিন্ট করুন / সেভ করুন
                    </button>
                    <button onclick="window.close()" class="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition shadow-sm font-medium">
                        বন্ধ করুন
                    </button>
                </div>

                <!-- Header -->
                <div class="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
                    <div>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">Q</div>
                            <span class="text-2xl font-bold text-gray-800">Easy <span class="text-primary">Q</span></span>
                        </div>
                        <p class="text-gray-500 text-sm">QuestionBank.bd - Official Platform</p>
                        <p class="text-gray-500 text-sm mt-1">Dhaka, Bangladesh</p>
                        <p class="text-gray-500 text-sm">support@questionbank.bd</p>
                    </div>
                    <div class="text-right">
                        <h1 class="text-4xl font-bold text-gray-100 uppercase tracking-widest">Invoice</h1>
                        <p class="text-gray-600 font-medium mt-2">#${data.id}</p>
                        <p class="text-gray-500 text-sm">তারিখ: ${data.date}</p>
                    </div>
                </div>

                <!-- Bill To -->
                <div class="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">গ্রাহক তথ্য</h3>
                        <h2 class="font-bold text-gray-800 text-lg">${data.customerName}</h2>
                        <p class="text-gray-600">${data.customerPhone}</p>
                    </div>
                    <div class="text-right">
                        <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">পেমেন্ট মেথড</h3>
                        <p class="font-bold text-gray-800 flex items-center justify-end gap-2">
                            ${data.paymentMethod} <span class="w-2 h-2 rounded-full bg-green-500"></span>
                        </p>
                        <p class="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded inline-block mt-1">PAID</p>
                    </div>
                </div>

                <!-- Table -->
                <div class="mb-8">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-gray-50 text-gray-600 text-sm border-y border-gray-100">
                                <th class="py-3 px-4 font-semibold">বিবরণ</th>
                                <th class="py-3 px-4 font-semibold text-right">পরিমাণ</th>
                                <th class="py-3 px-4 font-semibold text-right">মূল্য</th>
                            </tr>
                        </thead>
                        <tbody class="text-gray-700">
                            <tr class="border-b border-gray-50">
                                <td class="py-4 px-4">
                                    <p class="font-bold text-gray-800">${data.packageName}</p>
                                    <p class="text-sm text-gray-500">${data.duration} সাবস্ক্রিপশন প্ল্যান</p>
                                </td>
                                <td class="py-4 px-4 text-right">১</td>
                                <td class="py-4 px-4 text-right">৳${data.price}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Totals -->
                <div class="flex justify-end mb-8">
                    <div class="w-64 space-y-2">
                        <div class="flex justify-between text-gray-600">
                            <span>সাব টোটাল:</span>
                            <span>৳${data.price}</span>
                        </div>
                        <div class="flex justify-between text-green-600">
                            <span>ছাড়:</span>
                            <span>-৳${data.discount}</span>
                        </div>
                        <div class="flex justify-between font-bold text-xl text-gray-800 border-t border-gray-200 pt-3 mt-2">
                            <span>সর্বমোট:</span>
                            <span>৳${data.total}</span>
                        </div>
                    </div>
                </div>

                <!-- Footer -->
                <div class="mt-12 text-center pt-8 border-t border-gray-100">
                    <p class="text-gray-500 text-sm">আমাদের সাথে থাকার জন্য ধন্যবাদ!</p>
                    <p class="text-gray-400 text-xs mt-1">Easy Q Platform by QuestionBank.bd</p>
                </div>
            </div>
        </body>
        </html>
    `;

    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
  };

  const handleGeneratePaymentInvoice = () => {
    if (!payment) return;
    generateInvoice({
      id: payment.transactionId || `Txn-${Date.now()}`,
      date: formatDate(payment.createdAt),
      packageName: pkg?.displayName || "Subscription",
      duration: pkg?.duration === "monthly" ? "মাসিক" : "বার্ষিক",
      price: payment.price,
      discount: Math.abs(payment.discount || 0),
      total: payment.finalPrice,
      customerName: payment.userId || "User", // Ideally should fetch user name
      customerPhone: payment.phoneNumber || "N/A",
      paymentMethod: payment.paymentMethod,
    });
  };

  const handleGenerateSubscriptionInvoice = (sub: any) => {
    generateInvoice({
      id: `Sub-${sub.id.substring(0, 8)}`,
      date: formatDate(sub.startDate),
      packageName: sub.package?.displayName,
      duration: sub.package?.duration === "monthly" ? "মাসিক" : "বার্ষিক",
      price: sub.package?.price,
      discount: sub.package?.price - (sub.package?.offerPrice || sub.package?.price),
      total: sub.package?.offerPrice || sub.package?.price,
      customerName: "User", // Placeholder
      customerPhone: "N/A",
      paymentMethod: "Online",
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-6 font-bangla text-gray-800 antialiased sm:px-6 lg:px-8 lg:py-8">
      {/* Header Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center lg:mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl 2xl:text-4xl">
            সাবস্ক্রিপশন ওভারভিউ
          </h1>
          <p className="mt-1 text-gray-500 2xl:text-lg">
            আপনার বর্তমান প্ল্যান এবং ব্যবহারের বিবরণ
          </p>
        </div>
        {isActive && (
          <div className="w-fit flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-green-700 shadow-sm">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
            </span>
            <span className="text-sm font-medium">সাবস্ক্রিপশন সক্রিয়</span>
          </div>
        )}
      </div>

      {/* Mobile Tab Navigation */}
      <div className="sticky top-16 z-40 mb-6 bg-[#F9FAFB] pt-2 lg:hidden">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
          <button
            onClick={() => setActiveMobileTab("overview")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${activeMobileTab === "overview"
                ? "border-b-2 border-primary bg-[#EEF2FF] text-primary" // customized based on design class mobile-tab-active
                : "text-gray-500 hover:text-primary"
              }`}
          >
            <FaChartPie className="mr-1 inline" /> ওভারভিউ
          </button>
          <button
            onClick={() => setActiveMobileTab("payment")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${activeMobileTab === "payment"
                ? "border-b-2 border-primary bg-[#EEF2FF] text-primary"
                : "text-gray-500 hover:text-primary"
              }`}
          >
            <FaReceipt className="mr-1 inline" /> পেমেন্ট
          </button>
          <button
            onClick={() => setActiveMobileTab("features")}
            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${activeMobileTab === "features"
                ? "border-b-2 border-primary bg-[#EEF2FF] text-primary"
                : "text-gray-500 hover:text-primary"
              }`}
          >
            <FaStar className="mr-1 inline" /> ফিচার
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 2xl:gap-8">
        {/* Left Column: Current Plan & Payment (Span 2) */}
        <div className="space-y-6 lg:col-span-2">
          {/* Current Active Plan Card */}
          <div
            className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg ${activeMobileTab !== "overview" ? "hidden lg:block" : ""
              }`}
          >
            {/* Decorator */}
            <div className="pointer-events-none absolute -mr-8 -mt-8 right-0 top-0 h-32 w-32 rounded-bl-full bg-primary/10"></div>

            <div className="p-6 2xl:p-8">
              <div className="mb-6 flex items-start justify-between">
                <div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-primary">
                    বর্তমান প্যাকেজ
                  </span>
                  <h2 className="mt-2 text-3xl font-bold 2xl:text-4xl">
                    {pkg?.displayName || "N/A"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500 2xl:text-base">
                    {pkg?.duration === "monthly"
                      ? "মাসিক"
                      : pkg?.duration === "yearly"
                        ? "বার্ষিক"
                        : "আজীবন"}{" "}
                    সাবস্ক্রিপশন
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 2xl:text-4xl">
                    {formatPrice(pkg?.offerPrice || pkg?.price)}
                  </p>
                  {pkg?.offerPrice && pkg.offerPrice < pkg.price && (
                    <p className="text-xs text-gray-400 line-through 2xl:text-sm">
                      {formatPrice(pkg?.price)}
                    </p>
                  )}
                </div>
              </div>

              {/* Usage Stats */}
              <div className="mb-6 rounded-xl border border-gray-100 bg-gray-50 p-5">
                <div className="mb-2 flex items-end justify-between">
                  <div>
                    <span className="font-medium text-gray-600 2xl:text-lg">
                      প্রশ্ন সেট ব্যবহার
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 2xl:text-3xl">
                      <span>{questionSetsCreated}</span>{" "}
                      <span className="text-lg text-gray-400 2xl:text-xl">
                        / <span>{questionLimit}</span>
                      </span>
                    </h3>
                  </div>
                  <span className="rounded bg-white px-2 py-1 text-sm font-bold text-primary shadow-sm">
                    {questionLimit > 0
                      ? Math.round((questionSetsCreated / questionLimit) * 100)
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 2xl:h-4">
                  <div
                    className={`h-3 rounded-full transition-all duration-1000 ease-out 2xl:h-4 ${questionSetsCreated >= questionLimit
                        ? "bg-red-500"
                        : questionSetsCreated >= questionLimit * 0.8
                          ? "bg-yellow-500"
                          : "bg-primary"
                      }`}
                    style={{
                      width: `${Math.min(
                        ((questionSetsCreated || 0) / (questionLimit || 1)) *
                        100,
                        100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="mt-2 text-right text-xs text-gray-500 2xl:text-sm">
                  রিসেট হবে: <span>{formatDate(subscription?.endDate)}</span>
                </p>
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm 2xl:text-base">
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <p className="mb-1 text-gray-500">
                    <FaRegCalendarCheck className="mr-2 inline text-green-500" />
                    শুরু তারিখ
                  </p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(subscription?.startDate)}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-100 bg-white p-3">
                  <p className="mb-1 text-gray-500">
                    <FaRegClock className="mr-2 inline text-red-500" />
                    মেয়াদ শেষ
                  </p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(subscription?.endDate)}
                  </p>
                  <p className="mt-1 text-xs font-medium text-red-500">
                    {daysRemaining} দিন বাকি
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details (Collapsible) */}
          <div
            className={`overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md ${activeMobileTab !== "payment" ? "hidden lg:block" : ""
              }`}
          >
            <div
              className={`flex cursor-pointer items-center justify-between p-5 transition hover:bg-gray-50 2xl:p-6 ${showPaymentDetails || activeMobileTab === "payment" ? "bg-gray-50" : ""}`}
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100 text-pink-600 2xl:h-12 2xl:w-12">
                  <FaReceipt className="2xl:text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 2xl:text-lg">
                    পেমেন্ট তথ্য
                  </h3>
                  <p className="text-xs text-gray-500 2xl:text-sm">
                    লেনদেন আইডি:{" "}
                    <span className="font-mono text-gray-700">
                      {payment?.transactionId || "N/A"}
                    </span>
                  </p>
                </div>
              </div>
              <FaChevronDown
                className={`text-gray-400 transition-transform duration-300 ${showPaymentDetails || activeMobileTab === "payment"
                    ? "rotate-180"
                    : ""
                  }`}
              />
            </div>

            {(showPaymentDetails || activeMobileTab === "payment") && (
              <div className="border-t border-gray-100 bg-gray-50/50 p-6 transition-all">
                {payment ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Left: Basic Info */}
                    <div className="space-y-4">
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">পেমেন্ট মেথড</span>
                        <span className="font-bold text-pink-600 capitalize">
                          {payment.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">ফোন নম্বর</span>
                        <span className="font-mono font-medium">
                          {payment.phoneNumber || "N/A"}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500">পেমেন্ট তারিখ</span>
                        <span>{formatDate(payment.createdAt)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">স্ট্যাটাস</span>
                        <span
                          className={`rounded px-2 py-1 text-xs font-bold capitalize ${payment.paymentStatus === "completed"
                              ? "bg-green-100 text-green-700"
                              : payment.paymentStatus === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Right: Cost Breakdown */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                      <h4 className="mb-3 border-b pb-2 text-sm font-semibold text-gray-700">
                        বিল সারাংশ
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">মূল মূল্য</span>
                          <span>{formatPrice(payment.price)}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>ছাড়</span>
                          <span>
                            {payment.discount && payment.discount !== 0
                              ? `-${formatPrice(Math.abs(payment.discount))}`
                              : "৳0"}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-dashed border-gray-300 pt-2 text-lg font-bold text-gray-800">
                          <span>মোট প্রদান</span>
                          <span>{formatPrice(payment.finalPrice)}</span>
                        </div>
                      </div>
                      <button
                        onClick={handleGeneratePaymentInvoice}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-gray-800 py-2 text-sm text-white transition hover:bg-gray-900"
                      >
                        <FaPrint /> ইনভয়েস প্রিন্ট করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">কোনো পেমেন্ট তথ্য পাওয়া যায়নি।</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Features (Span 1) */}
        <div
          className={`lg:col-span-1 ${activeMobileTab !== "features" ? "hidden lg:block" : ""
            }`}
        >
          <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-lg 2xl:p-8">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800 2xl:text-2xl">
              <FaStar className="text-yellow-400" /> উপলব্ধ বৈশিষ্ট্য
            </h3>
            <ul className="space-y-3 2xl:space-y-4">
              {allFeatures.length > 0 ? (
                allFeatures.map((feature: any) => {
                  const isEnabled = features[feature.key] === true;
                  // Only showing checks as per design, but could use cross for disabled if needed
                  // Design shows checks for features. Assuming listed features are available.
                  // But in our logic we highlight enabled ones.

                  if (!isEnabled) return null; // Or show with different style? Design implies list of features.

                  return (
                    <li key={feature.id} className="flex items-start gap-3">
                      <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <FaCheck className="text-xs" />
                      </div>
                      <span className="text-sm text-gray-600 2xl:text-base">
                        {feature.name}
                      </span>
                    </li>
                  )
                })
              ) : (
                <p>No features loaded</p>
              )}
            </ul>

            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <h4 className="mb-1 font-bold text-primary">সাহায্য প্রয়োজন?</h4>
              <p className="mb-3 text-xs text-gray-600">
                প্যাকেজ বা ফিচার নিয়ে কোনো সমস্যা হলে আমাদের জানান।
              </p>
              <button className="text-sm font-semibold text-primary underline hover:text-indigo-800">
                সাপোর্ট টিমের সাথে চ্যাট করুন
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section: All Subscriptions */}
      <div
        className={`mt-12 ${activeMobileTab !== "overview" ? "hidden lg:block" : ""
          }`}
      >
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800 2xl:text-2xl">
          <FaLayerGroup className="text-gray-400" /> আপনার সকল সাবস্ক্রিপশন (
          {allSubscriptions.length})
        </h2>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 2xl:gap-8">
          {allSubscriptions.map((sub: any) => {
            const isCurrent = sub.userActive === true;
            const subPercentage =
              sub.questionLimit > 0
                ? Math.round(((sub.questionSetsCreated || 0) / sub.questionLimit) * 100)
                : 0;

            return (
              <div
                key={sub.id}
                className={`flex flex-col justify-between rounded-xl border p-5 shadow-sm transition hover:shadow-md 2xl:p-6 ${isCurrent
                    ? "border-primary ring-1 ring-primary bg-white"
                    : "border-gray-200 bg-white"
                  }`}
              >
                <div>
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="font-bold text-gray-800 2xl:text-lg">
                      {sub.package?.displayName}
                    </h4>
                    {isCurrent && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="mb-4 text-xs text-gray-500 2xl:text-sm">
                    মেয়াদ: {formatDate(sub.endDate, "en-GB")}
                  </p>

                  <div className="mb-2">
                    <div className="mb-1 flex justify-between text-xs 2xl:text-sm">
                      <span className="text-gray-600">ব্যবহৃত প্রশ্ন</span>
                      <span className="font-bold">
                        {sub.questionSetsCreated || 0}/{sub.questionLimit}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100">
                      <div
                        className="h-2 rounded-full bg-gray-400"
                        style={{ width: `${subPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-gray-100 pt-4">
                  {isCurrent ? (
                    <div className="flex gap-2">
                      <button
                        disabled
                        className="flex-1 cursor-not-allowed rounded bg-gray-100 py-2 text-sm font-medium text-gray-400"
                      >
                        বর্তমানে ব্যবহৃত
                      </button>
                      <button
                        onClick={() => handleGenerateSubscriptionInvoice(sub)}
                        className="rounded bg-gray-800 px-3 py-2 text-white transition hover:bg-gray-900"
                        title="ইনভয়েস দেখুন"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSwitchSubscription(sub.id)}
                        disabled={switchingSubscriptionId === sub.id}
                        className="flex-1 rounded border border-primary bg-white py-2 text-sm font-medium text-primary transition hover:bg-primary hover:text-white 2xl:text-base disabled:opacity-50"
                      >
                        {switchingSubscriptionId === sub.id
                          ? "..."
                          : "ব্যবহার করুন"}
                      </button>
                      <button
                        onClick={() => handleGenerateSubscriptionInvoice(sub)}
                        className="rounded border border-gray-300 bg-white px-3 py-2 text-gray-600 transition hover:bg-gray-50"
                        title="ইনভয়েস দেখুন"
                      >
                        <FaPrint />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/pricing"
          className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 text-center font-semibold text-white transition-all hover:from-blue-600 hover:to-purple-700"
        >
          আপগ্রেড বা রিনিউ করুন
        </Link>
      </div>
    </div>
  );
}
