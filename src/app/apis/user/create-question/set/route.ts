import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getSet = catchAsync(async (req: NextRequest) => {
  const set_id = req.nextUrl.searchParams.get("setId");
  if (!set_id) throw new Error("Set Id is required!");
  const set = await prisma.question_set.findUnique({
    where: {
      id: set_id,
    },
    include: {
      board: true,
      book: true,
      class: true,
      examName: true,
      institute: true,
    },
  });
  if (!set) throw new Error("Set not found!");
  return successResponse(set);
});
const updateSet = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  const data = await req.json();
  if (!id) throw new Error("Invalid set id");
  const set = await prisma.question_set.update({
    where: {
      id: id,
    },
    data: {
      questions: data,
    },
  });
  return successResponse(set);
});
const printNow = catchAsync(async (req: NextRequest) => {
  const { id } = await req.json();
  if (!id) throw new Error("Id is required");
  const set = await prisma.question_set.update({
    where: { id: id },
    data: { printed: true },
    include: {
      board: true,
      book: true,
      class: true,
      examName: true,
      institute: true,
    },
  });
  if (!set) throw new Error("Set not found!");
  return successResponse(set);
});
export { getSet as GET, printNow as POST, updateSet as PUT };
