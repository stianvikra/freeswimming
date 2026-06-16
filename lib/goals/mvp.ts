import { GUIDE_POOLSIDE_DRILLS } from "@/lib/guides/guide-poolside";
import { buildCourseOverviewPath } from "@/lib/course/canonical-routes";
import type { Database } from "@/types/database";

export const GOALS_ACTIVE_LIMIT = 3;

export const GOAL_TYPE_VALUES = [
  "distance_time",
  "distance_continuous",
  "drill_complete",
  "module_complete",
  "custom",
] as const;

export const GOAL_SOURCE_VALUES = ["template", "custom"] as const;

export const GOAL_STATUS_VALUES = [
  "active",
  "on_track",
  "at_risk",
  "achieved",
  "archived",
] as const;

export const GOAL_ACTIVE_STATUS_VALUES = ["active", "on_track", "at_risk"] as const;

export type GoalType = (typeof GOAL_TYPE_VALUES)[number];
export type GoalSource = (typeof GOAL_SOURCE_VALUES)[number];
export type GoalStatus = (typeof GOAL_STATUS_VALUES)[number];
export type GoalActiveStatus = (typeof GOAL_ACTIVE_STATUS_VALUES)[number];

export type GoalRow = Omit<
  Database["public"]["Tables"]["goals"]["Row"],
  "goal_type" | "source" | "status"
> & {
  goal_type: GoalType;
  source: GoalSource;
  status: GoalStatus;
};
export type GoalInsert = Database["public"]["Tables"]["goals"]["Insert"];
export type GoalUpdate = Database["public"]["Tables"]["goals"]["Update"];
export type GoalCreateInsert = Omit<GoalInsert, "user_id">;

type GoalTemplate = {
  id: GoalTemplateId;
  title: string;
  summary: string;
  goalType: GoalType;
  source: GoalSource;
  targetValue: number | null;
  targetUnit: string;
  targetDistanceM: number | null;
  targetTimeSeconds: number | null;
  targetCount: number | null;
  targetRef: string | null;
};

export type GoalTemplateId =
  | "distance_1000_under_10"
  | "distance_1000_continuous"
  | "drill_1_completed"
  | "module_1_completed"
  | "distance_400_under_10";

export type GoalPrimaryAction =
  | {
      kind: "link";
      label: string;
      href: string;
    }
  | {
      kind: "log_result";
      label: string;
      inputKind: "time_seconds" | "distance_m" | "count";
    };

export type GoalProgressContext = {
  completedDrillIds: Set<string>;
  completedModuleLessonCounts: Map<string, number>;
};

export type GoalView = {
  id: string;
  title: string;
  summary: string;
  status: GoalStatus;
  statusLabel: string;
  statusTone: "slate" | "blue" | "amber" | "emerald";
  goalType: GoalType;
  source: GoalSource;
  progressPercent: number;
  progressLabel: string;
  progressValue: number;
  targetValue: number | null;
  targetDate: string | null;
  targetDistanceM: number | null;
  targetTimeSeconds: number | null;
  targetCount: number | null;
  targetRef: string | null;
  celebratedAt: string | null;
  showCelebration: boolean;
  primaryAction: GoalPrimaryAction;
};

const POOLSIDE_DRILL_TITLE_BY_ID = new Map(
  GUIDE_POOLSIDE_DRILLS.map((drill) => [drill.id.toUpperCase(), drill.title])
);

export const GOAL_TEMPLATES: readonly GoalTemplate[] = [
  {
    id: "distance_1000_under_10",
    title: "1000m under 10:00",
    summary: "Build toward a 1000m benchmark swim under 10 minutes.",
    goalType: "distance_time",
    source: "template",
    targetValue: 600,
    targetUnit: "seconds_at_distance",
    targetDistanceM: 1000,
    targetTimeSeconds: 600,
    targetCount: null,
    targetRef: null,
  },
  {
    id: "distance_1000_continuous",
    title: "1000m continuous (not timed)",
    summary: "Hold smooth freestyle for 1000m without stopping.",
    goalType: "distance_continuous",
    source: "template",
    targetValue: 1000,
    targetUnit: "meters_continuous",
    targetDistanceM: 1000,
    targetTimeSeconds: null,
    targetCount: null,
    targetRef: null,
  },
  {
    id: "drill_1_completed",
    title: "Drill #1 completed",
    summary: "Finish the first poolside drill and lock in streamline basics.",
    goalType: "drill_complete",
    source: "template",
    targetValue: 1,
    targetUnit: "count",
    targetDistanceM: null,
    targetTimeSeconds: null,
    targetCount: 1,
    targetRef: "D01",
  },
  {
    id: "module_1_completed",
    title: "Module 1 completed",
    summary: "Complete all Module 1 lessons in the free course.",
    goalType: "module_complete",
    source: "template",
    targetValue: 3,
    targetUnit: "count",
    targetDistanceM: null,
    targetTimeSeconds: null,
    targetCount: 3,
    targetRef: "mod1",
  },
  {
    id: "distance_400_under_10",
    title: "400m under 10:00",
    summary: "Build control and pacing to swim 400m under 10 minutes.",
    goalType: "distance_time",
    source: "template",
    targetValue: 600,
    targetUnit: "seconds_at_distance",
    targetDistanceM: 400,
    targetTimeSeconds: 600,
    targetCount: null,
    targetRef: null,
  },
] as const;

const GOAL_TEMPLATE_BY_ID = new Map<GoalTemplateId, GoalTemplate>(
  GOAL_TEMPLATES.map((template) => [template.id, template])
);

function isDateString(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function toNumberOrZero(value: number | null | undefined): number {
  if (!Number.isFinite(value)) return 0;
  return Number(value);
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

function toStatusCopy(status: GoalStatus): Pick<GoalView, "statusLabel" | "statusTone"> {
  switch (status) {
    case "achieved":
      return { statusLabel: "Achieved", statusTone: "emerald" };
    case "at_risk":
      return { statusLabel: "At risk", statusTone: "amber" };
    case "on_track":
      return { statusLabel: "On track", statusTone: "blue" };
    case "archived":
      return { statusLabel: "Archived", statusTone: "slate" };
    case "active":
    default:
      return { statusLabel: "Active", statusTone: "slate" };
  }
}

function getDaysUntilDate(targetDate: string | null): number | null {
  if (!isDateString(targetDate)) return null;

  const now = new Date();
  const startOfToday = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const parsed = new Date(`${targetDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  const ms = parsed.getTime() - startOfToday;
  return Math.floor(ms / 86_400_000);
}

function resolveStatus(
  goal: GoalRow,
  achieved: boolean,
  progressPercent: number,
  fallbackStatus: GoalStatus = "active"
): GoalStatus {
  if (goal.status === "archived") return "archived";
  if (achieved) return "achieved";

  const daysUntil = getDaysUntilDate(goal.target_date);
  if (daysUntil !== null) {
    if (daysUntil < 0) return "at_risk";
    if (daysUntil <= 7 && progressPercent < 70) return "at_risk";
  }

  if (progressPercent > 0) return "on_track";
  return fallbackStatus;
}

function formatDurationFromSeconds(seconds: number): string {
  const safeSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function formatMeters(value: number): string {
  return `${Math.round(value)}m`;
}

function normalizeDrillId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toUpperCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function normalizeModuleId(value: string | null | undefined): string | null {
  const normalized = value?.trim().toLowerCase() ?? "";
  return normalized.length > 0 ? normalized : null;
}

function getPrimaryAction(goal: GoalRow): GoalPrimaryAction {
  switch (goal.goal_type) {
    case "drill_complete":
      return {
        kind: "link",
        label: "Review drills",
        href: "/guides/poolside",
      };
    case "module_complete":
      return {
        kind: "link",
        label: "Open next session",
        href: buildCourseOverviewPath(),
      };
    case "distance_time":
      return {
        kind: "log_result",
        label: "Log result",
        inputKind: "time_seconds",
      };
    case "distance_continuous":
      return {
        kind: "log_result",
        label: "Log result",
        inputKind: "distance_m",
      };
    case "custom":
    default:
      if (goal.target_count !== null) {
        return {
          kind: "log_result",
          label: "Log result",
          inputKind: "count",
        };
      }
      if (goal.target_time_seconds !== null) {
        return {
          kind: "log_result",
          label: "Log result",
          inputKind: "time_seconds",
        };
      }
      return {
        kind: "log_result",
        label: "Log result",
        inputKind: "distance_m",
      };
  }
}

function buildDistanceTimeView(goal: GoalRow) {
  const targetDistanceM = goal.target_distance_m;
  const targetTimeSeconds = goal.target_time_seconds;
  const bestTime = toNumberOrZero(goal.progress_value);
  const hasResult = bestTime > 0;
  const achieved = Boolean(hasResult && targetTimeSeconds && bestTime <= targetTimeSeconds);

  const progressPercent =
    targetTimeSeconds && hasResult ? clampPercent((targetTimeSeconds / bestTime) * 100) : 0;

  const targetLabel =
    targetDistanceM && targetTimeSeconds
      ? `${targetDistanceM}m under ${formatDurationFromSeconds(targetTimeSeconds)}`
      : "Timed target";

  const progressLabel = hasResult
    ? `Best: ${formatDurationFromSeconds(bestTime)} (${targetLabel})`
    : `No result logged yet. Target: ${targetLabel}.`;

  return {
    achieved,
    progressPercent,
    progressLabel,
    summary: `Track your best effort against ${targetLabel}.`,
    targetValue: targetTimeSeconds,
    progressValue: hasResult ? bestTime : 0,
  };
}

function buildDistanceContinuousView(goal: GoalRow) {
  const targetDistanceM = goal.target_distance_m;
  const bestDistance = toNumberOrZero(goal.progress_value);
  const achieved = Boolean(targetDistanceM && bestDistance >= targetDistanceM);
  const progressPercent = targetDistanceM
    ? clampPercent((bestDistance / targetDistanceM) * 100)
    : 0;
  const targetLabel = targetDistanceM ? `${targetDistanceM}m continuous` : "Continuous target";
  const progressLabel =
    bestDistance > 0
      ? `Best continuous: ${formatMeters(bestDistance)} (${targetLabel}).`
      : `No result logged yet. Target: ${targetLabel}.`;

  return {
    achieved,
    progressPercent,
    progressLabel,
    summary: `Build relaxed endurance for ${targetLabel}.`,
    targetValue: targetDistanceM,
    progressValue: bestDistance,
  };
}

function buildDrillCompleteView(goal: GoalRow, context: GoalProgressContext) {
  const drillId = normalizeDrillId(goal.target_ref);
  const drillTitle = drillId ? POOLSIDE_DRILL_TITLE_BY_ID.get(drillId) : null;
  const completed = drillId ? context.completedDrillIds.has(drillId) : false;
  const progressValue = completed ? 1 : 0;
  const targetValue = goal.target_count ?? 1;
  const progressPercent = completed ? 100 : 0;
  const progressLabel = completed
    ? `${drillId ?? "Drill"} completed.`
    : `${drillId ?? "Drill"} not completed yet.`;
  const summary = drillTitle ? drillTitle : "Complete your selected poolside drill.";

  return {
    achieved: completed,
    progressPercent,
    progressLabel,
    summary,
    targetValue,
    progressValue,
  };
}

function buildModuleCompleteView(goal: GoalRow, context: GoalProgressContext) {
  const moduleId = normalizeModuleId(goal.target_ref);
  const completedLessons = moduleId ? (context.completedModuleLessonCounts.get(moduleId) ?? 0) : 0;
  const targetCount = goal.target_count ?? 1;
  const achieved = completedLessons >= targetCount;
  const progressPercent = clampPercent((completedLessons / targetCount) * 100);
  const progressLabel = `${completedLessons}/${targetCount} lessons completed.`;
  const summary = `Complete all lessons in ${moduleId?.toUpperCase() ?? "module"} to finish this goal.`;

  return {
    achieved,
    progressPercent,
    progressLabel,
    summary,
    targetValue: targetCount,
    progressValue: completedLessons,
  };
}

function buildCustomView(goal: GoalRow) {
  const progressValue = toNumberOrZero(goal.progress_value);

  if (goal.target_count !== null) {
    const targetCount = goal.target_count;
    const achieved = progressValue >= targetCount;
    const progressPercent = clampPercent((progressValue / targetCount) * 100);
    return {
      achieved,
      progressPercent,
      progressLabel: `${Math.round(progressValue)}/${targetCount} completed.`,
      summary: "Custom consistency goal",
      targetValue: targetCount,
      progressValue,
    };
  }

  if (goal.target_time_seconds !== null) {
    const targetTime = goal.target_time_seconds;
    const hasResult = progressValue > 0;
    const achieved = hasResult && progressValue <= targetTime;
    const progressPercent = hasResult ? clampPercent((targetTime / progressValue) * 100) : 0;

    return {
      achieved,
      progressPercent,
      progressLabel: hasResult
        ? `Best: ${formatDurationFromSeconds(progressValue)} (target ${formatDurationFromSeconds(targetTime)}).`
        : `No result logged yet. Target: ${formatDurationFromSeconds(targetTime)}.`,
      summary: "Custom timed goal",
      targetValue: targetTime,
      progressValue,
    };
  }

  const targetDistance = goal.target_distance_m ?? 0;
  const achieved = targetDistance > 0 ? progressValue >= targetDistance : false;
  const progressPercent =
    targetDistance > 0 ? clampPercent((progressValue / targetDistance) * 100) : 0;

  return {
    achieved,
    progressPercent,
    progressLabel:
      targetDistance > 0
        ? `${formatMeters(progressValue)} of ${formatMeters(targetDistance)}.`
        : "Log your progress to track this goal.",
    summary: "Custom distance goal",
    targetValue: targetDistance || null,
    progressValue,
  };
}

export function buildGoalView(goal: GoalRow, context: GoalProgressContext): GoalView {
  const base =
    goal.goal_type === "distance_time"
      ? buildDistanceTimeView(goal)
      : goal.goal_type === "distance_continuous"
        ? buildDistanceContinuousView(goal)
        : goal.goal_type === "drill_complete"
          ? buildDrillCompleteView(goal, context)
          : goal.goal_type === "module_complete"
            ? buildModuleCompleteView(goal, context)
            : buildCustomView(goal);

  const status = resolveStatus(goal, base.achieved, base.progressPercent);
  const statusCopy = toStatusCopy(status);

  return {
    id: goal.id,
    title: goal.title,
    summary: base.summary,
    status,
    statusLabel: statusCopy.statusLabel,
    statusTone: statusCopy.statusTone,
    goalType: goal.goal_type,
    source: goal.source,
    progressPercent: base.progressPercent,
    progressLabel: base.progressLabel,
    progressValue: base.progressValue,
    targetValue: base.targetValue,
    targetDate: goal.target_date,
    targetDistanceM: goal.target_distance_m,
    targetTimeSeconds: goal.target_time_seconds,
    targetCount: goal.target_count,
    targetRef: goal.target_ref,
    celebratedAt: goal.celebrated_at,
    showCelebration: status === "achieved" && goal.celebrated_at === null,
    primaryAction: getPrimaryAction(goal),
  };
}

export function buildDerivedGoalSyncUpdate(
  goal: GoalRow,
  context: GoalProgressContext
): GoalUpdate | null {
  if (goal.goal_type !== "drill_complete" && goal.goal_type !== "module_complete") {
    return null;
  }

  const view = buildGoalView(goal, context);
  const patch: GoalUpdate = {};

  if (toNumberOrZero(goal.progress_value) !== view.progressValue) {
    patch.progress_value = view.progressValue;
  }

  if (goal.status !== view.status) {
    patch.status = view.status;
  }

  if (view.status === "achieved" && goal.achieved_at === null) {
    patch.achieved_at = new Date().toISOString();
  }

  return Object.keys(patch).length > 0 ? patch : null;
}

export function getGoalTemplateById(id: string): GoalTemplate | null {
  return GOAL_TEMPLATE_BY_ID.get(id as GoalTemplateId) ?? null;
}

export function buildTemplateGoalInsert(
  templateId: string,
  targetDate: string | null
): GoalCreateInsert | null {
  const template = getGoalTemplateById(templateId);
  if (!template) return null;

  return {
    title: template.title,
    goal_type: template.goalType,
    source: template.source,
    target_value: template.targetValue,
    target_unit: template.targetUnit,
    target_date: targetDate,
    target_distance_m: template.targetDistanceM,
    target_time_seconds: template.targetTimeSeconds,
    target_count: template.targetCount,
    target_ref: template.targetRef,
    progress_value: 0,
    status: "active",
  };
}

type CustomMetric = "distance_time" | "distance_continuous" | "count";

export type CustomGoalInput = {
  title: string;
  metric: CustomMetric;
  targetDate: string | null;
  distanceM?: number | null;
  timeSeconds?: number | null;
  count?: number | null;
};

export function buildCustomGoalInsert(input: CustomGoalInput): GoalCreateInsert | null {
  const title = input.title.trim();
  if (title.length < 3 || title.length > 80) return null;

  if (input.metric === "distance_time") {
    const distanceM = Math.round(Number(input.distanceM ?? 0));
    const timeSeconds = Math.round(Number(input.timeSeconds ?? 0));
    if (!Number.isFinite(distanceM) || distanceM <= 0) return null;
    if (!Number.isFinite(timeSeconds) || timeSeconds <= 0) return null;

    return {
      title,
      goal_type: "distance_time",
      source: "custom",
      target_value: timeSeconds,
      target_unit: "seconds_at_distance",
      target_date: input.targetDate,
      target_distance_m: distanceM,
      target_time_seconds: timeSeconds,
      target_count: null,
      target_ref: null,
      progress_value: 0,
      status: "active",
    };
  }

  if (input.metric === "distance_continuous") {
    const distanceM = Math.round(Number(input.distanceM ?? 0));
    if (!Number.isFinite(distanceM) || distanceM <= 0) return null;

    return {
      title,
      goal_type: "distance_continuous",
      source: "custom",
      target_value: distanceM,
      target_unit: "meters_continuous",
      target_date: input.targetDate,
      target_distance_m: distanceM,
      target_time_seconds: null,
      target_count: null,
      target_ref: null,
      progress_value: 0,
      status: "active",
    };
  }

  const count = Math.round(Number(input.count ?? 0));
  if (!Number.isFinite(count) || count <= 0) return null;

  return {
    title,
    goal_type: "custom",
    source: "custom",
    target_value: count,
    target_unit: "count",
    target_date: input.targetDate,
    target_distance_m: null,
    target_time_seconds: null,
    target_count: count,
    target_ref: null,
    progress_value: 0,
    status: "active",
  };
}

export function normalizeTargetDate(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isDateString(trimmed) ? trimmed : null;
}

export function formatGoalDate(targetDate: string | null): string {
  if (!isDateString(targetDate)) return "No target date";

  const parsed = new Date(`${targetDate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return "No target date";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function buildEmptyGoalProgressContext(): GoalProgressContext {
  return {
    completedDrillIds: new Set<string>(),
    completedModuleLessonCounts: new Map<string, number>(),
  };
}

export function normalizeLogResultValue(
  inputKind: Extract<GoalPrimaryAction, { kind: "log_result" }>["inputKind"],
  rawValue: unknown
): number | null {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;

  if (inputKind === "time_seconds") {
    return Math.round(parsed);
  }

  if (inputKind === "distance_m") {
    return Math.round(parsed);
  }

  return Math.round(parsed);
}
