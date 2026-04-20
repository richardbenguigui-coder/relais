import { NextResponse } from "next/server";
import { getTherapist } from "@/lib/auth";
import { createBillingPortalSession } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET() {
  const therapist = await getTherapist();
  if (!therapist?.stripeCustomerId) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  }

  const session = await createBillingPortalSession(therapist.stripeCustomerId);
  return NextResponse.redirect(session.url);
}
