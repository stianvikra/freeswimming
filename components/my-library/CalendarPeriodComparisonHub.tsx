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
  buildMyLibraryCalendarComparisonHref,
  getCalendarSourceFilterLabel,
  getCalendarSourceSelectionLabel,
  getMyLibraryCalendarPeriodLabel,
  MY_LIBRARY_CALENDAR_PERIODS,
  MY_LIBRARY_CALENDAR_SOURCE_FILTERS,
} from "@/lib/my-library/calendar";
import CalendarTrendSourceSelect from "@/components/my-library/CalendarTrendSourceSelect";

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
type PrimaryInsight = {
  tone: InsightTone;
  value: string;
  title: string;
  body: string;
};

const cardClass = "fs-library-card p-4 sm:p-5";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const eyebrowClass =
  "text-[12px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase";
const segmentBaseClass =
  "inline-flex min-h-11 items-center justify-center rounded-[var(--fs-radius-control)] px-4 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const actionClass =
  "fs-cta-secondary inline-flex min-h-11 shrink-0 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const disabledActionClass =
  "inline-flex min-h-11 shrink-0 cursor-not-allowed items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/50 px-4 text-sm font-semibold text-[color:var(--fs-color-muted)]";

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
    case "review":
      return "Needs review";
    case "syncing":
      return "Syncing";
    case "error":
      return "Needs check";
    case "unmapped":
      return "Not included yet";
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
    case "review":
      return "bg-amber-50 text-amber-900 ring-amber-200";
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

function capitalizeFirst(value: string): string {
  return `${value.charAt(0).toUpperCase()}${value.slice(1)}`;
}

function getCurrentPeriodPhrase(model: MyLibraryCalendarComparisonModel): string {
  const periodLabel = getMyLibraryCalendarPeriodLabel(
    getSafePeriod(model.selectedPeriod)
  ).toLowerCase();
  return model.window.selectedDate === model.window.todayDate
    ? `this ${periodLabel}`
    : `selected ${periodLabel}`;
}

function getComparisonPeriodPhrase(model: MyLibraryCalendarComparisonModel): string {
  if (model.window.comparisonMode === "explicit") return "selected comparison";
  const periodLabel = getMyLibraryCalendarPeriodLabel(
    getSafePeriod(model.selectedPeriod)
  ).toLowerCase();
  return model.window.selectedDate === model.window.todayDate
    ? `last ${periodLabel}`
    : `previous ${periodLabel}`;
}

function getSelectedRangePeriodLabel(model: MyLibraryCalendarComparisonModel): string {
  const phrase = capitalizeFirst(getCurrentPeriodPhrase(model));
  const isPartialPeriod = model.window.current.endDate < model.window.current.fullEndDate;
  return isPartialPeriod && model.window.selectedDate === model.window.todayDate
    ? `${phrase} so far`
    : phrase;
}

function getComparisonRangeHeading(model: MyLibraryCalendarComparisonModel): string {
  const phrase = capitalizeFirst(getComparisonPeriodPhrase(model));
  const isPartialPeriod = model.window.current.endDate < model.window.current.fullEndDate;
  return isPartialPeriod && model.window.comparisonMode === "previous"
    ? `${phrase}, same days`
    : phrase;
}

function buildMetricPeriodSentence(
  model: MyLibraryCalendarComparisonModel,
  metric: SourceMetric
): string {
  const comparisonValue =
    metric.id === "swim_activities"
      ? metric.comparisonLabel.replace(/ completed swims?$/, "")
      : metric.comparisonLabel;
  return `${capitalizeFirst(getCurrentPeriodPhrase(model))} ${metric.currentLabel} vs ${comparisonValue} ${getComparisonPeriodPhrase(model)}.`;
}

function getMetricCardBody(
  model: MyLibraryCalendarComparisonModel,
  highlight: MetricHighlight
): string {
  return model.sourceComparisons.length === 1
    ? highlight.metric.label
    : `${highlight.source.label}: ${highlight.metric.label}`;
}

function getPrimaryInsightTitle(model: MyLibraryCalendarComparisonModel, lead: MetricHighlight) {
  if (lead.source.source === "swimming" && lead.metric.id === "swim_activities") {
    return "Completed Swim Sessions";
  }
  if (lead.metric.tone === "positive") return `${getMetricCardBody(model, lead)} improved`;
  if (lead.metric.tone === "negative") return `${getMetricCardBody(model, lead)} needs attention`;
  return `${getMetricCardBody(model, lead)} is steady`;
}

function getPrimarySourceDetails(source: SourceComparison) {
  if (!source.details) return [];
  if (source.source !== "swimming") return source.details;
  return source.details.filter((detail) => detail.id === "trusted_swim_rows");
}

function getPrimarySourceMetrics(source: SourceComparison) {
  if (source.source !== "swimming") return source.metrics;
  return source.metrics;
}

function getComparisonDetailsSummaryLabel(model: MyLibraryCalendarComparisonModel) {
  if (model.sourceComparisons.length !== 1) return "All source comparison details";
  const source = model.sourceComparisons[0];
  if (source.source === "swimming") return "Swim calculation details";
  if (source.source === "micro_sessions") return "Micro Session comparison details";
  return `${source.label} comparison details`;
}

function isSingleSourceSwimming(model: MyLibraryCalendarComparisonModel): boolean {
  return model.sourceComparisons.length === 1 && model.sourceComparisons[0].source === "swimming";
}

function getDetailsSourceDetails(source: SourceComparison) {
  if (!source.details) return [];
  if (source.source !== "swimming") return source.details;
  return source.details.filter((detail) => detail.id !== "trusted_swim_rows");
}

function shouldShowInsightCards(model: MyLibraryCalendarComparisonModel): boolean {
  return !isSingleSourceSwimming(model);
}

function buildSwimmingHeroBody(model: MyLibraryCalendarComparisonModel, metric: SourceMetric) {
  const comparisonValue = metric.comparisonLabel.replace(/ completed swims?$/, "");
  return `${metric.currentLabel} ${getCurrentPeriodPhrase(model)} vs ${comparisonValue} ${getComparisonPeriodPhrase(model)}.`;
}

function buildPrimaryInsight(model: MyLibraryCalendarComparisonModel): PrimaryInsight {
  if (model.problemLabel) {
    return {
      tone: "warning",
      value: "Check setup",
      title: "This comparison cannot be counted yet",
      body: model.problemLabel,
    };
  }

  const reviewSource = model.sourceComparisons.find((source) => source.status === "review");
  if (reviewSource) {
    return {
      tone: "warning",
      value: "Needs review",
      title: `${reviewSource.label} data needs review`,
      body: reviewSource.summary,
    };
  }

  const highlights = getMetricHighlights(model);
  const positive = highlights.find((highlight) => highlight.metric.tone === "positive");
  const negative = highlights.find((highlight) => highlight.metric.tone === "negative");
  const neutral = highlights.find((highlight) => highlight.metric.tone === "neutral");
  const lead = positive ?? negative ?? neutral;
  const comparisonPeriodPhrase = getComparisonPeriodPhrase(model);

  if (!lead) {
    return {
      tone: "neutral",
      value: "No trend yet",
      title: "There is not enough tracked activity to compare",
      body: "Choose a period with saved activity or switch source to see a clearer trend.",
    };
  }

  if (lead.source.source === "habits" && lead.metric.id === "habit_completion_average") {
    if (lead.metric.tone === "positive") {
      return {
        tone: "positive",
        value: lead.metric.deltaLabel,
        title: "Consistency improved",
        body: `You hit ${lead.metric.currentLabel} of habit targets, up from ${lead.metric.comparisonLabel} ${comparisonPeriodPhrase}.`,
      };
    }

    if (lead.metric.tone === "negative") {
      return {
        tone: "negative",
        value: lead.metric.deltaLabel,
        title: "Consistency dropped",
        body: `You hit ${lead.metric.currentLabel} of habit targets, down from ${lead.metric.comparisonLabel} ${comparisonPeriodPhrase}.`,
      };
    }

    return {
      tone: "neutral",
      value: lead.metric.deltaLabel,
      title: "Consistency stayed steady",
      body: `You hit ${lead.metric.currentLabel} of habit targets, the same as ${lead.metric.comparisonLabel} ${comparisonPeriodPhrase}.`,
    };
  }

  if (lead.metric.tone === "positive") {
    return {
      tone: "positive",
      value: lead.metric.deltaLabel,
      title: getPrimaryInsightTitle(model, lead),
      body:
        lead.source.source === "swimming" && lead.metric.id === "swim_activities"
          ? buildSwimmingHeroBody(model, lead.metric)
          : buildMetricPeriodSentence(model, lead.metric),
    };
  }

  if (lead.metric.tone === "negative") {
    return {
      tone: "negative",
      value: lead.metric.deltaLabel,
      title: getPrimaryInsightTitle(model, lead),
      body:
        lead.source.source === "swimming" && lead.metric.id === "swim_activities"
          ? buildSwimmingHeroBody(model, lead.metric)
          : buildMetricPeriodSentence(model, lead.metric),
    };
  }

  return {
    tone: "neutral",
    value: lead.metric.deltaLabel,
    title: getPrimaryInsightTitle(model, lead),
    body:
      lead.source.source === "swimming" && lead.metric.id === "swim_activities"
        ? buildSwimmingHeroBody(model, lead.metric)
        : buildMetricPeriodSentence(model, lead.metric),
  };
}

function buildInsightCards(model: MyLibraryCalendarComparisonModel) {
  const highlights = getMetricHighlights(model);
  const positive = highlights.find((highlight) => highlight.metric.tone === "positive");
  const negative = highlights.find((highlight) => highlight.metric.tone === "negative");
  const sourceCount = getSourceCountLabel(model);
  const singleSource = model.sourceComparisons.length === 1 ? model.sourceComparisons[0] : null;
  const singleSourceNeedsReview = singleSource?.status === "review";
  const comparisonPhrase = getComparisonPeriodPhrase(model);

  return [
    {
      id: "best-signal",
      tone: positive ? ("positive" as const) : ("neutral" as const),
      label: "Best signal",
      value: positive?.metric.deltaLabel ?? "No improvement yet",
      body: positive
        ? getMetricCardBody(model, positive)
        : "No tracked metric is better than the comparison period.",
    },
    {
      id: "watch-next",
      tone: negative ? ("negative" as const) : ("neutral" as const),
      label: "Needs attention",
      value: negative?.metric.deltaLabel ?? "Nothing dropped",
      body: negative
        ? getMetricCardBody(model, negative)
        : singleSource
          ? `Nothing is lower than ${comparisonPhrase}.`
          : `No selected number is lower than ${comparisonPhrase}.`,
    },
    {
      id: "included-sources",
      tone:
        sourceCount.included === sourceCount.total ? ("positive" as const) : ("warning" as const),
      label: singleSource ? "Comparison data" : "Sources compared",
      value: singleSourceNeedsReview
        ? "Needs review"
        : singleSource && sourceCount.included === sourceCount.total
          ? "Ready"
          : singleSource
            ? "Needs data"
            : `${sourceCount.included} of ${sourceCount.total}`,
      body: singleSourceNeedsReview
        ? `${singleSource.label} has saved data that needs review before the comparison is complete.`
        : singleSource && sourceCount.included === sourceCount.total
          ? `${singleSource.label} has data for this comparison.`
          : singleSource
            ? `${singleSource.label} needs data in both ranges before the trend is useful.`
            : `${sourceCount.included} of ${sourceCount.total} selected sources have comparison data.`,
    },
  ];
}

function renderMetricSummary(metric: SourceMetric, model: MyLibraryCalendarComparisonModel) {
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
          {buildMetricPeriodSentence(model, metric)}
        </p>
      </div>
      <p className={cx("text-sm font-bold whitespace-nowrap", getDeltaClass(metric.tone))}>
        {metric.deltaLabel}
      </p>
    </div>
  );
}

function getSwimmingMetricValue(metric: SourceMetric): string {
  if (metric.id !== "swim_activities") return metric.currentLabel;
  return metric.currentLabel.replace(/ completed swims?$/, "");
}

function renderSwimmingSummary(
  source: SourceComparison,
  model: MyLibraryCalendarComparisonModel,
  options: { flushTop?: boolean } = {}
) {
  return (
    <dl
      className={cx(
        "grid gap-0 md:grid-cols-3 md:divide-x md:divide-[color:var(--fs-border-soft)]",
        options.flushTop ? "" : "mt-4 border-t border-[color:var(--fs-border-soft)] pt-2"
      )}
    >
      {source.metrics.slice(0, 3).map((metric) => (
        <div key={metric.id} className="py-3 md:px-5 md:first:pl-0 md:last:pr-0">
          <dt className="text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
            {metric.label}
          </dt>
          <dd className="mt-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-2xl font-semibold tracking-normal text-[color:var(--fs-color-ink-strong)]">
              {getSwimmingMetricValue(metric)}
            </span>
            <span className={cx("text-sm font-semibold", getDeltaClass(metric.tone))}>
              {metric.deltaLabel} vs {getComparisonPeriodPhrase(model)}
            </span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

function renderSourceDetails(
  source: SourceComparison,
  details = source.details ?? [],
  options: { showSupport?: boolean } = {}
) {
  if (details.length === 0) return null;
  const showSupport = options.showSupport !== false;

  return (
    <dl
      className={cx(
        "mt-4 grid border-t border-[color:var(--fs-border-soft)] pt-2",
        details.length === 2
          ? "divide-y divide-[color:var(--fs-border-soft)] sm:grid-cols-2 sm:divide-x sm:divide-y-0"
          : "gap-3 sm:grid-cols-3"
      )}
    >
      {details.map((detail) => (
        <div key={detail.id} className="min-w-0 py-3 sm:px-5 sm:first:pl-0 sm:last:pr-0">
          <dt className="text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
            {detail.label}
          </dt>
          <dd className="mt-1 text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
            {detail.value}
          </dd>
          {showSupport && detail.supportLabel ? (
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
  const showInsightCards = shouldShowInsightCards(model);
  const singleSourceSwimming = isSingleSourceSwimming(model);
  const reportSourceLabel = getCalendarSourceSelectionLabel(model.selectedSource);
  const reportPeriodLabel = getSelectedRangePeriodLabel(model);
  const useSourceSignalGrid = model.sourceComparisons.length > 1;
  const comparisonDetailsSummaryLabel = getComparisonDetailsSummaryLabel(model);

  return (
    <div className="space-y-6" data-testid="calendar-period-comparison-hub">
      <section className={cardClass} data-testid="calendar-period-controls">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:items-end">
          <div>
            <p className={eyebrowClass}>Trend view</p>
            <p className="mt-2 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              Source
            </p>
            <CalendarTrendSourceSelect
              selectedDate={model.window.selectedDate}
              selectedSource={model.selectedSource}
              period={safePeriod}
            />
            <nav aria-label="Trend sources" className="mt-2 hidden flex-wrap gap-2 sm:flex">
              {MY_LIBRARY_CALENDAR_SOURCE_FILTERS.map((source) => {
                const isActive = model.selectedSource === source;
                return (
                  <Link
                    key={source}
                    href={buildMyLibraryCalendarComparisonHref({
                      source,
                      period: safePeriod,
                      selectedDate: model.window.selectedDate,
                    })}
                    aria-current={isActive ? "page" : undefined}
                    className={cx(
                      segmentBaseClass,
                      "min-w-16",
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
            <nav aria-label="Trend periods" className="mt-2 grid max-w-[420px] grid-cols-3 gap-2">
              {MY_LIBRARY_CALENDAR_PERIODS.map((period) => {
                const isActive = model.selectedPeriod === period;
                return (
                  <Link
                    key={period}
                    href={buildMyLibraryCalendarComparisonHref({
                      source: safeSource,
                      period,
                      selectedDate: model.window.selectedDate,
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
                Selected range
              </p>
              <p className={mutedTextClass}>
                {reportSourceLabel} / {reportPeriodLabel} / {model.window.current.shortLabel}
              </p>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
              {model.window.comparisonMode === "explicit"
                ? "Selected comparison"
                : getComparisonRangeHeading(model)}
            </p>
            <p className={mutedTextClass}>{model.window.comparison.label}</p>
          </div>
        </div>
      </section>

      <section className={cardClass} data-testid="calendar-insight-summary">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className={eyebrowClass}>Trend insight</p>
            {!singleSourceSwimming ? (
              <h2 className="mt-2 text-2xl font-semibold text-[color:var(--fs-color-ink-strong)]">
                {primaryInsight.title}
              </h2>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href={buildMyLibraryCalendarComparisonHref({
                source: safeSource,
                period: safePeriod,
                selectedDate: model.window.previousPeriodDate,
              })}
              className={actionClass}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              Previous
            </Link>
            <Link
              href={buildMyLibraryCalendarComparisonHref({
                source: safeSource,
                period: safePeriod,
                selectedDate: model.window.todayDate,
              })}
              className={actionClass}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              Today
            </Link>
            {model.window.canGoNext ? (
              <Link
                href={buildMyLibraryCalendarComparisonHref({
                  source: safeSource,
                  period: safePeriod,
                  selectedDate: model.window.nextPeriodDate,
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
            "mt-5 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-[var(--fs-radius-panel)] border p-4 sm:gap-4 sm:p-5",
            getTonePanelClass(primaryInsight.tone)
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 ring-1 ring-current/10">
            <ToneIcon tone={primaryInsight.tone} className="h-5 w-5" />
          </div>
          <div className="min-w-0 sm:flex sm:flex-wrap sm:items-center sm:gap-x-4">
            <p>
              <span className="text-[26px] leading-tight font-bold tracking-normal break-words sm:text-[34px]">
                {primaryInsight.value}
              </span>
            </p>
            <p className="mt-1 max-w-[70ch] text-sm leading-6 sm:mt-0">{primaryInsight.body}</p>
          </div>
        </div>
      </section>

      {showInsightCards ? (
        <section aria-label="Trend key takeaways" className="grid gap-4 md:grid-cols-3">
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
      ) : null}

      <section aria-labelledby="calendar-source-comparison-heading" className="space-y-4">
        <div>
          <p className={eyebrowClass}>What changed</p>
          <h2
            id="calendar-source-comparison-heading"
            className="mt-2 text-lg font-semibold text-[color:var(--fs-color-ink-strong)]"
          >
            {singleSourceSwimming ? "Swim summary" : "Training summary"}
          </h2>
        </div>

        <div
          data-testid="calendar-source-comparison-grid"
          className={cx("grid gap-4", useSourceSignalGrid && "lg:grid-cols-2")}
        >
          {model.sourceComparisons.map((source) => (
            <article
              key={source.source}
              data-testid={`calendar-source-${source.source}`}
              className={cardClass}
            >
              {(() => {
                const showSourceSummary = !(
                  source.source === "swimming" && source.metrics.length > 0
                );
                const showSourceHeader = !(
                  singleSourceSwimming &&
                  source.source === "swimming" &&
                  source.metrics.length > 0
                );
                const primaryDetails = getPrimarySourceDetails(source);
                const primaryMetrics = getPrimarySourceMetrics(source);
                return (
                  <>
                    {showSourceHeader ? (
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-[color:var(--fs-color-ink-strong)]">
                            {source.label}
                          </h3>
                          {showSourceSummary ? (
                            <p className={cx("mt-2", mutedTextClass)}>{source.summary}</p>
                          ) : null}
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
                    ) : null}

                    {source.source === "swimming" && primaryMetrics.length > 0 ? (
                      renderSwimmingSummary(source, model, { flushTop: !showSourceHeader })
                    ) : primaryMetrics.length > 0 ? (
                      <div className="mt-4">
                        {renderSourceDetails(source, primaryDetails, { showSupport: false })}
                        {primaryMetrics
                          .slice(0, 3)
                          .map((metric) => renderMetricSummary(metric, model))}
                      </div>
                    ) : (
                      <>
                        {renderSourceDetails(source, primaryDetails, { showSupport: false })}
                        <p className="mt-4 text-sm leading-6 text-[color:var(--fs-color-muted)]">
                          {source.supportLabel}
                        </p>
                      </>
                    )}
                  </>
                );
              })()}
            </article>
          ))}
        </div>
      </section>

      <section className={cardClass} data-testid="calendar-period-details">
        <details>
          <summary className="cursor-pointer text-sm font-semibold text-[color:var(--fs-color-ink-strong)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
            {comparisonDetailsSummaryLabel}
          </summary>
          <div className="mt-5 space-y-6">
            {model.sourceComparisons.map((source) => (
              <div
                key={source.source}
                className="border-t border-[color:var(--fs-border-soft)] pt-5 first:border-t-0 first:pt-0"
              >
                {!singleSourceSwimming ? (
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
                ) : null}

                {renderSourceDetails(source, getDetailsSourceDetails(source))}

                {source.source !== "swimming" && source.metrics.length > 0 ? (
                  <div className="mt-4">
                    <div className="space-y-3 sm:hidden">
                      {source.metrics.map((metric) => (
                        <div
                          key={metric.id}
                          className="rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-sm font-semibold break-words text-[color:var(--fs-color-ink-strong)]">
                              {metric.label}
                            </p>
                            <p
                              className={cx(
                                "text-sm font-semibold whitespace-nowrap",
                                getDeltaClass(metric.tone)
                              )}
                            >
                              {metric.deltaLabel}
                            </p>
                          </div>
                          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                            <div className="min-w-0">
                              <dt className="font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                                Selected
                              </dt>
                              <dd className="mt-1 break-words text-[color:var(--fs-color-ink)]">
                                {metric.currentLabel}
                              </dd>
                            </div>
                            <div className="min-w-0">
                              <dt className="font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                                Compare
                              </dt>
                              <dd className="mt-1 break-words text-[color:var(--fs-color-muted)]">
                                {metric.comparisonLabel}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      ))}
                    </div>
                    <table className="hidden w-full table-fixed text-left text-sm sm:table">
                      <thead className="text-xs font-semibold tracking-wide text-[color:var(--fs-color-muted)] uppercase">
                        <tr>
                          <th scope="col" className="w-[34%] py-2 pr-2 sm:pr-3">
                            Metric
                          </th>
                          <th scope="col" className="w-[21%] px-2 py-2 sm:px-3">
                            Selected
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

                {source.source !== "swimming" ? (
                  <p className="mt-4 text-xs leading-relaxed text-[color:var(--fs-color-muted)]">
                    {source.supportLabel}
                  </p>
                ) : null}
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
