import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "./store";

// Define the base API
export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/apis", // Replace with your API base URL
    prepareHeaders: (headers, { getState }) => {
      // Attach the auth token if available
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: [
    "AdminSubscriptions",
    "AdminPayments",
    "UserSubscription",
    "Features",
    "Packages",
    "UserQuestions",
    "UserChapters",
    "User",
    "UserDashboard",
  ],
  endpoints: () => ({}), // Will be extended later
});

export default baseApi;
