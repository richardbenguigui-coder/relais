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

  const closure = await prisma.closure.findUnique({ where: { token } });
  if (!closure) {
    return NextResponse.json({ error: "Lien invalide." }, { status: 404 });
  }

  if (closure.respondedAt) {
    return NextResponse.json({ error: "Réponse déjà enregistrée." }, { status: 409 });
  }

  try {
    const body = await req.json();
    const { answers } = schema.parse(body);

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
          status: "PRIVATE_FEEDBACK",
          respondedAt: new Date(),
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
