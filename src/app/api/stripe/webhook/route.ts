import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  async function getTherapistByCustomer(customerId: string) {
    return prisma.therapist.findFirst({
      where: { stripeCustomerId: customerId },
    });
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const therapist = await getTherapistByCustomer(sub.customer as string);
      if (!therapist) break;

      const statusMap: Record<string, string> = {
        active: "ACTIVE",
        trialing: "TRIAL",
        past_due: "PAST_DUE",
        canceled: "CANCELED",
        unpaid: "PAST_DUE",
      };

      await prisma.therapist.update({
        where: { id: therapist.id },
        data: {
          stripeSubscriptionId: sub.id,
          subscriptionStatus: (statusMap[sub.status] || "TRIAL") as never,
          trialEndsAt: sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const therapist = await getTherapistByCustomer(sub.customer as string);
      if (!therapist) break;

      await prisma.therapist.update({
        where: { id: therapist.id },
        data: { subscriptionStatus: "CANCELED" },
      });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
