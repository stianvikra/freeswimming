import {
  PROGRAM_WEEKDAY_LABELS,
  countProgramAssignments,
  type ProgramAssignment,
  type ProgramEditorRecord,
} from "@/lib/programs/shared";
import {
  buildWorkoutGarminReadyExport,
  type WorkoutEditorRecord,
  type WorkoutGarminReadyExport,
} from "@/lib/workouts/shared";
import { BRAND_FONT_PUBLIC_PATH, BRAND_PDF_LOGO_PATH } from "@/lib/brand";

export type ProgramExportIssueCode =
  | "empty_program"
  | "missing_workout_reference"
  | "workout_requires_review";

export type ProgramExportIssue = {
  id: string;
  code: ProgramExportIssueCode;
  weekId: string | null;
  weekLabel: string | null;
  dayIndex: number | null;
  dayLabel: string | null;
  assignmentId: string | null;
  workoutId: string | null;
  detail: string;
};

export type ProgramGarminReadyExportAssignment = {
  id: string;
  workoutId: string;
  dayIndex: number;
  dayLabel: string;
  position: number;
  mappingStatus: "ready" | "review";
  reviewIssueIds: string[];
  workoutTitle: string | null;
  workoutSummary: string | null;
  workoutEnvironmentLabel: string | null;
  workoutSessionTypeLabel: string | null;
  workoutEffortLabel: string | null;
  workout: WorkoutGarminReadyExport | null;
};

export type ProgramGarminReadyExportDay = {
  dayIndex: number;
  dayLabel: string;
  assignmentCount: number;
  assignments: ProgramGarminReadyExportAssignment[];
};

export type ProgramGarminReadyExportWeek = {
  id: string;
  label: string;
  assignmentCount: number;
  days: ProgramGarminReadyExportDay[];
};

export type ProgramGarminReadyExport = {
  version: 1;
  kind: "freeswimming_garmin_ready_program_v1";
  source: "canonical_program";
  programId: string | null;
  exportedAt: string;
  diagnostics: {
    status: "ready" | "review";
    summary: string;
    issueCount: number;
    issues: ProgramExportIssue[];
  };
  program: {
    title: string;
    weekCount: number;
    assignmentCount: number;
  };
  weeks: ProgramGarminReadyExportWeek[];
};

type ProgramPdfAssignment = {
  id: string;
  title: string;
  summary: string;
  metaLine: string | null;
  status: "ready" | "review";
  reviewDetails: string[];
};

type ProgramPdfDay = {
  dayLabel: string;
  assignments: ProgramPdfAssignment[];
};

type ProgramPdfWeek = {
  id: string;
  label: string;
  assignmentCount: number;
  days: ProgramPdfDay[];
};

export type ProgramPdfModel = {
  fileName: string;
  sourceLabel: string;
  title: string;
  scheduleSummary: string;
  exportedAtLabel: string;
  readiness: ProgramGarminReadyExport["diagnostics"];
  weeks: ProgramPdfWeek[];
};

export function buildProgramGarminReadyExportFileName(
  program: Pick<ProgramEditorRecord, "title"> | null | undefined
) {
  return `freeswimming-${normalizeFileNamePart(program?.title ?? "") || "program"}-garmin-ready.json`;
}

export function buildProgramPdfFileName(
  program: Pick<ProgramEditorRecord, "title"> | null | undefined
) {
  return `freeswimming-${normalizeFileNamePart(program?.title ?? "") || "program"}-print.pdf`;
}

export function buildProgramGarminReadyExport(
  program: ProgramEditorRecord | null | undefined,
  workoutsById: ReadonlyMap<string, WorkoutEditorRecord>,
  options?: {
    exportedAt?: string;
  }
): ProgramGarminReadyExport {
  const exportedAt = options?.exportedAt ?? new Date().toISOString();

  if (!program) {
    const issues = [
      buildProgramExportIssue({
        code: "empty_program",
        weekId: null,
        weekLabel: null,
        dayIndex: null,
        assignmentId: null,
        workoutId: null,
        detail: "Create and save a canonical program before exporting it.",
      }),
    ];

    return {
      version: 1,
      kind: "freeswimming_garmin_ready_program_v1",
      source: "canonical_program",
      programId: null,
      exportedAt,
      diagnostics: {
        status: "review",
        summary: issues[0].detail,
        issueCount: issues.length,
        issues,
      },
      program: {
        title: "Program export",
        weekCount: 0,
        assignmentCount: 0,
      },
      weeks: [],
    };
  }

  const issues: ProgramExportIssue[] = [];
  const weeks = program.weeks.map((week) => {
    const days = PROGRAM_WEEKDAY_LABELS.map((dayLabel, dayIndex) => {
      const assignments = week.assignments
        .filter((assignment) => assignment.dayIndex === dayIndex)
        .sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
        .map((assignment) =>
          buildProgramExportAssignment({
            program,
            week,
            assignment,
            workoutsById,
            issues,
          })
        );

      return {
        dayIndex,
        dayLabel,
        assignmentCount: assignments.length,
        assignments,
      };
    });

    return {
      id: week.id,
      label: week.label,
      assignmentCount: week.assignments.length,
      days,
    };
  });

  const assignmentCount = countProgramAssignments(program.weeks);
  if (assignmentCount === 0) {
    issues.push(
      buildProgramExportIssue({
        code: "empty_program",
        weekId: null,
        weekLabel: null,
        dayIndex: null,
        assignmentId: null,
        workoutId: null,
        detail: "Add at least one scheduled workout before exporting this program.",
      })
    );
  }

  return {
    version: 1,
    kind: "freeswimming_garmin_ready_program_v1",
    source: "canonical_program",
    programId: program.id,
    exportedAt,
    diagnostics: {
      status: issues.length > 0 ? "review" : "ready",
      summary: buildProgramExportSummary(issues, assignmentCount),
      issueCount: issues.length,
      issues,
    },
    program: {
      title: program.title,
      weekCount: program.weeks.length,
      assignmentCount,
    },
    weeks,
  };
}

export function buildProgramPdfModel(
  program: ProgramEditorRecord | null | undefined,
  workoutsById: ReadonlyMap<string, WorkoutEditorRecord>,
  options?: {
    exportedAt?: string;
  }
): ProgramPdfModel {
  const exportPayload = buildProgramGarminReadyExport(program, workoutsById, options);
  const fileName = buildProgramPdfFileName(program);

  return {
    fileName,
    sourceLabel: "Canonical program",
    title: exportPayload.program.title,
    scheduleSummary:
      exportPayload.program.assignmentCount === 0
        ? "No scheduled workouts are saved in this program yet."
        : `${exportPayload.program.assignmentCount} scheduled workout${
            exportPayload.program.assignmentCount === 1 ? "" : "s"
          } across ${exportPayload.program.weekCount} week${
            exportPayload.program.weekCount === 1 ? "" : "s"
          }.`,
    exportedAtLabel: new Date(exportPayload.exportedAt).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    readiness: exportPayload.diagnostics,
    weeks: exportPayload.weeks.map((week) => ({
      id: week.id,
      label: week.label,
      assignmentCount: week.assignmentCount,
      days: week.days.map((day) => ({
        dayLabel: day.dayLabel,
        assignments: day.assignments.map((assignment) => ({
          id: assignment.id,
          title: assignment.workoutTitle ?? "Missing workout reference",
          summary:
            assignment.workoutSummary ??
            "This scheduled workout could not be loaded for the current account.",
          metaLine:
            [
              assignment.workoutEnvironmentLabel,
              assignment.workoutSessionTypeLabel,
              assignment.workoutEffortLabel,
            ]
              .filter(Boolean)
              .join(" · ") || null,
          status: assignment.mappingStatus,
          reviewDetails:
            assignment.workout?.diagnostics.issues.map((issue) => issue.detail) ??
            assignment.reviewIssueIds
              .map((issueId) =>
                exportPayload.diagnostics.issues.find((issue) => issue.id === issueId)
              )
              .filter((issue): issue is ProgramExportIssue => Boolean(issue))
              .map((issue) => issue.detail),
        })),
      })),
    })),
  };
}

export function buildProgramPdfHtmlDocument(
  program: ProgramEditorRecord | null | undefined,
  workoutsById: ReadonlyMap<string, WorkoutEditorRecord>,
  options?: {
    exportedAt?: string;
    logoUrl?: string | null;
    fontUrl?: string | null;
  }
) {
  const model = buildProgramPdfModel(program, workoutsById, {
    exportedAt: options?.exportedAt,
  });
  const fontUrl = options?.fontUrl ?? BRAND_FONT_PUBLIC_PATH;
  const logoUrl = options?.logoUrl ?? BRAND_PDF_LOGO_PATH;
  const fontFaceCss = fontUrl
    ? `
      @font-face {
        font-family: "FreeSwimming Brand";
        src: url("${escapeHtml(fontUrl)}") format("truetype");
        font-weight: 200 800;
        font-style: normal;
        font-display: swap;
      }
    `
    : "";
  const brandLockupHtml = logoUrl
    ? `
      <div class="brand-mark" data-logo-state="image">
        <img
          class="brand-logo"
          src="${escapeHtml(logoUrl)}"
          alt="freeswimming.org"
          onerror="this.parentElement.setAttribute('data-logo-state', 'fallback'); this.remove();"
        />
        <span class="brand-fallback">freeswimming.org</span>
      </div>
    `
    : `
      <div class="brand-mark" data-logo-state="fallback">
        <span class="brand-fallback">freeswimming.org</span>
      </div>
    `;
  const readinessNoticeHtml =
    model.readiness.issueCount > 0
      ? `
        <section class="notice notice-warn">
          <h2>Review before export/send</h2>
          <p>${escapeHtml(model.readiness.summary)}</p>
          <ul>
            ${model.readiness.issues.map((issue) => `<li>${escapeHtml(issue.detail)}</li>`).join("")}
          </ul>
        </section>
      `
      : `
        <section class="notice notice-ready">
          <h2>Export status</h2>
          <p>${escapeHtml(model.readiness.summary)}</p>
        </section>
      `;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(model.title)} - Program PDF print view</title>
    <style>
      :root {
        color-scheme: light;
        --line: rgba(15, 23, 42, 0.12);
        --page: #e8eef8;
        --surface: #ffffff;
        --surface-soft: #f8fbff;
        --surface-muted: #f8fafc;
        --text: #172033;
        --muted: #51607a;
        --accent: #1d4ed8;
        --accent-soft: rgba(29, 78, 216, 0.1);
        --warn: #9a3412;
        --warn-soft: rgba(245, 158, 11, 0.14);
        --ready: #166534;
        --ready-soft: rgba(34, 197, 94, 0.14);
      }

      ${fontFaceCss}

      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        background: var(--page);
        color: var(--text);
        font-family: "FreeSwimming Brand", "SF Pro Display", "Segoe UI", sans-serif;
      }

      body {
        min-height: 100vh;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 18px 24px;
        background: rgba(255, 255, 255, 0.92);
        border-bottom: 1px solid var(--line);
        position: sticky;
        top: 0;
      }

      .toolbar-copy {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .toolbar-kicker {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .toolbar-title {
        font-size: 1rem;
        font-weight: 700;
      }

      .toolbar-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }

      .toolbar-button {
        border: 1px solid var(--line);
        border-radius: 999px;
        background: #fff;
        color: var(--text);
        padding: 10px 16px;
        font: inherit;
      }

      .toolbar-button-primary {
        background: var(--accent);
        border-color: var(--accent);
        color: #fff;
      }

      .shell {
        padding: 32px 20px 48px;
      }

      .page {
        width: min(1040px, 100%);
        margin: 0 auto;
        background: var(--surface);
        border-radius: 28px;
        border: 1px solid rgba(23, 32, 51, 0.08);
        box-shadow: 0 24px 80px rgba(23, 32, 51, 0.12);
        overflow: hidden;
      }

      .hero {
        padding: 28px 28px 22px;
        background: linear-gradient(145deg, #eff6ff, #f8fbff 58%, #ffffff);
        border-bottom: 1px solid rgba(23, 32, 51, 0.08);
      }

      .hero-brand {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 16px;
      }

      .brand-mark {
        display: inline-flex;
        align-items: center;
      }

      .brand-logo {
        display: block;
        width: 176px;
        max-width: min(48vw, 176px);
        height: auto;
      }

      .brand-fallback {
        display: none;
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .brand-mark[data-logo-state="fallback"] .brand-fallback {
        display: inline-flex;
      }

      .eyebrow {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--accent);
      }

      .hero-tagline {
        margin: 6px 0 0;
        color: var(--muted);
        font-size: 0.95rem;
        font-weight: 700;
        letter-spacing: 0.04em;
      }

      .source-pill {
        margin: 16px 0 0;
        display: inline-flex;
        border-radius: 999px;
        background: rgba(255, 255, 255, 0.88);
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        color: var(--accent);
      }

      h1 {
        margin: 18px 0 0;
        font-size: clamp(2rem, 5vw, 2.8rem);
        line-height: 1.05;
      }

      .lede {
        margin: 12px 0 0;
        font-size: 1.02rem;
        line-height: 1.7;
        color: var(--muted);
      }

      .meta-grid {
        margin-top: 22px;
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .meta-card {
        border-radius: 20px;
        border: 1px solid rgba(23, 32, 51, 0.08);
        background: rgba(255, 255, 255, 0.85);
        padding: 16px;
      }

      .meta-label {
        margin: 0;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .meta-value {
        margin: 8px 0 0;
        font-size: 1rem;
        font-weight: 700;
      }

      .body {
        padding: 28px;
      }

      .notice {
        border-radius: 22px;
        padding: 18px 20px;
        border: 1px solid var(--line);
      }

      .notice h2 {
        margin: 0 0 8px;
        font-size: 1rem;
      }

      .notice p {
        margin: 0;
        line-height: 1.6;
      }

      .notice ul {
        margin: 12px 0 0;
        padding-left: 18px;
      }

      .notice-warn {
        background: var(--warn-soft);
        border-color: rgba(234, 179, 8, 0.3);
      }

      .notice-ready {
        background: var(--ready-soft);
        border-color: rgba(34, 197, 94, 0.22);
      }

      .week-list {
        margin-top: 22px;
        display: grid;
        gap: 18px;
      }

      .week-card {
        border-radius: 24px;
        border: 1px solid var(--line);
        background: var(--surface-soft);
        overflow: hidden;
      }

      .week-head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 10px;
        padding: 18px 20px;
        border-bottom: 1px solid rgba(23, 32, 51, 0.08);
      }

      .week-title {
        margin: 0;
        font-size: 1.15rem;
        font-weight: 700;
      }

      .week-pill {
        border-radius: 999px;
        background: #fff;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        color: var(--muted);
      }

      .day-grid {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        padding: 18px;
      }

      .day-card {
        border-radius: 20px;
        border: 1px solid rgba(23, 32, 51, 0.08);
        background: #fff;
        padding: 16px;
      }

      .day-title {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
      }

      .day-empty {
        margin: 14px 0 0;
        color: var(--muted);
      }

      .assignment-list {
        display: grid;
        gap: 12px;
        margin-top: 14px;
      }

      .assignment-card {
        border-radius: 18px;
        border: 1px solid rgba(23, 32, 51, 0.08);
        background: var(--surface-muted);
        padding: 14px 14px 16px;
      }

      .assignment-head {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        justify-content: space-between;
        gap: 8px;
      }

      .assignment-title {
        margin: 0;
        font-size: 0.98rem;
        font-weight: 700;
      }

      .assignment-pill {
        border-radius: 999px;
        padding: 5px 10px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .assignment-pill-ready {
        background: #fff;
        color: var(--ready);
      }

      .assignment-pill-review {
        background: #fff;
        color: var(--warn);
      }

      .assignment-summary,
      .assignment-meta {
        margin: 8px 0 0;
        line-height: 1.6;
      }

      .assignment-summary {
        color: var(--text);
      }

      .assignment-meta {
        color: var(--muted);
        font-size: 0.95rem;
      }

      .review-list {
        margin: 12px 0 0;
        padding-left: 18px;
        color: var(--warn);
      }

      .review-list li + li {
        margin-top: 6px;
      }

      .footer-note {
        margin-top: 24px;
        border-top: 1px solid var(--line);
        padding-top: 16px;
        color: var(--muted);
        line-height: 1.6;
      }

      @media (max-width: 820px) {
        .hero-brand {
          align-items: flex-start;
          flex-direction: column;
        }

        .meta-grid,
        .day-grid {
          grid-template-columns: 1fr;
        }

        .hero,
        .body {
          padding: 22px 20px 24px;
        }

        .shell {
          padding-inline: 14px;
        }
      }

      @media print {
        html,
        body {
          background: #fff;
        }

        .toolbar {
          display: none;
        }

        .shell {
          padding: 0;
        }

        .page {
          width: auto;
          border: none;
          border-radius: 0;
          box-shadow: none;
        }

        .notice,
        .week-card,
        .day-card,
        .assignment-card,
        .meta-card {
          break-inside: avoid;
        }
      }

      @page {
        size: auto;
        margin: 12mm;
      }
    </style>
  </head>
  <body>
    <div class="toolbar">
      <div class="toolbar-copy">
        <span class="toolbar-kicker">FreeSwimming</span>
        <span class="toolbar-title">Program PDF print view</span>
      </div>
      <div class="toolbar-actions">
        <button class="toolbar-button toolbar-button-primary" type="button" onclick="window.print()">
          Print / Save PDF
        </button>
        <button class="toolbar-button" type="button" onclick="window.close()">
          Close
        </button>
      </div>
    </div>
    <main class="shell">
      <article class="page" data-testid="program-pdf-print-view">
        <header class="hero">
          <div class="hero-brand">
            ${brandLockupHtml}
            <div>
              <p class="eyebrow">freeswimming.org</p>
              <p class="hero-tagline">Learn. Drill. Swim.</p>
            </div>
          </div>
          <p class="source-pill" data-testid="program-pdf-source">Source: ${escapeHtml(model.sourceLabel)}</p>
          <h1 data-testid="program-pdf-title">${escapeHtml(model.title)}</h1>
          <p class="lede">${escapeHtml(model.scheduleSummary)}</p>
          <div class="meta-grid">
            <div class="meta-card">
              <p class="meta-label">Weeks</p>
              <p class="meta-value">${model.weeks.length}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Scheduled workouts</p>
              <p class="meta-value">${model.weeks.reduce((total, week) => total + week.assignmentCount, 0)}</p>
            </div>
            <div class="meta-card">
              <p class="meta-label">Exported</p>
              <p class="meta-value">${escapeHtml(model.exportedAtLabel)}</p>
            </div>
          </div>
        </header>
        <div class="body">
          ${readinessNoticeHtml}
          <section class="week-list">
            ${model.weeks.map((week) => renderProgramPdfWeekHtml(week)).join("")}
          </section>
          <p class="footer-note">
            This print view reflects the saved canonical program and keeps workout ordering and review diagnostics explicit for later Garmin-ready delivery.
          </p>
        </div>
      </article>
    </main>
  </body>
</html>`;
}

function buildProgramExportAssignment(input: {
  program: ProgramEditorRecord;
  week: ProgramEditorRecord["weeks"][number];
  assignment: ProgramAssignment;
  workoutsById: ReadonlyMap<string, WorkoutEditorRecord>;
  issues: ProgramExportIssue[];
}): ProgramGarminReadyExportAssignment {
  const { week, assignment, workoutsById, issues } = input;
  const dayLabel = PROGRAM_WEEKDAY_LABELS[assignment.dayIndex] ?? "Unknown day";
  const workout = workoutsById.get(assignment.workoutId);

  if (!workout) {
    const issue = buildProgramExportIssue({
      code: "missing_workout_reference",
      weekId: week.id,
      weekLabel: week.label,
      dayIndex: assignment.dayIndex,
      assignmentId: assignment.id,
      workoutId: assignment.workoutId,
      detail: `${week.label} · ${dayLabel} includes a scheduled workout that could not be loaded for this account.`,
    });
    issues.push(issue);

    return {
      id: assignment.id,
      workoutId: assignment.workoutId,
      dayIndex: assignment.dayIndex,
      dayLabel,
      position: assignment.position,
      mappingStatus: "review",
      reviewIssueIds: [issue.id],
      workoutTitle: null,
      workoutSummary: null,
      workoutEnvironmentLabel: null,
      workoutSessionTypeLabel: null,
      workoutEffortLabel: null,
      workout: null,
    };
  }

  const workoutExport = buildWorkoutGarminReadyExport(workout.draft, {
    draftState: "canonical",
    workoutId: workout.id,
  });
  const reviewIssueIds: string[] = [];

  if (workoutExport.diagnostics.status === "review") {
    const issue = buildProgramExportIssue({
      code: "workout_requires_review",
      weekId: week.id,
      weekLabel: week.label,
      dayIndex: assignment.dayIndex,
      assignmentId: assignment.id,
      workoutId: assignment.workoutId,
      detail: `${week.label} · ${dayLabel} · ${workout.draft.title} still has ${
        workoutExport.diagnostics.issueCount
      } workout export review item${workoutExport.diagnostics.issueCount === 1 ? "" : "s"}.`,
    });
    issues.push(issue);
    reviewIssueIds.push(issue.id);
  }

  return {
    id: assignment.id,
    workoutId: assignment.workoutId,
    dayIndex: assignment.dayIndex,
    dayLabel,
    position: assignment.position,
    mappingStatus: workoutExport.diagnostics.status,
    reviewIssueIds,
    workoutTitle: workout.draft.title,
    workoutSummary: workoutExport.workout?.summary ?? null,
    workoutEnvironmentLabel: workoutExport.workout?.environment.label ?? null,
    workoutSessionTypeLabel: workoutExport.workout?.sessionType.label ?? null,
    workoutEffortLabel: workoutExport.workout?.effort.label ?? null,
    workout: workoutExport,
  };
}

function buildProgramExportIssue(input: {
  code: ProgramExportIssueCode;
  weekId: string | null;
  weekLabel: string | null;
  dayIndex: number | null;
  assignmentId: string | null;
  workoutId: string | null;
  detail: string;
}): ProgramExportIssue {
  return {
    id: `program-export-${input.assignmentId ?? "program"}-${input.code}`,
    code: input.code,
    weekId: input.weekId,
    weekLabel: input.weekLabel,
    dayIndex: input.dayIndex,
    dayLabel:
      input.dayIndex == null ? null : (PROGRAM_WEEKDAY_LABELS[input.dayIndex] ?? "Unknown day"),
    assignmentId: input.assignmentId,
    workoutId: input.workoutId,
    detail: input.detail,
  };
}

function buildProgramExportSummary(issues: ProgramExportIssue[], assignmentCount: number) {
  if (assignmentCount === 0) {
    return "Add at least one scheduled workout before exporting this program.";
  }

  if (issues.length === 0) {
    return "Ready for the planned Garmin/export handoff.";
  }

  return `Review ${issues.length} program export detail${
    issues.length === 1 ? "" : "s"
  } before you treat this schedule as handoff-ready.`;
}

function renderProgramPdfWeekHtml(week: ProgramPdfWeek) {
  return `
    <section class="week-card">
      <div class="week-head">
        <h2 class="week-title">${escapeHtml(week.label)}</h2>
        <span class="week-pill">${week.assignmentCount} scheduled</span>
      </div>
      <div class="day-grid">
        ${week.days.map((day) => renderProgramPdfDayHtml(day)).join("")}
      </div>
    </section>
  `;
}

function renderProgramPdfDayHtml(day: ProgramPdfDay) {
  return `
    <section class="day-card">
      <h3 class="day-title">${escapeHtml(day.dayLabel)}</h3>
      ${
        day.assignments.length === 0
          ? '<p class="day-empty">No workout scheduled.</p>'
          : `<div class="assignment-list">${day.assignments
              .map((assignment) => renderProgramPdfAssignmentHtml(assignment))
              .join("")}</div>`
      }
    </section>
  `;
}

function renderProgramPdfAssignmentHtml(assignment: ProgramPdfAssignment) {
  const reviewListHtml =
    assignment.reviewDetails.length > 0
      ? `
        <ul class="review-list">
          ${assignment.reviewDetails.map((detail) => `<li>${escapeHtml(detail)}</li>`).join("")}
        </ul>
      `
      : "";

  return `
    <article class="assignment-card">
      <div class="assignment-head">
        <h4 class="assignment-title">${escapeHtml(assignment.title)}</h4>
        <span class="assignment-pill assignment-pill-${
          assignment.status === "ready" ? "ready" : "review"
        }">${assignment.status === "ready" ? "Ready" : "Review"}</span>
      </div>
      <p class="assignment-summary">${escapeHtml(assignment.summary)}</p>
      ${
        assignment.metaLine
          ? `<p class="assignment-meta">${escapeHtml(assignment.metaLine)}</p>`
          : ""
      }
      ${reviewListHtml}
    </article>
  `;
}

function normalizeFileNamePart(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
