import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const { token, password } = schema.parse(await req.json());

    const therapist = await prisma.therapist.findUnique({
      where: { resetToken: token },
    });

    if (!therapist || !therapist.resetTokenExpiry || therapist.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { error: "Ce lien est invalide ou a expiré." },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.therapist.update({
      where: { id: therapist.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
