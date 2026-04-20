import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createSession, COOKIE_NAME } from "@/lib/auth";
import { addDays } from "date-fns";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = schema.parse(body);

    const existing = await prisma.therapist.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Un compte existe déjà avec cet email." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const therapist = await prisma.therapist.create({
      data: {
        email,
        passwordHash,
        subscriptionStatus: "TRIAL",
        trialEndsAt: addDays(new Date(), 60),
      },
    });

    const token = await createSession({ therapistId: therapist.id, email: therapist.email });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides." }, { status: 400 });
    }
    console.error("Signup error:", err);
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
