import {
  getDrylandMicroBlockReleaseDate,
  isDrylandMicroBlockAvailable,
  type DrylandMicroPlanRecord,
} from "@/lib/dryland/micro-plans";
import type { DrylandLibrarySnapshot } from "@/lib/dryland/shared";
import type { HabitSnapshot } from "@/lib/habits/shared";

export const TODAY_SURFACE_TABS = [
  { id: "bubbles", label: "Bubbles" },
  { id: "habits", label: "Habits" },
] as const;

export type TodaySurfaceTabId = (typeof TODAY_SURFACE_TABS)[number]["id"];

export type TodaySurfaceState = {
  state: "ready" | "complete" | "setup" | "paused" | "syncing" | "error";
  eyebrow: string;
  title: string;
  detail: string;
  progressLabel: string;
  progressPercent: number;
  actionLabel: string;
  href: string;
};

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

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

export function buildTodayBubblesState(
  drylandLibrary: Pick<
    DrylandLibrarySnapshot,
    "microPlan" | "microPlanLoadError" | "microPlanSchemaReady" | "recentSessions"
  >,
  now = new Date()
): TodaySurfaceState {
  if (!drylandLibrary.microPlanSchemaReady) {
    return {
      state: "syncing",
      eyebrow: "Micro Sessions",
      title: "Bubbles are syncing",
      detail: "Saved dryland sessions stay available while the micro-plan table is applied.",
      progressLabel: "Syncing",
      progressPercent: 0,
      actionLabel: "Open Dryland",
      href: "/my-library/dryland",
    };
  }

  if (drylandLibrary.microPlanLoadError) {
    return {
      state: "error",
      eyebrow: "Micro Sessions",
      title: "Bubbles need a refresh",
      detail: drylandLibrary.microPlanLoadError,
      progressLabel: "Not loaded",
      progressPercent: 0,
      actionLabel: "Open Dryland",
      href: "/my-library/dryland",
    };
  }

  const plan = drylandLibrary.microPlan;
  if (!plan) {
    return {
      state: "setup",
      eyebrow: "Micro Sessions",
      title:
        drylandLibrary.recentSessions.length > 0 ? "Start Bubbles" : "Create a dryland session",
      detail:
        drylandLibrary.recentSessions.length > 0
          ? "Build one weekly Micro Session from saved dryland work."
          : "Save a dryland session before building weekly bubbles.",
      progressLabel: "No active plan",
      progressPercent: 0,
      actionLabel: "Open Dryland",
      href: "/my-library/dryland",
    };
  }

  const availableCount = countAvailableMicroUnits(plan, now);
  const progressLabel = `${plan.progress.completedBlockCount}/${plan.progress.totalBlockCount} units`;

  if (plan.status === "completed") {
    return {
      state: "complete",
      eyebrow: "Micro Sessions",
      title: "Bubbles complete",
      detail: `${plan.title} is complete for this week.`,
      progressLabel,
      progressPercent: plan.progress.progressPercent,
      actionLabel: "Review Bubbles",
      href: "/my-library/dryland",
    };
  }

  if (plan.status === "paused") {
    return {
      state: "paused",
      eyebrow: "Micro Sessions",
      title: "Bubbles paused",
      detail: `${plan.title} is paused with ${pluralize(
        plan.progress.remainingBlockCount,
        "unit"
      )} remaining.`,
      progressLabel,
      progressPercent: plan.progress.progressPercent,
      actionLabel: "Resume Bubbles",
      href: "/my-library/dryland",
    };
  }

  return {
    state: availableCount > 0 ? "ready" : "setup",
    eyebrow: "Micro Sessions",
    title: availableCount > 0 ? "Continue Bubbles" : "Bubbles queued",
    detail:
      availableCount > 0
        ? `${pluralize(availableCount, "bubble")} ready in ${plan.title}.`
        : getNextMicroReleaseLabel(plan, now),
    progressLabel,
    progressPercent: plan.progress.progressPercent,
    actionLabel: availableCount > 0 ? "Open Bubbles" : "Open Micro Sessions",
    href: "/my-library/dryland",
  };
}

export function buildTodayHabitsState(habitSnapshot: HabitSnapshot): TodaySurfaceState {
  if (!habitSnapshot.schemaReady) {
    return {
      state: "syncing",
      eyebrow: "My Perfect Day",
      title: "Habits are syncing",
      detail: "Today's habits will appear when the habits table is ready.",
      progressLabel: "Syncing",
      progressPercent: 0,
      actionLabel: "Open Habits",
      href: "/my-library/habits",
    };
  }

  if (habitSnapshot.loadError) {
    return {
      state: "error",
      eyebrow: "My Perfect Day",
      title: "Habits need a refresh",
      detail: habitSnapshot.loadError,
      progressLabel: "Not loaded",
      progressPercent: 0,
      actionLabel: "Open Habits",
      href: "/my-library/habits",
    };
  }

  const perfectDayTotal = habitSnapshot.daySummary.perfectDayItemCount;
  const satisfiedCount = habitSnapshot.daySummary.satisfiedPerfectDayItemCount;
  const activeCount = habitSnapshot.activeHabits.length;

  if (activeCount === 0 || perfectDayTotal === 0) {
    return {
      state: "setup",
      eyebrow: "My Perfect Day",
      title: "Set today's habits",
      detail: "Start with a few small habits that define a good day.",
      progressLabel: "No habits yet",
      progressPercent: 0,
      actionLabel: "Add Habits",
      href: "/my-library/habits",
    };
  }

  if (habitSnapshot.daySummary.isPerfectDay) {
    return {
      state: "complete",
      eyebrow: "My Perfect Day",
      title: "Perfect day logged",
      detail: `${satisfiedCount}/${perfectDayTotal} habits are on target today.`,
      progressLabel: `${satisfiedCount}/${perfectDayTotal} done`,
      progressPercent: habitSnapshot.daySummary.completionPercent,
      actionLabel: "Review Habits",
      href: "/my-library/habits",
    };
  }

  return {
    state: "ready",
    eyebrow: "My Perfect Day",
    title: "Check in habits",
    detail: `${satisfiedCount}/${perfectDayTotal} habits are on target today.`,
    progressLabel: `${satisfiedCount}/${perfectDayTotal} done`,
    progressPercent: habitSnapshot.daySummary.completionPercent,
    actionLabel: "Open Habits",
    href: "/my-library/habits",
  };
}
