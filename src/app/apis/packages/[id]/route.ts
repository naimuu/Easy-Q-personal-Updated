import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

/**
 * GET /apis/packages/:id
 * Get single package details with all features and limits
 * Public endpoint
 */
const getPackage = catchAsync(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        subscriptions: {
          select: { id: true, userId: true, startDate: true, endDate: true },
        },
      },
    });

    if (!pkg) {
      throw new Error("Package not found");
    }

    return successResponse({ result: pkg });
  }
);

export { getPackage as GET };