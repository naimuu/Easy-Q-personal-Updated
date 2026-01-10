import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getBoards = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.board.findMany({
    include: {
      classes: true,
    },
  });
  return successResponse(boards);
});
export { getBoards as GET };
