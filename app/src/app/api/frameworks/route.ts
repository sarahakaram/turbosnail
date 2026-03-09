import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function GET() {
  try {
    const user = await requireCoach();

    const frameworks = await prisma.framework.findMany({
      where: { coachId: user.coachProfile!.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(frameworks);
  } catch (error) {
    console.error("Frameworks API error:", error);
    return NextResponse.json({ error: "Failed to fetch frameworks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireCoach();
    const { name, purpose, steps, keyQuestions, commonPitfalls, successIndicators, relatedFrameworks } = await req.json();

    const framework = await prisma.framework.create({
      data: {
        coachId: user.coachProfile!.id,
        name,
        purpose,
        steps,
        keyQuestions,
        commonPitfalls,
        successIndicators,
        relatedFrameworks,
        embedding: [], // TODO: Generate embedding via RAG pipeline
      },
    });

    return NextResponse.json(framework, { status: 201 });
  } catch (error) {
    console.error("Create framework error:", error);
    return NextResponse.json({ error: "Failed to create framework" }, { status: 500 });
  }
}
