import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCoach();
    const { id } = await params;

    const client = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        user: true,
        goals: { orderBy: { createdAt: "desc" } },
        assessments: { orderBy: { administeredAt: "desc" } },
        conversations: {
          orderBy: { startedAt: "desc" },
          take: 10,
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
        sessionNotes: { orderBy: { sessionDate: "desc" } },
        alerts: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error("Client detail error:", error);
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCoach();
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.clientProfile.update({
      where: { id },
      data: body,
      include: { user: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 });
  }
}
