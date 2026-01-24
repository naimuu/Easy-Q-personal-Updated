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
 * GET /apis/admin/payments
 * Get all payments with advanced filtering, search, sorting, and pagination
 * Admin only endpoint
 *
 * Query params:
 * - ?page=1&limit=10 (pagination)
 * - ?status=pending|completed|failed|refunded (filter by status)
 * - ?search=value (search by phone number, transaction ID, or payment ID)
 * - ?searchType=phone|txId|paymentId (specify search type)
 * - ?sortBy=createdAt|finalPrice (sort field)
 * - ?sortOrder=asc|desc (sort direction)
 * - ?userId=... (filter by user)
 */
const getPayments = catchAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  // Pagination
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("limit") || "10", 10)),
  );
  const skip = (page - 1) * limit;

  // Filtering
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");
  const search = searchParams.get("search");
  const searchType = searchParams.get("searchType") || "all"; // all, phone, txId, paymentId

  // Sorting
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc").toLowerCase() as
    | "asc"
    | "desc";

  // Validate sort field
  const validSortFields = [
    "createdAt",
    "finalPrice",
    "phoneNumber",
    "transactionId",
  ];
  const sortField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  // Build where clause
  const where: any = {};

  if (status) {
    where.paymentStatus = status;
  }

  if (userId) {
    where.userId = userId;
  }

  // Advanced search
  if (search && search.trim()) {
    const searchValue = search.trim();

    if (searchType === "phone") {
      where.phoneNumber = {
        contains: searchValue,
        mode: "insensitive",
      };
    } else if (searchType === "txId") {
      where.transactionId = {
        contains: searchValue,
        mode: "insensitive",
      };
    } else if (searchType === "paymentId") {
      where.id = searchValue;
    } else {
      // Search all fields
      where.OR = [
        {
          phoneNumber: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          transactionId: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
        {
          id: {
            contains: searchValue,
            mode: "insensitive",
          },
        },
      ];
    }
  }

  // Get total count
  const total = await prisma.payment.count({ where });

  // Fetch paginated payments first (without user relation)
  const payments = await prisma.payment.findMany({
    where,
    include: {
      package: true,
      subscriptions: true,
    },
    orderBy: { [sortField]: sortOrder },
    skip,
    take: limit,
  });

  // Get all user IDs from payments
  const userIds = payments.map((payment) => payment.userId).filter((id) => id);

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

  // Combine payments with users and filter out orphaned records
  const validPayments = payments
    .map((payment) => ({
      ...payment,
      user: userMap.get(payment.userId) || null,
    }))
    .filter((payment) => payment.user !== null);

  const pages = Math.ceil(total / limit);

  return successResponse({
    result: {
      data: validPayments,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    } as PaginatedResponse<any>,
    message: `Found ${validPayments.length} payment(s)`,
  });
});

export { getPayments as GET };
