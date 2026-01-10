import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getLesson = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.lesson.findMany();
  return successResponse(boards);
});
export { getLesson as GET };
