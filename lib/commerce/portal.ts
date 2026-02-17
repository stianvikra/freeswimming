export function getSafePortalReturnPath(
  input: string | undefined,
  fallback = "/my-library"
): string {
  if (!input) return fallback;
  if (!input.startsWith("/")) return fallback;
  if (input.startsWith("//")) return fallback;
  return input;
}

type StripeCustomerLike = {
  id?: unknown;
  deleted?: unknown;
};

export function pickActiveStripeCustomerId(customers: StripeCustomerLike[]): string | null {
  for (const customer of customers) {
    if (!customer || customer.deleted === true) continue;
    if (typeof customer.id !== "string") continue;

    const customerId = customer.id.trim();
    if (!customerId) continue;
    return customerId;
  }

  return null;
}
