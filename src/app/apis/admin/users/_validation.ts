import * as yup from "yup";

export const createUserSchema = yup
  .object({
    name: yup
      .string()
      .required("Name is required")
      .min(2, "Name must be at least 2 characters"),
    email: yup.string().email("Invalid email format").optional(),
    phone: yup
      .string()
      .matches(/^(01[3-9]\d{8}|8801[3-9]\d{8})$/, "Invalid phone number format")
      .optional(),
    password: yup
      .string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    isAdmin: yup.boolean().default(false),
    credit: yup.number().min(0, "Credit cannot be negative").default(0),
  })
  .test(
    "email-or-phone",
    "Either email or phone must be provided",
    function (value) {
      return !!(value.email || value.phone);
    },
  );

export const updateUserSchema = yup.object({
  name: yup.string().min(2, "Name must be at least 2 characters").optional(),
  email: yup.string().email("Invalid email format").optional(),
  phone: yup
    .string()
    .matches(/^(01[3-9]\d{8}|8801[3-9]\d{8})$/, "Invalid phone number format")
    .optional(),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional(),
  isAdmin: yup.boolean().optional(),
  credit: yup.number().min(0, "Credit cannot be negative").optional(),
});
