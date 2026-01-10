import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { uploadImage } from "@/utils/uploadImage";
import { NextRequest } from "next/server";
const createBook = catchAsync(async (req: NextRequest) => {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const cover = formData.get("cover") as File;
  const classId = formData.get("classId") as string;
  if (!name || !cover || !classId)
    throw new Error("Name,cover,classId is required!");
  const imageUrl = await uploadImage(cover);
  const board = await prisma.books.create({
    data: {
      name,
      cover: imageUrl,
      classId: classId,
    },
  });
  return successResponse(board);
});
const updateBook = catchAsync(async (req: NextRequest) => {
  const formData = await req.formData();
  const name = formData.get("name") as string;
  const cover = formData.get("cover") as File;
  const classId = formData.get("classId") as string;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Invalid Id");
  const imageUrl = cover ? await uploadImage(cover) : undefined;
  const board = await prisma.books.update({
    data: {
      name: name || undefined,
      classId: classId || undefined,
      cover: imageUrl,
    },
    where: {
      id: id,
    },
  });
  return successResponse(board);
});
const getBooks = catchAsync(async (req: NextRequest) => {
  console.log(req.nextUrl.searchParams);
  const boards = await prisma.books.findMany({
    include: {
      _count: {
        select: {
          chapter: true,
        },
      },
      class: true,
    },
  });
  return successResponse(boards);
});
const deleteBooks = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Id is required!");
  const board = await prisma.books.delete({ where: { id: id } });
  return successResponse(board);
});
export {
  deleteBooks as DELETE,
  getBooks as GET,
  updateBook as PUT,
  createBook as POST,
};
