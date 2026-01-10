import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const gteQuestions = catchAsync(async (req: NextRequest) => {
  //console.log(req.nextUrl.searchParams);
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const boards = await prisma.questions.findMany({
    include: {
      category: true,
      options: true,
    },
    where: {
      lessonId: lessonId || undefined,
      categoryId: categoryId || undefined,
    },
  });
  return successResponse(boards);
});
export { gteQuestions as GET };
