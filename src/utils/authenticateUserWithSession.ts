import prisma from "@/config/prisma";
import { NextRequest } from "next/server";
import { isSessionExpired } from "./JWT";

const authenticateUserWithSession = async (req: NextRequest) => {
  const token = req.headers.get("USER");
  if (!token) throw new Error("Please log in!");

  const { userId: id, iat } = JSON.parse(token);
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) throw new Error("User not found!");

  const isPassChanged = await isSessionExpired(
    user.passwordUpdateAt as Date,
    iat,
  );
  if (isPassChanged) throw new Error("Session expired! Please log in again.");

  return { user, userId: id };
};

export default authenticateUserWithSession;