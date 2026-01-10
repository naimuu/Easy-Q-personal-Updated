import baseApi from "../../baseApi";

export const bookService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addBook: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/admin/books",
        method: "POST",
        body: formData,
      }),
    }),
    updateBook: builder.mutation<any, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url: `/admin/books?id=${id}`,
        method: "PUT",
        body: formData,
      }),
    }),
    deleteBook: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/books?id=${id}`,
        method: "DELETE",
      }),
    }),
    getBooks: builder.query<any[], void>({
      query: () => "/admin/books",
    }),
  }),
});

export const {
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBooksQuery,
} = bookService;
