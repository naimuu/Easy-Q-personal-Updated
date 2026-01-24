import baseApi from "../../baseApi";

export const featureService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createFeature: builder.mutation<any, any>({
      query: (data) => ({
        url: "/admin/features",
        method: "POST",
        body: data,
      }),
    }),
    deleteFeature: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/features/${id}`,
        method: "DELETE",
      }),
    }),
    updateFeature: builder.mutation<any, { id: string; data: { isActive: boolean } }>({
      query: ({ id, data }) => ({
        url: `/admin/features/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    getFeatures: builder.query<any[], void>({
      query: () => "/admin/features",
      transformResponse: (response: any) => response.result || [],
    }),
  }),
});

export const {
  useCreateFeatureMutation,
  useDeleteFeatureMutation,
  useUpdateFeatureMutation,
  useGetFeaturesQuery,
} = featureService;
