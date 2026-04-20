import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { z } from "zod";
import { randomBytes } from "crypto";

const schema = z.object({ email: z.string().email() });

export async function POST(req: NextRequest) {
  try {
    const { email } = schema.parse(await req.json());

    const therapist = await prisma.therapist.findUnique({ where: { email } });

    // Always return success to avoid leaking whether the email exists
    if (therapist) {
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.therapist.update({
        where: { id: therapist.id },
        data: { resetToken: token, resetTokenExpiry: expiry },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${token}`;
      await sendPasswordResetEmail({ email, resetUrl });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
