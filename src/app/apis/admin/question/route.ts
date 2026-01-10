import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import { array, object, string } from "yup";
import {
  descriptionBaseQuestionSchema,
  descriptionBaseQuestionUpdateSchema,
  questionSchema,
} from "../../../../../validations";
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
  // const type = req.nextUrl.searchParams.get("type");
  const data = await descriptionBaseQuestionSchema.validate(await req.json());

  let result: any;

  if (data.context) {
    const context = await prisma.context.create({
      data: {
        text: data.context,
        lessonId: data.lessonId,
        categoryId: data.categoryId,
      },
    });

    result = await Promise.all(
      data.question.map(async (q) => {
        const createdQuestion = await prisma.questions.create({
          data: {
            categoryId: q.categoryId,
            lessonId: q.lessonId,
            question: q.question,
            details: q.details,
            table: q.table,
            contextId: context.id,
          },
        });

        if (q.option?.length) {
          await prisma.options.createMany({
            data: q.option.map((opt) => ({
              name: opt,
              questionId: createdQuestion.id,
              categoryId: q.categoryId,
              lessonId: q.lessonId,
              contextId: context.id,
            })),
          });
        }

        return createdQuestion;
      }),
    );
  } else {
    result = await Promise.all(
      data.question.map(async (q) => {
        const createdQuestion = await prisma.questions.create({
          data: {
            categoryId: q.categoryId,
            lessonId: q.lessonId,
            question: q.question,
            details: q.details,
            table: q.table,
          },
        });

        if (q.option?.length) {
          await prisma.options.createMany({
            data: q.option.map((opt) => ({
              name: opt,
              questionId: createdQuestion.id,
              categoryId: q.categoryId,
              lessonId: q.lessonId,
            })),
          });
        }

        return createdQuestion;
      }),
    );
  }

  return successResponse(result);
});

const updateQuestion = catchAsync(async (req: NextRequest) => {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const contextId = req.nextUrl.searchParams.get("contextId");
  if (!lessonId || !categoryId) throw new Error("Id is required!");
  const data = await descriptionBaseQuestionSchema.validate(await req.json());

  let result: any;
  if (contextId) {
    const context = await prisma.context.update({
      data: { text: data.context },
      where: { id: contextId },
    });
    await prisma.questions.deleteMany({
      where: {
        contextId: contextId,
      },
    });
    await prisma.options.deleteMany({
      where: {
        contextId: contextId,
      },
    });
    result = await Promise.all(
      data.question.map(async (q) => {
        const createdQuestion = await prisma.questions.create({
          data: {
            categoryId: q.categoryId,
            lessonId: q.lessonId,
            question: q.question,
            details: q.details,
            table: q.table,
            contextId: context.id,
          },
        });

        if (q.option?.length) {
          await prisma.options.createMany({
            data: q.option.map((opt) => ({
              name: opt,
              questionId: createdQuestion.id,
              categoryId: q.categoryId,
              lessonId: q.lessonId,
              contextId: context.id,
            })),
          });
        }

        return createdQuestion;
      }),
    );
  } else {
    await prisma.questions.deleteMany({
      where: {
        categoryId: categoryId,
        lessonId: lessonId,
      },
    });
    await prisma.options.deleteMany({
      where: {
        categoryId: categoryId,
        lessonId: lessonId,
      },
    });
    result = await Promise.all(
      data.question.map(async (q) => {
        const createdQuestion = await prisma.questions.create({
          data: {
            categoryId: q.categoryId,
            lessonId: q.lessonId,
            question: q.question,
            details: q.details,
            table: q.table,
          },
        });

        if (q.option?.length) {
          await prisma.options.createMany({
            data: q.option.map((opt) => ({
              name: opt,
              questionId: createdQuestion.id,
              categoryId: q.categoryId,
              lessonId: q.lessonId,
            })),
          });
        }

        return createdQuestion;
      }),
    );
  }

  return successResponse(result);
});

const getQuestion = catchAsync(async (req: NextRequest) => {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  if (!lessonId) throw new Error("Invalid lesson id");
  const category = await prisma.category.findMany({
    where: {
      OR: [
        {
          questions: {
            some: {
              lessonId: lessonId,
            },
          },
        },
        {
          context: {
            some: {
              lessonId: lessonId,
            },
          },
        },
      ],
    },
  });

  const final = await Promise.all(
    category.map(async (d : any) => {
      //console.log(d.type);
      if (d.type === "passage-based") {
        const data = await prisma.context.findMany({
          where: {
            categoryId: d.id,
            lessonId: lessonId,
          },
          include: {
            questions: {
              include: {
                options: true,
                category: true,
              },
            },
          },
        });
        const newD = data.map((s : any) => {
          const nnewData = groupQuestionsByCategory(s.questions);
          return { id: s.id, text: s.text, questions: nnewData };
        });
        return { ...d, questions: newD };
      } else {
        const data = await prisma.questions.findMany({
          where: {
            lessonId: lessonId,
            categoryId: d.id,
            context: {
              is: null,
            },
          },
          include: {
            options: true,
          },
        });
        return { ...d, questions: data };
      }
    }),
  );
  return successResponse(final.filter((d) => d.questions.length > 0));
});
const deleteCategory = catchAsync(async (req: NextRequest) => {
  const lessonId = req.nextUrl.searchParams.get("lessonId");
  const categoryId = req.nextUrl.searchParams.get("categoryId");
  const contextId = req.nextUrl.searchParams.get("contextId");
  if (!lessonId || !categoryId) throw new Error("Id is required!");
  if (contextId) {
    await prisma.context.delete({ where: { id: contextId } });
  }

  const board = await prisma.questions.deleteMany({
    where: {
      lessonId: lessonId,
      categoryId: categoryId,
      contextId: contextId || undefined,
    },
  });
  await prisma.options.deleteMany({
    where: {
      categoryId: categoryId,
      lessonId: lessonId,
      contextId: contextId || undefined,
    },
  });

  return successResponse(board);
});
export {
  deleteCategory as DELETE,
  getQuestion as GET,
  updateQuestion as PUT,
  createQuestion as POST,
};
