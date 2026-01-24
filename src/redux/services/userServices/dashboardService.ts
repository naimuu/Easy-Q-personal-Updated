import baseApi from "../../baseApi";

export const dashboardService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserDashboard: builder.query<{ question: any; books: any }, void>({
      query: () => `/user/dashboard`,
      providesTags: ["UserDashboard"],
    }),
    getUserBoard: builder.query<any[], void>({
      query: () => `/user/board`,
    }),
    getUserClass: builder.query<any[], void>({
      query: () => `/user/class`,
    }),
    getUserBooks: builder.query<any[], any>({
      query: (params) => {
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, v]) => v !== undefined && v !== null && v !== ""
          )
        ) as Record<string, string>;
        const query = new URLSearchParams(filteredParams).toString();
        return `/user/books?${query}`;
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useGetUserDashboardQuery,
  useGetUserBoardQuery,
  useGetUserClassQuery,
  useGetUserBooksQuery,
} = dashboardService;
