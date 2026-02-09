"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
};

export default function Modal({ open, onClose, children, ariaLabel }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // ✅ Best practice: when closed, don't render anything
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={ariaLabel}>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/35 backdrop-blur-sm"
      />

      {/* Slide-in panel */}
      <aside
        className={[
          "absolute right-0 top-0 h-full",
          "w-[92vw] max-w-[420px]",
          "rounded-l-3xl bg-white",
          "shadow-[0_40px_120px_rgba(15,23,42,0.35)]",
        ].join(" ")}
      >
        {children}
      </aside>
    </div>
  );
}