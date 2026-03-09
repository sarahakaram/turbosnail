import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { title, description, targetDate } = await req.json();

    const goal = await prisma.goal.create({
      data: {
        clientProfileId: id,
        title,
        description,
        targetDate: targetDate ? new Date(targetDate) : null,
      },
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
