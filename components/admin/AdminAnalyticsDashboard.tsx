"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AdminManagerState from "@/components/admin/AdminManagerState";
import { cx } from "@/components/ui/cx";
import {
  ANALYTICS_DASHBOARD_RANGE_OPTIONS,
  buildAnalyticsDashboardViewModel,
  normalizeAnalyticsDashboardRangeDays,
  type AnalyticsDashboardApiResponse,
  type AnalyticsDashboardPayload,
  type AnalyticsDashboardRangeDays,
  type AnalyticsDashboardViewModel,
} from "@/lib/analytics/admin-dashboard";

type LoadState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "loaded"; payload: AnalyticsDashboardPayload };

const managerHeaderClass = "fs-library-card fs-library-card-accent p-4 sm:p-5";
const panelClass = "fs-library-card p-4 sm:p-5";
const mutedPanelClass = "fs-library-card fs-library-card-muted p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass = "text-[13px] font-semibold text-[color:var(--fs-color-brand-700)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const rangeButtonBaseClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const metadataLabelClass =
  "text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase";

function stateTone(state: AnalyticsDashboardViewModel["state"]) {
  if (state === "schema-missing" || state === "capped" || state === "quiet") return "warning";
  if (state === "no-data") return "empty";
  return "success";
}

function buildInsightsUrl(rangeDays: AnalyticsDashboardRangeDays): string {
  const params = new URLSearchParams();
  params.set("rangeDays", String(rangeDays));
  return `/api/admin/analytics/insights?${params.toString()}`;
}

function isLoadedPayload(
  payload: AnalyticsDashboardApiResponse
): payload is AnalyticsDashboardPayload {
  return payload.ok === true;
}

async function fetchAnalyticsState(
  rangeDays: AnalyticsDashboardRangeDays
): Promise<Extract<LoadState, { status: "error" | "loaded" }>> {
  const normalizedRange = normalizeAnalyticsDashboardRangeDays(rangeDays);
  try {
    const response = await fetch(buildInsightsUrl(normalizedRange), {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = (await response.json()) as AnalyticsDashboardApiResponse;
    if (!response.ok || !isLoadedPayload(payload)) {
      return {
        status: "error",
        error: isLoadedPayload(payload)
          ? "Could not load analytics dashboard."
          : (payload.error ?? "Could not load analytics dashboard."),
      };
    }

    return { status: "loaded", payload };
  } catch {
    return { status: "error", error: "Could not load analytics dashboard." };
  }
}

function ListPanel({
  emptyLabel,
  items,
  title,
  testId,
}: {
  emptyLabel: string;
  items: AnalyticsDashboardViewModel["eventItems"];
  title: string;
  testId: string;
}) {
  return (
    <section className={panelClass} data-testid={testId}>
      <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">{title}</h3>
      {items.length === 0 ? (
        <p className={cx("mt-3", mutedTextClass)}>{emptyLabel}</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={`${testId}:${item.key}:${index}`}
              className="flex min-w-0 items-start justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                  {item.label}
                </p>
                {item.secondary ? (
                  <p className="mt-0.5 text-xs break-words text-[color:var(--fs-color-muted)]">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {item.count}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function WorkoutBuilderFunnelPanel({
  funnel,
}: {
  funnel: AnalyticsDashboardViewModel["workoutBuilderFunnel"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-builder-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-builder-funnel"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Workout builder</p>
          <h3
            id="admin-analytics-workout-builder-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Builder starts and saves
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{funnel.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
          Product telemetry
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {funnel.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              {metric.detail ? <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p> : null}
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{funnel.caveat}</p>
    </section>
  );
}

function ExistingUpsellBaselinePanel({
  baseline,
}: {
  baseline: AnalyticsDashboardViewModel["existingUpsellBaseline"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-existing-upsell-heading"
      className={panelClass}
      data-testid="admin-analytics-existing-upsell-baseline"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-existing-upsell-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Current sales prompts
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{baseline.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
          Plans and library
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {baseline.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              {metric.detail ? <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p> : null}
            </dd>
          </div>
        ))}
      </dl>

      {baseline.sourceItems.length === 0 ? (
        <p className={cx("mt-4", mutedTextClass)}>{baseline.emptyLabel}</p>
      ) : (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {baseline.sourceItems.map((item, index) => (
            <li
              key={`existing-upsell:${item.key}:${index}`}
              className="flex min-w-0 items-start justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                  {item.label}
                </p>
                {item.secondary ? (
                  <p className="mt-0.5 text-xs break-words text-[color:var(--fs-color-muted)]">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {item.count}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className={cx("mt-4", mutedTextClass)}>{baseline.caveat}</p>
    </section>
  );
}

function WorkoutContextStageSummaryPanel({
  summary,
}: {
  summary: AnalyticsDashboardViewModel["workoutContextStageSummary"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-context-stage-summary-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-context-stage-summary"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-workout-context-stage-summary-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Poolside guide paused funnel
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{summary.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">Paused path</p>
      </div>

      <ol className="mt-4 space-y-3">
        {summary.stages.map((stage) => (
          <li key={stage.id}>
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {stage.label}
                </p>
                <p className="mt-0.5 text-xs text-[color:var(--fs-color-muted)]">{stage.detail}</p>
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {stage.count}
              </p>
            </div>
            <div className="mt-2 h-2 rounded-full bg-slate-100" aria-hidden="true">
              <div
                className="h-2 rounded-full bg-[color:var(--fs-color-brand-600)]"
                style={{ width: `${stage.percentOfMax}%` }}
              />
            </div>
          </li>
        ))}
      </ol>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summary.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{summary.caveat}</p>
    </section>
  );
}

function WorkoutContextCtaPanel({
  cta,
}: {
  cta: AnalyticsDashboardViewModel["workoutContextCta"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-context-cta-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-context-cta"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-workout-context-cta-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Poolside guide prompt readiness
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{cta.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">Paused path</p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cta.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{cta.caveat}</p>
    </section>
  );
}

function WorkoutContextCheckoutStartedPanel({
  checkoutStarted,
}: {
  checkoutStarted: AnalyticsDashboardViewModel["workoutContextCheckoutStarted"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-context-checkout-started-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-context-checkout-started"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-workout-context-checkout-started-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Poolside guide checkout readiness
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{checkoutStarted.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">Paused path</p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {checkoutStarted.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{checkoutStarted.caveat}</p>
    </section>
  );
}

function WorkoutContextCheckoutOutcomePanel({
  outcome,
}: {
  outcome: AnalyticsDashboardViewModel["workoutContextCheckoutOutcome"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-context-checkout-outcome-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-context-checkout-outcome"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-workout-context-checkout-outcome-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Poolside guide access readiness
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{outcome.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">Paused path</p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {outcome.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      {outcome.reviewItems.length === 0 ? (
        <p className={cx("mt-4", mutedTextClass)}>{outcome.emptyReviewLabel}</p>
      ) : (
        <div className="mt-4">
          <p className={metadataLabelClass}>Review signals</p>
          <ul className="mt-2 grid gap-2">
            {outcome.reviewItems.map((item) => (
              <li
                key={item.key}
                className="flex min-w-0 items-start justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words text-[color:var(--fs-color-ink-strong)]">
                    {item.label}
                  </p>
                  {item.secondary ? (
                    <p className="mt-0.5 text-xs break-words text-[color:var(--fs-color-muted)]">
                      {item.secondary}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                  {item.count}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={cx("mt-4", mutedTextClass)}>{outcome.caveat}</p>
    </section>
  );
}

function WorkoutContextCheckoutCancelPanel({
  cancel,
}: {
  cancel: AnalyticsDashboardViewModel["workoutContextCheckoutCancel"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-context-checkout-cancel-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-context-checkout-cancel"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Commerce</p>
          <h3
            id="admin-analytics-workout-context-checkout-cancel-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Poolside guide checkout cancel readiness
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{cancel.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">Paused path</p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        {cancel.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      {cancel.reviewItems.length === 0 ? (
        <p className={cx("mt-4", mutedTextClass)}>{cancel.emptyReviewLabel}</p>
      ) : (
        <div className="mt-4">
          <p className={metadataLabelClass}>Review signals</p>
          <ul className="mt-2 grid gap-2">
            {cancel.reviewItems.map((item) => (
              <li
                key={item.key}
                className="flex min-w-0 items-start justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium break-words text-[color:var(--fs-color-ink-strong)]">
                    {item.label}
                  </p>
                  {item.secondary ? (
                    <p className="mt-0.5 text-xs break-words text-[color:var(--fs-color-muted)]">
                      {item.secondary}
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                  {item.count}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className={cx("mt-4", mutedTextClass)}>{cancel.caveat}</p>
    </section>
  );
}

function WorkoutBuilderSourceBreakdownPanel({
  breakdown,
}: {
  breakdown: AnalyticsDashboardViewModel["workoutBuilderSourceBreakdown"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-builder-source-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-builder-source-breakdown"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Workout builder</p>
          <h3
            id="admin-analytics-workout-builder-source-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Manual vs generated workouts
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{breakdown.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
          Product telemetry
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {breakdown.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{breakdown.caveat}</p>
    </section>
  );
}

function WorkoutBuilderTemplateGeneratedCompletionPanel({
  completion,
}: {
  completion: AnalyticsDashboardViewModel["workoutBuilderTemplateGeneratedCompletion"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-builder-generated-completion-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-builder-template-generated-completion"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Workout builder</p>
          <h3
            id="admin-analytics-workout-builder-generated-completion-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Generated sessions
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{completion.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
          Product telemetry
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {completion.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      <p className={cx("mt-4", mutedTextClass)}>{completion.caveat}</p>
    </section>
  );
}

function WorkoutBuilderTemplateUsagePanel({
  usage,
}: {
  usage: AnalyticsDashboardViewModel["workoutBuilderTemplateUsage"];
}) {
  return (
    <section
      aria-labelledby="admin-analytics-workout-builder-template-usage-heading"
      className={panelClass}
      data-testid="admin-analytics-workout-builder-template-usage"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className={metadataLabelClass}>Workout builder</p>
          <h3
            id="admin-analytics-workout-builder-template-usage-heading"
            className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Template starts
          </h3>
          <p className={cx("mt-1", mutedTextClass)}>{usage.detail}</p>
        </div>
        <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
          Product telemetry
        </p>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {usage.metrics.map((metric) => (
          <div key={metric.id} className="min-w-0">
            <dt className={metadataLabelClass}>{metric.label}</dt>
            <dd className="mt-1">
              <p className="text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {metric.value}
              </p>
              <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
            </dd>
          </div>
        ))}
      </dl>

      {usage.items.length === 0 ? (
        <p className={cx("mt-4", mutedTextClass)}>{usage.emptyLabel}</p>
      ) : (
        <ul className="mt-4 space-y-2">
          {usage.items.map((item, index) => (
            <li
              key={`template-usage:${item.key}:${index}`}
              className="flex min-w-0 items-start justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                  {item.label}
                </p>
                {item.secondary ? (
                  <p className="mt-0.5 text-xs break-words text-[color:var(--fs-color-muted)]">
                    {item.secondary}
                  </p>
                ) : null}
              </div>
              <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                {item.count}
              </p>
            </li>
          ))}
        </ul>
      )}

      <p className={cx("mt-4", mutedTextClass)}>{usage.caveat}</p>
    </section>
  );
}

export default function AdminAnalyticsDashboard() {
  const [rangeDays, setRangeDays] = useState<AnalyticsDashboardRangeDays>(30);
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  const reloadAnalytics = useCallback(async (nextRangeDays: AnalyticsDashboardRangeDays) => {
    setLoadState({ status: "loading" });
    setLoadState(await fetchAnalyticsState(nextRangeDays));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadSelectedRange() {
      const nextState = await fetchAnalyticsState(rangeDays);
      if (active) setLoadState(nextState);
    }

    void loadSelectedRange();
    return () => {
      active = false;
    };
  }, [rangeDays]);

  const viewModel = useMemo(
    () =>
      loadState.status === "loaded" ? buildAnalyticsDashboardViewModel(loadState.payload) : null,
    [loadState]
  );

  function selectRange(nextRangeDays: AnalyticsDashboardRangeDays) {
    if (nextRangeDays === rangeDays) return;
    setLoadState({ status: "loading" });
    setRangeDays(nextRangeDays);
  }

  return (
    <section className="space-y-4" data-testid="admin-analytics-dashboard">
      <div className={managerHeaderClass} data-testid="admin-analytics-dashboard-header">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className={eyebrowClass}>Analytics</p>
            <h2 className={cx("mt-1", headingClass)}>Read-only insight dashboard</h2>
            <p className={cx("mt-2 max-w-3xl", mutedTextClass)}>
              Privacy-safe product, route, and commerce signals from first-party logged actions.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reloadAnalytics(rangeDays)}
            className={secondaryActionClass}
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <p id="admin-analytics-range-label" className={metadataLabelClass}>
            Range
          </p>
          <div
            role="group"
            aria-labelledby="admin-analytics-range-label"
            className="inline-flex flex-wrap gap-2"
          >
            {ANALYTICS_DASHBOARD_RANGE_OPTIONS.map((option) => {
              const selected = option === rangeDays;
              return (
                <button
                  key={option}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectRange(option)}
                  className={cx(
                    rangeButtonBaseClass,
                    selected
                      ? "bg-[color:var(--fs-color-brand-700)] text-white"
                      : "border border-[color:var(--fs-border-soft)] bg-white/85 text-[color:var(--fs-color-muted)] hover:border-[color:var(--fs-border-brand)] hover:text-[color:var(--fs-color-brand-700)]"
                  )}
                >
                  {option} days
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {loadState.status === "loading" ? (
        <AdminManagerState tone="loading">Loading analytics dashboard...</AdminManagerState>
      ) : null}

      {loadState.status === "error" ? (
        <AdminManagerState
          tone="error"
          actions={
            <button
              type="button"
              onClick={() => void reloadAnalytics(rangeDays)}
              className={secondaryActionClass}
            >
              Retry
            </button>
          }
        >
          {loadState.error}
        </AdminManagerState>
      ) : null}

      {viewModel ? (
        <>
          <section className={mutedPanelClass} data-testid="admin-analytics-health">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
              <div>
                <p className={metadataLabelClass}>Data health</p>
                <p className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {viewModel.stateLabel}
                </p>
                <p className={cx("mt-1", mutedTextClass)}>{viewModel.stateDetail}</p>
              </div>
              <dl className="grid gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <dt className={metadataLabelClass}>Range</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {viewModel.rangeLabel}
                  </dd>
                </div>
                <div>
                  <dt className={metadataLabelClass}>Generated</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {viewModel.generatedAtLabel}
                  </dd>
                </div>
                <div>
                  <dt className={metadataLabelClass}>Last activity</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {viewModel.lastEventLabel}
                  </dd>
                </div>
                <div>
                  <dt className={metadataLabelClass}>Read limit</dt>
                  <dd className="mt-1 font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {viewModel.rowCapLabel}
                  </dd>
                </div>
              </dl>
            </div>
            <AdminManagerState
              tone={stateTone(viewModel.state)}
              density="compact"
              className="mt-4"
              testId="admin-analytics-trust-state"
            >
              {viewModel.stateDetail}
            </AdminManagerState>
          </section>

          <section
            aria-label="Analytics metrics"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            data-testid="admin-analytics-kpis"
          >
            {viewModel.metrics.map((metric) => (
              <article key={metric.id} className={panelClass}>
                <p className={metadataLabelClass}>{metric.label}</p>
                <p className="mt-2 text-xl font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                  {metric.value}
                </p>
                <p className={cx("mt-1", mutedTextClass)}>{metric.detail}</p>
              </article>
            ))}
          </section>

          <section className={panelClass} data-testid="admin-analytics-funnel">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className={metadataLabelClass}>Funnel</p>
                <h3 className="mt-1 text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                  Public to entitlement signal
                </h3>
              </div>
              <p className="text-xs font-semibold text-[color:var(--fs-color-muted)]">
                Read-only proxy
              </p>
            </div>
            {viewModel.funnel.length === 0 ? (
              <p className={cx("mt-3", mutedTextClass)}>Funnel is not counted yet.</p>
            ) : (
              <ol className="mt-4 space-y-3">
                {viewModel.funnel.map((step) => (
                  <li key={step.id}>
                    <div className="flex min-w-0 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                          {step.label}
                        </p>
                        <p className="mt-0.5 text-xs text-[color:var(--fs-color-muted)]">
                          {step.detail}
                        </p>
                      </div>
                      <p className="shrink-0 text-right text-sm font-semibold text-[color:var(--fs-color-ink-strong)] tabular-nums">
                        {step.count}
                      </p>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100" aria-hidden="true">
                      <div
                        className="h-2 rounded-full bg-[color:var(--fs-color-brand-600)]"
                        style={{ width: `${step.percentOfMax}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <ExistingUpsellBaselinePanel baseline={viewModel.existingUpsellBaseline} />
          <WorkoutContextStageSummaryPanel summary={viewModel.workoutContextStageSummary} />
          <WorkoutContextCtaPanel cta={viewModel.workoutContextCta} />
          <WorkoutContextCheckoutStartedPanel
            checkoutStarted={viewModel.workoutContextCheckoutStarted}
          />
          <WorkoutContextCheckoutOutcomePanel outcome={viewModel.workoutContextCheckoutOutcome} />
          <WorkoutContextCheckoutCancelPanel cancel={viewModel.workoutContextCheckoutCancel} />
          <WorkoutBuilderFunnelPanel funnel={viewModel.workoutBuilderFunnel} />
          <WorkoutBuilderSourceBreakdownPanel breakdown={viewModel.workoutBuilderSourceBreakdown} />
          <WorkoutBuilderTemplateGeneratedCompletionPanel
            completion={viewModel.workoutBuilderTemplateGeneratedCompletion}
          />
          <WorkoutBuilderTemplateUsagePanel usage={viewModel.workoutBuilderTemplateUsage} />

          <div className="grid gap-4 lg:grid-cols-3" data-testid="admin-analytics-top-lists">
            <ListPanel
              title="Top tracked actions"
              emptyLabel="No tracked action counts in this range."
              items={viewModel.eventItems}
              testId="admin-analytics-top-events"
            />
            <ListPanel
              title="Top routes"
              emptyLabel="No route counts in this range."
              items={viewModel.routeItems}
              testId="admin-analytics-top-routes"
            />
            <ListPanel
              title="Top products"
              emptyLabel="No product counts in this range."
              items={viewModel.productItems}
              testId="admin-analytics-top-products"
            />
          </div>

          <section className={mutedPanelClass} data-testid="admin-analytics-caveats">
            <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
              Caveats
            </h3>
            <ul className="mt-3 list-inside list-disc space-y-1 text-sm leading-6 text-[color:var(--fs-color-muted)]">
              {viewModel.caveats.map((caveat) => (
                <li key={caveat}>{caveat}</li>
              ))}
            </ul>
          </section>
        </>
      ) : null}
    </section>
  );
}
