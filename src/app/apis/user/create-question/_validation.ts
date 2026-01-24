import { InferType, number, object, string } from "yup";

const questionSchema = object({
  instituteId: string().required(),
  bookId: string().required(),
  classId: string().required(),
  boardId: string().required(),
  subject: string().required(),
  examsId: string(),
  examName: string(),
  durationHour: string().required(),
  durationMinute: string().required(),
  totalMarks: string().required(),
  type: string().required().oneOf(["en", "bn", "ar"]),
  bookName: string(),
  className: string().required("Class name is required"),
});
export { questionSchema };
export type QuestionInput = InferType<typeof questionSchema>;
