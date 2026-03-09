import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function getCurrentUser() {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      coachProfile: true,
      clientProfile: {
        include: { coach: true },
      },
    },
  });
}

export async function requireCoach() {
  const user = await getCurrentUser();
  if (!user || user.role !== "COACH") {
    throw new Error("Unauthorized: Coach access required");
  }
  return user;
}

export async function requireClient() {
  const user = await getCurrentUser();
  if (!user || user.role !== "CLIENT") {
    throw new Error("Unauthorized: Client access required");
  }
  return user;
}
