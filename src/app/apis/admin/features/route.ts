import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

const featureSchema = yup.object({
  key: yup.string().required("Feature key is required").lowercase(),
  name: yup.string().required("Feature name is required"),
  description: yup.string().nullable(),
  category: yup.string().nullable(),
  isActive: yup.boolean().default(true),
});

/**
 * GET /apis/admin/features
 * Get all features
 */

const getFeatures = catchAsync(async (req: NextRequest) => {
  const features = await prisma.feature.findMany({
    where: { isActive: true },
    orderBy: [{ category: "asc" }, { name: "asc" }],
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

  // Filter out null values for Prisma
  const cleanData = Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null)
  );

  const feature = await prisma.feature.create({
    data: cleanData as any,
  });

  return successResponse({ result: feature });
});

export { getFeatures as GET, createFeature as POST };
