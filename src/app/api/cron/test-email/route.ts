import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPatientEmail } from "@/lib/email";
import { z } from "zod";

const schema = z.object({ closureId: z.string() });

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { closureId } = schema.parse(body);

  const closure = await prisma.closure.findUnique({ where: { id: closureId } });
  if (!closure) {
    return NextResponse.json({ error: "Closure not found" }, { status: 404 });
  }

  await sendPatientEmail({
    patientEmail: closure.patientEmail,
    patientFirstName: closure.patientFirstName,
    token: closure.token,
    isFollowUp: false,
  });

  const now = new Date();
  await prisma.closure.update({
    where: { id: closureId },
    data: { status: "EMAIL_SENT", email21SentAt: now },
  });

  return NextResponse.json({ success: true, sentTo: closure.patientEmail });
}
