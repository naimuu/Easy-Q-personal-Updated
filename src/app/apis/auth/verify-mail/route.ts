import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { decrypt, encrypt } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { subMinutes } from "date-fns";
import { verifyMailOtpSchema } from "../../../../../validations";

const verifyMailOTP = catchAsync(async (req: NextRequest) => {
  const { otp } = await verifyMailOtpSchema.validate(await req.json());
  const userOtp = await prisma.otpMail.findUnique({
    where: {
      otp,
    },
  });
  if (!userOtp) throw new Error("Invalid OTP");

  const { otpToken } = userOtp;
  console.log(otpToken);
  const decode = (await decrypt(otpToken)) as {
    email: string;
    code: string;
    name: string;
    hash: string;
  };
  if (decode.code !== otp) throw new Error("Invalid OTP");

  const user = await prisma.users.create({
    data: {
      email: decode.email,
      name: decode.name,
      password: decode.hash,
    },
  });

  await prisma.otpMail.deleteMany({
    where: {
      sentDateTime: {
        lt: subMinutes(new Date(), 5),
      },
    },
  });

  const token = await encrypt(user.id, false, new Date(), 30);

  return successResponse({ message: "OTP verified successfully", user, token });
});

export { verifyMailOTP as POST };
