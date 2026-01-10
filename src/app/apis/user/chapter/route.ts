import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getChapter = catchAsync(async (req: NextRequest) => {
  const bookId = req.nextUrl.searchParams.get("bookId");
  const boards = await prisma.chapter.findMany({
    where: {
      bookId: bookId || undefined,
    },
    orderBy: {
      serial: "asc",
    },
    include: {
      lesson: true,
    },
  });
  return successResponse(boards);
});
export { getChapter as GET };
