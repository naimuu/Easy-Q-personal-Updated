import catchAsync from "@/utils/catchAsync";
import { sendExpirationWarnings } from "@/utils/emailNotificationService";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

/**
 * POST /apis/cron/expiration-warnings
 * Send expiration warnings for subscriptions ending in 3 days
 * This endpoint should be called by a cron job daily
 * Protected endpoint - requires cron secret
 */
const sendExpirationWarningsHandler = catchAsync(async (req: NextRequest) => {
  // Verify cron secret to prevent unauthorized access
  const cronSecret = req.headers.get("x-cron-secret");
  if (cronSecret !== process.env.CRON_SECRET) {
    throw new Error("Unauthorized: Invalid cron secret");
  }

  await sendExpirationWarnings();

  return successResponse({
    result: null,
    message: "Expiration warnings processed successfully",
  });
});

export { sendExpirationWarningsHandler as POST };
