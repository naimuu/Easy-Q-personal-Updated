import baseApi from "../../baseApi";

export const classService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    addClass: builder.mutation<any, { name: string; boardId: string }>({
      query: (data) => ({
        url: "/admin/class",
        method: "POST",
        body: data,
      }),
    }),
    updateClass: builder.mutation<any, { id: string; data: { name: string } }>({
      query: ({ id, data }) => ({
        url: `/admin/class?id=${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    deleteClass: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/class?id=${id}`,
        method: "DELETE",
      }),
    }),
    getClasses: builder.query<any[], void>({
      query: () => "/admin/class",
    }),
  }),
});

export const {
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassesQuery,
} = classService;
