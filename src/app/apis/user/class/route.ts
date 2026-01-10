import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getClass = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.classes.findMany();
  return successResponse(boards);
});
export { getClass as GET };
