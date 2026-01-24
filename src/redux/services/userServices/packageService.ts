import baseApi from "../../baseApi";
import { Package } from "@/types/package";

interface PackageWithFeatureNames extends Package {
  featureNames?: { [key: string]: string };
}

export const userPackageService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShowcasePackages: builder.query<PackageWithFeatureNames[], void>({
      query: () => "/packages",
      transformResponse: (response: any) => response.result || [],
    }),
  }),
});

export const { useGetShowcasePackagesQuery } = userPackageService;
