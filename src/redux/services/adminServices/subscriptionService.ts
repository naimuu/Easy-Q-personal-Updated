import { Subscription } from "@/types/subscription";
import baseApi from "../../baseApi";

interface VerifySubscriptionRequest {
  isActive: boolean;
}

interface SubscriptionVerificationResponse {
  subscription: Subscription;
  payment: any;
  package: any;
  user: any;
  canActivate?: boolean;
  canDeactivate?: boolean;
}

export interface SubscriptionFilter {
  page?: number;
  limit?: number;
  isActive?: boolean;
  paymentStatus?: string;
  paymentMethod?: string;
  userId?: string;
  search?: string;
  sortBy?: "createdAt" | "endDate" | "startDate";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSubscriptionResponse {
  data: Subscription[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const adminSubscriptionService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminSubscriptions: builder.query<
      PaginatedSubscriptionResponse,
      SubscriptionFilter | void
    >({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters && typeof filters === "object" && !Array.isArray(filters)) {
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
          if (filters.isActive !== undefined)
            params.append("isActive", String(filters.isActive));
          if (filters.paymentStatus)
            params.append("paymentStatus", filters.paymentStatus);
          if (filters.paymentMethod)
            params.append("paymentMethod", filters.paymentMethod);
          if (filters.userId) params.append("userId", filters.userId);
          if (filters.search) params.append("search", filters.search);
          if (filters.sortBy) params.append("sortBy", filters.sortBy);
          if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        }

        return `/admin/subscription?${params.toString()}`;
      },
      transformResponse: (response: any) =>
        response.result || {
          data: [],
          pagination: { total: 0, page: 1, limit: 10, pages: 0 },
        },
      providesTags: ["AdminSubscriptions"],
    }),

    getSubscriptionForVerification: builder.query<
      SubscriptionVerificationResponse,
      string
    >({
      query: (subscriptionId) => `/admin/subscription/verify/${subscriptionId}`,
      transformResponse: (response: any) => response.result || {},
    }),

    verifySubscription: builder.mutation<
      SubscriptionVerificationResponse,
      { subscriptionId: string; data: VerifySubscriptionRequest }
    >({
      query: ({ subscriptionId, data }) => ({
        url: `/admin/subscription/verify/${subscriptionId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminSubscriptions"],
    }),

    deleteSubscription: builder.mutation<
      { deletedSubscription: Subscription },
      string
    >({
      query: (subscriptionId) => ({
        url: `/admin/subscription?id=${subscriptionId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["AdminSubscriptions"],
    }),
  }),
});

export const {
  useGetAdminSubscriptionsQuery,
  useGetSubscriptionForVerificationQuery,
  useVerifySubscriptionMutation,
  useDeleteSubscriptionMutation,
} = adminSubscriptionService;
