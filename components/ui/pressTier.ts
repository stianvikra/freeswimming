// components/ui/pressTier.ts
import { cx } from "./cx";

export type PressTier = "cta" | "nav" | "icon" | "card" | "menuCard";

const tierClassMap: Record<PressTier, string> = {
  cta: "ui-press ui-focus ui-press-tier-cta select-none",
  nav: "ui-press ui-focus ui-press-tier-nav select-none",
  icon: "ui-press ui-focus ui-press-tier-icon select-none",
  card: "ui-card ui-focus ui-card-tier-default",
  menuCard: "ui-card ui-focus ui-card-tier-menu select-none",
};

export function getPressTierClass(tier: PressTier = "nav") {
  return cx(tierClassMap[tier]);
}
