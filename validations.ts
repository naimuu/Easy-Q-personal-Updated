import * as yup from "yup";

export const registerSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
  name: yup.string().required(),
});

import { object, string } from "yup";
export const verifyMailOtpSchema = object({
  otp: string().length(6).required(),
});
export const categorySchema = object({
  name: string().required(),
  type: string()
    .required()
    .oneOf([
      "objective",
      "single-question",
      "table",
      "fill-gap",
      "right-wrong",
      "passage-based",
      "word",
      "no",
      "no",
      "stack-fraction",
    ]),
  isRTL: yup.boolean().optional(),
});
export const chapterSchem = object({
  name: string().required(),
  serial: yup.number().required(),
  bookId: string().required(),
});
export const lessonSchem = object({
  name: string().required(),
  serial: yup.number().required(),
  chapterId: string().required(),
});
export const questionSchema = object({
  question: string().required(),
  categoryId: string().required(),
  details: string(),
  table: string(),
  lessonId: string().required(),
  option: yup.array(string().required()),
});
export const questionUpdateSchema = object({
  question: string().required(),
  categoryId: string().required(),
  details: string(),
  table: string(),
  lessonId: string().required(),
  option: yup.array(string().required()),
  id: yup.string().required(),
});
export const descriptionBaseQuestionSchema = object({
  context: yup.string(),
  question: yup.array(questionSchema.required()).required(),
  categoryId: string().required(),
  lessonId: string().required(),
});
export const descriptionBaseQuestionUpdateSchema = object({
  context: yup.string(),
  question: yup.array(questionUpdateSchema.required()).required(),
});
