// Barrel file for user services - exports all hooks from individual service files
export {
  useGetUserDashboardQuery,
  useGetUserBoardQuery,
  useGetUserClassQuery,
  useGetUserBooksQuery,
} from "./userServices/dashboardService";

export {
  useCreateInstituteMutation,
  useUpdateInstituteMutation,
  useGetInstitutesQuery,
  useDeleteInstituteMutation,
} from "./userServices/instituteService";

export {
  useGetExamsQuery,
  useCreateExamMutation,
  useGetUserQuestionsQuery,
  useGetExamQuestionsQuery,
  useDeleteExamQuestionsMutation,
  useGetUserChapterQuery,
  useGetSetDetailsQuery,
  useUpdateSetQuestionMutation,
  usePrintQuestionMutation,
} from "./userServices/questionService";

export {
  useGetShowcasePackagesQuery,
} from "./userServices/packageService";

export {
  useGetFeaturesQuery,
} from "./userServices/featureService";

export {
  useGetActiveSubscriptionQuery,
  useCreateSubscriptionMutation,
} from "./userServices/purchaseSubscriptionService";

export {
  useGetUserPaymentsQuery,
  useCreatePaymentMutation,
} from "./userServices/paymentService";
