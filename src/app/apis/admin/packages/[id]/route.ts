import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { updatePackageSchema } from "../_validation";

/**
 * PUT /apis/admin/packages/:id
 * Full update - replaces entire package (all optional fields)
 * Admin only
 */
const updatePackage = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const data = await req.json();

    // Verify package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new Error("Package not found");
    }

    // Validate features against available features
    if (data.features) {
      const availableFeatures = await prisma.feature.findMany({
        where: { isActive: true },
      });

      const featureKeys = availableFeatures.map((f: any) => f.key);

      for (const featureKey of Object.keys(data.features)) {
        if (!featureKeys.includes(featureKey)) {
          throw new Error(
            `Invalid feature key '${featureKey}'. Available features: ${featureKeys.join(", ")}`,
          );
        }
      }
    }

    const data_validated = await updatePackageSchema.validate(data);

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data_validated,
        updatedAt: new Date(),
      },
    });

    return successResponse({
      result: pkg,
      message: "Package updated successfully",
    });
  },
);

/**
 * PATCH /apis/admin/packages/:id
 * Partial update - updates only provided fields
 * Admin only
 */
const patchPackage = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const data = await req.json();

    // Verify package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new Error("Package not found");
    }

    // Validate features against available features
    if (data.features) {
      const availableFeatures = await prisma.feature.findMany({
        where: { isActive: true },
      });

      const featureKeys = availableFeatures.map((f: any) => f.key);

      // Filter features - only keep valid predefined features
      data.features = Object.fromEntries(
        Object.entries(data.features).filter(([key]) =>
          featureKeys.includes(key),
        ),
      );
    }

    const data_validated = await updatePackageSchema.validate(data);

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        ...data_validated,
        updatedAt: new Date(),
      },
    });

    return successResponse({
      result: pkg,
      message: "Package patched successfully",
    });
  },
);

/**
 * DELETE /apis/admin/packages/:id
 * Soft delete - deactivate package
 * Admin only
 */
const deletePackage = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Verify package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    });

    if (!existingPackage) {
      throw new Error("Package not found");
    }

    const pkg = await prisma.package.delete({
      where: { id },
    });

    return successResponse({
      result: pkg,
      message: "Package deleted successfully",
    });
  },
);

export { deletePackage as DELETE, patchPackage as PATCH, updatePackage as PUT };
