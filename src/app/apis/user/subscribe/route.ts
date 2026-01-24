import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { sendPurchaseNotifications } from "@/utils/emailNotificationService";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

/**
 * GET /apis/user/subscribe
 * Get user's subscription with payment details
 * Protected endpoint - requires authentication
 */
const getSubscriptionWithTransaction = catchAsync(async (req: NextRequest) => {
  // Get userId from USER header (set by checkAuth middleware)
  const userHeader = req.headers.get("USER");
  if (!userHeader) {
    throw new Error("User not authenticated");
  }

  const user = JSON.parse(userHeader);
  const userId = user.userId;

  // Get user's currently selected subscription (must be admin-approved and not expired)
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      userActive: true, // User has selected this one
      isActive: true, // Admin has approved it
    },
    include: {
      package: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // If no userActive subscription, find the latest admin-approved one and set it as user's choice
  let activeSubscription = subscription;
  if (!activeSubscription) {
    const latestApproved = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true, // Admin-approved
        endDate: { gte: new Date() }, // Not expired
        payment: {
          paymentStatus: "completed",
        },
      },
      include: {
        package: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (latestApproved) {
      activeSubscription = await prisma.subscription.update({
        where: { id: latestApproved.id },
        data: { userActive: true },
        include: {
          package: true,
          payment: true,
        },
      });
    }
  }

  // Check if subscription exists but has expired
  if (subscription && subscription.endDate <= new Date()) {
    // Deactivate user's selection on expired subscription
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { userActive: false },
    });

    // Update user's currentPackage to Free
    await prisma.users.update({
      where: { id: userId },
      data: { currentPackage: "Free" },
    });

    // Now fall through to create free subscription below
  }

  // If no active subscription OR subscription expired, create free subscription automatically
  // But first check if user already has a free subscription (even if expired or not userActive)
  if (!subscription || subscription.endDate <= new Date()) {
    const freePackage = await prisma.package.findFirst({
      where: { slug: "free" },
    });

    if (!freePackage) {
      throw new Error("Free package not found");
    }

    // Check if user already has ANY free subscription (prevent duplicates)
    const existingFreeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        package: {
          slug: "free",
        },
      },
      include: {
        package: true,
        payment: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If user already has a free subscription, just reuse it (set as userActive)
    if (existingFreeSubscription) {
      // Update it to be userActive if it's not expired
      if (existingFreeSubscription.endDate > new Date()) {
        const updatedFree = await prisma.subscription.update({
          where: { id: existingFreeSubscription.id },
          data: { userActive: true },
          include: {
            package: true,
            payment: true,
          },
        });

        return successResponse({
          result: {
            subscription: updatedFree,
            payment: updatedFree.payment,
            package: updatedFree.package,
            features: updatedFree.package.features || {},
            limits: updatedFree.package.limits || {},
            isActive: true,
            isFree: true,
            questionLimit: updatedFree.package.numberOfQuestions,
            questionSetsCreated: 0,
            allSubscriptions: [updatedFree],
          },
          message: "Free subscription reactivated",
        });
      }
    }

    // Only create a new free subscription if user has NONE
    // Create payment record for free package
    const freePayment = await prisma.payment.create({
      data: {
        userId,
        packageId: freePackage.id,
        price: 0,
        discount: 0,
        finalPrice: 0,
        phoneNumber: "N/A",
        transactionId: `FREE-${Date.now()}-${userId.slice(-6)}`,
        paymentStatus: "completed",
        paymentMethod: "free",
        currency: freePackage.currency,
        notes: "Free package - auto activated",
      },
    });

    // Calculate start and end dates based on package duration
    const startDate = new Date();
    let endDate = new Date();

    if (freePackage.duration === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (freePackage.duration === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      // Default to 30 days
      endDate.setDate(endDate.getDate() + 30);
    }

    // Create subscription with payment
    const newSubscription = await prisma.subscription.create({
      data: {
        userId,
        packageId: freePackage.id,
        paymentId: freePayment.id,
        startDate,
        endDate,
        isActive: true,
        usageCount: {
          questionSetsCreated: 0,
        },
      },
      include: {
        package: true,
        payment: true,
      },
    });

    return successResponse({
      result: {
        subscription: newSubscription,
        payment: freePayment,
        package: freePackage,
        features: freePackage.features || {},
        limits: freePackage.limits || {},
        isActive: true,
        isFree: false,
      },
      message: "Active subscription found",
    });
  }

  // Calculate question set count for THIS SUBSCRIPTION (not all user's sets)
  const subscriptionUsageCount = await prisma.question_set.count({
    where: {
      subscriptionId: subscription.id,
    },
  });

  // Also get total user count for reference
  const totalUserCount = await prisma.question_set.count({
    where: {
      userId,
    },
  });

  // Update subscription with actual usage count
  const updatedSubscription = await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      usageCount: {
        questionSetsCreated: subscriptionUsageCount,
      },
    },
    include: {
      package: true,
      payment: true,
    },
  });

  // Get all admin-approved subscriptions (isActive: true) with completed payments
  // Only show subscriptions that admin has activated
  const allSubscriptionsRaw = await prisma.subscription.findMany({
    where: {
      userId,
      isActive: true, // Only admin-approved subscriptions
      endDate: { gte: new Date() },
      payment: {
        paymentStatus: "completed",
      },
    },
    include: {
      package: true,
      _count: {
        select: {
          questionSets: true,
        },
      },
    },
    orderBy: [{ userActive: "desc" }, { createdAt: "desc" }],
  });

  // Transform to include usage count and question limit for each subscription
  const allSubscriptions = allSubscriptionsRaw.map((sub) => ({
    ...sub,
    questionSetsCreated: sub._count.questionSets, // Count of questions created for this specific subscription
    questionLimit: (sub as any).questionLimit || sub.package.numberOfQuestions, // Question limit for this subscription
  }));

  // Calculate question limit - use subscription's questionLimit if set, otherwise use package default
  const questionLimit =
    (updatedSubscription as any).questionLimit ||
    updatedSubscription.package.numberOfQuestions;

  return successResponse({
    result: {
      subscription: updatedSubscription,
      payment: updatedSubscription.payment,
      package: updatedSubscription.package,
      features: updatedSubscription.package.features || {},
      limits: updatedSubscription.package.limits || {},
      isActive:
        updatedSubscription.isActive &&
        updatedSubscription.endDate > new Date(),
      isFree: false,
      questionLimit, // Total question limit for this subscription
      questionSetsCreated: subscriptionUsageCount, // Usage for THIS subscription only
      totalQuestionSets: totalUserCount, // Total for all subscriptions (for reference)
      allSubscriptions, // All subscriptions user can switch between (with individual usage)
    },
    message: "Active subscription found",
  });
});

/**
 * POST /apis/user/subscribe
 * Create a new payment and subscription in a single transaction
 * User provides: packageId, phoneNumber, transactionId, paymentMethod
 * Both payment and subscription start as pending/inactive (waiting for admin verification)
 * Protected endpoint - requires authentication
 */
const createSubscriptionWithTransaction = catchAsync(
  async (req: NextRequest) => {
    // Get userId from USER header (set by checkAuth middleware)
    const userHeader = req.headers.get("USER");
    if (!userHeader) {
      throw new Error("User not authenticated");
    }

    const user = JSON.parse(userHeader);
    const userId = user.userId;

    // Validate request body
    const subscribeSchema = yup.object({
      packageId: yup.string().required("Package ID is required"),
      phoneNumber: yup
        .string()
        .optional()
        .nullable()
        .transform((value) => value || "")
        .test(
          "phone-format",
          "Phone number must be between 10-15 digits",
          function (value) {
            // If value is empty or N/A, allow it (for free packages)
            if (!value || value === "" || value === "N/A") return true;
            return /^[0-9]{10,15}$/.test(value);
          },
        ),
      transactionId: yup
        .string()
        .optional()
        .nullable()
        .transform((value) => value || ""),
      paymentMethod: yup.string().optional().nullable().default("bkash"),
      isFreePackage: yup.boolean().optional(),
      replaceExisting: yup.boolean().optional().default(false),
    });

    const data = await subscribeSchema.validate(await req.json());

    // Verify package exists and is active
    const pkg = await prisma.package.findUnique({
      where: { id: data.packageId },
    });

    if (!pkg) {
      throw new Error("Package not found");
    }

    if (!pkg.isActive) {
      throw new Error("Package is not active");
    }

    // Check if user already has an active subscription
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      include: {
        package: true,
      },
    });

    // Check if user already has a subscription for this SAME package (active or not, but not expired)
    const existingPackageSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        packageId: data.packageId,
        endDate: { gte: new Date() }, // Not expired
        payment: {
          paymentStatus: "completed", // Only consider completed payments
        },
      },
      include: {
        package: true,
      },
    });

    // If user is buying the same package they already have - increase question limit
    const isRepurchasingSamePackage = existingPackageSubscription !== null;

    // If user has an active subscription and replaceExisting is false, throw error
    // (but allow if it's a repurchase of the same package)
    if (
      activeSubscription &&
      !data.replaceExisting &&
      !isRepurchasingSamePackage
    ) {
      throw new Error(
        `আপনার বর্তমানে "${activeSubscription.package?.displayName}" প্যাকেজ সক্রিয় আছে। নতুন প্যাকেজ কিনতে হলে বর্তমান প্যাকেজটি বাতিল হবে।`,
      );
    }

    // Calculate payment details early to check if it's a free package
    const calculatedFinalPrice = pkg.offerPrice || pkg.price || 0;
    const isNewPackageFree = calculatedFinalPrice === 0;

    // Prevent purchasing free package twice - user already has one
    if (isNewPackageFree && existingPackageSubscription) {
      throw new Error(
        "আপনি ইতিমধ্যে ফ্রি প্যাকেজ ব্যবহার করছেন। ফ্রি প্যাকেজ শুধুমাত্র একবারই কেনা যায়। প্রিমিয়াম প্যাকেজে আপগ্রেড করুন।",
      );
    }

    // If replaceExisting is true and user has active subscription:
    // - For FREE packages: deactivate old subscription immediately (no admin approval needed)
    // - For PAID packages: keep old subscription active until admin approves new one
    if (activeSubscription && data.replaceExisting && isNewPackageFree) {
      await prisma.subscription.update({
        where: { id: activeSubscription.id },
        data: {
          isActive: false,
        },
      });
    }
    // For paid packages, old subscription remains active until admin activates the new one

    // Check if transaction ID already exists (only for paid packages with a transaction ID)
    if (data.transactionId && data.transactionId.trim() !== "") {
      const existingPayment = await prisma.payment.findUnique({
        where: { transactionId: data.transactionId },
      });

      if (existingPayment) {
        throw new Error(
          "Transaction ID already used. Please provide a unique transaction ID",
        );
      }
    }

    // Calculate payment details
    const discount = pkg.price - (pkg.offerPrice || 0);
    const finalPrice = pkg.offerPrice || pkg.price || 0;

    // Check if this is a free package (0 taka)
    const isFreePackage = finalPrice === 0;

    // Calculate subscription dates
    const startDate = new Date();
    const endDate = new Date();

    if (pkg.duration === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (pkg.duration === "yearly") {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else if (pkg.duration === "lifetime") {
      endDate.setFullYear(endDate.getFullYear() + 100);
    }

    // Get user details for notification
    const userDetails = await prisma.users.findUnique({
      where: { id: userId },
      select: { name: true, email: true, phone: true },
    });

    if (!userDetails) {
      throw new Error("User not found");
    }

    // Create payment and subscription in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create payment - auto complete for free packages
      const payment = await tx.payment.create({
        data: {
          userId,
          packageId: data.packageId,
          price: pkg.price,
          discount: discount,
          finalPrice: finalPrice,
          phoneNumber: data.phoneNumber || "N/A",
          transactionId:
            data.transactionId || `FREE-${Date.now()}-${userId.slice(-6)}`,
          paymentMethod: isFreePackage ? "free" : data.paymentMethod,
          paymentStatus: isFreePackage ? "completed" : "pending",
          currency: pkg.currency,
          notes: isFreePackage
            ? "Free package - auto activated"
            : isRepurchasingSamePackage
              ? `Repurchase - adding ${pkg.numberOfQuestions} questions to existing subscription`
              : undefined,
        },
      });

      let subscription;

      // If repurchasing the same PAID package, create a NEW subscription (not update existing)
      // For FREE packages: update existing to extend benefits
      // For PAID packages: create separate subscription for user to choose which one to activate
      if (
        isRepurchasingSamePackage &&
        existingPackageSubscription &&
        isFreePackage
      ) {
        // FREE package repurchase: Just update the existing one
        // This keeps the same free subscription
        const currentLimit =
          (existingPackageSubscription as any).questionLimit ||
          pkg.numberOfQuestions;
        const newLimit = currentLimit + pkg.numberOfQuestions;

        subscription = await tx.subscription.update({
          where: { id: existingPackageSubscription.id },
          data: {
            questionLimit: newLimit,
            // Extend the end date for free package
            endDate: new Date(
              Math.max(
                existingPackageSubscription.endDate.getTime(),
                endDate.getTime(),
              ),
            ),
          } as any,
          include: {
            package: true,
            payment: true,
          },
        });

        // Create a record linking this new payment to the subscription
        // Store the payment info for admin verification
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            notes: `Repurchase - adding ${pkg.numberOfQuestions} questions. New limit: ${newLimit}. Subscription ID: ${subscription.id}`,
          },
        });

        // Return with updated subscription info
        return {
          ...subscription,
          payment,
          isRepurchase: true,
          addedQuestions: pkg.numberOfQuestions,
          newLimit,
        };
      } else if (
        isRepurchasingSamePackage &&
        existingPackageSubscription &&
        !isFreePackage
      ) {
        // PAID package repurchase: Create a NEW subscription (admin will review separately)
        // User can switch between multiple purchased subscriptions

        subscription = await tx.subscription.create({
          data: {
            userId,
            packageId: data.packageId,
            paymentId: payment.id,
            startDate,
            endDate,
            isActive: false, // Requires admin approval
            userActive: false, // User hasn't selected this one yet
            questionLimit: pkg.numberOfQuestions,
            usageCount: {},
          } as any,
          include: {
            package: true,
            payment: true,
          },
        });

        return {
          ...subscription,
          isRepurchase: true,
          newSubscriptionCreated: true,
        };
      }

      // Create new subscription for new package
      // First, deactivate all other subscriptions if this one will be auto-activated (free package)
      if (isFreePackage) {
        await tx.subscription.updateMany({
          where: {
            userId,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

      subscription = await tx.subscription.create({
        data: {
          userId,
          packageId: data.packageId,
          paymentId: payment.id,
          startDate,
          endDate,
          isActive: isFreePackage, // Auto activate for free packages
          userActive: isFreePackage, // Auto select for free packages
          questionLimit: pkg.numberOfQuestions, // Set initial question limit from package
          usageCount: {},
        } as any,
        include: {
          package: true,
          payment: true,
        },
      });

      return { ...subscription, isRepurchase: false };
    });

    // Cast result to any to access dynamic properties
    const txResult = result as any;

    // Send notifications for paid packages (free packages don't need admin approval)
    if (!isFreePackage) {
      try {
        await sendPurchaseNotifications(
          userId,
          userDetails.email,
          userDetails.phone,
          userDetails.name,
          pkg,
          {
            finalPrice: finalPrice,
            transactionId:
              data.transactionId || txResult.payment?.transactionId,
            paymentMethod: data.paymentMethod || "bkash",
            phoneNumber: data.phoneNumber || txResult.payment?.phoneNumber,
          },
        );
      } catch (notificationError) {
        console.error(
          "Failed to send purchase notifications:",
          notificationError,
        );
        // Don't fail the purchase if notification fails
      }
    }

    // Prepare the response message
    let message = "";
    if (txResult.isRepurchase) {
      if (isFreePackage) {
        message = `প্যাকেজে ${txResult.addedQuestions} প্রশ্ন যোগ হয়েছে! নতুন সীমা: ${txResult.newLimit} প্রশ্ন।`;
      } else if (txResult.newSubscriptionCreated) {
        message = `নতুন সাবস্ক্রিপশন তৈরি হয়েছে! অনুমোদনের জন্য অপেক্ষা করুন। আপনি সাবস্ক্রিপশন পেজ থেকে সমস্ত প্যাকেজ দেখতে পারবেন।`;
      }
    } else {
      message = isFreePackage
        ? "ফ্রি সাবস্ক্রিপশন সফলভাবে সক্রিয় হয়েছে!"
        : "সাবস্ক্রিপশন তৈরি হয়েছে। অ্যাডমিন দ্বারা পেমেন্ট যাচাইয়ের অপেক্ষা করুন।";
    }

    return successResponse({
      result: {
        subscription: txResult,
        payment: txResult.payment,
        package: txResult.package,
        features: txResult.package?.features || {},
        limits: txResult.package?.limits || {},
        isActive: isFreePackage,
        isFree: isFreePackage,
        isRepurchase: txResult.isRepurchase || false,
        newSubscriptionCreated: txResult.newSubscriptionCreated || false,
        addedQuestions: txResult.addedQuestions,
        newQuestionLimit: txResult.newLimit,
      },
      message,
    });
  },
);

export {
  getSubscriptionWithTransaction as GET,
  createSubscriptionWithTransaction as POST,
};
