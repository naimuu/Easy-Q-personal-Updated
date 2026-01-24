import baseApi from "../../baseApi";

export const packageService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPackages: builder.query<any[], void>({
      query: () => "/packages",
      transformResponse: (response: any) => response.result || [],
    }),
    getPackagesForAdmin: builder.query<any[], void>({
      query: () => "/admin/packages",
      transformResponse: (response: any) => response.result || [],
    }),
    createPackage: builder.mutation<any, any>({
      query: (data) => ({
        url: "/admin/packages",
        method: "POST",
        body: data,
      }),
    }),
    updatePackage: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/packages/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deletePackage: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/packages/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetPackagesQuery,
  useGetPackagesForAdminQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} = packageService;
