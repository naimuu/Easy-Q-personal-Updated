import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import * as yup from "yup";

const updateProfileSchema = yup.object({
  name: yup.string().required("Name is required"),
  email: yup.string().email("Invalid email").optional(),
  phone: yup.string().optional(),
});

const updateProfile = catchAsync(async (req: NextRequest) => {
  const token = req.headers.get("USER");
  if (!token) throw new Error("Please login!");
  const { userId: id } = JSON.parse(token);

  const body = await req.json();
  const validatedData = await updateProfileSchema.validate(body);

  const updatedUser = await prisma.users.update({
    where: { id },
    data: validatedData,
  });

  return successResponse({ result: updatedUser });
});

export { updateProfile as PUT };
