import baseApi from "../../baseApi";

export const boardService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addBoard: builder.mutation<
      { id: string; name: string; createdAt: string },
      { name: string }
    >({
      query: (data) => ({
        url: "/admin/board",
        method: "POST",
        body: data,
      }),
    }),
    updateBoard: builder.mutation<
      { id: string; name: string; createdAt: string },
      { id: string; data: { name?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/admin/board?id=${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteBoard: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/board?id=${id}`,
        method: "DELETE",
      }),
    }),
    getBoards: builder.query<
      {
        id: string;
        name: string;
        createdAt: string;
        _count: { classes: number };
      }[],
      void
    >({
      query: () => "/admin/board",
    }),
  }),
});

export const {
  useAddBoardMutation,
  useUpdateBoardMutation,
  useGetBoardsQuery,
  useDeleteBoardMutation,
} = boardService;
