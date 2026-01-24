import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const bulkCreateChapterLesson = catchAsync(async (req: NextRequest) => {
    const { bookId, data } = await req.json();

    if (!bookId || !data || !Array.isArray(data)) {
        throw new Error("bookId and valid data array are required");
    }

    // Get current max serial for chapters in this book
    const lastChapter = await prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { serial: "desc" },
    });

    let currentChapterSerial = (lastChapter?.serial || 0) + 1;

    const results = [];

    for (const chapterData of data) {
        const { name: chapterName, lessons } = chapterData;

        // Create the chapter
        const chapter = await prisma.chapter.create({
            data: {
                name: chapterName,
                serial: currentChapterSerial++,
                bookId,
            },
        });

        const createdLessons = [];
        let currentLessonSerial = 1;

        if (lessons && Array.isArray(lessons)) {
            for (const lessonName of lessons) {
                // Create each lesson
                const lesson = await prisma.lesson.create({
                    data: {
                        name: lessonName,
                        serial: currentLessonSerial++,
                        chapterId: chapter.id,
                    },
                });
                createdLessons.push(lesson);
            }
        }

        results.push({
            ...chapter,
            lessons: createdLessons,
        });
    }

    return successResponse(results);
});

export { bulkCreateChapterLesson as POST };
