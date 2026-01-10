import prisma from "@/config/prisma";
import catchAsync from "@/utils/catchAsync";
import { successResponse } from "@/utils/serverError";
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { updateUserSchema } from "../_validation";

/**
 * GET /apis/admin/users/:id
 * Get a specific user by ID
 */
const getUser = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const user = await prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        credit: true,
        createAt: true,
        passwordUpdateAt: true,
        institute: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
            date: true,
          },
        },
        _count: {
          select: {
            question_set: true,
            exams: true,
            subscriptions: true,
            payments: true,
          },
        },
        subscriptions: {
          select: {
            id: true,
            package: {
              select: {
                displayName: true,
                duration: true,
              },
            },
            startDate: true,
            endDate: true,
            isActive: true,
          },
          orderBy: { startDate: "desc" },
          take: 1, // Get latest subscription
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return successResponse({ result: user });
  },
);

/**
 * PUT /apis/admin/users/:id
 * Full update of user
 * Admin only
 */
const updateUser = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const data = await req.json();

    // Verify user exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Validate input
    const validatedData = await updateUserSchema.validate(data, {
      stripUnknown: false,
      abortEarly: false,
    });

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.users.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Check phone uniqueness if phone is being updated
    if (validatedData.phone && validatedData.phone !== existingUser.phone) {
      const phoneExists = await prisma.users.findFirst({
        where: {
          phone: validatedData.phone,
          id: { not: id },
        },
      });

      if (phoneExists) {
        throw new Error("Phone number already exists");
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
    };

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
      updateData.passwordUpdateAt = new Date();
    }

    // Update user
    const user = await prisma.users.update({
      where: { id },
      data: updateData,
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
      message: "User updated successfully",
    });
  },
);

/**
 * PATCH /apis/admin/users/:id
 * Partial update of user
 * Admin only
 */
const patchUser = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const data = await req.json();

    // Verify user exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Validate input
    const validatedData = await updateUserSchema.validate(data, {
      stripUnknown: false,
      abortEarly: false,
    });

    // Check email uniqueness if email is being updated
    if (validatedData.email && validatedData.email !== existingUser.email) {
      const emailExists = await prisma.users.findFirst({
        where: {
          email: validatedData.email,
          id: { not: id },
        },
      });

      if (emailExists) {
        throw new Error("Email already exists");
      }
    }

    // Check phone uniqueness if phone is being updated
    if (validatedData.phone && validatedData.phone !== existingUser.phone) {
      const phoneExists = await prisma.users.findFirst({
        where: {
          phone: validatedData.phone,
          id: { not: id },
        },
      });

      if (phoneExists) {
        throw new Error("Phone number already exists");
      }
    }

    // Prepare update data
    const updateData: any = {
      ...validatedData,
    };

    // Hash password if provided
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 12);
      updateData.passwordUpdateAt = new Date();
    }

    // Update user
    const user = await prisma.users.update({
      where: { id },
      data: updateData,
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
      message: "User updated successfully",
    });
  },
);

/**
 * DELETE /apis/admin/users/:id
 * Delete a user
 * Admin only
 */
const deleteUser = catchAsync(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    // Verify user exists
    const existingUser = await prisma.users.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // Delete user (cascade delete will handle related records)
    await prisma.users.delete({
      where: { id },
    });

    return successResponse({
      message: "User deleted successfully",
    });
  },
);

export {
  getUser as GET,
  updateUser as PUT,
  patchUser as PATCH,
  deleteUser as DELETE,
};
