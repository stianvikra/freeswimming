"use client";

import { useRouter } from "next/navigation";

type Props = {
  fallbackHref?: string;
};

export default function BackButton({ fallbackHref = "/" }: Props) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
      aria-label="Go back"
      type="button"
    >
      <span className="text-lg leading-none">←</span>
      Back
    </button>
  );
}