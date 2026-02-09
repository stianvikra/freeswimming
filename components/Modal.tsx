"use client";

import { useEffect, useId, useRef } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  ariaLabel?: string;
};

export default function Modal({
  open,
  onClose,
  children,
  ariaLabel = "Menu",
}: ModalProps) {
  const describedById = useId();
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    // Focus panel on open (after render)
    requestAnimationFrame(() => {
      panelRef.current?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      previouslyFocusedRef.current?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 bg-slate-900/35 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Slide-in panel */}
      <aside
        ref={(el) => {
          panelRef.current = el;
        }}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        aria-describedby={describedById}
        tabIndex={-1}
        className={`absolute right-0 top-0 h-full w-[80vw] max-w-[420px]
          rounded-l-3xl bg-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]
          transform transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <span id={describedById} className="sr-only">
          Slide-in panel
        </span>

        {children}
      </aside>
    </div>
  );
}