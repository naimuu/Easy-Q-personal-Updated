import prisma from "@/config/prisma";

import catchAsync from "@/utils/catchAsync";
import { encrypt } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import * as bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const handler = catchAsync(async (req: NextRequest) => {
  const data = await req.json();

  // Find user by email or phone
  let user;
  if (data.email) {
    user = await prisma.users.findFirst({
      where: { email: data.email },
    });
  } else if (data.phone) {
    user = await prisma.users.findFirst({
      where: { phone: data.phone },
    });
  }

  if (!user) throw new Error("ব্যবহারকারী খুঁজে পাওয়া যায়নি");

  // Check if user is verified
  if (!user.isVerified) {
    throw new Error(
      "আপনার একাউন্ট যাচাই করা হয়নি। অনুগ্রহ করে ইমেইল/ফোনে পাঠানো OTP দিয়ে যাচাই করুন।",
    );
  }

  // Compare the provided password with the stored hashed password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) throw new Error("পাসওয়ার্ড ভুল হয়েছে");

  // Generate the JWT token
  const token = await encrypt(user.id, user.isAdmin, new Date(), 30);

  return successResponse({ user, token });
});
export { handler as POST };
