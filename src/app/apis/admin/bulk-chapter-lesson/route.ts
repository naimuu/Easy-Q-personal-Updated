import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";

const bulkCreateChapterLesson = catchAsync(async (req: NextRequest) => {
    const { bookId, data } = await req.json();

    if (!bookId || !data || !Array.isArray(data)) {
        throw new Error("bookId and valid data array are required");
    }

    // Get current max serials to continue sequences for new items
    const lastChapter = await prisma.chapter.findFirst({
        where: { bookId },
        orderBy: { serial: "desc" },
    });
    let currentChapterSerial = (lastChapter?.serial || 0) + 1;

    const results = [];

    // Process Chapters
    for (const chapterData of data) {
        const { id: chapterId, name: chapterName, lessons } = chapterData;
        let chapter;

        if (chapterId) {
            // Updated existing chapter
            chapter = await prisma.chapter.update({
                where: { id: chapterId },
                data: { name: chapterName },
            });
        } else {
            // Create new chapter
            chapter = await prisma.chapter.create({
                data: {
                    name: chapterName,
                    serial: currentChapterSerial++,
                    bookId,
                },
            });
        }

        const createdLessons = [];
        // Get max serial for lessons in this chapter (for new lessons)
        const lastLesson = await prisma.lesson.findFirst({
            where: { chapterId: chapter.id },
            orderBy: { serial: "desc" },
        });
        let currentLessonSerial = (lastLesson?.serial || 0) + 1;

        if (lessons && Array.isArray(lessons)) {
            for (const lessonData of lessons) {
                const { id: lessonId, name: lessonName } = lessonData;
                let lesson;

                if (lessonId) {
                    // Update existing lesson
                    lesson = await prisma.lesson.update({
                        where: { id: lessonId },
                        data: { name: lessonName },
                    });
                } else {
                    // Create new lesson
                    lesson = await prisma.lesson.create({
                        data: {
                            name: lessonName,
                            serial: currentLessonSerial++,
                            chapterId: chapter.id,
                        },
                    });
                }
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
