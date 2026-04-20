import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const closure = await prisma.closure.findUnique({
    where: { token },
    select: {
      status: true,
      closureType: true,
      publicFeedbackAt: true,
      therapist: {
        select: { reviewLink: true, reviewPlatform: true },
      },
    },
  });

  if (!closure) {
    return NextResponse.json({ error: "Introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    status: closure.status,
    closureType: closure.closureType,
    publicFeedbackAt: closure.publicFeedbackAt,
    reviewLink: closure.therapist.reviewLink,
    reviewPlatform: closure.therapist.reviewPlatform,
  });
}
