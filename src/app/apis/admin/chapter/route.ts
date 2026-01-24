import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { number, object, string } from "yup";
import { chapterSchem } from "../../../../../validations";


const createChapter = catchAsync(async (req: NextRequest) => {
  const data = await chapterSchem.validate(await req.json());
  const board = await prisma.chapter.create({
    data: {
      ...data,
    },
  });
  return successResponse(board);
});
const updateChapter = catchAsync(async (req: NextRequest) => {
  const data = await chapterSchem.validate(await req.json());
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.chapter.update({
    data: {
      ...data,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getChapter = catchAsync(async (req: NextRequest) => {
  const bookId = req.nextUrl.searchParams.get("bookId");
  const boards = await prisma.chapter.findMany({
    where: {
      bookId: bookId || undefined,
    },
    orderBy:{
      serial:"asc"
    }
  });
  return successResponse(boards);
});
const deleteChapter = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.chapter.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteChapter as DELETE,
  getChapter as GET,
  updateChapter as PUT,
  createChapter as POST,
};
