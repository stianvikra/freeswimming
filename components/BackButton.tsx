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
      className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
    >
      <span className="text-lg leading-none">←</span>
      Back
    </button>
  );
}