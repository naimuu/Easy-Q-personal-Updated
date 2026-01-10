import * as yup from "yup";

export const packageSchema = yup.object({
  name: yup.string().required("Package name is required"),
  slug: yup.string().required("Slug is required").lowercase(),
  numberOfQuestions: yup.number().typeError("Number of questions must be a number").min(0).required("Number of questions is required"),
  displayName: yup.string().required("Display name is required"),
  price: yup.number().optional(),
  offerPrice: yup.number().min(0).optional().nullable(),
  currency: yup.string().default("BDT"),
  duration: yup
    .string()
    .oneOf(["monthly", "yearly", "lifetime"])
    .required("Duration is required"),
  isActive: yup.boolean().default(true),
  features: yup.object().default({}),
  limits: yup.object().default({}),
  sortOrder: yup.number().default(1),
});

export const subscribeSchema = yup.object({
  packageId: yup.string().required("Package ID is required"),
  duration: yup
    .string()
    .oneOf(["monthly", "yearly", "lifetime"])
    .required("Duration is required"),
});

export const featureSchema = yup.object({
  key: yup.string().required("Feature key is required").lowercase(),
  name: yup.string().required("Feature name is required"),
  description: yup.string().optional(),
  category: yup.string().optional(),
  isActive: yup.boolean().default(true),
});

export const updatePackageSchema = yup.object({
  name: yup.string().optional(),
  numberOfQuestions: yup.number().typeError("Number of questions must be a number").min(0).optional(),
  displayName: yup.string().optional(),
  price: yup.number().min(0).optional(),
  offerPrice: yup.number().min(0).optional().nullable(),
  currency: yup.string().optional(),
  duration: yup
    .string()
    .oneOf(["monthly", "yearly", "lifetime"])
    .optional(),
  isActive: yup.boolean().optional(),
  features: yup.object().optional(),
  limits: yup.object().optional(),
  sortOrder: yup.number().optional(),
});

