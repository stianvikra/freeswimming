"use client";

import { useFormStatus } from "react-dom";

type Props = {
  idleLabel: string;
  pendingLabel: string;
  className: string;
  disabled?: boolean;
  disabledLabel?: string;
  testId?: string;
};

export default function AuthSubmitButton({
  idleLabel,
  pendingLabel,
  className,
  disabled = false,
  disabledLabel,
  testId,
}: Props) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  const label = pending ? pendingLabel : disabled && disabledLabel ? disabledLabel : idleLabel;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      aria-disabled={isDisabled}
      data-testid={testId}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-70`}
    >
      {label}
    </button>
  );
}
