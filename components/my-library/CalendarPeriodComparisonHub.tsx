import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { cx } from "@/components/ui/cx";
import type { MyLibraryCalendarComparisonModel } from "@/lib/my-library/calendar-comparison";
import {
  getCalendarSourceFilterLabel,
  getMyLibraryCalendarPeriodLabel,
  MY_LIBRARY_CALENDAR_PERIODS,
  MY_LIBRARY_CALENDAR_SOURCE_FILTERS,
  type MyLibraryCalendarPeriod,
  type MyLibraryCalendarSourceFilter,
} from "@/lib/my-library/calendar";

type Props = {
  model: MyLibraryCalendarComparisonModel;
};

type SourceComparison = MyLibraryCalendarComparisonModel["sourceComparisons"][number];
type SourceMetric = SourceComparison["metrics"][number];
type InsightTone = SourceMetric["tone"] | "warning";
type MetricHighlight = {
  source: SourceComparison;
  metric: SourceMetric;
};

const cardClass = "fs-library-card p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass =
  "text-[12px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase";
const segmentBaseClass =
  "inline-flex min-h-10 items-center justify-center rounded-[var(--fs-radius-control)] px-3 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const actionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const disabledActionClass =
  "inline-flex min-h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/50 px-4 text-sm font-semibold text-[color:var(--fs-color-muted)]";

function buildCalendarHref({
  source,
  period,
  date,
  compareTo,
}: {
  source: MyLibraryCalendarSourceFilter;
  period: MyLibraryCalendarPeriod;
  date: string;
  compareTo?: string | null;
}) {
  const params = new URLSearchParams();
  params.set("source", source);
  params.set("period", period);
  params.set("date", date);
  if (compareTo) params.set("compareTo", compareTo);
  return `/my-library/calendar?${params.toString()}`;
}

function getSafeSource(source: MyLibraryCalendarComparisonModel["selectedSource"]) {
  return source === "unmapped" ? "all" : source;
}

function getSafePeriod(period: MyLibraryCalendarComparisonModel["selectedPeriod"]) {
  return period === "unmapped" ? "week" : period;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "mapped":
      return "Included";
    case "no_data":
      return "No entries";
    case "syncing":
      return "Syncing";
    case "error":
      return "Needs check";
    case "unmapped":
      return "Not included";
    default:
      return "Unknown";
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case "mapped":
      return "bg-emerald-50 text-emerald-800 ring-emerald-200";
    case "no_data":
      return "bg-white/85 text-[color:var(--fs-color-muted)] ring-[color:var(--fs-border-soft)]";
    case "syncing":
      return "bg-blue-50 text-blue-800 ring-blue-200";
    case "error":
      return "bg-rose-50 text-rose-800 ring-rose-200";
    case "unmapped":
      return "bg-amber-50 text-amber-900 ring-amber-200";
    default:
      return "bg-white/85 text-[color:var(--fs-color-muted)] ring-[color:var(--fs-border-soft)]";
  }
}

function getDeltaClass(tone: SourceMetric["tone"]) {
  if (tone === "positive") return "text-emerald-800";
  if (tone === "negative") return "text-rose-800";
  return "text-[color:var(--fs-color-muted)]";
}

function getTonePanelClass(tone: InsightTone) {
  if (tone === "positive") return "border-emerald-200 bg-emerald-50/80 text-emerald-950";
  if (tone === "negative") return "border-rose-200 bg-rose-50/80 text-rose-950";
  if (tone === "warning") return "border-amber-200 bg-amber-50/80 text-amber-950";
  return "border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-ink)]";
}

function ToneIcon({ tone, className }: { tone: InsightTone; className: string }) {
  const iconProps = { className, "aria-hidden": true as const };
  switch (tone) {
    case "positive":
      return <TrendingUp {...iconProps} />;
    case "negative":
      return <TrendingDown {...iconProps} />;
    case "warning":
      return <AlertTriangle {...iconProps} />;
    default:
      return <Activity {...iconProps} />;
  }
}

function getMetricHighlights(model: MyLibraryCalendarComparisonModel): MetricHighlight[] {
  return model.sourceComparisons.flatMap((source) =>
    source.metrics.map((metric) => ({ source, metric }))
  );
}

function getSourceCountLabel(model: MyLibraryCalendarComparisonModel) {
  const comparableSources = model.sourceComparisons.filter(
    (source) => source.source !== "unmapped"
  );
  const includedSources = comparableSources.filter(
    (source) => source.status === "mapped" && source.metrics.length > 0
  );
  return {
    included: includedSources.length,
    total: comparableSources.length,
    label: `${includedSources.length}/${comparableSources.length}`,
  };
}

function buildPrimaryInsight(model: MyLibraryCalendarComparisonModel): {
  tone: InsightTone;
  value: string;
  title: string;
  body: string;
} {
  if (model.problemLabel) {
    return {
      tone: "warning",
      value: "Check setup",
      title: "This comparison cannot be counted yet",
      body: model.problemLabel,
    };
  }

  const highlights = getMetricHighlights(model);
  const positive = highlights.find((highlight) => highlight.metric.tone === "positive");
  const negative = highlights.find((highlight) => highlight.metric.tone === "negative");
  const neutral = highlights.find((highlight) => highlight.metric.tone === "neutral");
  const lead = positive ?? negative ?? neutral;

  if (!lead) {
    return {
      tone: "neutral",
      value: "No trend yet",
      title: "There is not enough tracked activity to compare",
      body: "Choose a period with saved activity or switch source to see a clearer trend.",
    };
  }

  if (lead.metric.tone === "positive") {
    return {
      tone: "positive",
      value: lead.metric.deltaLabel,
      title: "The strongest signal is improving",
      body: `${lead.source.label}: ${lead.metric.label} is ${lead.metric.currentLabel}, compared with ${lead.metric.comparisonLabel}.`,
    };
  }

  if (lead.metric.tone === "negative") {
    return {
      tone: "negative",
      value: lead.metric.deltaLabel,
      title: "One area needs attention",
      body: `${lead.source.label}: ${lead.metric.label} is ${lead.metric.currentLabel}, compared with ${lead.metric.comparisonLabel}.`,
    };
  }

  return {
    tone: "neutral",
    value: lead.metric.deltaLabel,
    title: "The comparison is steady",
    body: `${lead.source.label}: ${lead.metric.label} is ${lead.metric.currentLabel}, compared with ${lead.metric.comparisonLabel}.`,
  };
}

function buildInsightCards(model: MyLibraryCalendarComparisonModel) {
  const highlights = getMetricHighlights(model);
  const positive = highlights.find((highlight) => highlight.metric.tone === "positive");
  const negative = highlights.find((highlight) => highlight.metric.tone === "negative");
  const sourceCount = getSourceCountLabel(model);

  return [
    {
      id: "best-signal",
      tone: positive ? ("positive" as const) : ("neutral" as const),
      label: "Best signal",
      value: positive?.metric.deltaLabel ?? "No lift yet",
      body: positive
        ? `${positive.source.label}: ${positive.metric.label}`
        : "No mapped metric is above the comparison period.",
    },
    {
      id: "watch-next",
      tone: negative ? ("negative" as const) : ("neutral" as const),
      label: "Watch next",
      value: negative?.metric.deltaLabel ?? "No drop flagged",
      body: negative
        ? `${negative.source.label}: ${negative.metric.label}`
        : "No mapped metric is currently worse than its comparison.",
    },
    {
      id: "included-sources",
      tone:
        sourceCount.included === sourceCount.total ? ("positive" as const) : ("warning" as const),
      label: "Included sources",
      value: sourceCount.label,
      body:
        sourceCount.included === sourceCount.total
          ? "All selected sources have comparison data."
          : "Some sources are waiting for a safe data mapping.",
    },
  ];
}

function renderMetricSummary(metric: SourceMetric) {
  return (
    <div
      key={metric.id}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 border-t border-[color:var(--fs-border-soft)] py-3 first:border-t-0 first:pt-0 last:pb-0"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
          {metric.label}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
          {metric.currentLabel} now, {metric.comparisonLabel} before
        </p>
      </div>
      <p className={cx("text-sm font-bold whitespace-nowrap", getDeltaClass(metric.tone))}>
        {metric.deltaLabel}
      </p>
    </div>
  );
}

function renderSourceDetails(source: SourceComparison) {
  if (!source.details || source.details.length === 0) return null;

  return (
    <dl className="mt-4 grid gap-3 border-t border-[color:var(--fs-border-soft)] pt-4 sm:grid-cols-3">
      {source.details.map((detail) => (
        <div key={detail.id} className="min-w-0">
          <dt className="text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
            {detail.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
            {detail.value}
          </dd>
          {detail.supportLabel ? (
            <dd className="mt-1 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
              {detail.supportLabel}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

export default function CalendarPeriodComparisonHub({ model }: Props) {
  const safeSource = getSafeSource(model.selectedSource);
  const safePeriod = getSafePeriod(model.selectedPeriod);
  const primaryInsight = buildPrimaryInsight(model);
  const insightCards = buildInsightCards(model);
  const compareLabel =
    model.window.comparisonMode === "explicit" ? "selected comparison" : "previous period";

  return (
    <div className="space-y-6" data-testid="calendar-period-comparison-hub">
      <section className={cardClass} data-testid="calendar-insight-summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={eyebrowClass}>Calendar insight</p>
            <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fs-color-ink-strong)]">
              {primaryInsight.title}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildCalendarHref({
                source: safeSource,
                period: safePeriod,
                date: model.window.previousPeriodDate,
              })}
              className={actionClass}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Link>
            <Link
              href={buildCalendarHref({
                source: safeSource,
                period: safePeriod,
                date: model.window.todayDate,
              })}
              className={actionClass}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Today
            </Link>
            {model.window.canGoNext ? (
              <Link
                href={buildCalendarHref({
                  source: safeSource,
                  period: safePeriod,
                  date: model.window.nextPeriodDate,
                })}
                className={actionClass}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <span className={disabledActionClass} aria-disabled="true">
                Next
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </span>
            )}
          </div>
        </div>

        <div
          className={cx(
            "mt-5 rounded-[var(--fs-radius-panel)] border p-4 sm:grid sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-4 sm:p-5",
            getTonePanelClass(primaryInsight.tone)
          )}
        >
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/80 ring-1 ring-current/10 sm:mb-0">
            <ToneIcon tone={primaryInsight.tone} className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[32px] leading-none font-bold tracking-normal sm:text-[40px]">
              {primaryInsight.value}
            </p>
            <p className="mt-2 max-w-[70ch] text-sm leading-6">{primaryInsight.body}</p>
            <p className="mt-3 text-xs leading-relaxed opacity-80">
              Current: {model.window.current.shortLabel}. Compared with {compareLabel}:{" "}
              {model.window.comparison.shortLabel}.
            </p>
          </div>
        </div>
      </section>

      <section aria-label="Calendar period key takeaways" className="grid gap-4 md:grid-cols-3">
        {insightCards.map((card) => {
          return (
            <article
              key={card.id}
              className={cx(cardClass, "border", getTonePanelClass(card.tone))}
              data-testid={`calendar-insight-card-${card.id}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold tracking-wide uppercase opacity-75">
                  {card.label}
                </p>
                <ToneIcon tone={card.tone} className="h-4 w-4 shrink-0" />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-normal">{card.value}</p>
              <p className="mt-2 text-sm leading-6 opacity-85">{card.body}</p>
            </article>
          );
        })}
      </section>

      <section className={cardClass} data-testid="calendar-period-controls">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <div>
            <p className={eyebrowClass}>View options</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              Source
            </p>
            <nav aria-label="Calendar sources" className="mt-2 flex flex-wrap gap-2">
              {MY_LIBRARY_CALENDAR_SOURCE_FILTERS.map((source) => {
                const isActive = model.selectedSource === source;
                return (
                  <Link
                    key={source}
                    href={buildCalendarHref({
                      source,
                      period: safePeriod,
                      date: model.window.selectedDate,
                    })}
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      segmentBaseClass,
                      isActive
                        ? "bg-[color:var(--fs-color-brand-700)] text-white shadow-sm"
                        : "border border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-muted)] hover:bg-[color:var(--fs-color-brand-50)] hover:text-[color:var(--fs-color-brand-700)]"
                    )}
                  >
                    {getCalendarSourceFilterLabel(source)}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">Period</p>
            <nav
              aria-label="Calendar periods"
              className="mt-2 grid max-w-[420px] grid-cols-3 gap-2"
            >
              {MY_LIBRARY_CALENDAR_PERIODS.map((period) => {
                const isActive = model.selectedPeriod === period;
                return (
                  <Link
                    key={period}
                    href={buildCalendarHref({
                      source: safeSource,
                      period,
                      date: model.window.selectedDate,
                    })}
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      segmentBaseClass,
                      isActive
                        ? "bg-[color:var(--fs-color-brand-700)] text-white shadow-sm"
                        : "border border-[color:var(--fs-border-soft)] bg-white/75 text-[color:var(--fs-color-muted)] hover:bg-[color:var(--fs-color-brand-50)] hover:text-[color:var(--fs-color-brand-700)]"
                    )}
                  >
                    {getMyLibraryCalendarPeriodLabel(period)}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-[color:var(--fs-border-soft)] pt-5 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <CalendarRange
              className="mt-1 h-4 w-4 text-[color:var(--fs-color-brand-700)]"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                Current
              </p>
              <p className={mutedTextClass}>{model.window.current.label}</p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              {model.window.comparisonMode === "explicit"
                ? "Selected comparison"
                : "Previous period"}
            </p>
            <p className={mutedTextClass}>{model.window.comparison.label}</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="calendar-source-comparison-heading" className="space-y-4">
        <div>
          <p className={eyebrowClass}>What changed</p>
          <h2
            id="calendar-source-comparison-heading"
            className="mt-2 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            Source signals
          </h2>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {model.sourceComparisons.map((source) => (
            <article
              key={source.source}
              data-testid={`calendar-source-${source.source}`}
              className={cardClass}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {source.label}
                  </h3>
                  <p className={cx("mt-2", mutedTextClass)}>{source.summary}</p>
                </div>
                <span
                  className={cx(
                    "rounded-[var(--fs-radius-control)] px-2.5 py-1 text-xs font-semibold ring-1",
                    getStatusClass(source.status)
                  )}
                >
                  {getStatusLabel(source.status)}
                </span>
              </div>

              {renderSourceDetails(source)}

              {source.metrics.length > 0 ? (
                <div className="mt-4">{source.metrics.slice(0, 3).map(renderMetricSummary)}</div>
              ) : (
                <p className="mt-4 text-sm leading-6 text-[color:var(--fs-color-muted)]">
                  {source.supportLabel}
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className={cardClass} data-testid="calendar-period-details">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--fs-color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            Detailed numbers
          </summary>
          <div className="mt-5 space-y-6">
            {model.sourceComparisons.map((source) => (
              <div
                key={source.source}
                className="border-t border-[color:var(--fs-border-soft)] pt-5 first:border-t-0 first:pt-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                    {source.label}
                  </h3>
                  <span
                    className={cx(
                      "rounded-[var(--fs-radius-control)] px-2.5 py-1 text-xs font-semibold ring-1",
                      getStatusClass(source.status)
                    )}
                  >
                    {getStatusLabel(source.status)}
                  </span>
                </div>

                {source.metrics.length > 0 ? (
                  <div className="mt-4">
                    <table className="w-full table-fixed text-left text-xs sm:text-sm">
                      <thead className="text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                        <tr>
                          <th scope="col" className="w-[34%] py-2 pr-2 sm:pr-3">
                            Metric
                          </th>
                          <th scope="col" className="w-[21%] px-2 py-2 sm:px-3">
                            Current
                          </th>
                          <th scope="col" className="w-[21%] px-2 py-2 sm:px-3">
                            Compare
                          </th>
                          <th scope="col" className="w-[24%] py-2 pl-2 sm:pl-3">
                            Change
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[color:var(--fs-border-soft)]">
                        {source.metrics.map((metric) => (
                          <tr key={metric.id}>
                            <th
                              scope="row"
                              className="py-3 pr-2 align-top font-semibold break-words text-[color:var(--fs-color-ink-strong)] sm:pr-3"
                            >
                              {metric.label}
                            </th>
                            <td className="px-2 py-3 align-top break-words text-[color:var(--fs-color-ink)] sm:px-3">
                              {metric.currentLabel}
                            </td>
                            <td className="px-2 py-3 align-top break-words text-[color:var(--fs-color-muted)] sm:px-3">
                              {metric.comparisonLabel}
                            </td>
                            <td
                              className={cx(
                                "py-3 pl-2 align-top font-semibold break-words sm:pl-3",
                                getDeltaClass(metric.tone)
                              )}
                            >
                              {metric.deltaLabel}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                <p className="mt-4 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
                  {source.supportLabel}
                </p>
              </div>
            ))}
          </div>
        </details>
      </section>

      {model.problemLabel ? (
        <div
          className="rounded-[var(--fs-radius-card)] bg-amber-50 p-4 text-sm leading-6 text-amber-950 ring-1 ring-amber-200"
          data-testid="calendar-period-problem"
        >
          {model.problemLabel}
        </div>
      ) : null}
    </div>
  );
}
