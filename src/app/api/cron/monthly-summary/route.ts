import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendMonthlyTherapistSummary } from "@/lib/email";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const lastMonth = subMonths(now, 1);
  const periodStart = startOfMonth(lastMonth);
  const periodEnd = endOfMonth(lastMonth);
  const monthLabel = format(lastMonth, "MMMM yyyy", { locale: fr });

  const therapists = await prisma.therapist.findMany({
    where: { onboardingDone: true },
    include: {
      closures: {
        where: {
          createdAt: { gte: periodStart, lte: periodEnd },
        },
      },
    },
  });

  const results: { email: string; status: string }[] = [];

  for (const therapist of therapists) {
    if (therapist.closures.length === 0) continue;

    const closures = therapist.closures;
    const emailsSent = closures.filter(
      (c) => c.email21SentAt !== null || c.email28SentAt !== null
    ).length;
    const privateCount = closures.filter((c) => c.status === "PRIVATE_FEEDBACK").length;
    const publicCount = closures.filter((c) => c.status === "PUBLIC_TESTIMONIAL").length;
    const noFollowUpCount = closures.filter((c) => c.status === "NO_FOLLOW_UP").length;

    try {
      await sendMonthlyTherapistSummary({
        therapistEmail: therapist.email,
        therapistName: therapist.name || therapist.email,
        month: monthLabel,
        totalClosures: closures.length,
        emailsSent,
        privateCount,
        publicCount,
        noFollowUpCount,
      });
      results.push({ email: therapist.email, status: "sent" });
    } catch (err) {
      console.error(`Failed monthly summary for ${therapist.email}:`, err);
      results.push({ email: therapist.email, status: "error" });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
