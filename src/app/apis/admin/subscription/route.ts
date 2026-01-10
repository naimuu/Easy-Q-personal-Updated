import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

/**
 * GET /apis/admin/subscription
 * Get all subscriptions with advanced filtering, search, sorting, and pagination
 * Admin only endpoint
 *
 * Query params:
 * - ?page=1&limit=10 (pagination)
 * - ?isActive=true|false (filter by subscription status)
 * - ?paymentStatus=pending|completed|failed|refunded (filter by payment status)
 * - ?search=value (search by user name, email, or phone number)
 * - ?sortBy=createdAt|endDate|finalPrice (sort field)
 * - ?sortOrder=asc|desc (sort direction)
 * - ?userId=... (filter by specific user)
 */
const getSubscriptions = catchAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
  );
  const skip = (page - 1) * limit;

  // Filtering
  const isActive = searchParams.get("isActive");
  const paymentStatus = searchParams.get("paymentStatus");
  const paymentMethod = searchParams.get("paymentMethod");
  const userId = searchParams.get("userId");
  const search = searchParams.get("search");

  // Sorting
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() as
    | "asc"
    | "desc";

  // Validate sort field
  const validSortFields = ["createdAt", "endDate", "startDate"];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  // Build where clause
  const where: any = {};

  if (isActive !== null && isActive !== undefined && isActive !== "") {
    where.isActive = isActive === "true";
  }

  if (userId) {
    where.userId = userId;
  }

  // Advanced search - search across user name, email, and phone number
  if (search && search.trim()) {
    const searchValue = search.trim();

    // Detect search type
    const isEmail = searchValue.includes("@");
    const isPhone = /^[0-9+\-\s()]+$/.test(searchValue);

    if (isEmail) {
      // Search by email only
      where.OR = [
        { user: { name: { contains: searchValue, mode: "insensitive" } } },
        { user: { email: { contains: searchValue, mode: "insensitive" } } },
      ];
    } else if (isPhone) {
      // Search by phone only
      where.OR = [
        { user: { name: { contains: searchValue, mode: "insensitive" } } },
        { user: { phone: { contains: searchValue, mode: "insensitive" } } },
        {
          payment: {
            phoneNumber: { contains: searchValue, mode: "insensitive" },
          },
        },
      ];
    } else {
      // Search all fields
      where.OR = [
        { user: { name: { contains: searchValue, mode: "insensitive" } } },
        { user: { email: { contains: searchValue, mode: "insensitive" } } },
        { user: { phone: { contains: searchValue, mode: "insensitive" } } },
        {
          payment: {
            phoneNumber: { contains: searchValue, mode: "insensitive" },
          },
        },
      ];
    }
  }

  // Payment status filter
  if (paymentStatus) {
    where.payment = {
      ...where.payment,
      paymentStatus,
    };
  }

  // Payment method filter (to filter free packages)
  if (paymentMethod) {
    where.payment = {
      ...where.payment,
      paymentMethod,
    };
  }

  // Fetch all matching subscriptions first (without user relation)
  const subscriptions = await prisma.subscription.findMany({
    where,
    include: {
      package: true,
      payment: true,
    },
    orderBy: { [sortField]: sortOrder },
  });

  // Get all user IDs from subscriptions
  const userIds = subscriptions.map((sub) => sub.userId).filter((id) => id);

  // Fetch users separately
  const users = await prisma.users.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });

  // Create a map of users for quick lookup
  const userMap = new Map(users.map((user) => [user.id, user]));

  // Combine subscriptions with users and filter out orphaned records
  const validSubscriptions = subscriptions
    .map((sub) => ({
      ...sub,
      user: userMap.get(sub.userId) || null,
    }))
    .filter((sub) => sub.user !== null);

  // Apply pagination manually after filtering
  const total = validSubscriptions.length;
  const paginatedSubscriptions = validSubscriptions.slice(skip, skip + limit);
  const pages = Math.ceil(total / limit);

  return successResponse({
    result: {
      data: paginatedSubscriptions,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    } as PaginatedResponse<any>,
    message: `Found ${paginatedSubscriptions.length} subscription(s)`,
  });
});

/**
 * DELETE /apis/admin/subscription
 * Delete a subscription by ID
 * Admin only endpoint
 *
 * Query params:
 * - ?id=subscriptionId (required)
 */
const deleteSubscription = catchAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const subscriptionId = searchParams.get("id");

  if (!subscriptionId) {
    throw new Error("Subscription ID is required");
  }

  // Get the subscription first to check if it exists
  const subscription = await prisma.subscription.findUnique({
    where: { id: subscriptionId },
    include: {
      payment: true,
      user: true,
    },
  });

  if (!subscription) {
    throw new Error("Subscription not found");
  }

  // Delete the subscription (this will cascade delete related data if configured)
  await prisma.subscription.delete({
    where: { id: subscriptionId },
  });

  // Also delete the associated payment if it exists
  if (subscription.paymentId) {
    await prisma.payment
      .delete({
        where: { id: subscription.paymentId },
      })
      .catch(() => {
        // Payment might already be deleted or not exist
      });
  }

  return successResponse({
    result: {
      deletedSubscription: subscription,
    },
    message: "Subscription deleted successfully",
  });
});

export { deleteSubscription as DELETE, getSubscriptions as GET };
