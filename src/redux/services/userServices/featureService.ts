import baseApi from "../../baseApi";
import { Feature } from "@/types/feature.d";

export const userFeatureService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFeatures: builder.query<Feature[], void>({
      query: () => "/features",
      transformResponse: (response: any) => response.result || [],
    }),
  }),
});

export const { useGetFeaturesQuery } = userFeatureService;
