// components/ui/MobileSegmentedNav.tsx
"use client";

import * as React from "react";
import PressButton from "@/components/ui/PressButton";
import PressLink from "@/components/ui/PressLink";
import { cx } from "@/components/ui/cx";
import {
  MOBILE_NAV_BUTTON_BASE,
  MOBILE_NAV_SEGMENT_ROW,
  MOBILE_NAV_SHELL,
  getMobileNavSkinClass,
  type MobileNavSkin,
} from "@/components/ui/mobileNavTheme";

export type MobileSegmentedNavSkin = MobileNavSkin;

type ItemBase = {
  id: string;
  label: React.ReactNode;
  skin?: MobileSegmentedNavSkin;
  disabled?: boolean;
  className?: string;
  testId?: string;
  ariaLabel?: string;
  ariaPressed?: boolean;
  ariaExpanded?: boolean;
  ariaCurrent?: "page";
};

type NavButtonItem = ItemBase & {
  kind: "button";
  onClick?: () => void;
};

type NavLinkItem = ItemBase & {
  kind: "link";
  href: string;
  onClick?: () => void;
};

export type MobileSegmentedNavItem = NavButtonItem | NavLinkItem;

type Props = {
  items: MobileSegmentedNavItem[];
  className?: string;
  rowClassName?: string;
};

function classFor(item: MobileSegmentedNavItem) {
  const skin = item.skin ?? "muted";
  return cx(
    "flex-1",
    MOBILE_NAV_BUTTON_BASE,
    getMobileNavSkinClass(skin, item.disabled),
    item.className
  );
}

export default function MobileSegmentedNav({ items, className, rowClassName }: Props) {
  return (
    <div className={cx(MOBILE_NAV_SHELL, className)}>
      <div className={cx(MOBILE_NAV_SEGMENT_ROW, rowClassName)}>
        {items.map((item) => {
          const classes = classFor(item);

          if (item.kind === "button") {
            return (
              <PressButton
                key={item.id}
                tier="nav"
                onClick={item.disabled ? undefined : item.onClick}
                disabled={item.disabled}
                className={classes}
                data-testid={item.testId}
                aria-label={item.ariaLabel}
                aria-pressed={item.ariaPressed}
                aria-expanded={item.ariaExpanded}
              >
                {item.label}
              </PressButton>
            );
          }

          return (
            <PressLink
              key={item.id}
              tier="nav"
              href={item.href}
              onClick={item.onClick}
              className={classes}
              data-testid={item.testId}
              aria-label={item.ariaLabel}
              aria-current={item.ariaCurrent}
            >
              {item.label}
            </PressLink>
          );
        })}
      </div>
    </div>
  );
}
