// components/ui/PressButton.tsx
"use client";

import * as React from "react";
import { cx } from "./cx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * When true, also applies aria-disabled + ui-disabled behavior.
   * Useful if you want the *look* disabled but still handle click logic elsewhere.
   */
  ariaDisabled?: boolean;
};

export default function PressButton({
  className,
  disabled,
  ariaDisabled,
  type,
  ...rest
}: Props) {
  const isDisabled = Boolean(disabled || ariaDisabled);

  return (
    <button
      type={type ?? "button"}
      disabled={disabled}
      aria-disabled={ariaDisabled || disabled || undefined}
      className={cx(
        "ui-press ui-focus select-none",
        isDisabled && "ui-disabled",
        className
      )}
      {...rest}
    />
  );
}