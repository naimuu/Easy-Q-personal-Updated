import prisma from "@/config/prisma";
import authenticateUserWithSession from "@/utils/authenticateUserWithSession";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { trackQuestionSetUsage } from "@/utils/trackSubscriptionUsage";
import { NextRequest } from "next/server";
import { questionSchema } from "./_validation";

function groupQuestionsByCategory(questions: any[]) {
  const categoryMap = new Map<
    string,
    {
      id: string;
      name: string;
      type: string;
      questions: any[];
    }
  >();

  for (const q of questions) {
    const catId = q.category.id;

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        id: q.category.id,
        name: q.category.name,
        type: q.category.type,
        questions: [],
      });
    }

    categoryMap.get(catId)!.questions.push(q);
  }

  return Array.from(categoryMap.values());
}
const createQuestion = catchAsync(async (req: NextRequest) => {
  const data = await questionSchema.validate(await req.json());
  const { user } = await authenticateUserWithSession(req);

  // Track usage before creating question set
  const usageTracking = await trackQuestionSetUsage(user.id);

  // Get the user's CURRENTLY SELECTED subscription (userActive: true)
  // This is the subscription the user is actively using for question creation
  const userSelectedSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
      userActive: true, // User has selected this one
      isActive: true, // Admin has approved it
      endDate: { gte: new Date() }, // Not expired
      payment: {
        paymentStatus: "completed",
      },
    },
  });

  if (!userSelectedSubscription) {
    throw new Error(
      "No active subscription found. Please select a subscription.",
    );
  }

  let exam;
  if (data.examsId) {
    exam = await prisma.exams.findUnique({
      where: {
        id: data.examsId,
      },
    });
  }
  if (!exam) {
    if (!data.examName) throw new Error("Exam name required!");
    exam = await prisma.exams.create({
      data: { examName: data.examName, usersId: user.id, type: data.type },
    });
  }
  const q = await prisma.question_set.create({
    data: {
      userId: user.id,
      boardId: data.boardId,
      bookId: data.bookId,
      classId: data.classId,
      durationHour: data.durationHour,
      durationMinute: data.durationMinute,
      examsId: exam.id,
      instituteId: data.instituteId,
      subject: data.subject,
      type: data.type,
      totalMarks: data.totalMarks,
      bookName: data.bookName,
      className: data.className,
      subscriptionId: userSelectedSubscription.id, // Link to user's SELECTED subscription
    },
  });

  return successResponse({
    questionSet: q,
    usage: usageTracking,
  });
});
const getQuestion = catchAsync(async (req: NextRequest) => {
  const bookId = req.nextUrl.searchParams.get("bookId");
  const chapterId = req.nextUrl.searchParams.get("chapterId");
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const search = req.nextUrl.searchParams.get("search") || "";

  if (!bookId) throw new Error("Invalid book id");

  // 🔹 Step 1: get chapterIds
  const chapters = await prisma.chapter.findMany({
    where: {
      bookId,
      ...(chapterId && { id: chapterId }),
    },
    select: { id: true },
  });
  const chapterIds = chapters.map((c: any) => c.id);

  // 🔹 Step 2: get lessonIds
  let lessons = await prisma.lesson.findMany({
    where: {
      ...(lessonId
        ? { id: lessonId } // direct lesson filter
        : { chapterId: { in: chapterIds } }),
    },
    select: { id: true },
  });
  const lessonIds = lessons.map((l: any) => l.id);

  // 🔹 Step 3: Fetch ALL data in parallel (optimized - only 2 queries instead of N+1)
  const [allContexts, allQuestions] = await Promise.all([
    // Query 1: Get all contexts with their questions in one go
    prisma.context.findMany({
      where: {
        lessonId: { in: lessonIds },
        ...(search && {
          OR: [
            { text: { contains: search, mode: "insensitive" } },
            {
              questions: {
                some: {
                  question: { contains: search, mode: "insensitive" },
                },
              },
            },
          ],
        }),
      },
      include: {
        questions: {
          where: {
            ...(search && {
              question: { contains: search, mode: "insensitive" },
            }),
          },
          include: {
            options: true,
            category: true,
          },
        },
        category: true,
        lesson: {
          include: {
            chapter: true,
          },
        },
      },
    }),
    // Query 2: Get all non-context questions in one go
    prisma.questions.findMany({
      where: {
        lessonId: { in: lessonIds },
        context: { is: null },
        ...(search && {
          OR: [
            { question: { contains: search, mode: "insensitive" } },
            { details: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        options: true,
        category: true,
        lesson: {
          include: {
            chapter: true,
          },
        },
      },
    }),
  ]);

  // Group contexts by category
  const contextsByCategory = new Map<string, typeof allContexts>();
  allContexts.forEach((ctx: any) => {
    const catId = ctx.categoryId;
    if (!contextsByCategory.has(catId)) {
      contextsByCategory.set(catId, []);
    }
    contextsByCategory.get(catId)!.push(ctx);
  });

  // Group questions by category
  const questionsByCategory = new Map<string, typeof allQuestions>();
  allQuestions.forEach((q: any) => {
    const catId = q.categoryId;
    if (!questionsByCategory.has(catId)) {
      questionsByCategory.set(catId, []);
    }
    questionsByCategory.get(catId)!.push(q);
  });

  // Get unique categories
  const categoryIds = new Set([
    ...Array.from(contextsByCategory.keys()),
    ...Array.from(questionsByCategory.keys()),
  ]);

  // Fetch categories metadata
  const categories = await prisma.category.findMany({
    where: {
      id: { in: Array.from(categoryIds) },
    },
  });

  // Build final result
  const final = categories.map((category: any) => {
    const contexts = contextsByCategory.get(category.id) || [];
    const questions = questionsByCategory.get(category.id) || [];

    if (contexts.length > 0) {
      // Has context-based questions (passage-based)
      const groupedContexts = contexts.map((ctx: any) => {
        const contextQuestions = ctx.questions || [];
        const grouped = groupQuestionsByCategory(contextQuestions);
        return { id: ctx.id, text: ctx.text, questions: grouped };
      });

      return {
        ...category,
        questions: groupedContexts,
      };
    } else {
      // Regular questions
      return {
        ...category,
        questions: questions,
      };
    }
  });

  return successResponse(final.filter((d: any) => d.questions.length > 0));
});
export { getQuestion as GET, createQuestion as POST };
