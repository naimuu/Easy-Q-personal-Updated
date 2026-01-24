import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
const createClass = catchAsync(async (req: NextRequest) => {
  const { name, boardId } = await req.json();
  if (!name || !boardId) throw new Error("Name,boardId is required!");
  const board = await prisma.classes.create({
    data: {
      name,
      boardId,
    },
  });
  return successResponse(board);
});
const updateClass = catchAsync(async (req: NextRequest) => {
  const { name } = await req.json();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.classes.update({
    data: {
      name: name || undefined,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getClass = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.classes.findMany({
    include:{
      board:true
    }
  });
  return successResponse(boards);
});
const deleteClass = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.classes.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteClass as DELETE,
  getClass as GET,
  updateClass as PUT,
  createClass as POST,
};
