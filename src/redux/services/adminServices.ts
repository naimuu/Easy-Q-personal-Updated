// Barrel file for admin services - exports all hooks from individual service files
export {
  useAddBoardMutation,
  useUpdateBoardMutation,
  useGetBoardsQuery,
  useDeleteBoardMutation,
} from "./adminServices/boardService";

export {
  useAddClassMutation,
  useUpdateClassMutation,
  useDeleteClassMutation,
  useGetClassesQuery,
} from "./adminServices/classService";

export {
  useAddBookMutation,
  useUpdateBookMutation,
  useDeleteBookMutation,
  useGetBooksQuery,
} from "./adminServices/bookService";

export {
  useCreateFeatureMutation,
  useDeleteFeatureMutation,
  useUpdateFeatureMutation,
  useGetFeaturesQuery,
} from "./adminServices/featureService";

export {
  useGetPackagesQuery,
  useGetPackagesForAdminQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
} from "./adminServices/packageService";

export {
  useGetAdminSubscriptionsQuery,
  useGetSubscriptionForVerificationQuery,
  useVerifySubscriptionMutation,
} from "./adminServices/subscriptionService";

export {
  useGetAdminPaymentsQuery,
  useVerifyPaymentMutation,
} from "./adminServices/paymentService";

export {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "./adminServices/userService";
