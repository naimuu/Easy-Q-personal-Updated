import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

/**
 * GET /apis/user/subscriptions
 * Get ALL subscriptions for the user (not just active)
 * This allows user to see all packages they've purchased and switch between them
 */
const getAllSubscriptions = catchAsync(async (req: NextRequest) => {
  const userHeader = req.headers.get("USER");
  if (!userHeader) {
    throw new Error("User not authenticated");
  }

  const user = JSON.parse(userHeader);
  const userId = user.userId;

  // Get all subscriptions for this user (including inactive ones)
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId,
      // Only get subscriptions that haven't expired
      endDate: { gte: new Date() },
      // Only get subscriptions with completed payments
      payment: {
        paymentStatus: "completed",
      },
    },
    include: {
      package: true,
      payment: true,
    },
    orderBy: [
      { isActive: "desc" }, // Active first
      { createdAt: "desc" }, // Then by newest
    ],
  });

  // Find the currently active subscription
  const activeSubscription = subscriptions.find((s) => s.isActive);

  // Calculate usage for active subscription
  let actualCount = 0;
  if (activeSubscription) {
    actualCount = await prisma.question_set.count({
      where: { userId },
    });
  }

  return successResponse({
    subscriptions,
    activeSubscription,
    totalSubscriptions: subscriptions.length,
    questionSetsCreated: actualCount,
  });
});

export { getAllSubscriptions as GET };
