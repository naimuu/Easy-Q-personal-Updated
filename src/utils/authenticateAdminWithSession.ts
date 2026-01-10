import prisma from "@/config/prisma";
import { NextRequest } from "next/server";
import { isSessionExpired } from "./JWT";

const authenticateAdminWithSession = async (req: NextRequest) => {
  const token = req.headers.get("ADMIN");
  if (!token) throw new Error("Please log in!");

  const { userId: id, iat } = JSON.parse(token);
  const admin = await prisma.users.findUnique({ where: { id } });
  if (!admin) throw new Error("Admin not found!");

  const isPassChanged = await isSessionExpired(
    admin.passwordUpdateAt as Date,
    iat,
  );
  if (isPassChanged) throw new Error("Session expired! Please log in again.");

  return { admin, adminId: id };
};

export default authenticateAdminWithSession;