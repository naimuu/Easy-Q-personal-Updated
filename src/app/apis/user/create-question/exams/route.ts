import prisma from "@/config/prisma";
import authenticateUserWithSession from "@/utils/authenticateUserWithSession";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getExams = catchAsync(async (req: NextRequest) => {
  const type = req.nextUrl.searchParams.get("type");
  if (!type) throw new Error("Type required");
  const { userId } = await authenticateUserWithSession(req);
  const exams = await prisma.exams.findMany({
    where: { usersId: userId, type: type },
  });
  return successResponse(exams);
});
export { getExams as GET };
