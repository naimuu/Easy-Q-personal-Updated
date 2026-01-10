import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

/**
 * GET /apis/user/payment
 * Get all payments for the logged-in user
 * Protected endpoint - requires authentication
 */
const getUserPayments = catchAsync(async (req: NextRequest) => {
  // Get userId from USER header (set by checkAuth middleware)
  const userHeader = req.headers.get("USER");
  if (!userHeader) {
    throw new Error("User not authenticated");
  }

  const user = JSON.parse(userHeader);
  const userId = user.userId;

  // Get all payments for user
  const payments = await prisma.payment.findMany({
    where: { userId },
    include: {
      package: true,
      subscriptions: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return successResponse({
    result: payments,
    message: "Payments retrieved successfully",
  });
});

/**
 * POST /apis/user/payment
 * Create a new payment for package subscription
 * User provides: packageId, phoneNumber, transactionId
 * Payment status starts as "pending" (waiting for admin verification)
 * Protected endpoint - requires authentication
 */
const createPayment = catchAsync(async (req: NextRequest) => {
  // Get userId from USER header (set by checkAuth middleware)
  const userHeader = req.headers.get("USER");
  if (!userHeader) {
    throw new Error("User not authenticated");
  }

  const user = JSON.parse(userHeader);
  const userId = user.userId;

  // Validate request body
  const paymentSchema = yup.object({
    packageId: yup.string().required("Package ID is required"),
    phoneNumber: yup
      .string()
      .required("Phone number is required")
      .matches(/^[0-9]{10,15}$/, "Phone number must be between 10-15 digits"),
    transactionId: yup
      .string()
      .required("Transaction ID is required")
      .min(3, "Transaction ID must be at least 3 characters"),
    paymentMethod: yup
      .string()
      .required("Payment method is required"),
  });

  const data = await paymentSchema.validate(await req.json());

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

  // Check if transaction ID already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { transactionId: data.transactionId },
  });

  if (existingPayment) {
    throw new Error("Transaction ID already used. Please provide a unique transaction ID");
  }

  // Calculate final price
  const discount = pkg.price - (pkg.offerPrice || 0);
  const finalPrice = pkg.offerPrice || pkg.price || 0;

  // Create payment with pending status
  const payment = await prisma.payment.create({
    data: {
      userId,
      packageId: data.packageId,
      price: pkg.price,
      discount: discount,
      finalPrice: finalPrice,
      phoneNumber: data.phoneNumber,
      transactionId: data.transactionId,
      paymentMethod: data.paymentMethod,
      paymentStatus: "pending", // Waiting for admin verification
      currency: pkg.currency,
    },
    include: {
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

  return successResponse({
    result: payment,
    message: "Payment created successfully. Waiting for admin verification.",
  });
});

export { getUserPayments as GET, createPayment as POST };
