import prisma from "@/config/prisma";

/**
 * Track user's usage of a limited resource
 * Increments the usage count in subscription record
 */
export async function trackUsage(
  userId: string,
  limitKey: string,
  increment: number = 1
): Promise<void> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });

    if (!subscription) {
      return; // Free users don't track usage for now
    }

    const currentUsage = subscription.usageCount as Record<string, number>;
    const newUsage = (currentUsage[limitKey] || 0) + increment;

    await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        usageCount: {
          ...currentUsage,
          [limitKey]: newUsage,
        },
      },
    });
  } catch (error) {
    console.error("Error tracking usage:", error);
    // Don't throw - usage tracking shouldn't block main operation
  }
}

/**
 * Get user's current usage
 */
export async function getUsage(
  userId: string,
  limitKey: string
): Promise<number> {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gte: new Date() },
      },
    });

    if (!subscription) {
      return 0;
    }

    const usageCount = subscription.usageCount as Record<string, number>;
    return usageCount[limitKey] || 0;
  } catch (error) {
    console.error("Error getting usage:", error);
    return 0;
  }
}