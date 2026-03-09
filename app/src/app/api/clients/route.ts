import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireCoach();

    const clients = await prisma.clientProfile.findMany({
      where: { coachId: user.coachProfile!.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        goals: true,
        assessments: { orderBy: { administeredAt: "desc" }, take: 3 },
        conversations: {
          orderBy: { startedAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(clients);
  } catch (error) {
    console.error("Clients API error:", error);
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCoach();
    const body = await req.json();

    const { name, email, title, company, industry, teamSize, mode } = body;

    // Create the user and client profile
    const clientUser = await prisma.user.create({
      data: {
        clerkId: `pending_${Date.now()}`, // Will be updated when client signs up
        email,
        name,
        role: "CLIENT",
        clientProfile: {
          create: {
            coachId: user.coachProfile!.id,
            title,
            company,
            industry,
            teamSize: teamSize ? parseInt(teamSize) : null,
            mode: mode || "COMPANION",
            engagementStart: new Date(),
          },
        },
      },
      include: { clientProfile: true },
    });

    return NextResponse.json(clientUser, { status: 201 });
  } catch (error) {
    console.error("Create client error:", error);
    return NextResponse.json({ error: "Failed to create client" }, { status: 500 });
  }
}
