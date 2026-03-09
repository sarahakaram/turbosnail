import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireCoach } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireCoach();
    const { id } = await params;
    const { sessionDate, notes, focusAreas, commitments } = await req.json();

    const sessionNote = await prisma.sessionNote.create({
      data: {
        clientProfileId: id,
        sessionDate: new Date(sessionDate),
        notes,
        focusAreas,
        commitments,
      },
    });

    return NextResponse.json(sessionNote, { status: 201 });
  } catch (error) {
    console.error("Create session note error:", error);
    return NextResponse.json({ error: "Failed to create session note" }, { status: 500 });
  }
}
