import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { decrypt } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

const resetPassword = catchAsync(async (req: NextRequest) => {
  const { token, password } = await req.json();
  console.log(token);
  const { userId } = await decrypt(token);
  console.log(userId);
  if (!userId) throw new Error("Invalid token");
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.users.update({
    where: { id: userId as string },
    data: {
      password: hashedPassword,
    },
  });

  return successResponse({
    message:
      "Password changed successfully ! please login with your new password .",
  });
});

export { resetPassword as POST };
