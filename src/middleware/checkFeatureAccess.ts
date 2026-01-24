import prisma from "@/config/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * Middleware to check if user has access to a specific feature
 * Usage: await checkFeatureAccess(req, userId, 'dragAndDrop')
 */
export async function checkFeatureAccess(
  req: NextRequest,
  userId: string,
  featureKey: string
): Promise<{ allowed: boolean; error?: string }> {
  try {
    // Get user's active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      include: {
        package: true,
      },
    });

    // Get package (subscription or free)
    let pkg;
    if (!subscription) {
      pkg = await prisma.package.findFirst({
        where: { slug: "free" },
      });

      if (!pkg) {
        return { allowed: false, error: "Free package not found" };
      }
    } else {
      pkg = subscription.package;
    }

    // Check if feature is available
    const features = pkg.features as Record<string, boolean>;
    const hasFeature = features[featureKey] === true;

    if (!hasFeature) {
      return {
        allowed: false,
        error: `Feature '${featureKey}' not available in ${pkg.displayName} package`,
      };
    }

    return { allowed: true };
  } catch (error) {
    return {
      allowed: false,
      error: "Feature access check failed",
    };
  }
}

/**
 * Middleware to check if user has reached a limit
 */
export async function checkLimitAccess(
  userId: string,
  limitKey: string,
  currentUsage: number
): Promise<{ allowed: boolean; current?: number; limit?: number; error?: string }> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
      include: {
        package: true,
      },
    });

    let pkg;
    if (!subscription) {
      pkg = await prisma.package.findFirst({
        where: { slug: "free" },
      });

      if (!pkg) {
        return { allowed: false, error: "Free package not found" };
      }
    } else {
      pkg = subscription.package;
    }

    const limits = pkg.limits as Record<string, number>;
    const limit = limits[limitKey];

    // If no limit defined, unlimited
    if (!limit || limit === 0) {
      return { allowed: true, current: currentUsage };
    }

    const allowed = currentUsage < limit;

    return {
      allowed,
      current: currentUsage,
      limit,
    };
  } catch (error) {
    return {
      allowed: false,
      error: "Limit check failed",
    };
  }
}