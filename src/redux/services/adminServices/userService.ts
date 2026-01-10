import baseApi from "../../baseApi";

export const userAdminService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      {
        users: any[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      },
      {
        page?: number;
        limit?: number;
        search?: string;
        isAdmin?: boolean;
      }
    >({
      query: (params = {}) => ({
        url: "/admin/users",
        params,
      }),
      transformResponse: (response: any) =>
        response.result || { users: [], pagination: {} },
    }),
    getUserDetails: builder.query<any, string>({
      query: (id) => `/admin/users/${id}`,
      transformResponse: (response: any) => response.result || null,
    }),
    createUser: builder.mutation<any, any>({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        body: data,
      }),
    }),
    updateUser: builder.mutation<any, { id: string; data: any }>({
      query: ({ id, data }) => ({
        url: `/admin/users/${id}`,
        method: "PATCH",
        body: data,
      }),
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/users/${id}`,
        method: "DELETE",
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userAdminService;
