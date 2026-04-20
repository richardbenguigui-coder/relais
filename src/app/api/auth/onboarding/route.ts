import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(100),
  reviewPlatform: z.enum(["GOOGLE", "TRUSTPILOT", "AVIS_VERIFIES"]),
  reviewLink: z.string().url(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
    const body = await req.json();
    const { name, reviewPlatform, reviewLink } = schema.parse(body);

    await prisma.therapist.update({
      where: { id: session.therapistId },
      data: { name, reviewPlatform, reviewLink, onboardingDone: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    console.error("Onboarding error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
