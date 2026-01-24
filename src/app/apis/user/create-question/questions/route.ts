import prisma from "@/config/prisma";
import authenticateUserWithSession from "@/utils/authenticateUserWithSession";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getQuestions = catchAsync(async (req: NextRequest) => {
  const query = req.nextUrl.searchParams;
  const { userId } = await authenticateUserWithSession(req);

  const classId = query.get("classId");
  const boardId = query.get("boardId");
  const instituteId = query.get("instituteId");
  const sort = query.get("sort");
  const search = query.get("search");
  const download = query.get("download");

  const questions = await prisma.question_set.findMany({
    where: {
      ...(boardId && { boardId }),
      ...(classId && { classId }),
      ...(instituteId && { instituteId }),
      ...(download && { printed: true }),
      ...(search && {
        examName: {
          examName: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
      userId: userId,
    },
    orderBy: {
      date: sort === "desc" ? "desc" : "asc", // default to asc if sort not 'desc'
    },
    include: {
      class: true,
      book: true,
      institute: true,
      examName: true,
    },
  });

  return successResponse(questions);
});
const deleteQuestion = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Invalid id");
  const qs = await prisma.question_set.delete({
    where: { id },
  });
  return successResponse(qs);
});
export { getQuestions as GET, deleteQuestion as DELETE };
