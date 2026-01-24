import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { sendConfirmationNotification } from "@/utils/emailNotificationService";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /apis/admin/subscription/verify/[id]
 * Update subscription active status
 * - If isActive: true -> Only activate if payment is completed
 * - If isActive: false -> Deactivate subscription
 * Protected endpoint - requires admin authentication
 */

const verifySubscription = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: subscriptionId } = await params; // Get [id] from route params

    // Parse request body
    const body = await req.json();
    const { isActive } = body;

    // Validate isActive field
    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          message: "isActive field is required and must be a boolean",
        },
        { status: 400 },
      );
    }

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        payment: true,
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found",
        },
        { status: 404 },
      );
    }

    // Check if payment exists
    if (!subscription.payment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment not found for this subscription",
        },
        { status: 404 },
      );
    }

    // Check if subscription is already in the requested state
    if (subscription.isActive === isActive) {
      const currentState = isActive ? "active" : "inactive";
      return NextResponse.json(
        {
          success: true,
          message: `Subscription is already ${currentState}. No changes made.`,
          result: {
            subscription,
            payment: subscription.payment,
            package: subscription.package,
            user: subscription.user,
          },
        },
        { status: 200 },
      );
    }

    // If trying to activate, check payment status
    if (isActive === true) {
      if (subscription.payment.paymentStatus !== "completed") {
        return NextResponse.json(
          {
            success: false,
            message: `Cannot activate subscription. Payment must be completed first. Current payment status: ${subscription.payment.paymentStatus}`,
            currentPaymentStatus: subscription.payment.paymentStatus,
          },
          { status: 403 },
        );
      }

      // Deactivate any other active subscriptions for this user before activating the new one
      await prisma.subscription.updateMany({
        where: {
          userId: subscription.userId,
          isActive: true,
          id: { not: subscriptionId }, // Exclude the current subscription being activated
        },
        data: {
          isActive: false,
        },
      });
    }

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        isActive,
      },
      include: {
        payment: true,
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // Send confirmation notification when activating subscription
    if (isActive && updatedSubscription.user) {
      try {
        await sendConfirmationNotification(
          updatedSubscription.userId,
          updatedSubscription.user.email ||
            updatedSubscription.user.phone ||
            "",
          updatedSubscription.user.name,
          updatedSubscription.package,
          updatedSubscription,
        );
      } catch (notificationError) {
        console.error(
          "Failed to send confirmation notification:",
          notificationError,
        );
        // Don't fail the activation if notification fails
      }
    }

    const message = isActive
      ? "Subscription activated successfully"
      : "Subscription deactivated successfully";

    return NextResponse.json(
      {
        success: true,
        message,
        result: {
          subscription: updatedSubscription,
          payment: updatedSubscription.payment,
          package: updatedSubscription.package,
          user: updatedSubscription.user,
        },
      },
      { status: 200 },
    );
  },
);

/**
 * GET /apis/admin/subscription/verify/[id]
 * Get subscription details for verification
 * Protected endpoint - requires admin authentication
 */
const getSubscriptionForVerification = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: subscriptionId } = await params;

    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: {
        payment: true,
        package: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!subscription) {
      return NextResponse.json(
        {
          success: false,
          message: "Subscription not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription details retrieved successfully",
        result: {
          subscription,
          payment: subscription.payment,
          package: subscription.package,
          user: subscription.user,
          canActivate:
            !subscription.isActive &&
            subscription.payment?.paymentStatus === "completed",
          canDeactivate: subscription.isActive,
        },
      },
      { status: 200 },
    );
  },
);

export { getSubscriptionForVerification as GET, verifySubscription as PUT };
