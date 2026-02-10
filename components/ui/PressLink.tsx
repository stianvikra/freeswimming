// components/ui/PressLink.tsx
"use client";

import Link, { type LinkProps } from "next/link";
import * as React from "react";
import { cx } from "./cx";
import { getPressTierClass, type PressTier } from "./pressTier";

type Props = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    disabled?: boolean;
    tier?: PressTier;
  };

export default function PressLink({
  className,
  disabled,
  tier = "nav",
  children,
  ...rest
}: Props) {
  if (disabled) {
    // Render non-clickable “link” that still looks consistent
    return (
      <span
        aria-disabled="true"
        className={cx(getPressTierClass(tier), "ui-disabled", className)}
      >
        {children}
      </span>
    );
  }

  return (
    <Link className={cx(getPressTierClass(tier), className)} {...rest}>
      {children}
    </Link>
  );
}
