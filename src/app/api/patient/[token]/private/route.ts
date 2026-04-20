import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  answers: z.array(z.string().max(5000)).length(5),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const closure = await prisma.closure.findUnique({
    where: { token },
    include: { feedback: true },
  });
  if (!closure) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  }

  // Block only if private feedback already submitted (public testimonial allows double feedback)
  if (closure.feedback) {
    return NextResponse.json({ error: "Réponse déjà enregistrée." }, { status: 409 });
  }

  try {
    const body = await req.json();
    const { answers } = schema.parse(body);

    // If patient already left a public review, mark as both; otherwise private only
    const newStatus = closure.publicFeedbackAt ? "BOTH_FEEDBACK" : "PRIVATE_FEEDBACK";

    await prisma.$transaction([
      prisma.feedback.create({
        data: {
          closureId: closure.id,
          answer1: answers[0] || null,
          answer2: answers[1] || null,
          answer3: answers[2] || null,
          answer4: answers[3] || null,
          answer5: answers[4] || null,
        },
      }),
      prisma.closure.update({
        where: { id: closure.id },
        data: {
          status: newStatus,
          respondedAt: closure.respondedAt ?? new Date(),
        },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    console.error("Private feedback error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
