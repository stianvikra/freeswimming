"use client";

import { useState } from "react";
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
      className={[
        "inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {loading ? loadingLabel : buttonLabel}
    </button>
  );
}
