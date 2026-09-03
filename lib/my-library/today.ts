import {
  getDrylandMicroBlockReleaseDate,
  isDrylandMicroBlockAvailable,
  type DrylandMicroPlanRecord,
} from "@/lib/dryland/micro-plans";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import {
  getHabitDayStatusLabel,
  getHabitItemTrackingStateLabel,
  isHabitMetricCoverageIncomplete,
  type HabitSnapshot,
} from "@/lib/habits/shared";

export const TODAY_SURFACE_TABS = [
  { id: "micro-sessions", label: "Micro Sessions" },
  { id: "habits", label: "Habits" },
] as const;

export type TodaySurfaceTabId = (typeof TODAY_SURFACE_TABS)[number]["id"];

export type TodaySurfaceState = {
  state:
    | "ready"
    | "complete"
    | "setup"
    | "paused"
    | "syncing"
    | "error"
    | "review"
    | "not_tracked"
    | "tracking_incomplete";
  title: string;
  detail: string;
  progressLabel: string;
  progressPercent: number | null;
  actionLabel: string;
  href: string;
  editHref: string | null;
};

export type TodayRoutineQuickAction = {
  id: TodaySurfaceTabId;
  title: string;
  subtitle: string;
  href: string;
  state: TodaySurfaceState["state"];
};

function countAvailableMicroUnits(plan: DrylandMicroPlanRecord, now: Date) {
  return plan.blocks.filter(
    (block) =>
      block.status === "queued" &&
      !block.isArchived &&
      isDrylandMicroBlockAvailable(
        plan,
        {
          ...block,
          releaseOffsetDays: block.releaseOffsetDays,
        },
        now
      )
  ).length;
}

function getNextMicroReleaseLabel(plan: DrylandMicroPlanRecord, now: Date) {
  const nextRelease = plan.blocks
    .filter((block) => block.status === "queued" && !block.isArchived)
    .map((block) => getDrylandMicroBlockReleaseDate(plan, block))
    .filter((date): date is Date => date !== null && date.getTime() > now.getTime())
    .sort((first, second) => first.getTime() - second.getTime())[0];

  if (!nextRelease) {
    return "Next unit is queued.";
  }

  return `Next unit opens ${nextRelease.toLocaleDateString("en-GB", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}.`;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function buildTodayMicroSessionsState(
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >,
  now = new Date()
): TodaySurfaceState {
  if (!drylandLibrary.microPlanSchemaReady) {
    return {
      state: "syncing",
      title: "Micro Sessions",
      detail: "Saved dryland sessions stay available while the micro-plan table is applied.",
      progressLabel: "Syncing",
      progressPercent: 0,
      actionLabel: "Open",
      href: "/my-library/dryland#micro-sessions",
      editHref: "/my-library/dryland?micro=edit#micro-sessions",
    };
  }

  if (drylandLibrary.microPlanLoadError) {
    return {
      state: "error",
      title: "Micro Sessions",
      detail: drylandLibrary.microPlanLoadError,
      progressLabel: "Not loaded",
      progressPercent: 0,
      actionLabel: "Open",
      href: "/my-library/dryland#micro-sessions",
      editHref: "/my-library/dryland?micro=edit#micro-sessions",
    };
  }

  const plan = drylandLibrary.microPlan;
  if (!plan) {
    return {
      state: "setup",
      title: "Micro Sessions",
      detail:
        drylandLibrary.recentSessions.length > 0
          ? "Split dryland sessions into manageable micro sessions."
          : "Create a dryland exercise before building micro sessions.",
      progressLabel: "No active plan",
      progressPercent: 0,
      actionLabel: "Open",
      href:
        drylandLibrary.recentSessions.length > 0
          ? "/my-library/dryland?micro=edit#micro-sessions"
          : "/my-library/dryland?micro=setup#micro-sessions",
      editHref: "/my-library/dryland?micro=edit#micro-sessions",
    };
  }

  const availableCount = countAvailableMicroUnits(plan, now);
  const progressLabel = `${plan.progress.completedBlockCount}/${plan.progress.totalBlockCount} units`;

  if (plan.status === "completed") {
    return {
      state: "complete",
      title: "Micro Sessions",
      detail: `${plan.title} is complete for this week.`,
      progressLabel,
      progressPercent: plan.progress.progressPercent,
      actionLabel: "Open",
      href: "/my-library/dryland?micro=active&view=auto#micro-sessions",
      editHref: "/my-library/dryland?micro=edit#micro-sessions",
    };
  }

  if (plan.status === "paused") {
    return {
      state: "paused",
      title: "Micro Sessions",
      detail: `${plan.title} is paused with ${pluralize(
        plan.progress.remainingBlockCount,
        "unit"
      )} remaining.`,
      progressLabel,
      progressPercent: plan.progress.progressPercent,
      actionLabel: "Open",
      href: "/my-library/dryland?micro=active&view=auto#micro-sessions",
      editHref: "/my-library/dryland?micro=edit#micro-sessions",
    };
  }

  return {
    state: availableCount > 0 ? "ready" : "setup",
    title: "Micro Sessions",
    detail:
      availableCount > 0
        ? `${pluralize(availableCount, "unit")} ready in ${plan.title}.`
        : getNextMicroReleaseLabel(plan, now),
    progressLabel,
    progressPercent: plan.progress.progressPercent,
    actionLabel: "Open",
    href: "/my-library/dryland?micro=active&view=auto#micro-sessions",
    editHref: "/my-library/dryland?micro=edit#micro-sessions",
  };
}

export function buildTodayHabitsState(habitSnapshot: HabitSnapshot): TodaySurfaceState {
  if (!habitSnapshot.schemaReady) {
    return {
      state: "syncing",
      title: "Habits",
      detail: "Today's habits will appear when the habits table is ready.",
      progressLabel: "Syncing",
      progressPercent: 0,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (habitSnapshot.loadError) {
    return {
      state: "error",
      title: "Habits",
      detail: habitSnapshot.loadError,
      progressLabel: "Not loaded",
      progressPercent: 0,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (habitSnapshot.dayStatusesReady === false) {
    return {
      state: "review",
      title: "Habits",
      detail: "Habit progress is hidden until saved day statuses can be loaded safely.",
      progressLabel: "Day status unavailable",
      progressPercent: null,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: null,
    };
  }

  if (
    habitSnapshot.daySummary.trackingState === "needs_review" ||
    habitSnapshot.daySummary.metricCoverage?.state === "needs_review"
  ) {
    return {
      state: "review",
      title: "Habits",
      detail: "Habit progress is hidden because this day uses a status that needs review.",
      progressLabel: getHabitDayStatusLabel("unsupported"),
      progressPercent: null,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: null,
    };
  }

  const perfectDayTotal = habitSnapshot.daySummary.perfectDayItemCount;
  const satisfiedCount = habitSnapshot.daySummary.satisfiedPerfectDayItemCount;
  const activeCount = habitSnapshot.activeHabits.length;
  const unsupportedCount = habitSnapshot.unsupportedHabits?.length ?? 0;

  if (unsupportedCount > 0) {
    const reviewLabel = `${pluralize(unsupportedCount, "habit")} ${
      unsupportedCount === 1 ? "needs" : "need"
    } review`;
    const supportedProgressLabel =
      perfectDayTotal > 0
        ? `${satisfiedCount}/${perfectDayTotal} supported`
        : activeCount > 0
          ? pluralize(activeCount, "supported habit")
          : null;

    return {
      state: "review",
      title: "Habits",
      detail:
        activeCount > 0
          ? `Known Habit progress is still available. ${reviewLabel} before all Habits can count.`
          : `Saved Habit history is preserved. ${reviewLabel} before Habits can count progress.`,
      progressLabel: supportedProgressLabel
        ? `${reviewLabel} · ${supportedProgressLabel}`
        : reviewLabel,
      progressPercent: null,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: null,
    };
  }

  if (habitSnapshot.daySummary.trackingState === "not_tracked") {
    return {
      state: "not_tracked",
      title: "Habits",
      detail: "This day is excluded from Habit performance, totals, and streaks.",
      progressLabel: getHabitDayStatusLabel("not_tracked"),
      progressPercent: null,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (isHabitMetricCoverageIncomplete(habitSnapshot.daySummary.metricCoverage)) {
    return {
      state: "tracking_incomplete",
      title: "Habits",
      detail:
        "One or more Habit outcomes are excluded because this cadence period does not have enough tracked days.",
      progressLabel: getHabitItemTrackingStateLabel("incomplete"),
      progressPercent: null,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (activeCount === 0) {
    return {
      state: "setup",
      title: "Habits",
      detail: "Start with a few small habits that define a good day.",
      progressLabel: "No habits yet",
      progressPercent: 0,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (perfectDayTotal === 0) {
    return {
      state: "ready",
      title: "Habits",
      detail: "No habits are due today.",
      progressLabel: "No habits due",
      progressPercent: 100,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  if (habitSnapshot.daySummary.isPerfectDay) {
    return {
      state: "complete",
      title: "Habits",
      detail: `${satisfiedCount}/${perfectDayTotal} habits are on target today.`,
      progressLabel: `${satisfiedCount}/${perfectDayTotal} done`,
      progressPercent: habitSnapshot.daySummary.completionPercent,
      actionLabel: "Open",
      href: "/my-library/habits",
      editHref: "/my-library/habits",
    };
  }

  return {
    state: "ready",
    title: "Habits",
    detail: `${satisfiedCount}/${perfectDayTotal} habits are on target today.`,
    progressLabel: `${satisfiedCount}/${perfectDayTotal} done`,
    progressPercent: habitSnapshot.daySummary.completionPercent,
    actionLabel: "Open",
    href: "/my-library/habits",
    editHref: "/my-library/habits",
  };
}

function buildMicroSessionsQuickHref(
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >,
  state: TodaySurfaceState
) {
  if (state.state === "setup" && !drylandLibrary.microPlan) {
    return drylandLibrary.recentSessions.length > 0
      ? "/my-library/dryland?micro=edit#micro-sessions"
      : "/my-library/dryland?micro=setup#micro-sessions";
  }

  if (state.state === "ready" || state.state === "complete" || state.state === "paused") {
    return "/my-library/dryland?micro=active&view=auto#micro-sessions";
  }

  return "/my-library/dryland#micro-sessions";
}

function buildMicroSessionsQuickSubtitle(
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >,
  state: TodaySurfaceState
) {
  if (state.state === "ready") return state.progressLabel;
  if (state.state === "complete") return "Week complete";
  if (state.state === "paused") return "Paused";
  if (state.state === "syncing") return "Syncing";
  if (state.state === "error") return "Open to retry";
  return drylandLibrary.recentSessions.length > 0 ? "Create from dryland" : "Create dryland first";
}

function buildHabitsQuickHref(state: TodaySurfaceState) {
  if (state.state === "setup") return "/my-library/habits?view=active#add-habit";
  if (state.state === "not_tracked" || state.state === "tracking_incomplete") {
    return "/my-library/habits";
  }
  return "/my-library/habits?view=active#today-habits";
}

function buildHabitsQuickSubtitle(state: TodaySurfaceState) {
  if (state.state === "complete") return "Done today";
  if (state.state === "review") return state.progressLabel;
  if (state.state === "not_tracked") return state.progressLabel;
  if (state.state === "tracking_incomplete") return state.progressLabel;
  if (state.state === "ready") return state.progressLabel;
  if (state.state === "syncing") return "Syncing";
  if (state.state === "error") return "Open to retry";
  return "Add first habit";
}

export function buildTodayRoutineQuickActions(
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >,
  habitSnapshot: HabitSnapshot,
  now = new Date()
): TodayRoutineQuickAction[] {
  const microSessionsState = buildTodayMicroSessionsState(drylandLibrary, now);
  const habitsState = buildTodayHabitsState(habitSnapshot);

  return [
    {
      id: "micro-sessions",
      title: microSessionsState.title,
      subtitle: buildMicroSessionsQuickSubtitle(drylandLibrary, microSessionsState),
      href: buildMicroSessionsQuickHref(drylandLibrary, microSessionsState),
      state: microSessionsState.state,
    },
    {
      id: "habits",
      title: habitsState.title,
      subtitle: buildHabitsQuickSubtitle(habitsState),
      href: buildHabitsQuickHref(habitsState),
      state: habitsState.state,
    },
  ];
}
