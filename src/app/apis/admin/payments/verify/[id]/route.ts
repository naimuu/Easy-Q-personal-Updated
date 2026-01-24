import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

/**
 * PUT /apis/admin/payments/verify/:id
 * Update payment status based on admin verification
 * Admin only endpoint
 * Body: { paymentStatus: "completed" | "failed" | "refunded", notes?: string }
 * 
 * Logic:
 * - Only set Subscription isActive: true when paymentStatus is "completed"
 * - If paymentStatus changes to "failed" or "refunded", subscription status unchanged
 * - User's currentPackage only updated when paymentStatus is "completed"
 */
const verifyPayment = catchAsync(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const paymentId = id;

    console.log("Payment ID:", paymentId);

  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  // Validate request body
  const verifySchema = yup.object({
    paymentStatus: yup
      .string()
      .oneOf(["completed", "failed", "refunded", "pending"])
      .required("Payment status is required"),
    notes: yup.string().optional(),
  });

  const data = await verifySchema.validate(await req.json());

  // Find payment with subscriptions
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { user: true, package: true },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      paymentStatus: data.paymentStatus,
      notes: data.notes || payment.notes,
      updatedAt: new Date(),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      package: true,
      subscriptions: true,
    },
  });

  // ONLY activate subscription if paymentStatus is "completed"
  if (data.paymentStatus === "completed" && updatedPayment.subscriptions.length > 0) {
    for (const subscription of updatedPayment.subscriptions) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { isActive: true },
      });
    }

    // Update user's currentPackage
    await prisma.users.update({
      where: { id: payment.userId },
      data: { currentPackage: payment.package.slug },
    });
  }

  // If status changed to failed/refunded, don't change subscription status
  
  // Fetch the final updated payment with latest subscription data
  const finalPayment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      package: true,
      subscriptions: true,
    },
  });

  return successResponse({
    result: finalPayment,
    message: `Payment status updated to "${data.paymentStatus}" successfully`,
  });
});

export { verifyPayment as PUT };