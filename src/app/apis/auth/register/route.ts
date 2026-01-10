import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { mailVerficationToken } from "@/utils/JWT";
import { sendMail } from "@/utils/mailer";
import { generateOtp } from "@/utils/otpUtils";
import { successResponse } from "@/utils/serverError";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { registerSchema } from "../../../../../validations";

const registerByEmail = catchAsync(async (req: NextRequest) => {
  const { email, name, password } = await registerSchema.validate(
    await req.json(),
  );

  if (
    await prisma.users.findFirst({
      where: { email },
    })
  )
    throw new Error("User already exists");

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.users.create({
    data: {
      email: email,
      name: name,
      password: hash,
    },
  });
  const code = await generateOtp();
  const otpToken = await mailVerficationToken(email, code, name, hash);
  const html = `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);">
    <header style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
        <h1 style="margin: 0; font-size: 24px;">Verify Your Email</h1>
    </header>
    <div style="padding: 20px; text-align: center;">
        <p style="font-size: 16px; color: #333; margin: 0 0 15px;">
            Hi there! Use the code below to verify your email and activate your account:
        </p>
        <div style="display: inline-block; background-color: #B1B1B1; color: white; font-size: 24px; font-weight: bold; padding: 15px 30px; border-radius: 8px; margin: 15px 0;">
            ${code}
        </div>
        <p style="font-size: 14px; color: #555; margin: 20px 0 0;">
            If you did not request this, please ignore this email. The code will expire in 5 minutes.
        </p>
    </div>
  </div>
  `;
  await sendMail(email, "For otp varification", html);
  await prisma.otpMail.create({
    data: {
      otp: code,
      otpToken,
      type: "email",
      purpose: "registration",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes from now
    },
  });

  return successResponse({ message: "OTP send successful", otpToken });
});

export { registerByEmail as POST };
