import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { mailVerficationToken } from "@/utils/JWT";
import { sendMail } from "@/utils/mailer";
import { generateOtp } from "@/utils/otpUtils";
import { successResponse } from "@/utils/serverError";
import { sendOTPSMS } from "@/utils/smsService";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { flexibleRegisterSchema } from "../_validation";

const handler = catchAsync(async (req: NextRequest) => {
  const { email, phone, name, password } =
    await flexibleRegisterSchema.validate(await req.json());

  // Check if user already exists with email or phone
  let existingUser = null;
  if (email) {
    existingUser = await prisma.users.findFirst({
      where: { email },
    });
  } else if (phone) {
    existingUser = await prisma.users.findFirst({
      where: { phone },
    });
  }

  // If user exists and is verified, block registration
  if (existingUser && existingUser.isVerified) {
    throw new Error(
      email
        ? "এই ইমেইল দিয়ে ইতিমধ্যে একাউন্ট আছে। অনুগ্রহ করে লগইন করুন।"
        : "এই ফোন নম্বর দিয়ে ইতিমধ্যে একাউন্ট আছে। অনুগ্রহ করে লগইন করুন।",
    );
  }

  const hash = await bcrypt.hash(password, 12);

  let user;

  // If user exists but not verified, update and resend OTP (allow re-registration)
  if (existingUser && !existingUser.isVerified) {
    user = await prisma.users.update({
      where: { id: existingUser.id },
      data: {
        name, // Update name in case they changed it
        password: hash, // Update password
      },
    });
  } else {
    // Create new user with isVerified: false
    user = await prisma.users.create({
      data: {
        email: email || undefined,
        phone: phone || undefined,
        name,
        password: hash,
        isVerified: false,
      },
    });
  }

  const code = await generateOtp();

  // Create verification token
  const otpToken = await mailVerficationToken(
    email || phone || "",
    code,
    name,
    hash,
  );

  // Calculate expiry time (5 minutes from now)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 5);

  // Send OTP based on registration method
  if (email) {
    const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
        <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 24px;">ইমেইল যাচাই করুন</h1>
        </header>
        <div style="padding: 20px; text-align: center;">
          <p style="font-size: 16px; color: #333; margin: 0 0 15px;">
            হ্যালো ${name}! আপনার ইমেইল যাচাই করতে নিচের কোডটি ব্যবহার করুন:
          </p>
          <div style="display: inline-block; background-color: #4CAF50; color: white; font-size: 32px; font-weight: bold; padding: 15px 30px; border-radius: 8px; margin: 15px 0; letter-spacing: 5px;">
            ${code}
          </div>
          <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
            এই কোডটি ৫ মিনিটের জন্য বৈধ থাকবে। আপনি যদি এই একাউন্ট তৈরি না করে থাকেন তাহলে এই মেইলটি উপেক্ষা করুন।
          </p>
        </div>
      </div>
    `;
    await sendMail(email, "Easy-Q - ইমেইল যাচাইকরণ", html);
  } else if (phone) {
    try {
      await sendOTPSMS(phone, code);
    } catch (smsError) {
      console.error("SMS Error:", smsError);
      // Continue registration process even if SMS fails
    }
  }

  // Save OTP to database with userId reference
  const otpRecord = await prisma.otpMail.create({
    data: {
      otp: code,
      otpToken,
      email: email || null,
      phone: phone || null,
      type: email ? "email" : "phone",
      purpose: "register",
      expiresAt,
      isUsed: false,
    },
  });

  console.log("✅ User created with isVerified=false. ID:", user.id);
  console.log("📧 OTP sent:", code);

  return successResponse({
    message: email
      ? "OTP আপনার ইমেইলে পাঠানো হয়েছে"
      : "OTP আপনার ফোনে পাঠানো হয়েছে",
    token: otpToken,
    type: email ? "email" : "phone",
  });
});

export { handler as POST };
