"use client";

import { useState } from "react";
import { mobileActionItemClass } from "@/components/ui/actionLayout";
import { cx } from "@/components/ui/cx";
import { readAdminNoteClipboardImageFromNavigator } from "@/lib/admin/note-compose";

type Props = {
  onPasteReady: (file: File) => Promise<void> | void;
  onError?: (message: string) => void;
  onSuccess?: () => void;
  buttonLabel?: string;
  loadingLabel?: string;
  disabled?: boolean;
  className?: string;
  buttonTestId?: string;
};

const defaultButtonClassName =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

export default function AdminNoteClipboardPasteButton({
  onPasteReady,
  onError,
  onSuccess,
  buttonLabel = "Paste image from clipboard",
  loadingLabel = "Pasting…",
  disabled = false,
  className = "",
  buttonTestId,
}: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (disabled || loading) return;

    setLoading(true);
    try {
      const result = await readAdminNoteClipboardImageFromNavigator({
        clipboard: navigator.clipboard,
        secureContext: window.isSecureContext,
      });

      if (!result.ok) {
        onError?.(result.error);
        return;
      }

      await onPasteReady(result.file);
      onSuccess?.();
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error.message
          : "Could not read an image from the clipboard right now. Use Upload image instead."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      data-testid={buttonTestId}
      disabled={disabled || loading}
      onClick={() => {
        void handleClick();
      }}
      className={cx(defaultButtonClassName, mobileActionItemClass, className)}
    >
      {loading ? loadingLabel : buttonLabel}
    </button>
  );
}
