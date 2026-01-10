import prisma from "@/config/prisma";
import authenticateUserWithSession from "@/utils/authenticateUserWithSession";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getDashboardInfo = catchAsync(async (req: NextRequest) => {
  const { userId } = await authenticateUserWithSession(req);
  const question = await prisma.question_set.findMany({
    orderBy: {
      date: "desc",
    },
    where: {
      userId: userId,
      printed: false,
    },

    include: {
      book: true,
      class: true,
      examName: true,
    },
  });
  const books = await prisma.books.findMany({
    orderBy: {
      date: "desc",
    },
  });
  return successResponse({ books, question });
});
export { getDashboardInfo as GET };
