import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

/**
 * GET /apis/packages
 * Get all active packages sorted by display order
 * Public endpoint - no authentication required
 */
const getPackages = catchAsync(async (req: NextRequest) => {
  const packages = await prisma.package.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  // Fetch all features to map keys to names
  const features = await prisma.feature.findMany({
    where: { isActive: true },
  });

  const featureMap = features.reduce(
    (acc : any, feature : any) => {
      acc[feature.key] = feature.name;
      return acc;
    },
    {} as Record<string, string>
  );

  // Transform packages to include feature names
  const packagesWithFeatureNames = packages.map((pkg : any) => ({
    ...pkg,
    featureNames: Object.keys(pkg.features || {}).reduce(
      (acc, key) => {
        if ((pkg.features as Record<string, boolean>)[key]) {
          acc[key] = featureMap[key] || key;
        }
        return acc;
      },
      {} as Record<string, string>
    ),
  }));

  return successResponse({ result: packagesWithFeatureNames });
});

export { getPackages as GET };