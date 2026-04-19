import { NextResponse } from "next/server";
import { getTherapist } from "@/lib/auth";
import { createCheckoutSession, createStripeCustomer } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const therapist = await getTherapist();
  if (!therapist) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
  }

  let customerId = therapist.stripeCustomerId;

  if (!customerId) {
    const customer = await createStripeCustomer(
      therapist.email,
      therapist.name || therapist.email
    );
    customerId = customer.id;
    await prisma.therapist.update({
      where: { id: therapist.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await createCheckoutSession(customerId, therapist.id);

  return NextResponse.redirect(session.url!);
}
