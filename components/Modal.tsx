"use client";

import { useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
};

export default function Modal({ open, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      aria-modal="true"
      role="dialog"
      aria-label={title ?? "Menu"}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-slate-900/30"
        onClick={onClose}
        aria-label="Close menu"
      />

      {/* Panel */}
      <div className="absolute right-4 top-20 w-[min(420px,calc(100%-2rem))] glass-card rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/70">
          <div className="text-sm font-semibold tracking-wide text-slate-900">
            {title ?? "Menu"}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-slate-700 hover:bg-slate-100 active:scale-[0.98] transition"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}