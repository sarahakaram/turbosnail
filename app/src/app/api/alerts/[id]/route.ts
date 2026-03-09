import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCoach();
    const { id } = await params;
    const { status } = await req.json();

    const alert = await prisma.alert.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === "RESOLVED" ? new Date() : null,
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error("Update alert error:", error);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
