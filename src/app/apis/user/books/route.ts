import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getBooks = catchAsync(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const boardId = req.nextUrl.searchParams.get("boardId") || undefined;
  const bookId = req.nextUrl.searchParams.get("bookId") || undefined;
  const classId = req.nextUrl.searchParams.get("classId") || undefined;
  const classes = req.nextUrl.searchParams.get("class");
  if (classes && !classId) throw new Error("invalid class id");
  //if (!classId)

  const books = await prisma.books.findMany({
    where: {
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive", // case-insensitive search
        },
      }),
      ...(classId && { classId }),
      ...(bookId && { id: bookId }),
      ...(boardId && {
        class: {
          boardId,
        },
      }),
    },
    include: {
      class: {
        include: {
          board: true,
        },
      },
      _count: {
        select: {
          chapter: true,
        },
      },
    },
  });

  return successResponse(books);
});

export { getBooks as GET };
