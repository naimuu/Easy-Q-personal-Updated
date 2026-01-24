import baseApi from "../../baseApi";

export const chapterLesson = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChapters: builder.query<any[], string | undefined>({
      query: (bookId) => ({ url: `/admin/chapter?bookId=${bookId || ""}` }),
    }),
    createChapter: builder.mutation({
      query: (data) => ({
        url: "/admin/chapter",
        method: "POST",
        body: data,
      }),
    }),
    updateChapter: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/chapter?id=${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteChapter: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/chapter?id=${id}`,
        method: "DELETE",
      }),
    }),
    getLessons: builder.query<any[], void>({
      query: () => ({ url: "/admin/lesson" }),
    }),
    getBookCategories: builder.query<any[], string>({
      query: (bookId) => ({ url: `/admin/book-categories?bookId=${bookId}` }),
    }),
    createLesson: builder.mutation({
      query: (data) => ({
        url: "/admin/lesson",
        method: "POST",
        body: data,
      }),
    }),
    updateLesson: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/admin/lesson?id=${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteLesson: builder.mutation({
      query: ({ id }) => ({
        url: `/admin/lesson?id=${id}`,
        method: "DELETE",
      }),
    }),
    bulkCreateChapterLesson: builder.mutation({
      query: (data) => ({
        url: "/admin/bulk-chapter-lesson",
        method: "POST",
        body: data,
      }),
    }),
  }),
});
export const {
  useCreateChapterMutation,
  useCreateLessonMutation,
  useDeleteChapterMutation,
  useDeleteLessonMutation,
  useGetChaptersQuery,
  useGetLessonsQuery,
  useUpdateChapterMutation,
  useUpdateLessonMutation,
  useBulkCreateChapterLessonMutation,
  useGetBookCategoriesQuery,
} = chapterLesson;
