import Link from "next/link";

export type GuideAccessRequiredStateProps = {
  guideLabel?: string;
  description?: string;
  plansHref?: string;
  libraryHref?: string;
};

const DEFAULT_DESCRIPTION = "This guide appears when it is in your library.";

function normalizeText(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export default function GuideAccessRequiredState({
  guideLabel,
  description,
  plansHref = "/plans",
  libraryHref = "/my-library",
}: GuideAccessRequiredStateProps) {
  const safeGuideLabel = normalizeText(guideLabel, "this guide");
  const safeDescription = normalizeText(description, DEFAULT_DESCRIPTION);

  return (
    <section className="mx-auto min-h-screen w-full max-w-[980px] px-6 pt-28 pb-20">
      <div
        className="fs-library-card fs-library-card-accent p-5 sm:p-6 md:p-8"
        data-guide-label={safeGuideLabel}
        data-testid="guide-access-required-state"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-[680px]">
            <p className="text-sm font-semibold text-blue-700">Guide access</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950 sm:text-3xl">
              Guide access required
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
              {safeDescription}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row lg:shrink-0">
            <Link
              href={plansHref}
              className="fs-cta-primary inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:w-auto"
            >
              View plans
            </Link>
            <Link
              href={libraryHref}
              className="fs-cta-secondary inline-flex min-h-11 w-full items-center justify-center px-4 text-sm font-semibold transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700 sm:w-auto"
            >
              Back to My Library
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
