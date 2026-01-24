import baseApi from "../../baseApi";
import { Payment } from "@/types/subscription";

interface CreatePaymentRequest {
  packageId: string;
  phoneNumber: string;
  transactionId: string;
  paymentMethod: string;
}


export const userPaymentService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserPayments: builder.query<Payment[], void>({
      query: () => "/user/payment",
      transformResponse: (response: any) => response.result || [],
    }),

    createPayment: builder.mutation<Payment, CreatePaymentRequest>({
      query: (data) => ({
        url: "/user/payment",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const { useGetUserPaymentsQuery, useCreatePaymentMutation } =
  userPaymentService;
