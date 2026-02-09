// components/ui/PressLink.tsx
"use client";

import Link, { type LinkProps } from "next/link";
import * as React from "react";
import { cx } from "./cx";

type Props = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    disabled?: boolean;
  };

export default function PressLink({
  className,
  disabled,
  children,
  ...rest
}: Props) {
  if (disabled) {
    // Render non-clickable “link” that still looks consistent
    return (
      <span
        aria-disabled="true"
        className={cx("ui-press ui-focus ui-disabled select-none", className)}
      >
        {children}
      </span>
    );
  }

  return (
    <Link className={cx("ui-press ui-focus select-none", className)} {...rest}>
      {children}
    </Link>
  );
}