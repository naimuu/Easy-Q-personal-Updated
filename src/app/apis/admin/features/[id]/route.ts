import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

/**
 * DELETE /apis/admin/features/:id
 * Hard delete - permanently remove feature
 * Admin only
 */
const deleteFeature = catchAsync(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    // Verify feature exists
    const existingFeature = await prisma.feature.findUnique({
      where: { id },
    });

    if (!existingFeature) {
      throw new Error("Feature not found");
    }

    // Hard delete - permanently remove feature
    await prisma.feature.delete({
      where: { id },
    });

    return successResponse({ result: { message: "Feature deleted successfully" } });
  }
);

export { deleteFeature as DELETE };