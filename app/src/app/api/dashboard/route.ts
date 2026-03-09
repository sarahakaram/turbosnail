import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireCoach();
    const coachProfile = user.coachProfile!;

    // Get all clients with recent activity
    const clients = await prisma.clientProfile.findMany({
      where: { coachId: coachProfile.id },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        goals: true,
        conversations: {
          orderBy: { startedAt: "desc" },
          take: 1,
          include: {
            messages: { orderBy: { createdAt: "desc" }, take: 1 },
          },
        },
        alerts: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Aggregate stats
    const stats = {
      totalClients: clients.length,
      activeClients: clients.filter((c) => c.status === "ACTIVE").length,
      pendingAlerts: clients.reduce((sum, c) => sum + c.alerts.length, 0),
      totalConversations: await prisma.conversation.count({
        where: { clientProfile: { coachId: coachProfile.id } },
      }),
    };

    // Recent alerts across all clients
    const recentAlerts = await prisma.alert.findMany({
      where: {
        clientProfile: { coachId: coachProfile.id },
        status: "PENDING",
      },
      include: {
        clientProfile: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Recent conversations across all clients
    const recentConversations = await prisma.conversation.findMany({
      where: { clientProfile: { coachId: coachProfile.id } },
      include: {
        clientProfile: { include: { user: { select: { name: true } } } },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { startedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({
      stats,
      clients,
      recentAlerts,
      recentConversations,
    });
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard" },
      { status: 500 }
    );
  }
}
