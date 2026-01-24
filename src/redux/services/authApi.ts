import { LoginFormData } from "@/app/auth/login/SignInForm";
import { EmailRegisterType } from "@/app/auth/register/SignUpForm";
import { Admin, AuthResponse, UserResponse } from "@/types/apiTypes";
import baseApi from "../baseApi";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginFormData>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, EmailRegisterType>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
    }),
    sendOTP: builder.mutation<AuthResponse, string>({
      query: (credentials) => ({
        url: "/auth/verify-mail",
        method: "POST",
        body: { otp: credentials },
      }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: "/user/update-user",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({
        url: "/user/update-password",
        method: "PUT",
        body,
      }),
    }),
    sentResetpassMail: builder.mutation({
      query: (body) => ({
        url: "/auth/send-reset-mail",
        method: "POST",
        body,
      }),
    }),
    getUser: builder.query<UserResponse, void>({
      query: () => `/user`,
      providesTags: ["User"],
    }),
    getAdmin: builder.query<{ admin: Admin }, void>({
      query: () => `/admin/details`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetAdminQuery,
  useGetUserQuery,
  useResetPasswordMutation,
  useSendOTPMutation,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useSentResetpassMailMutation,
} = authApi;
