import baseApi from "../../baseApi";

const categoryCreateQuestionService = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getQuestions: builder.query<any[], string>({
            query: (id) => `/admin/question?lessonId=${id}`,
            providesTags: ["UserQuestions"],
        }),
        createQuestion: builder.mutation({
            query: (body) => ({
                url: "/admin/question",
                method: "POST",
                body,
            }),
            invalidatesTags: ["UserQuestions"],
        }),
        deleteQuestion: builder.mutation({
            query: ({ lessonId, categoryId, contextId }) => ({
                url: `/admin/question?lessonId=${lessonId}&categoryId=${categoryId}&contextId=${contextId || ""}`,
                method: "DELETE",
            }),
            invalidatesTags: ["UserQuestions"],
        }),
        updateQuestion: builder.mutation({
            query: ({ lessonId, categoryId, contextId, body }) => ({
                url: `/admin/question?lessonId=${lessonId}&categoryId=${categoryId}&contextId=${contextId || ""}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["UserQuestions"],
        }),
        updateCategory: builder.mutation({
            query: (body) => ({
                url: `/admin/category?id=${body.id}`,
                method: "PUT",
                body,
            }),
            invalidatesTags: ["UserQuestions"],
        }),
    }),
    overrideExisting: true,
});

export const {
    useCreateQuestionMutation,
    useGetQuestionsQuery,
    useDeleteQuestionMutation,
    useUpdateQuestionMutation,
    useUpdateCategoryMutation,
} = categoryCreateQuestionService;
