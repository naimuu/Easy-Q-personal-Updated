"use client";

import Loader from "@/components/shared/Loader";
import PurchaseButton from "@/components/shared/PurchaseButton";
import {
  useGetFeaturesQuery,
  useGetShowcasePackagesQuery,
} from "@/redux/services/userService";

const colorMap: {
  [key: string]: {
    border: string;
    text: string;
    button: string;
    hover: string;
  };
} = {
  free: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    button:
      "bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-300 dark:text-gray-900 dark:hover:bg-cyan-400",
    hover: "delay-0",
  },
  beginner: {
    border: "border-green-400",
    text: "text-green-600 dark:text-green-400",
    button: "bg-green-600 hover:bg-green-500",
    hover: "delay-200",
  },
  basic: {
    border: "border-blue-400",
    text: "text-blue-600 dark:text-blue-400",
    button: "bg-blue-500 hover:bg-blue-600",
    hover: "delay-400",
  },
  standard: {
    border: "border-yellow-400",
    text: "text-yellow-600 dark:text-yellow-400",
    button: "bg-yellow-500 hover:bg-yellow-600",
    hover: "delay-600",
  },
  premium: {
    border: "border-red-400",
    text: "text-red-600 dark:text-red-400",
    button: "bg-orange-600 hover:bg-orange-500",
    hover: "delay-800",
  },
  business: {
    border: "border-purple-400",
    text: "text-purple-600 dark:text-purple-400",
    button: "bg-purple-600 hover:bg-purple-500",
    hover: "delay-1000",
  },
};

export default function PricingSection() {
  const { data: packages = [], isLoading: packagesLoading } =
    useGetShowcasePackagesQuery();
  const { data: allFeatures = [], isLoading: featuresLoading } =
    useGetFeaturesQuery();

  const isLoading = packagesLoading || featuresLoading;

  const getColorStyles = (slug: string) => {
    return colorMap[slug.toLowerCase()] || colorMap.free;
  };

  const formatPrice = (price: number | undefined) => {
    return price !== undefined ? `৳${price.toLocaleString()}` : "৳০";
  };

  const getDurationText = (duration: string) => {
    if (duration === "monthly") return "/মাস";
    if (duration === "yearly") return "/বছর";
    return "/আজীবন";
  };

  if (isLoading) {
    return (
      <section className="bg-gray-100 px-6 py-20 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <h2 className="mb-12 text-center text-3xl font-bold">
          📦 প্যাকেজ ও মূল্য তালিকা
        </h2>
        <div className="flex justify-center">
          <Loader />
        </div>
      </section>
    );
  }

  return (
    <section
      id="pricing"
      className="bg-gray-100 px-6 py-20 text-gray-900 dark:bg-gray-900 dark:text-gray-100"
    >
      <h2 className="mb-12 text-center text-3xl font-bold">
        📦 প্যাকেজ ও মূল্য তালিকা
      </h2>
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-3">
        {packages.map((pkg, index) => {
          const colors = getColorStyles(pkg.slug);
          const isFree = pkg.price === 0;
          const displayPrice =
            pkg.offerPrice !== null && pkg.offerPrice !== undefined
              ? pkg.offerPrice
              : pkg.price;

          return (
            <div
              key={pkg.id}
              className={`glass-card animate-float transform rounded-xl border-2 ${isFree ? "border-gray-200 dark:border-gray-700" : colors.border} bg-white/20 p-8 shadow-xl transition hover:scale-105 dark:bg-white/10 ${colors.hover}`}
            >
              <h3 className={`mb-4 text-2xl font-bold ${colors.text}`}>
                {pkg.displayName}
              </h3>
              <p className="mb-6 flex items-baseline gap-2">
                <span className="text-4xl font-extrabold">
                  {formatPrice(displayPrice)}
                </span>

                {pkg.offerPrice !== null &&
                  pkg.offerPrice !== undefined &&
                  pkg.offerPrice < pkg.price && (
                    <span className="ml-2 text-sm text-gray-500 line-through">
                      {formatPrice(pkg.price)}
                    </span>
                  )}

                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getDurationText(pkg.duration)}
                </span>
              </p>
              <ul className="space-y-2 text-sm">
                <li>✅ {pkg.numberOfQuestions} সেট প্রশ্ন</li>
                {allFeatures.map((feature) => {
                  const isEnabled = (pkg.features as Record<string, boolean>)?.[
                    feature.key
                  ];
                  return (
                    <li
                      key={feature.key}
                      className={
                        isEnabled
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }
                    >
                      {isEnabled ? "✅" : "❌"} {feature.name}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6">
                <PurchaseButton
                  packageId={pkg.id}
                  packageName={pkg.displayName}
                  packagePrice={displayPrice}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
