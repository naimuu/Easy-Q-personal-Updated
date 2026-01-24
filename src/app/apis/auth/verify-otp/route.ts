import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { encrypt, verifyMailVerficationToken } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { otpVerificationSchema } from "../_validation";

const handler = catchAsync(async (req: NextRequest) => {
  const { otp, token } = await otpVerificationSchema.validate(await req.json());

  // Find OTP record
  const otpRecord = await prisma.otpMail.findUnique({
    where: { otp },
  });

  if (!otpRecord) throw new Error("অবৈধ OTP");
  if (otpRecord.isUsed) throw new Error("এই OTP ইতিমধ্যে ব্যবহার করা হয়েছে");
  if (new Date() > otpRecord.expiresAt)
    throw new Error("OTP মেয়াদ শেষ হয়ে গেছে");
  if (otpRecord.otpToken !== token) throw new Error("টোকেন মেলেনি");

  // Verify token and get user data
  const decoded = await verifyMailVerficationToken(token);

  // Find the unverified user
  let user = await prisma.users.findFirst({
    where: {
      OR: [
        { email: otpRecord.email || undefined },
        { phone: otpRecord.phone || undefined },
      ],
    },
  });

  if (!user) throw new Error("ব্যবহারকারী পাওয়া যায়নি");

  // Update user to verified
  user = await prisma.users.update({
    where: { id: user.id },
    data: { isVerified: true },
  });

  // Mark OTP as used
  await prisma.otpMail.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  // Generate auth token
  const authToken = await encrypt(user.id, false, new Date(), 30);

  return successResponse({
    message: "একাউন্ট সফলভাবে তৈরি হয়েছে!",
    user,
    token: authToken,
  });
});

export { handler as POST };
