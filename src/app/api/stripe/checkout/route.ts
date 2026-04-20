import { NextResponse } from "next/server";
import { getTherapist } from "@/lib/auth";
import { createCheckoutSession, createStripeCustomer } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function GET() {
  console.log("[checkout] STRIPE_PRICE_ID env:", process.env.STRIPE_PRICE_ID);
  try {
    const therapist = await getTherapist();
    if (!therapist) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login`);
    }

    let customerId = therapist.stripeCustomerId;

    if (!customerId) {
      customerId = await freshCustomer(therapist.id, therapist.email, therapist.name);
    }

    try {
      const session = await createCheckoutSession(customerId, therapist.id);
      return NextResponse.redirect(session.url!);
    } catch (err) {
      // Stale customer ID (wrong mode or deleted) — create a new one and retry once
      if (err instanceof Stripe.errors.StripeInvalidRequestError && err.code === "resource_missing") {
        console.warn("Stripe customer not found, creating new one:", customerId);
        customerId = await freshCustomer(therapist.id, therapist.email, therapist.name);
        const session = await createCheckoutSession(customerId, therapist.id);
        return NextResponse.redirect(session.url!);
      }
      throw err;
    }
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      console.error("Stripe checkout error:", err.type, err.code, err.message);
    } else {
      console.error("Stripe checkout error:", err);
    }
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?error=checkout`
    );
  }
}

async function freshCustomer(therapistId: string, email: string, name: string | null) {
  const customer = await createStripeCustomer(email, name || email);
  await prisma.therapist.update({
    where: { id: therapistId },
    data: { stripeCustomerId: customer.id },
  });
  return customer.id;
}
