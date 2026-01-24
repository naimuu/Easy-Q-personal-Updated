import baseApi from "../../baseApi";
import { Payment, PaymentVerificationRequest } from "@/types/subscription";

export interface PaymentFilter {
  page?: number;
  limit?: number;
  status?: string;
  userId?: string;
  search?: string;
  searchType?: "all" | "phone" | "txId" | "paymentId";
  sortBy?: "createdAt" | "finalPrice";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPaymentResponse {
  data: Payment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const adminPaymentService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminPayments: builder.query<PaginatedPaymentResponse, PaymentFilter | void>({
      query: (filters) => {
        const params = new URLSearchParams();

        if (filters && typeof filters === "object" && !Array.isArray(filters)) {
          if (filters.page) params.append("page", String(filters.page));
          if (filters.limit) params.append("limit", String(filters.limit));
          if (filters.status) params.append("status", filters.status);
          if (filters.userId) params.append("userId", filters.userId);
          if (filters.search) params.append("search", filters.search);
          if (filters.searchType) params.append("searchType", filters.searchType);
          if (filters.sortBy) params.append("sortBy", filters.sortBy);
          if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);
        }

        return `/admin/payments?${params.toString()}`;
      },
      transformResponse: (response: any) => response.result || { data: [], pagination: { total: 0, page: 1, limit: 10, pages: 0 } },
      providesTags: ["AdminPayments"],
    }),

    verifyPayment: builder.mutation<
      Payment,
      { paymentId: string; data: PaymentVerificationRequest }
    >({
      query: ({ paymentId, data }) => ({
        url: `/admin/payments/verify/${paymentId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["AdminPayments", "AdminSubscriptions"],
    }),
  }),
});

export const { useGetAdminPaymentsQuery, useVerifyPaymentMutation } =
  adminPaymentService;