import {
  CreateSubscriptionRequest,
  SubscriptionResponse,
} from "@/types/subscription";
import baseApi from "../../baseApi";

export const userSubscriptionService = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveSubscription: builder.query<SubscriptionResponse, void>({
      query: () => "/user/subscribe",
      transformResponse: (response: any) => response.result || {},
      providesTags: ["UserSubscription"],
    }),

    getAllSubscriptions: builder.query<any, void>({
      query: () => "/user/subscriptions",
      transformResponse: (response: any) => response.result || {},
      providesTags: ["UserSubscription"],
    }),

    createSubscription: builder.mutation<
      SubscriptionResponse,
      CreateSubscriptionRequest
    >({
      query: (data) => ({
        url: "/user/subscribe",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserSubscription"],
    }),

    switchSubscription: builder.mutation<any, { subscriptionId: string }>({
      query: (data) => ({
        url: "/user/subscriptions/switch",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["UserSubscription"],
    }),
  }),
});

export const {
  useGetActiveSubscriptionQuery,
  useGetAllSubscriptionsQuery,
  useCreateSubscriptionMutation,
  useSwitchSubscriptionMutation,
} = userSubscriptionService;
