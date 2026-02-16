import Stripe from "stripe";

let stripeClient: Stripe | null = null;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function getStripeSecretKey() {
  return requireEnv("STRIPE_SECRET_KEY");
}

export function getStripeWebhookSecret() {
  return requireEnv("STRIPE_WEBHOOK_SECRET");
}

export function createStripeClient() {
  if (stripeClient) return stripeClient;

  stripeClient = new Stripe(getStripeSecretKey());
  return stripeClient;
}
