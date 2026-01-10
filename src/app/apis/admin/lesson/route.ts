import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { number, object, string } from "yup";
import { lessonSchem } from "../../../../../validations";


const createLesson = catchAsync(async (req: NextRequest) => {
  const data = await lessonSchem.validate(await req.json());
  const board = await prisma.lesson.create({
    data: {
      ...data,
    },
  });
  return successResponse(board);
});
const updateLesson = catchAsync(async (req: NextRequest) => {
  const data = await lessonSchem.validate(await req.json());
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.lesson.update({
    data: {
      ...data,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getLesson = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.lesson.findMany({
    orderBy: {
      serial: "asc",
    },
  });
  return successResponse(boards);
});
const deleteLesson = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.lesson.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteLesson as DELETE,
  getLesson as GET,
  updateLesson as PUT,
  createLesson as POST,
};
