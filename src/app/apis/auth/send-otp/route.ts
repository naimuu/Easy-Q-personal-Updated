import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { generateOtp } from "@/utils/otpUtils";
import { sendMail } from "@/utils/mailer";
import { sendOTPSMS } from "@/utils/smsService";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { sendOTPSchema } from "../_validation";
import { mailVerficationToken } from "@/utils/JWT";

const handler = catchAsync(async (req: NextRequest) => {
  const { email, phone, purpose } = await sendOTPSchema.validate(
    await req.json(),
  );
  console.log(`📩 Sending OTP for purpose: ${purpose}`);
  console.log(`📩 Target: ${email || phone}`);
  // Find user
  let user;
  if (email) {
    user = await prisma.users.findFirst({ where: { email } });
  } else if (phone) {
    user = await prisma.users.findFirst({ where: { phone } });
  }

  if (!user) throw new Error("ব্যবহারকারী খুঁজে পাওয়া যায়নি");

  const code = await generateOtp();
  const otpToken = await mailVerficationToken(
    email || phone || "",
    code,
    user.name,
    user.password,
  );

  // Calculate expiry time (5 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  // Send OTP
  if (email) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
        <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">Easy-Q লগইন OTP</h1>
        </header>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; color: #333; margin: 0 0 15px;">
            হ্যালো ${user.name}! আপনার লগইন OTP কোড:
          </p>
          <div style="display: inline-block; background-color: #4CAF50; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; margin: 15px 0; letter-spacing: 5px;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
            এই কোডটি ৫ মিনিটের জন্য বৈধ থাকবে। আপনি যদি লগইন চেষ্টা না করে থাকেন তাহলে এই মেইলটি উপেক্ষা করুন।
          </p>
        </div>
      </div>
    `;
    await sendMail(email, "Easy-Q - লগইন যাচাইকরণ", html);
  } else if (phone) {
    await sendOTPSMS(phone, code);
  }

  // Save OTP to database
  await prisma.otpMail.create({
    data: {
      otp: code,
      otpToken,
      email: email || null,
      phone: phone || null,
      type: email ? "email" : "phone",
      purpose,
      expiresAt,
      isUsed: false,
    },
  });

  return successResponse({
    message: email
      ? "OTP আপনার ইমেইলে পাঠানো হয়েছে"
      : "OTP আপনার ফোনে পাঠানো হয়েছে",
    token: otpToken,
    type: email ? "email" : "phone",
    userId: user.id,
  });
});

export { handler as POST };
