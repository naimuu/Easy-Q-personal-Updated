import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { encrypt } from "@/utils/JWT";
import { sendMail } from "@/utils/mailer";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const sendResetMail = catchAsync(async (req: NextRequest) => {
  const { email } = await req.json();
  const user = await prisma.users.findFirst({ where: { email } });
  if (!user) throw { message: "User not found" };

  const updateAt = new Date();

  console.log(user.id);

  const token = await encrypt(
    user.id as string,
    user.isAdmin as boolean,
    updateAt as Date,
    1,
  );

  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset/${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 20px auto; background: #ffffff; padding: 20px; text-align: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #555;">If you requested to reset your password, click the button below:</p>
            <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; margin-top: 20px; background-color: #007bff; color: #ffffff; text-decoration: none; font-size: 16px; border-radius: 5px;">Reset Your Password</a>
            <p style="margin-top: 20px; font-size: 12px; color: #777;">If you didn't request this, you can safely ignore this email.</p>
        </div>
    </body>
    </html>
    `;

  await sendMail(email, "Password Reset ", html);

  return successResponse({ message: "Reset Mail sent successfully" });
});

export { sendResetMail as POST };
