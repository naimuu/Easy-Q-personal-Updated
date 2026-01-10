import { object, string } from "yup";

// Registration validation - either email or phone must be provided
export const flexibleRegisterSchema = object({
  name: string().required("নাম প্রয়োজন"),
  email: string().email("সঠিক ইমেইল দিন").optional(),
  phone: string()
    .matches(
      /^(01[3-9]\d{8}|8801[3-9]\d{8})$/,
      "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)",
    )
    .optional(),
  password: string()
    .required("পাসওয়ার্ড প্রয়োজন")
    .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
}).test(
  "email-or-phone",
  "ইমেইল অথবা ফোন নম্বর একটি অবশ্যই দিতে হবে",
  function (value) {
    return !!(value.email || value.phone);
  },
);

// OTP verification schema
export const otpVerificationSchema = object({
  otp: string().required("OTP প্রয়োজন").length(6, "OTP ৬ সংখ্যার হতে হবে"),
  token: string().required("টোকেন প্রয়োজন"),
});

// Login validation - either email or phone
export const flexibleLoginSchema = object({
  email: string().email("সঠিক ইমেইল দিন").optional(),
  phone: string()
    .matches(
      /^(01[3-9]\d{8}|8801[3-9]\d{8})$/,
      "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)",
    )
    .optional(),
  password: string()
    .required("পাসওয়ার্ড প্রয়োজন")
    .min(6, "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"),
}).test(
  "email-or-phone",
  "ইমেইল অথবা ফোন নম্বর একটি অবশ্যই দিতে হবে",
  function (value) {
    return !!(value.email || value.phone);
  },
);

// Send OTP request schema
export const sendOTPSchema = object({
  email: string().email("সঠিক ইমেইল দিন").optional(),
  phone: string()
    .matches(
      /^(01[3-9]\d{8}|8801[3-9]\d{8})$/,
      "সঠিক ফোন নম্বর দিন (01XXXXXXXXX)",
    )
    .optional(),
  purpose: string()
    .oneOf(["register", "login", "reset"], "Invalid purpose")
    .required(),
}).test(
  "email-or-phone",
  "ইমেইল অথবা ফোন নম্বর একটি অবশ্যই দিতে হবে",
  function (value) {
    return !!(value.email || value.phone);
  },
);
