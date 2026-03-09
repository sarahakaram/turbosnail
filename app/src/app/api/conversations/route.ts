import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role === "CLIENT" && user.clientProfile) {
      const conversations = await prisma.conversation.findMany({
        where: { clientProfileId: user.clientProfile.id },
        orderBy: { startedAt: "desc" },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
      return NextResponse.json(conversations);
    }

    if (user.role === "COACH" && user.coachProfile) {
      const conversations = await prisma.conversation.findMany({
        where: {
          clientProfile: { coachId: user.coachProfile.id },
        },
        orderBy: { startedAt: "desc" },
        include: {
          clientProfile: { include: { user: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
      return NextResponse.json(conversations);
    }

    return NextResponse.json([]);
  } catch (error) {
    console.error("Conversations API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
