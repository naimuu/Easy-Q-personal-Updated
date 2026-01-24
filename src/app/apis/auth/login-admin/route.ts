import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { encrypt } from "@/utils/JWT";
import { successResponse } from "@/utils/serverError";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";
import { emailLoginSchema } from "./_validation";

const adminLogin = catchAsync(async (req: NextRequest) => {
  const { email, password } = await emailLoginSchema.validate(await req.json());

  const admin = await prisma.users.findFirst({ where: { email } });

  if (!admin) throw new Error("Admin not found !");

  const isPassCorrect = await bcrypt.compare(password, admin.password);
  if (!isPassCorrect) throw new Error("Invalid Password !");

  const token = await encrypt(admin.id, admin.isAdmin, new Date(), 30);

  return successResponse({
    message: "Admin logged successfully!",
    admin,
    token,
  });
});

const adminCreate = catchAsync(async (req: NextRequest) => {
  const { email, password, name } = await req.json();
  if (!email || !password || !name) throw new Error("All fields are required");
  const admin = await prisma.users.findFirst({ where: { email } });
  if (admin) throw new Error("Admin already exists !");
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await prisma.users.create({
    data: {
      email,
      password: hashedPassword,
      name,
      isAdmin: true,
    },
  });
  const token = await encrypt(newAdmin.id, newAdmin.isAdmin, new Date(), 30);
  return successResponse({
    message: "Admin created successfully!",
    admin: newAdmin,
    token,
  });
});

export { adminLogin as POST, adminCreate as PUT };
