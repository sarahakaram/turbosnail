import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getCoachingResponse } from "@/lib/coaching-engine";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.clientProfile) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create conversation
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const conversation = await prisma.conversation.create({
        data: {
          clientProfileId: user.clientProfile.id,
          title: message.substring(0, 100),
        },
      });
      activeConversationId = conversation.id;
    }

    // Save user message
    await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        senderId: user.id,
        role: "user",
        content: message,
      },
    });

    // Get coaching response
    const response = await getCoachingResponse(
      user.clientProfile.id,
      message,
      activeConversationId
    );

    // Save assistant message
    await prisma.message.create({
      data: {
        conversationId: activeConversationId,
        role: "assistant",
        content: response.content,
        metadata: {
          frameworksReferenced: response.frameworksReferenced,
          confidenceLevel: response.confidenceLevel,
          escalationTriggered: response.escalationTriggered,
          escalationType: response.escalationType,
        },
      },
    });

    return NextResponse.json({
      conversationId: activeConversationId,
      message: response.content,
      frameworksReferenced: response.frameworksReferenced,
      escalationTriggered: response.escalationTriggered,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 }
    );
  }
}
