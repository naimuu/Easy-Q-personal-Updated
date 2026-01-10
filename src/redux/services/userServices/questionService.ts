import { QuestionInput } from "@/app/apis/user/create-question/_validation";
import baseApi from "../../baseApi";

export const questionService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExams: builder.query<
      {
        examName: string;
        id: string;
        userId: string;
        user: { name: string; id: string };
      }[],
      string
    >({
      query: (type) => `/user/create-question/exams?type=${type}`,
    }),
    createExam: builder.mutation<any, QuestionInput>({
      query: (body) => ({
        url: `/user/create-question`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["UserQuestions", "UserDashboard"],
    }),
    getUserQuestions: builder.query<any[], any>({
      query: (query) => {
        return `/user/create-question?lessonId=${query.lessonId || ""}&chapterId=${query.chapterId || ""}&bookId=${query.bookId || ""}&search=${query.search || ""}`;
      },
      providesTags: (result, error, arg) => [
        { type: "UserQuestions", id: arg.bookId || "LIST" },
        "UserQuestions",
      ],
    }),
    getExamQuestions: builder.query<any[], any>({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/user/create-question/questions?${queryString}`;
      },
    }),
    deleteExamQuestions: builder.mutation<any[], any>({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return {
          url: `/user/create-question/questions?${queryString}`,
          method: "DELETE",
        };
      },
      invalidatesTags: ["UserQuestions"],
    }),
    getUserChapter: builder.query<any[], string>({
      query: (id) => `/user/chapter?bookId=${id}`,
      providesTags: (result, error, bookId) => [
        { type: "UserChapters", id: bookId },
        "UserChapters",
      ],
    }),
    getSetDetails: builder.query<any, string>({
      query: (id) => `/user/create-question/set?setId=${id}`,
      providesTags: (result, error, id) => [
        { type: "UserQuestions", id: id },
        "UserQuestions",
      ],
    }),
    updateSetQuestion: builder.mutation<any, { id: string; body: any }>({
      query: ({ id, body }) => ({
        url: `/user/create-question/set?id=${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["UserQuestions"],
    }),
    printQuestion: builder.mutation<any, { id: string }>({
      query: (body) => ({
        url: `/user/create-question/set`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetUserQuestionsQuery,
  useGetExamQuestionsQuery,
  useDeleteExamQuestionsMutation,
  useGetUserChapterQuery,
  useGetSetDetailsQuery,
  useUpdateSetQuestionMutation,
  usePrintQuestionMutation,
} = questionService;
