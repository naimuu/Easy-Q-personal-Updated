import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
const createBoard = catchAsync(async (req: NextRequest) => {
  const { name } = await req.json();
  if (!name) throw new Error("Name is required!");
  const board = await prisma.board.create({
    data: {
      name,
    },
  });
  return successResponse(board);
});
const updateBoard = catchAsync(async (req: NextRequest) => {
  const { name } = await req.json();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.board.update({
    data: {
      name: name || undefined,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getBoard = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.board.findMany({
    include: {
      _count: {
        select: {
          classes: true,
        },
      },
    },
  });
  return successResponse(boards);
});
const deleteBoard = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.board.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteBoard as DELETE,
  getBoard as GET,
  updateBoard as PUT,
  createBoard as POST,
};
