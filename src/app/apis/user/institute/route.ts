import prisma from "@/config/prisma";
import authenticateUserWithSession from "@/utils/authenticateUserWithSession";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { uploadImage } from "@/utils/uploadImage";
import { NextRequest } from "next/server";
import { object } from "yup";

const createInstitute = catchAsync(async (req: NextRequest) => {
  const formData = await req.formData();
  const image = formData.get("image") as File;
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const phone = formData.get("phone") as string;
  const user = await authenticateUserWithSession(req);
  if (!name || !phone)
    throw new Error("image, name, address,phone is required!");
  const imageUrl = image ? await uploadImage(image) : undefined;
  const institute = await prisma.institute.create({
    data: {
      address: address || undefined,
      image: imageUrl,
      name: name,
      userId: user.userId,
      phone: phone,
    },
  });
  return successResponse(institute);
});

const updateInstitute = catchAsync(async (req: NextRequest) => {
  const formData = await req.formData();
  const image = formData.get("image") as File;
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Invalid Id");
  const user = await authenticateUserWithSession(req);
  const imageUrl = image ? await uploadImage(image) : undefined;

  const institute = await prisma.institute.update({
    where: { id: id },
    data: {
      name: name || undefined,
      image: imageUrl,
      address: address || undefined,
    },
  });
  return successResponse(institute);
});
const deleteInstitute = catchAsync(async (req: NextRequest) => {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) throw new Error("Invalid Id");

  const institute = await prisma.institute.delete({ where: { id: id } });
  await prisma.question_set.deleteMany({
    where: {
      instituteId: id,
    },
  });
  return successResponse(institute);
});

const getInstitute = catchAsync(async (req: NextRequest) => {
  const search = req.nextUrl.searchParams.get("search") || "";
  const sort = req.nextUrl.searchParams.get("sort") || "date-desc";
  const { userId } = await authenticateUserWithSession(req);

  // Handle sorting
  let orderBy: any = {};
  switch (sort) {
    case "name-asc":
      orderBy = { name: "asc" };
      break;
    case "name-desc":
      orderBy = { name: "desc" };
      break;
    case "date-desc":
    default:
      orderBy = { date: "desc" }; // Adjust to your field name (e.g., createdAt)
      break;
  }

  // Handle filters
  const where: any = {
    userId: userId,
  };

  if (search) {
    where.name = {
      contains: search,
      mode: "insensitive",
    };
  }

  const institutes = await prisma.institute.findMany({
    where,
    orderBy,
  });

  return successResponse(institutes);
});

export {
  getInstitute as GET,
  createInstitute as POST,
  updateInstitute as PUT,
  deleteInstitute as DELETE,
};
