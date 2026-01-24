import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { categorySchema } from "../../../../../validations";

const createCategory = catchAsync(async (req: NextRequest) => {
  const data = await categorySchema.validate(await req.json());
  const board = await prisma.category.create({
    data: {
      name: data.name,
      type: data.type,
      isRTL: data.isRTL || false,
    },
  });
  return successResponse(board);
});
const updateCategory = catchAsync(async (req: NextRequest) => {
  const data = await categorySchema.validate(await req.json());
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.category.update({
    data: {
      name: data.name,
      type: data.type,
      isRTL: data.isRTL,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getCategory = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.category.findMany();
  return successResponse(boards);
});
const deleteCategory = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.category.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteCategory as DELETE,
  getCategory as GET,
  updateCategory as PUT,
  createCategory as POST,
};
