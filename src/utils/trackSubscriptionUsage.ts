import prisma from "@/config/prisma";

/**
 * Track usage by counting actual question sets created by the user
 * This is AUTOMATED - no manual tracking needed
 *
 * Business Logic:
 * 1. Admin sets Package.numberOfQuestions (e.g., 155)
 * 2. User creates question sets
 * 3. System counts actual question_set records for user
 * 4. Prevents creation if count >= limit
 */
export async function trackQuestionSetUsage(userId: string) {
  try {
    // Step 1: Find user's currently selected subscription (userActive: true, isActive: true, not expired, payment completed)
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        userActive: true,
        isActive: true,
        endDate: {
          gt: new Date(),
        },
        payment: {
          paymentStatus: "completed",
        },
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      console.log(`No active subscription found for user ${userId}`);
      return null;
    }

    // Step 2: Get question limit (subscription.questionLimit or package default)
    const questionLimit =
      (subscription as any).questionLimit ||
      subscription.package?.numberOfQuestions;
    if (!questionLimit) {
      console.log(
        `No question limit set for package ${subscription.packageId}`,
      );
      return null;
    }

    // Step 3: COUNT actual question sets created for this subscription only
    const actualQuestionSetsCreated = await prisma.question_set.count({
      where: {
        userId: userId,
        subscriptionId: subscription.id,
      },
    });

    // Step 4: CHECK if user has reached their limit
    if (actualQuestionSetsCreated >= questionLimit) {
      const error = new Error(
        `You have reached your question set limit (${questionLimit}). Please upgrade your package.`,
      ) as any;
      error.statusCode = 402; // Payment Required
      error.code = "QUOTA_EXCEEDED";
      error.data = {
        limit: questionLimit,
        current: actualQuestionSetsCreated,
        upgradeUrl: "/pricing",
      };
      throw error;
    }

    // Step 5: Return usage info for display
    console.log(
      `User ${userId} has created ${actualQuestionSetsCreated}/${questionLimit} question sets for subscription ${subscription.id}.`,
    );
    return {
      success: true,
      currentUsage: actualQuestionSetsCreated, // How many already created for this subscription
      limit: questionLimit, // Limit for this subscription
      remaining: questionLimit - actualQuestionSetsCreated, // How many left
    };
  } catch (error: any) {
    console.error("Error tracking usage:", error.message);
    throw error;
  }
}

/**
 * Get current usage for a user (read-only, doesn't affect data)
 * Returns actual question set count vs package limit
 */
export async function getUserUsage(userId: string) {
  try {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: {
          gt: new Date(),
        },
      },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return null;
    }

    // Count actual question sets (AUTOMATED)
    const actualQuestionSetsCreated = await prisma.question_set.count({
      where: {
        userId: userId,
      },
    });

    const packageLimit = subscription.package?.numberOfQuestions || 0;
    const remaining = Math.max(0, packageLimit - actualQuestionSetsCreated);
    const percentage = packageLimit
      ? Math.round((actualQuestionSetsCreated / packageLimit) * 100)
      : 0;

    return {
      questionSetsCreated: actualQuestionSetsCreated, // Actual count
      limit: packageLimit, // Admin-set limit
      remaining,
      percentage,
      subscription,
    };
  } catch (error: any) {
    console.error("Error getting usage:", error.message);
    return null;
  }
}

/**
 * Explanation of why we count actual question sets:
 *
 * ✅ AUTOMATED: No manual tracking needed
 * ✅ ACCURATE: Always matches dashboard count
 * ✅ RELIABLE: Single source of truth (question_set table)
 * ✅ SCALABLE: Works with any package limit
 * ✅ AUTO-RESET: When user upgrades package, count stays same but limit increases
 * ❌ NO MANUAL TRACKING: Removed usageCount increment logic (not needed)
 *
 * Example:
 * Package limit = 155 (set by admin)
 * User creates 5 question sets
 * trackQuestionSetUsage() counts = 5
 * Remaining = 155 - 5 = 150
 * User tries to create 6th → Check: 5 < 155 ✅ allowed
 * User creates 155 question sets
 * trackQuestionSetUsage() counts = 155
 * Remaining = 155 - 155 = 0
 * User tries to create 156th → Check: 155 >= 155 ❌ ERROR
 */
