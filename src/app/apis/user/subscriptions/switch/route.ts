import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

/**
 * POST /apis/user/subscriptions/switch
 * Switch the active subscription to a different one
 * User can switch between their purchased packages
 */
const switchSubscription = catchAsync(async (req: NextRequest) => {
  const userHeader = req.headers.get("USER");
  if (!userHeader) {
    throw new Error("User not authenticated");
  }

  const user = JSON.parse(userHeader);
  const userId = user.userId;

  const schema = yup.object({
    subscriptionId: yup.string().required("Subscription ID is required"),
  });

  const data = await schema.validate(await req.json());

  // Verify the subscription exists and belongs to the user
  // AND it must be admin-approved (isActive: true)
  const targetSubscription = await prisma.subscription.findFirst({
    where: {
      id: data.subscriptionId,
      userId,
      isActive: true, // Must be admin-approved
      endDate: { gte: new Date() }, // Not expired
      payment: {
        paymentStatus: "completed", // Payment must be completed
      },
    },
    include: {
      package: true,
      payment: true,
    },
  });

  if (!targetSubscription) {
    throw new Error(
      "Subscription not found, not approved by admin, or expired",
    );
  }

  // Deactivate all current user selections for this user
  await prisma.subscription.updateMany({
    where: {
      userId,
      userActive: true,
    },
    data: {
      userActive: false,
    },
  });

  // Set the target subscription as user's choice
  const updatedSubscription = await prisma.subscription.update({
    where: { id: data.subscriptionId },
    data: { userActive: true },
    include: {
      package: true,
      payment: true,
    },
  });

  // Update user's currentPackage
  await prisma.users.update({
    where: { id: userId },
    data: { currentPackage: updatedSubscription.package.displayName },
  });

  return successResponse({
    subscription: updatedSubscription,
    message: `Successfully switched to ${updatedSubscription.package.displayName} package`,
  });
});

export { switchSubscription as POST };
