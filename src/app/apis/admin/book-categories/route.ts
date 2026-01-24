import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const getBookCategories = catchAsync(async (req: NextRequest) => {
    const bookId = req.nextUrl.searchParams.get("bookId");
    if (!bookId) throw new Error("Book ID is required");

    // Find all lessons in this book
    const lessons = await prisma.lesson.findMany({
        where: {
            chapter: {
                bookId: bookId,
            },
        },
        select: {
            id: true,
        },
    });

    const lessonIds = lessons.map((l) => l.id);

    if (lessonIds.length === 0) {
        return successResponse([]);
    }

    // Find unique category IDs from questions in these lessons
    const categoriesFromQuestions = await prisma.questions.findMany({
        where: {
            lessonId: { in: lessonIds },
        },
        select: {
            categoryId: true,
        },
        distinct: ["categoryId"],
    });

    // Find unique category IDs from contexts in these lessons
    const categoriesFromContexts = await prisma.context.findMany({
        where: {
            lessonId: { in: lessonIds },
        },
        select: {
            categoryId: true,
        },
        distinct: ["categoryId"],
    });

    // Combine and de-duplicate IDs
    const uniqueCategoryIds = Array.from(
        new Set([
            ...categoriesFromQuestions.map((c) => c.categoryId),
            ...categoriesFromContexts.map((c) => c.categoryId),
        ])
    );

    // Fetch full category objects
    const categories = await prisma.category.findMany({
        where: {
            id: { in: uniqueCategoryIds },
        },
    });

    return successResponse(categories);
});

export { getBookCategories as GET };
