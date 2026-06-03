import type { CatalogProductAvailability } from "@/lib/commerce/catalog";

export type PlansProductPresentationInput = Omit<CatalogProductAvailability, "id"> & {
  id: string;
};

export type PlanCopy = {
  eyebrow: string;
  description: string;
  format: string;
  bestFor: string;
  comparisonCue: string;
  deliverables: string[];
  proof: string;
};

export type PurchaseModelCopy = {
  badge: string;
  label: string;
  detail: string;
  checkoutExpectation: string;
};

const ONE_TIME_PURCHASE_MODEL: PurchaseModelCopy = {
  badge: "One-time purchase",
  label: "One-time",
  detail: "Pay once for this offer. No subscription.",
  checkoutExpectation:
    "Opens secure Stripe Checkout. Final price, promo code field, and payment details are confirmed before you pay.",
};

const FALLBACK_PURCHASE_MODEL: PurchaseModelCopy = {
  badge: "Checkout details",
  label: "Confirmed in Stripe",
  detail: "The payment model is confirmed before purchase.",
  checkoutExpectation:
    "Opens secure Stripe Checkout. Final price, payment model, and payment details are confirmed before you pay.",
};

const PLAN_COPY_BY_ID: Partial<Record<string, PlanCopy>> = {
  guide_0_1000m: {
    eyebrow: "Structured program",
    description:
      "A structured program designed to take you from starting out with freestyle to completing your first 1000m.",
    format: "Interactive plan + PDF guide",
    bestFor: "Learners who want a step-by-step path from technique lessons to longer swims.",
    comparisonCue: "Choose this when you want the clearest progression path.",
    deliverables: [
      "20-session structure you can follow in order",
      "Weekly progression with practical focus cues",
      "PDF access plus My Library tracking after checkout",
    ],
    proof:
      "Built to pair with the free course so drills, sessions, and progression use the same method language.",
  },
  guide_poolside: {
    eyebrow: "Pool deck companion",
    description:
      "A compact poolside drill guide you can bring to every session when you need quick structure and reminders.",
    format: "Drill library + printable guide",
    bestFor:
      "Swimmers who already know the course basics and want a fast session script at the pool.",
    comparisonCue: "Choose this when you need quick practice structure on deck.",
    deliverables: [
      "Fast drill lookup when you are already at the pool",
      "Clear focus areas for balance, position, and timing",
      "PDF access plus My Library tracking after checkout",
    ],
    proof:
      "Uses the same balance, body-position, and timing cues as the course lessons, without adding workout admin.",
  },
  analysis_video: {
    eyebrow: "Personal feedback",
    description:
      "Personal video feedback so you know exactly what to fix first and what to ignore for now.",
    format: "Technique review",
    bestFor:
      "Learners who have video of their stroke and need a clear priority order before the next swim.",
    comparisonCue: "Choose this when you need a coach to prioritize the next fix.",
    deliverables: [
      "Prioritized technique feedback based on your stroke",
      "Actionable adjustments for your next sessions",
      "A focused next-step plan instead of a long list of corrections",
    ],
    proof:
      "Feedback is intentionally prioritized so you can work on the highest-impact change first.",
  },
};

const FALLBACK_PLAN_COPY: PlanCopy = {
  eyebrow: "Paid plan",
  description: "Structured paid offer with practical guidance and clear next actions.",
  format: "Freeswimming product",
  bestFor: "Swimmers who want a practical next step.",
  comparisonCue: "Choose this when the offer matches the next step you need.",
  deliverables: ["Practical content", "Clear action steps", "Built for everyday training"],
  proof: "Built around the same Freeswimming method used across the free course.",
};

const ONE_TIME_PRODUCT_IDS = new Set(["guide_0_1000m", "guide_poolside", "analysis_video"]);

export function getPlanCopy(product: PlansProductPresentationInput): PlanCopy {
  return PLAN_COPY_BY_ID[product.id] ?? FALLBACK_PLAN_COPY;
}

export function getPurchaseModelCopy(product: PlansProductPresentationInput): PurchaseModelCopy {
  return ONE_TIME_PRODUCT_IDS.has(product.id) ? ONE_TIME_PURCHASE_MODEL : FALLBACK_PURCHASE_MODEL;
}

export function getCheckoutCtaLabel(product: PlansProductPresentationInput) {
  const title = product.title.trim();
  return title ? `Buy ${title}` : "Buy this plan";
}
