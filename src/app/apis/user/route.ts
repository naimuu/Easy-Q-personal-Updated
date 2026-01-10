import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { isSessionExpired } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getMe = catchAsync(async (req: NextRequest) => {
  const token = req.headers.get("USER");
  if (!token) throw new Error("Please login !");
  const { userId: id, iat } = JSON.parse(token);
  const user = await prisma.users.findUnique({
    where: { id },
  });

  if (!user) throw new Error("user not found");

  const isPassChanged = await isSessionExpired(
    user.passwordUpdateAt as Date,
    iat,
  );
  const result = isPassChanged ? "Please log in again" : user;

  return successResponse({ result });
});

export { getMe as GET };
