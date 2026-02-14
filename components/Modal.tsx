"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type Props = {
  /** Backwards compatible: support both */
  open?: boolean;
  isOpen?: boolean;

  onClose: () => void;
  ariaLabel?: string;
  children: React.ReactNode;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type InertNode = HTMLElement & { inert?: boolean };

export default function Modal({ open, isOpen, onClose, ariaLabel = "Dialog", children }: Props) {
  const visible = Boolean(open ?? isOpen);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!visible) return;

    const prevOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = prevOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;

    const panel = panelRef.current;
    if (!panel) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;

    const getFocusable = () =>
      Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => {
        if (el.getAttribute("aria-hidden") === "true") return false;
        if (el.tabIndex < 0) return false;
        return true;
      });

    const initialTarget = getFocusable()[0] ?? panel;
    requestAnimationFrame(() => initialTarget.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const focusable = getFocusable();
      if (!focusable.length) {
        e.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || !panel.contains(active) || active === first) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (!active || !panel.contains(active) || active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      lastFocusedRef.current?.focus?.();
    };
  }, [visible, onClose]);

  useEffect(() => {
    if (!visible) return;

    const root = dialogRef.current;
    if (!root) return;

    const siblings = Array.from(document.body.children).filter((el) => el !== root);
    const prevState = siblings.map((el) => ({
      el: el as InertNode,
      ariaHidden: el.getAttribute("aria-hidden"),
      inert: Boolean((el as InertNode).inert),
    }));

    for (const { el } of prevState) {
      el.setAttribute("aria-hidden", "true");
      el.inert = true;
    }

    return () => {
      for (const { el, ariaHidden, inert } of prevState) {
        if (ariaHidden === null) el.removeAttribute("aria-hidden");
        else el.setAttribute("aria-hidden", ariaHidden);
        el.inert = inert;
      }
    };
  }, [visible]);

  if (!visible) return null;
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={dialogRef}
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
        className="absolute inset-0 cursor-pointer bg-black/25 backdrop-blur-[2px]"
      />

      {/* Right-side panel wrapper */}
      <div className="absolute inset-0 flex justify-end">
        <div
          ref={panelRef}
          tabIndex={-1}
          className={[
            "relative h-[100dvh] w-full max-w-[420px]",
            "bg-white/95 backdrop-blur",
            "shadow-[0_30px_120px_rgba(15,23,42,0.35)]",
            "overflow-hidden rounded-bl-3xl",
            "pointer-events-auto",
          ].join(" ")}
          style={{ WebkitOverflowScrolling: "touch" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-full min-h-0 flex-col">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}
