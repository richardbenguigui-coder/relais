import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPatientEmail, sendInterruptedPatientEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const pending = await prisma.scheduledEmail.findMany({
    where: {
      sentAt: null,
      scheduledAt: { lte: now },
    },
    include: {
      closure: {
        include: { therapist: true },
      },
    },
  });

  const results: { id: string; status: string }[] = [];

  for (const email of pending) {
    const { closure } = email;

    if (email.type === "PATIENT_J28") {
      if (closure.respondedAt) {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { sentAt: now },
        });
        results.push({ id: email.id, status: "skipped_responded" });
        continue;
      }
      if (closure.status === "NO_FOLLOW_UP" && closure.email28SentAt !== null) {
        await prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { sentAt: now },
        });
        results.push({ id: email.id, status: "skipped_final" });
        continue;
      }
    }

    try {
      const sendFn = closure.closureType === "INTERRUPTED"
        ? sendInterruptedPatientEmail
        : sendPatientEmail;

      await sendFn({
        patientEmail: closure.patientEmail,
        patientFirstName: closure.patientFirstName,
        therapistName: closure.therapist.name,
        token: closure.token,
        isFollowUp: email.type === "PATIENT_J28",
      });

      await prisma.$transaction([
        prisma.scheduledEmail.update({
          where: { id: email.id },
          data: { sentAt: now },
        }),
        prisma.closure.update({
          where: { id: closure.id },
          data: {
            status: "EMAIL_SENT",
            ...(email.type === "PATIENT_J21"
              ? { email21SentAt: now }
              : { email28SentAt: now }),
          },
        }),
      ]);

      results.push({ id: email.id, status: "sent" });
    } catch (err) {
      console.error(`Failed to send email ${email.id}:`, err);
      results.push({ id: email.id, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
