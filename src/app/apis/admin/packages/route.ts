import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

/**
 * GET /apis/admin/packages
 * Get all packages
 */
const getPackages = catchAsync(async (req: NextRequest) => {
  const packages = await prisma.package.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return successResponse({ result: packages });
});

/**
 * POST /apis/admin/packages
 * Create a new package
 * Admin only
 */
const createPackage = catchAsync(async (req: NextRequest) => {
  const data = await req.json();

  console.log("Received package data:", data);

  // Get all available features to validate against
  const availableFeatures = await prisma.feature.findMany({
    where: { isActive: true },
  });

  const featureKeys = availableFeatures.map((f: any) => f.key);
  console.log("Available feature keys:", featureKeys);

  // Filter features - only keep valid predefined features
  let cleanedFeatures = {};
  if (data.features) {
    cleanedFeatures = Object.fromEntries(
      Object.entries(data.features).filter(([key]) =>
        featureKeys.includes(key),
      ),
    );
  }

  // Update data with cleaned features
  data.features = cleanedFeatures;

  // Validate with schema
  const packageSchema = yup.object({
    name: yup.string().required("Package name is required"),
    slug: yup.string().required("Slug is required").lowercase(),
    numberOfQuestions: yup
      .number()
      .typeError("Number of questions must be a number")
      .min(0)
      .required("Number of questions is required"),
    displayName: yup.string().required("Display name is required"),
    price: yup.number().optional(),
    offerPrice: yup.number().min(0).optional().nullable(),
    currency: yup.string().default("BDT"),
    duration: yup
      .string()
      .oneOf(["monthly", "yearly", "lifetime"])
      .required("Duration is required"),
    isActive: yup.boolean().nullable().default(true),
    features: yup.object().required().default({}),
    limits: yup.object().required().default({}),
    sortOrder: yup.number().default(1),
  });

  const validatedData = await packageSchema.validate(data, {
    stripUnknown: false,
    abortEarly: false,
  });

  console.log("Validated data with features:", validatedData);

  // Ensure isActive has a value
  const packageData = {
    ...validatedData,
    isActive: validatedData.isActive ?? true,
  };

  // Check if slug already exists
  const existing = await prisma.package.findUnique({
    where: { slug: packageData.slug },
  });

  if (existing) {
    throw new Error(`Package with slug '${packageData.slug}' already exists`);
  }

  console.log("Creating package with validated data:", {
    name: packageData.name,
    slug: packageData.slug,
    displayName: packageData.displayName,
    price: packageData.price,
    features: packageData.features,
  });

  const pkg = await prisma.package.create({
    data: {
      name: packageData.name,
      slug: packageData.slug,
      numberOfQuestions: parseInt(String(packageData.numberOfQuestions), 10),
      displayName: packageData.displayName,
      price: parseInt(String(packageData.price), 10),
      offerPrice: packageData.offerPrice
        ? parseFloat(String(packageData.offerPrice))
        : null,
      currency: packageData.currency,
      duration: packageData.duration,
      isActive: packageData.isActive,
      features: JSON.parse(JSON.stringify(packageData.features || {})),
      limits: JSON.parse(JSON.stringify(packageData.limits || {})),
      sortOrder: packageData.sortOrder,
    },
  });

  console.log("Package created:", pkg);

  return successResponse({
    result: pkg,
    message: "Package created successfully",
  });
});

export { getPackages as GET, createPackage as POST };
