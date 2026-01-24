import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { createUserSchema } from "./_validation";

/**
 * GET /apis/admin/users
 * Get all users with pagination and filtering
 */
const getUsers = catchAsync(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const isAdmin = searchParams.get("isAdmin");

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  if (isAdmin !== null && isAdmin !== undefined) {
    where.isAdmin = isAdmin === "true";
  }

  // Get users with counts
  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        isAdmin: true,
        credit: true,
        createAt: true,
        passwordUpdateAt: true,
        _count: {
          select: {
            institute: true,
            question_set: true,
            exams: true,
            subscriptions: true,
            payments: true,
          },
        },
      },
      orderBy: { createAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.users.count({ where }),
  ]);

  return successResponse({
    result: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

/**
 * POST /apis/admin/users
 * Create a new user
 * Admin only
 */
const createUser = catchAsync(async (req: NextRequest) => {
  const data = await req.json();

  // Validate input
  const validatedData = await createUserSchema.validate(data, {
    stripUnknown: false,
    abortEarly: false,
  });

  // Check if email already exists
  if (validatedData.email) {
    const existingUser = await prisma.users.findFirst({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
  }

  // Check if phone already exists
  if (validatedData.phone) {
    const existingUser = await prisma.users.findFirst({
      where: { phone: validatedData.phone },
    });

    if (existingUser) {
      throw new Error("User with this phone number already exists");
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);

  // Create user
  const user = await prisma.users.create({
    data: {
      name: validatedData.name,
      email: validatedData.email,
      password: hashedPassword,
      isAdmin: validatedData.isAdmin || false,
      credit: validatedData.credit || 0,
    },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      credit: true,
      createAt: true,
      passwordUpdateAt: true,
    },
  });

  return successResponse({
    result: user,
    message: "User created successfully",
  });
});

export { getUsers as GET, createUser as POST };
