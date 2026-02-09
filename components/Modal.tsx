"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  onClose: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, ariaLabel = "Dialog", children }: Props) {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[70]"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/25 backdrop-blur-[2px]"
      />

      {/* Right-side panel wrapper */}
      <div className="absolute inset-0 flex justify-end">
        {/* Panel */}
        <div
          className={[
            "relative h-[100dvh] w-full max-w-[420px]",
            "bg-white/95 backdrop-blur",
            "shadow-[0_30px_120px_rgba(15,23,42,0.35)]",
            "overflow-hidden rounded-bl-3xl",
            "pointer-events-auto",
          ].join(" ")}
          // Important on iOS: allow proper touch scrolling inside children scroll areas
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* This inner flex container MUST have min-h-0 so children with overflow can scroll */}
          <div className="flex h-full min-h-0 flex-col">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}