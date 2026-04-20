import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { addDays } from "date-fns";
import { z } from "zod";

const schema = z.object({
  patientFirstName: z.string().min(1).max(100),
  patientEmail: z.string().email(),
  closureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  closureType: z.enum(["STANDARD", "INTERRUPTED"]).default("STANDARD"),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non autorisé." }, { status: 401 });

  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: session.therapistId },
    });

    if (!therapist) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });

    const trialExpired =
      therapist.subscriptionStatus === "TRIAL" &&
      therapist.trialEndsAt &&
      new Date(therapist.trialEndsAt) < new Date();

    if (therapist.subscriptionStatus === "CANCELED" || trialExpired) {
      return NextResponse.json(
        { error: "Votre abonnement est inactif. Veuillez vous réabonner pour créer des clôtures." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { patientFirstName, patientEmail, closureDate, closureType } = schema.parse(body);

    // Schedule from the therapist-entered closure date, not the creation date.
    // If closureDate was 25 days ago, email21Date is 4 days ago — the cron picks it up immediately.
    const closureDateObj = new Date(`${closureDate}T12:00:00.000Z`);
    const email21Date = addDays(closureDateObj, 21);
    const email28Date = addDays(closureDateObj, 28);

    const closure = await prisma.closure.create({
      data: {
        therapistId: session.therapistId,
        patientFirstName,
        patientEmail,
        closureDate: closureDateObj,
        closureType,
        scheduledEmails: {
          create: [
            { type: "PATIENT_J21", scheduledAt: email21Date },
            { type: "PATIENT_J28", scheduledAt: email28Date },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, closureId: closure.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    console.error("Closure creation error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
