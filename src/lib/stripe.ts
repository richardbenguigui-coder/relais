import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function createStripeCustomer(email: string, name: string) {
  return stripe.customers.create({ email, name });
}

export async function createCheckoutSession(customerId: string, therapistId: string) {
  const trialEnd = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 60; // 60 days

  return stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    subscription_data: { trial_end: trialEnd },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscription=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    metadata: { therapistId },
  });
}

export async function createBillingPortalSession(customerId: string) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
  });
}
