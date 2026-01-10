import * as yup from "yup";

export const featureSchema = yup.object({
  key: yup.string().required("Feature key is required").lowercase(),
  name: yup.string().required("Feature name is required"),
  isActive: yup.boolean().default(true),
});
