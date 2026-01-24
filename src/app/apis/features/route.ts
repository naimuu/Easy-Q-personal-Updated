import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { featureSchema } from "./_validation";

/**
 * GET /apis/admin/features
 * Get all features
 */
const getFeatures = catchAsync(async (req: NextRequest) => {
  const features = await prisma.feature.findMany({
    where: { isActive: true },
    orderBy: { category: "asc" },
  });

  return successResponse({ result: features });
});

/**
 * POST /apis/admin/features
 * Create new feature
 * Admin only
 */
const createFeature = catchAsync(async (req: NextRequest) => {
  const data = await featureSchema.validate(await req.json());

  const existing = await prisma.feature.findUnique({
    where: { key: data.key },
  });

  if (existing) {
    throw new Error(`Feature with key '${data.key}' already exists`);
  }

  const feature = await prisma.feature.create({
    data,
  });

  return successResponse({ result: feature });
});

export { getFeatures as GET, createFeature as POST };