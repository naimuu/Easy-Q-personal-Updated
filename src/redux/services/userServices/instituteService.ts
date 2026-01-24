import baseApi from "../../baseApi";

export const instituteService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInstitute: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/user/institute",
        method: "POST",
        body: formData,
      }),
    }),
    updateInstitute: builder.mutation<any, { id: string; body: FormData }>({
      query: ({ id, body }) => ({
        url: `/user/institute?id=${id}`,
        method: "PUT",
        body: body,
      }),
    }),
    getInstitutes: builder.query({
      query: (params) => {
        const queryString = new URLSearchParams(params).toString();
        return `/user/institute?${queryString}`;
      },
    }),
    deleteInstitute: builder.mutation({
      query: (id: string) => ({
        url: `/user/institute?id=${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useGetInstitutesQuery,
  useDeleteInstituteMutation,
} = instituteService;
