import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { encrypt } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as bcrypt from "bcryptjs";
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
  if (otpRecord.purpose !== "login") throw new Error("এই OTP লগইনের জন্য নয়");

  // Find user
  let user;
  if (otpRecord.email) {
    user = await prisma.users.findFirst({ where: { email: otpRecord.email } });
  } else if (otpRecord.phone) {
    user = await prisma.users.findFirst({ where: { phone: otpRecord.phone } });
  }

  if (!user) throw new Error("ব্যবহারকারী খুঁজে পাওয়া যায়নি");

  // Mark OTP as used
  await prisma.otpMail.update({
    where: { id: otpRecord.id },
    data: { isUsed: true },
  });

  // Mark user as verified if not already
  if (!user.isVerified) {
    await prisma.users.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }

  // Generate auth token
  const authToken = await encrypt(user.id, user.isAdmin, new Date(), 30);

  return successResponse({
    message: "লগইন সফল হয়েছে!",
    user,
    token: authToken,
  });
});

export { handler as POST };
