import type React from "react";
import Link from "next/link";
import SiteChrome from "@/components/SiteChrome";
import TrackCheckoutCancel from "@/components/analytics/TrackCheckoutCancel";
import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import { signOutFromLibrary } from "@/app/my-library/actions";
import CheckoutButton from "@/components/my-library/CheckoutButton";
import ContinueCourseCard from "@/components/my-library/ContinueCourseCard";
import MyLibraryNewContentNotice from "@/components/my-library/MyLibraryNewContentNotice";
import PortalButton from "@/components/my-library/PortalButton";
import DownloadResendForm from "@/components/commerce/DownloadResendForm";
import CreateManualProgramButton from "@/components/my-library/programs/CreateManualProgramButton";
import { cx } from "@/components/ui/cx";
import type { CatalogProduct } from "@/lib/commerce/catalog";
import type { LibrarySections } from "@/lib/commerce/library";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import type { ProgramLibrarySnapshot } from "@/lib/programs/shared";
import type { WorkoutLibrarySnapshot } from "@/lib/workouts/shared";

type Props = {
  userId: string;
  userEmail: string | null;
  sections: LibrarySections;
  activeGoalCountError: boolean;
  workoutLibrarySnapshot: WorkoutLibrarySnapshot;
  programLibrarySnapshot: ProgramLibrarySnapshot;
  drylandLibrarySnapshot: DrylandLibrarySnapshot;
  claimHref: string;
};

const sectionHeadingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const cardHeadingClass = "text-base font-semibold text-[color:var(--fs-color-ink-strong)]";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const navigationCardClass = "fs-library-card p-4 sm:p-5";
const sectionEyebrowClass =
  "text-[12px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase";
const primaryActionClass =
  "fs-cta-primary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const quietActionClass =
  "inline-flex min-h-11 shrink-0 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-4 text-sm font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";

function getKindCopy(product: CatalogProduct) {
  if (product.kind === "analysis") {
    return "Personal video feedback and tailored focus points.";
  }

  return "Structured training plan with practical guidance.";
}

function DashboardSectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className={sectionEyebrowClass}>{eyebrow}</p>
      <h2 className={sectionHeadingClass}>{title}</h2>
    </div>
  );
}

function LibraryShortcut({
  title,
  href,
  children,
  testId,
  actionClassName = secondaryActionClass,
}: {
  title: string;
  href?: string;
  children?: React.ReactNode;
  testId?: string;
  actionClassName?: string;
}) {
  return (
    <section data-testid={testId} className={navigationCardClass}>
      <div className="flex min-h-[72px] items-center justify-between gap-4">
        <div className="min-w-0">
          <h2 className={cardHeadingClass}>{title}</h2>
          {children}
        </div>
        {href ? (
          <Link href={href} className={actionClassName}>
            Open
          </Link>
        ) : null}
      </div>
    </section>
  );
}

export default function MyLibraryHub({
  userId,
  userEmail,
  sections,
  activeGoalCountError,
  workoutLibrarySnapshot,
  programLibrarySnapshot,
  drylandLibrarySnapshot,
  claimHref,
}: Props) {
  const latestProgram = programLibrarySnapshot.recentPrograms[0] ?? null;

  return (
    <SiteChrome mobileNavMode="hidden">
      <section className="mx-auto min-h-screen w-full max-w-[1180px] px-4 pt-24 pb-20 sm:px-6 sm:pt-28">
        <TrackEventOnMount
          eventName="library_viewed"
          payload={{
            ownedCount: sections.owned.length + sections.unknownOwnedProductIds.length,
            exploreCount: sections.explore.length,
          }}
        />
        {sections.explore.length > 0 ? (
          <TrackEventOnMount
            eventName="upsell_presented"
            payload={{
              surface: "library_explore",
              offerCount: sections.explore.length,
            }}
          />
        ) : null}
        <TrackCheckoutCancel surface="my_library" />

        <header className="border-b border-[color:var(--fs-border-brand)] pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[30px] leading-none font-semibold text-[color:var(--fs-color-ink-strong)] sm:text-[34px]">
                My Library
              </h1>
              <p className="mt-2 text-sm text-[color:var(--fs-color-muted)]">
                Signed in as {userEmail ?? "your account"}
              </p>
            </div>
            <div className="flex flex-wrap items-start gap-2">
              <PortalButton returnPath="/my-library" />
              <form action={signOutFromLibrary}>
                <button type="submit" className={quietActionClass}>
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </header>

        <div
          className="mt-6 grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] lg:items-start"
          data-testid="my-library-dashboard-grid"
        >
          <div className="min-w-0 space-y-7" data-testid="my-library-dashboard-main">
            <section className="space-y-3" data-testid="my-library-dashboard-start">
              <DashboardSectionHeading eyebrow="Start here" title="Today in your library" />
              <ContinueCourseCard />
              <MyLibraryNewContentNotice userId={userId} />
            </section>

            <section className="space-y-4" data-testid="my-library-dashboard-workspaces">
              <DashboardSectionHeading eyebrow="Member dashboard" title="Your workspaces" />
              <div className="grid gap-3 md:grid-cols-2">
                <LibraryShortcut
                  title="My Routines"
                  href="/my-library/routines"
                  testId="my-library-routines-row"
                  actionClassName={primaryActionClass}
                />
                <LibraryShortcut title="My Swim Profile" href="/my-library/profile" />
                <LibraryShortcut title="Goals" href="/my-library/goals">
                  {activeGoalCountError ? (
                    <p className={cx("mt-2", mutedTextClass)}>
                      Goals are still syncing in this environment.
                    </p>
                  ) : null}
                </LibraryShortcut>
                <LibraryShortcut
                  title="Swim Sessions"
                  href={workoutLibrarySnapshot.schemaReady ? "/my-library/workouts" : undefined}
                >
                  {!workoutLibrarySnapshot.schemaReady ? (
                    <p className={cx("mt-2", mutedTextClass)}>
                      This canonical swim-session layer is still syncing in this environment.
                    </p>
                  ) : null}
                </LibraryShortcut>
                <LibraryShortcut
                  title="Dryland Sessions"
                  href={drylandLibrarySnapshot.schemaReady ? "/my-library/dryland" : undefined}
                >
                  {!drylandLibrarySnapshot.schemaReady ? (
                    <p className={cx("mt-2", mutedTextClass)}>
                      This dryland foundation is still syncing in this environment.
                    </p>
                  ) : null}
                </LibraryShortcut>
                <section className="fs-library-card fs-library-card-muted p-4 sm:p-5">
                  <div className="flex min-h-[88px] flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className={cardHeadingClass}>Program builder preview</h2>
                        <span className="rounded-[var(--fs-radius-control)] bg-white/85 px-2.5 py-1 text-xs font-semibold text-[color:var(--fs-color-muted)] ring-1 ring-[color:var(--fs-border-soft)]">
                          Optional
                        </span>
                      </div>
                      <p className={cx("mt-2", mutedTextClass)}>
                        {!programLibrarySnapshot.schemaReady
                          ? "Program builder preview is still syncing in this environment."
                          : latestProgram
                            ? [
                                latestProgram.title,
                                `${latestProgram.weekCount} week${latestProgram.weekCount === 1 ? "" : "s"}`,
                                `${latestProgram.assignmentCount} scheduled workout${latestProgram.assignmentCount === 1 ? "" : "s"}`,
                              ]
                                .filter(Boolean)
                                .join(" · ")
                            : "Use this only when you want to place saved swim sessions into week/day slots. Ignore it during normal My Library and session-builder work."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {latestProgram ? (
                        <Link
                          href={`/my-library/programs/${latestProgram.id}`}
                          className={quietActionClass}
                        >
                          Open latest saved plan
                        </Link>
                      ) : null}
                      {programLibrarySnapshot.schemaReady ? (
                        <CreateManualProgramButton
                          label={latestProgram ? "Create another plan" : "Create first plan"}
                          testId="my-library-create-manual-program"
                          className={quietActionClass}
                        />
                      ) : null}
                    </div>
                  </div>
                </section>
              </div>
            </section>

            <section id="my-library-owned" className="space-y-4">
              <DashboardSectionHeading eyebrow="Owned access" title="Owned library items" />

              {sections.owned.length === 0 && sections.unknownOwnedProductIds.length === 0 ? (
                <div className="fs-library-card fs-library-card-muted border-dashed p-5 sm:p-6">
                  <p className={mutedTextClass}>
                    You have no purchased items yet. Browse available options below.
                  </p>
                  <div className="mt-4 border-t border-[color:var(--fs-border-soft)] pt-4">
                    <p className="text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
                      Already bought with another email? Request an access link and we&apos;ll
                      restore your library when you sign in.
                    </p>
                    <DownloadResendForm
                      initialEmail={userEmail ?? ""}
                      nextPath="/my-library"
                      source="library_recovery"
                      className="mt-3"
                    />
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                {sections.owned.map((product) => (
                  <article
                    key={product.id}
                    className="fs-library-card border-emerald-200 bg-emerald-50/50 p-4"
                  >
                    <p className="text-xs font-semibold text-emerald-700">Owned</p>
                    <h3 className={cx("mt-1", cardHeadingClass)}>{product.title}</h3>
                    <p className={cx("mt-2", mutedTextClass)}>{getKindCopy(product)}</p>
                    {!product.active ? (
                      <p className="mt-2 text-xs text-amber-700">
                        This item remains available in your library, but it is currently hidden from
                        new sales.
                      </p>
                    ) : null}
                    <div className="mt-4">
                      <Link
                        href={`/my-library/item/${product.slug}`}
                        className={secondaryActionClass}
                      >
                        Open
                      </Link>
                    </div>
                  </article>
                ))}

                {sections.unknownOwnedProductIds.map((productId) => (
                  <article
                    key={productId}
                    className="fs-library-card border-amber-200 bg-amber-50/50 p-4"
                  >
                    <p className="text-xs font-semibold text-amber-700">Owned</p>
                    <h3 className={cx("mt-1", cardHeadingClass)}>Purchased item</h3>
                    <p className="mt-2 text-xs text-slate-500">Product id: {productId}</p>
                    <p className={cx("mt-2", mutedTextClass)}>
                      This item is owned but not yet mapped in your current catalog view.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link href={claimHref} className={quietActionClass}>
                        Email me access link
                      </Link>
                      <Link href="/contact" className={quietActionClass}>
                        Contact support
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside
            className="space-y-6 lg:sticky lg:top-28 lg:min-w-0"
            data-testid="my-library-dashboard-aside"
          >
            <section id="my-library-explore" className="space-y-4">
              <DashboardSectionHeading eyebrow="Next options" title="Explore available items" />
              <div className="grid gap-3">
                {sections.explore.map((product) => (
                  <article key={product.id} className="fs-library-card p-4">
                    <h3 className={cardHeadingClass}>{product.title}</h3>
                    <p className={cx("mt-2", mutedTextClass)}>{getKindCopy(product)}</p>
                    <div className="mt-4">
                      <CheckoutButton productId={product.id} analyticsSource="library_explore" />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>

        <p className="mt-7 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
          Privacy and cookie details:{" "}
          <Link href="/privacy" className="font-semibold text-blue-700 hover:text-blue-600">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className="font-semibold text-blue-700 hover:text-blue-600">
            Cookie Policy
          </Link>
          .
        </p>
      </section>
    </SiteChrome>
  );
}
