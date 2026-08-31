"use client";

import { useEffect, useMemo, useState } from "react";
import { COURSE_MODULES } from "@/app/course/courseData";
import AdminManagerState from "@/components/admin/AdminManagerState";
import AdminContextNotesPanel from "@/components/admin/AdminContextNotesPanel";
import AdminContextQrPanel from "@/components/admin/AdminContextQrPanel";
import type { AdminRole } from "@/lib/admin/access";
import type {
  AdminContentItemRow,
  AdminContentStatus,
  AdminContentType,
} from "@/lib/admin/content";
import type {
  AdminContentMirrorMetric as MirrorMetric,
  AdminContentMirrorSnapshot as MirrorSnapshot,
} from "@/lib/admin/content-mirror";
import {
  resolveAdminContentEditNotesContext,
  resolveAdminContentEditQrContext,
} from "@/lib/admin/content-edit-context";
import {
  ALL_CONTENT_SCOPE_STORAGE_KEY,
  CONTENT_PRIMARY_VIEW_STORAGE_KEY,
  parseStoredAllContentScope,
  parseStoredContentPrimaryView,
  type ContentPrimaryView,
} from "@/lib/admin/content-view-preferences";
import {
  buildCourseStructureIntegrity,
  getAdjacentLessonId,
  getAdjacentModuleId,
  type CourseStructureLessonRow,
  type CourseStructureModuleRow,
} from "@/lib/admin/course-structure";
import {
  buildCourseWorkspaceLessonPreview,
  buildCourseWorkspaceLessonsByModuleId,
} from "@/lib/admin/course-workspace";
import type { AdminCategoryRow } from "@/lib/admin/categories";
import { buildCoursePreviewHref, resolveCoursePreviewModeFromStatus } from "@/lib/course/preview";
import { buildCourseLessonHref } from "@/lib/course/canonical-routes";
import { resolveCourseLessonRuntimeId } from "@/lib/course/runtime-identity";
import {
  resolveGuideDrillRuntimeId,
  resolveGuideSessionRuntimeId,
} from "@/lib/guides/runtime-identity";
import { buildAdminQrPrefillHref } from "@/lib/qr-links/admin-prefill";

const CONTENT_TYPE_OPTIONS: Array<{ value: AdminContentType; label: string }> = [
  { value: "course_module", label: "Course module" },
  { value: "course_lesson", label: "Course lesson" },
  { value: "guide_session", label: "Guide session" },
  { value: "guide_drill", label: "Guide drill" },
  { value: "page", label: "Page" },
  { value: "product", label: "Product metadata" },
];

const DEFAULT_ALL_CONTENT_SCOPE: AdminContentType = "course_module";
const ALL_CONTENT_SCOPE_OPTIONS: Array<{ value: "all" | AdminContentType; label: string }> = [
  { value: "all", label: "All content (audit)" },
  { value: "course_module", label: "Course modules" },
  { value: "course_lesson", label: "Course lessons" },
  { value: "guide_session", label: "0-1000 sessions" },
  { value: "guide_drill", label: "Poolside drills" },
  { value: "product", label: "Programs/products" },
  { value: "page", label: "Pages" },
];

const CONTENT_TYPE_LABEL: Record<AdminContentType, string> = {
  course_module: "Course module",
  course_lesson: "Course lesson",
  guide_session: "Guide session",
  guide_drill: "Guide drill",
  page: "Page",
  product: "Product metadata",
};

const STATUS_OPTIONS: Array<{ value: AdminContentStatus; label: string }> = [
  { value: "draft", label: "Draft" },
  { value: "review", label: "Review" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
];

const COURSE_CONTENT_TYPES: ReadonlySet<AdminContentType> = new Set([
  "course_module",
  "course_lesson",
]);

const STATUS_LABEL_BY_VALUE: Record<AdminContentStatus, string> = {
  draft: "Draft",
  review: "Review",
  published: "Published",
  archived: "Archived",
};

const STATUS_CHIP_CLASS_BY_VALUE: Record<AdminContentStatus, string> = {
  draft: "border-slate-300 bg-slate-100 text-slate-700",
  review: "border-amber-300 bg-amber-100 text-amber-800",
  published: "border-emerald-300 bg-emerald-100 text-emerald-800",
  archived: "border-slate-300 bg-slate-200 text-slate-700",
};

const managerHeaderClass =
  "fs-library-card fs-library-card-accent !rounded-none !border-x-0 !border-t-0 !bg-transparent p-0 pb-4 !shadow-none";
const workspacePanelClass =
  "fs-library-card fs-library-card-muted !bg-white/82 p-4 !shadow-[0_6px_18px_rgba(15,23,42,0.045)] sm:p-5";
const rowCardClass =
  "fs-library-card !bg-white/88 p-4 !shadow-[0_6px_18px_rgba(15,23,42,0.045)] sm:p-5";
const nestedPanelClass = "rounded-[var(--fs-radius-control)] bg-slate-50/72 p-3";
const mutedPanelClass = "rounded-[var(--fs-radius-control)] bg-slate-50/58 p-3";
const activePanelClass =
  "rounded-[var(--fs-radius-control)] border-l-4 border-[color:var(--fs-color-brand-600)] bg-[color:var(--fs-color-brand-50)] p-3";
const mutedTextClass = "text-sm leading-6 text-[color:var(--fs-color-muted)]";
const headingClass = "text-lg font-semibold text-[color:var(--fs-color-ink-strong)]";
const smallHeadingClass = "text-sm font-semibold text-[color:var(--fs-color-ink-strong)]";
const metadataClass = "text-xs text-[color:var(--fs-color-muted)]";
const metadataLabelClass = "text-xs font-semibold text-[color:var(--fs-color-muted)]";
const compactLabelClass = "space-y-1 text-xs font-semibold text-[color:var(--fs-color-ink)]";
const inlineFieldClass =
  "h-10 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const compactFieldClass =
  "h-9 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-[rgba(248,250,252,0.75)] disabled:text-[color:var(--fs-color-muted)]";
const textAreaClass =
  "admin-auto-grow-textarea min-h-20 w-full resize-y overflow-hidden rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white px-3 py-2 text-sm text-[color:var(--fs-color-ink-strong)] transition-colors placeholder:text-[color:var(--fs-color-muted)] focus:border-[color:var(--fs-border-brand)] focus:outline-none focus:ring-2 focus:ring-blue-100";
const lessonMirrorComfortTextareaClass = [textAreaClass, "sm:!min-h-24"].join(" ");
const lessonMirrorFocusTextareaClass = [textAreaClass, "sm:!min-h-28"].join(" ");
const readOnlyValueClass =
  "min-h-9 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/82 px-3 py-2 text-sm text-[color:var(--fs-color-ink-strong)]";
const compactCheckboxClass =
  "h-4 w-4 rounded border border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";
const lessonMirrorEditorClass =
  "rounded-[var(--fs-radius-control)] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.94))] p-3 shadow-[0_14px_34px_rgba(15,23,42,0.06)] sm:p-4";
const lessonMirrorShellClass = "mt-3 w-full space-y-3";
const lessonMirrorCardClass =
  "rounded-[var(--fs-radius-control)] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.94))] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)] sm:p-4";
const lessonMirrorLargeCardClass =
  "rounded-[var(--fs-radius-control)] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.94))] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)] sm:p-4";
const lessonMirrorPracticeCardClass =
  "overflow-hidden rounded-[var(--fs-radius-control)] border border-slate-200/72 bg-white/96 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)]";
const lessonMirrorWaterPracticeCardClass =
  "overflow-hidden rounded-[var(--fs-radius-control)] border border-blue-100/90 bg-white/96 p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)]";
const lessonMirrorSoftCalloutClass =
  "rounded-[var(--fs-radius-control)] border-l-4 border-blue-200 bg-blue-50/50 px-3 py-3";
const lessonMirrorCoachCheckClass =
  "rounded-[var(--fs-radius-control)] border border-blue-100/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(246,250,255,0.94)_48%,rgba(240,253,250,0.82))] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)] sm:p-4";
const lessonMirrorReadyCheckClass =
  "rounded-[var(--fs-radius-control)] border border-blue-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,251,255,0.94))] p-3 shadow-[0_10px_24px_rgba(15,23,42,0.055)] sm:p-4";
const lessonMirrorCoachCheckRowClass =
  "rounded-[var(--fs-radius-control)] bg-white/82 p-2 ring-1 ring-slate-200/76";
const lessonMirrorAvoidFieldClass =
  "rounded-[var(--fs-radius-control)] bg-amber-50/72 p-2 ring-1 ring-amber-100/80";
const lessonMirrorFixFieldClass =
  "rounded-[var(--fs-radius-control)] bg-blue-50/72 p-2 ring-1 ring-blue-100/80";
const lessonMirrorReadyFieldClass =
  "rounded-[var(--fs-radius-control)] bg-white/88 p-2 ring-1 ring-blue-100/78";
const lessonMirrorSupportFieldClass =
  "rounded-[var(--fs-radius-control)] border border-slate-200/72 bg-white/92 p-2";
const lessonMirrorSectionEyebrowClass =
  "text-[13px] font-bold tracking-wide text-slate-600 uppercase";
const lessonMirrorHeaderRowClass = "grid min-h-7 grid-cols-[minmax(0,1fr)_auto] items-center gap-2";
const lessonMirrorPracticeHeaderClass = "grid gap-2 px-1 sm:px-2";
const secondaryActionClass =
  "fs-cta-secondary inline-flex min-h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactPrimaryActionClass =
  "fs-cta-primary inline-flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactSecondaryActionClass =
  "fs-cta-secondary inline-flex min-h-9 items-center justify-center gap-2 px-3 text-xs font-semibold transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactQuietActionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/78 px-3 text-xs font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactSuccessActionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-800 transition-colors hover:bg-emerald-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactWarningActionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-amber-200 bg-amber-50 px-3 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactDangerActionClass =
  "inline-flex min-h-9 items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-rose-200 bg-white/85 px-3 text-xs font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const compactDetailsSummaryClass =
  "inline-flex min-h-9 cursor-pointer list-none items-center justify-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/78 px-3 text-xs font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 [&::-webkit-details-marker]:hidden";
const compactActionRailClass =
  "mt-2 flex flex-wrap items-center gap-2 border-t border-[color:var(--fs-border-soft)] pt-2";
const tabButtonClass =
  "inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] px-3 text-xs font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";
const tabButtonActiveClass = "bg-white text-[color:var(--fs-color-brand-700)] shadow-sm";
const tabButtonInactiveClass = "text-[color:var(--fs-color-ink)] hover:bg-white/75";
const statusFilterClass =
  "inline-flex min-h-8 items-center justify-center rounded-full border border-[color:var(--fs-border-soft)] bg-white/66 px-2.5 text-[11px] font-semibold text-[color:var(--fs-color-ink)] transition-colors hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const statusFilterActiveClass =
  "border-[color:var(--fs-border-brand)] bg-[color:var(--fs-color-brand-50)] text-[color:var(--fs-color-brand-700)]";

const COURSE_WORKSPACE_OVERVIEW_PREVIEW_LIMIT = 3;

type ListSortOption =
  | "default"
  | "title_asc"
  | "title_desc"
  | "updated_desc"
  | "updated_asc"
  | "status_then_order";

const SORT_OPTIONS: Array<{ value: ListSortOption; label: string }> = [
  { value: "default", label: "Default order" },
  { value: "title_asc", label: "Title (A-Z)" },
  { value: "title_desc", label: "Title (Z-A)" },
  { value: "updated_desc", label: "Last updated (newest)" },
  { value: "updated_asc", label: "Last updated (oldest)" },
  { value: "status_then_order", label: "Status then order" },
];

const STATUS_SORT_RANK: Record<AdminContentStatus, number> = {
  draft: 0,
  review: 1,
  published: 2,
  archived: 3,
};

const EDITABLE_CONTENT_TYPES: ReadonlySet<AdminContentType> = new Set([
  "course_module",
  "course_lesson",
  "guide_session",
  "guide_drill",
  "page",
  "product",
]);

const MIRROR_METRIC_KEY_BY_CONTENT_TYPE: Partial<Record<AdminContentType, MirrorMetric["key"]>> = {
  course_module: "course_module",
  course_lesson: "course_lesson",
  guide_session: "guide_session",
  guide_drill: "guide_drill",
  product: "programs",
};

type AdminContentListResponse =
  | {
      ok: true;
      role: AdminRole;
      items: AdminContentItemRow[];
      schemaReady?: boolean;
      warning?: string | null;
      mirror?: MirrorSnapshot;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCreateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentUpdateResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentDeleteResponse =
  | {
      ok: true;
      id: string;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentCleanupTestRecordsResponse =
  | {
      ok: true;
      deletedCount: number;
      deletedIds: string[];
      deletedSlugs: string[];
      normalizedCourseStructure?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
      candidateCount?: number;
    };

type CourseStructureActionResponse =
  | {
      ok: true;
      integrity?: {
        unlinkedLessonCount: number;
        duplicateModuleSortOrderCount: number;
        duplicateLessonSortGroupCount: number;
        duplicateLessonSortEntryCount: number;
      };
    }
  | {
      ok: false;
      error?: string;
    };

type ContentRevisionItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotTitle: string;
  snapshotStatus: string;
};

type AdminContentRevisionsResponse =
  | {
      ok: true;
      canRestore: boolean;
      items: ContentRevisionItem[];
    }
  | {
      ok: false;
      error?: string;
    };

type AdminContentRestoreResponse =
  | {
      ok: true;
      item: AdminContentItemRow;
      restoredRevisionId: string;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminCategoriesResponse =
  | {
      ok: true;
      items: AdminCategoryRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type FormState = {
  contentType: AdminContentType;
  title: string;
  slug: string;
  summary: string;
  category: string;
  status: AdminContentStatus;
  parentId: string;
};

type EditFormState = {
  title: string;
  slug: string;
  summary: string;
  category: string;
  sortOrder: string;
  parentId: string;
  lessonBody: LessonBodyEditState | null;
};

type LessonTypeOption = "learn" | "drill" | "swim" | "";
type SupportActionOption = "videoAnalysis" | "poolsideGuide" | "guide0To1000" | "contact";
type SupportPrimaryActionOption = SupportActionOption | "";

type LessonExperienceMistakeEditRow = {
  mistake: string;
  fix: string;
};

type LessonExperienceVariantOption = "concept" | "dryland" | "water_drill" | "swim_set" | "custom";
type LessonExperienceDisplayKey =
  | "quickExplanation"
  | "whyThisMatters"
  | "landPractice"
  | "landSafetyNote"
  | "waterPractice"
  | "waterSafetyNote"
  | "feelCues"
  | "commonMistakes"
  | "nextStep"
  | "support";

type LessonExperienceDisplayState = Record<LessonExperienceDisplayKey, boolean>;

type LessonExperienceEditState = {
  variant: LessonExperienceVariantOption;
  display: LessonExperienceDisplayState;
  quickExplanation: string;
  whyThisMatters: string;
  landPracticeTitle: string;
  landPracticeSteps: string;
  landPracticeSafetyNote: string;
  waterPracticeTitle: string;
  waterPracticeSteps: string;
  waterPracticeSafetyNote: string;
  commonMistakes: LessonExperienceMistakeEditRow[];
  feelCues: string;
  nextStep: string;
  supportTitle: string;
  supportBody: string;
};

type LessonBodyEditState = {
  lessonId: string;
  youtubeId: string;
  estMinutes: string;
  videoPlanningNotes: string;
  lessonType: LessonTypeOption;
  drillLabel: string;
  supportStartAtLessonInModule: string;
  supportActionVideoAnalysis: boolean;
  supportActionPoolsideGuide: boolean;
  supportActionGuide0To1000: boolean;
  supportActionContact: boolean;
  supportPrimaryAction: SupportPrimaryActionOption;
  goal: string;
  displayGoal: boolean;
  displayCues: boolean;
  displayCommonMistakes: boolean;
  displayDrill: boolean;
  displayCheckpoint: boolean;
  displayNextStep: boolean;
  displaySupport: boolean;
  cues: string;
  commonMistakes: string;
  drillTitle: string;
  drillSteps: string;
  nextStep: string;
  passCriteria: string;
  lessonExperience: LessonExperienceEditState;
};

const LESSON_EXPERIENCE_VARIANT_OPTIONS: Array<{
  value: LessonExperienceVariantOption;
  label: string;
  description: string;
}> = [
  {
    value: "concept",
    label: "Concept / intro",
    description: "Use for explanation-first lessons without forced practice blocks.",
  },
  {
    value: "dryland",
    label: "Dryland practice",
    description: "Use when the lesson mainly rehearses movement outside the pool.",
  },
  {
    value: "water_drill",
    label: "Water drill",
    description: "Use for a normal swim drill with land prep and water practice.",
  },
  {
    value: "swim_set",
    label: "Swim set",
    description: "Use for pool execution where water practice matters most.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Use after manually choosing the exact visible containers.",
  },
];

const LESSON_EXPERIENCE_DISPLAY_DEFAULTS: Record<
  LessonExperienceVariantOption,
  LessonExperienceDisplayState
> = {
  concept: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: false,
    landSafetyNote: true,
    waterPractice: false,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  dryland: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: false,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  water_drill: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
  swim_set: {
    quickExplanation: true,
    whyThisMatters: false,
    landPractice: false,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: false,
    nextStep: true,
    support: true,
  },
  custom: {
    quickExplanation: true,
    whyThisMatters: true,
    landPractice: true,
    landSafetyNote: true,
    waterPractice: true,
    waterSafetyNote: true,
    feelCues: true,
    commonMistakes: true,
    nextStep: true,
    support: true,
  },
};

type CourseLessonWorkspaceItem = {
  id: string;
  title: string;
  slug: string;
  status: AdminContentStatus;
  sortOrder: number;
  parentId: string | null;
  moduleLabel: string | null;
  runtimeLessonId: string;
};

type CourseModuleWorkspaceItem = {
  id: string;
  title: string;
  slug: string;
  status: AdminContentStatus;
  sortOrder: number;
};

type WorkspaceLessonCreateState = {
  title: string;
  slug: string;
  summary: string;
  status: AdminContentStatus;
  parentId: string;
};

type StatusCountByState = Record<AdminContentStatus, number>;

type ContentListFocusState = {
  source: "mirror" | "workspace";
  label: string;
  detail: string;
};

type CourseStructureActionPayload =
  | {
      action: "move_module";
      moduleId: string;
      direction: "up" | "down";
    }
  | {
      action: "move_lesson";
      lessonId: string;
      direction: "up" | "down";
    }
  | {
      action: "move_lesson_to_module";
      lessonId: string;
      targetModuleId: string;
      targetPosition?: "start" | "end";
    }
  | {
      action: "delete_module";
      moduleId: string;
      strategy: "reassign" | "archive_lessons" | "unlink_lessons";
      targetModuleId?: string;
    }
  | {
      action: "normalize";
    };

type PendingModuleDeleteState = {
  moduleId: string;
  moduleTitle: string;
  lessonCount: number;
  strategy: "reassign" | "archive_lessons" | "unlink_lessons";
  targetModuleId: string;
};

const WORKSPACE_ALL_MODULES_ID = "__all__";
const WORKSPACE_UNLINKED_MODULE_ID = "__unlinked__";
const LESSON_TYPE_OPTIONS: Array<{ value: LessonTypeOption; label: string }> = [
  { value: "", label: "Not set" },
  { value: "learn", label: "Learn" },
  { value: "drill", label: "Drill" },
  { value: "swim", label: "Swim" },
];
const SUPPORT_ACTION_OPTIONS: Array<{ value: SupportActionOption; label: string }> = [
  { value: "videoAnalysis", label: "Video analysis" },
  { value: "poolsideGuide", label: "Poolside guide" },
  { value: "guide0To1000", label: "0-1000 guide" },
  { value: "contact", label: "Contact" },
];

const INITIAL_FORM: FormState = {
  contentType: "course_module",
  title: "",
  slug: "",
  summary: "",
  category: "General",
  status: "draft",
  parentId: "",
};

const INITIAL_WORKSPACE_LESSON_CREATE_FORM: WorkspaceLessonCreateState = {
  title: "",
  slug: "",
  summary: "",
  status: "draft",
  parentId: "",
};

function normalizeCategoryInput(value: string): string {
  const collapsed = value.trim().replace(/\s+/g, " ");
  return collapsed.length > 0 ? collapsed : "General";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeLinesInput(value: string): string[] {
  return value
    .split("\n")
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function joinLines(value: string[]): string {
  return value.join("\n");
}

function createStatusCountByState(): StatusCountByState {
  return {
    draft: 0,
    review: 0,
    published: 0,
    archived: 0,
  };
}

function parseBodyString(body: unknown, key: string): string | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function parseBodyBoolean(body: unknown, key: string): boolean | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value === "boolean") return value;
  return null;
}

function parseBodyNumber(body: unknown, key: string): number | null {
  if (!isRecord(body)) return null;
  const value = body[key];
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseBodyStringArray(body: unknown, key: string): string[] {
  if (!isRecord(body)) return [];
  const value = body[key];
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter((entry) => entry.length > 0);
}

function resolveLessonType(value: string | null): LessonTypeOption {
  if (value === "learn" || value === "drill" || value === "swim") return value;
  return "";
}

function resolveLessonExperienceVariant(
  value: string | null,
  lessonType: LessonTypeOption
): LessonExperienceVariantOption {
  if (
    value === "concept" ||
    value === "dryland" ||
    value === "water_drill" ||
    value === "swim_set" ||
    value === "custom"
  ) {
    return value;
  }
  if (lessonType === "learn") return "concept";
  if (lessonType === "swim") return "swim_set";
  return "water_drill";
}

function parseLessonExperienceDisplayState(
  lessonExperience: Record<string, unknown> | null,
  variant: LessonExperienceVariantOption,
  legacyDisplay: Record<string, unknown> | null
): LessonExperienceDisplayState {
  const displayRecord = parseNestedRecord(lessonExperience, "display");
  const defaults = { ...LESSON_EXPERIENCE_DISPLAY_DEFAULTS[variant] };
  if (!displayRecord && parseBodyBoolean(legacyDisplay, "drill") === false) {
    defaults.landPractice = false;
    defaults.waterPractice = false;
  }

  return {
    quickExplanation:
      parseBodyBoolean(displayRecord, "quickExplanation") ?? defaults.quickExplanation,
    whyThisMatters: parseBodyBoolean(displayRecord, "whyThisMatters") ?? defaults.whyThisMatters,
    landPractice: parseBodyBoolean(displayRecord, "landPractice") ?? defaults.landPractice,
    landSafetyNote: parseBodyBoolean(displayRecord, "landSafetyNote") ?? defaults.landSafetyNote,
    waterPractice: parseBodyBoolean(displayRecord, "waterPractice") ?? defaults.waterPractice,
    waterSafetyNote: parseBodyBoolean(displayRecord, "waterSafetyNote") ?? defaults.waterSafetyNote,
    feelCues: parseBodyBoolean(displayRecord, "feelCues") ?? defaults.feelCues,
    commonMistakes: parseBodyBoolean(displayRecord, "commonMistakes") ?? defaults.commonMistakes,
    nextStep: parseBodyBoolean(displayRecord, "nextStep") ?? defaults.nextStep,
    support: parseBodyBoolean(displayRecord, "support") ?? defaults.support,
  };
}

function resolveSupportPrimaryAction(value: string | null): SupportPrimaryActionOption {
  if (
    value === "videoAnalysis" ||
    value === "poolsideGuide" ||
    value === "guide0To1000" ||
    value === "contact"
  ) {
    return value;
  }
  return "";
}

function parseLessonExperienceRecord(body: unknown): Record<string, unknown> | null {
  return isRecord(body) && isRecord(body.lessonExperience) ? body.lessonExperience : null;
}

function parseNestedRecord(body: unknown, key: string): Record<string, unknown> | null {
  return isRecord(body) && isRecord(body[key]) ? body[key] : null;
}

function ensureLessonExperienceMistakeRows(
  rows: LessonExperienceMistakeEditRow[]
): LessonExperienceMistakeEditRow[] {
  return rows.length > 0 ? rows : [{ mistake: "", fix: "" }];
}

function parseLessonExperienceMistakeRows(
  lessonExperience: Record<string, unknown> | null,
  legacyMistakes: string[]
): LessonExperienceMistakeEditRow[] {
  const value = lessonExperience?.commonMistakes;
  if (Array.isArray(value)) {
    const rows = value
      .map((entry) => {
        if (typeof entry === "string") {
          return {
            mistake: entry.trim(),
            fix: "",
          };
        }
        if (!isRecord(entry)) return null;
        const mistake = typeof entry.mistake === "string" ? entry.mistake.trim() : "";
        const fix = typeof entry.fix === "string" ? entry.fix.trim() : "";
        if (!mistake && !fix) return null;
        return { mistake, fix };
      })
      .filter((entry): entry is LessonExperienceMistakeEditRow => Boolean(entry));
    return ensureLessonExperienceMistakeRows(rows);
  }

  return ensureLessonExperienceMistakeRows(
    legacyMistakes.map((mistake) => ({
      mistake,
      fix: "",
    }))
  );
}

function toLessonExperienceEditState(item: AdminContentItemRow): LessonExperienceEditState {
  const lessonExperience = parseLessonExperienceRecord(item.body);
  const landPractice = parseNestedRecord(lessonExperience, "landPractice");
  const waterPractice = parseNestedRecord(lessonExperience, "waterPractice");
  const lessonType = resolveLessonType(parseBodyString(item.body, "lessonType"));
  const variant = resolveLessonExperienceVariant(
    parseBodyString(lessonExperience, "variant"),
    lessonType
  );
  const legacyDisplay = parseNestedRecord(item.body, "display");

  return {
    variant,
    display: parseLessonExperienceDisplayState(lessonExperience, variant, legacyDisplay),
    quickExplanation: parseBodyString(lessonExperience, "quickExplanation") ?? "",
    whyThisMatters: parseBodyString(lessonExperience, "whyThisMatters") ?? "",
    landPracticeTitle: parseBodyString(landPractice, "title") ?? "",
    landPracticeSteps: joinLines(parseBodyStringArray(landPractice, "steps")),
    landPracticeSafetyNote: parseBodyString(landPractice, "safetyNote") ?? "",
    waterPracticeTitle: parseBodyString(waterPractice, "title") ?? "",
    waterPracticeSteps: joinLines(parseBodyStringArray(waterPractice, "steps")),
    waterPracticeSafetyNote: parseBodyString(waterPractice, "safetyNote") ?? "",
    commonMistakes: parseLessonExperienceMistakeRows(
      lessonExperience,
      parseBodyStringArray(item.body, "commonMistakes")
    ),
    feelCues: joinLines(parseBodyStringArray(lessonExperience, "feelCues")),
    nextStep: parseBodyString(lessonExperience, "nextStep") ?? "",
    supportTitle: parseBodyString(parseNestedRecord(lessonExperience, "support"), "title") ?? "",
    supportBody: parseBodyString(parseNestedRecord(lessonExperience, "support"), "body") ?? "",
  };
}

function toLessonBodyEditState(item: AdminContentItemRow): LessonBodyEditState {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  const drillBody = isRecord(item.body) && isRecord(item.body.drill) ? item.body.drill : null;
  const videoPlanningBody = parseNestedRecord(item.body, "videoPlanning");
  const displayBody = isRecord(item.body) && isRecord(item.body.display) ? item.body.display : null;
  const supportCardBody =
    isRecord(item.body) && isRecord(item.body.supportCard) ? item.body.supportCard : null;
  const supportActionsBody =
    supportCardBody && isRecord(supportCardBody.actions) ? supportCardBody.actions : null;
  const drillTitleRaw =
    drillBody && typeof drillBody.title === "string" ? drillBody.title.trim() : "";
  const drillStepsRaw =
    drillBody && Array.isArray(drillBody.steps)
      ? drillBody.steps
          .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
          .filter((entry) => entry.length > 0)
      : [];

  return {
    lessonId,
    youtubeId: parseBodyString(item.body, "youtubeId") ?? "",
    estMinutes: (() => {
      const value = parseBodyNumber(item.body, "estMinutes");
      return value && value >= 1 ? String(Math.floor(value)) : "";
    })(),
    videoPlanningNotes: parseBodyString(videoPlanningBody, "notes") ?? "",
    lessonType: resolveLessonType(parseBodyString(item.body, "lessonType")),
    drillLabel: parseBodyString(item.body, "drillLabel") ?? "",
    supportStartAtLessonInModule: (() => {
      const value = parseBodyNumber(item.body, "supportStartAtLessonInModule");
      return value && value >= 1 ? String(Math.floor(value)) : "";
    })(),
    supportActionVideoAnalysis: parseBodyBoolean(supportActionsBody, "videoAnalysis") ?? true,
    supportActionPoolsideGuide: parseBodyBoolean(supportActionsBody, "poolsideGuide") ?? true,
    supportActionGuide0To1000: parseBodyBoolean(supportActionsBody, "guide0To1000") ?? false,
    supportActionContact: parseBodyBoolean(supportActionsBody, "contact") ?? false,
    supportPrimaryAction: resolveSupportPrimaryAction(
      parseBodyString(supportCardBody, "primaryAction")
    ),
    goal: parseBodyString(item.body, "goal") ?? item.summary ?? "",
    displayGoal: parseBodyBoolean(displayBody, "goal") ?? true,
    displayCues: parseBodyBoolean(displayBody, "cues") ?? true,
    displayCommonMistakes: parseBodyBoolean(displayBody, "commonMistakes") ?? true,
    displayDrill: parseBodyBoolean(displayBody, "drill") ?? true,
    displayCheckpoint: parseBodyBoolean(displayBody, "checkpoint") ?? true,
    displayNextStep: parseBodyBoolean(displayBody, "nextStep") ?? true,
    displaySupport: parseBodyBoolean(displayBody, "support") ?? true,
    cues: joinLines(parseBodyStringArray(item.body, "cues")),
    commonMistakes: joinLines(parseBodyStringArray(item.body, "commonMistakes")),
    drillTitle: drillTitleRaw,
    drillSteps: joinLines(drillStepsRaw),
    nextStep: parseBodyString(item.body, "nextStep") ?? "",
    passCriteria: joinLines(parseBodyStringArray(item.body, "passCriteria")),
    lessonExperience: toLessonExperienceEditState(item),
  };
}

function normalizeLessonExperienceForCompare(value: LessonExperienceEditState) {
  return {
    variant: value.variant,
    display: { ...value.display },
    quickExplanation: value.quickExplanation.trim(),
    whyThisMatters: value.whyThisMatters.trim(),
    landPracticeTitle: value.landPracticeTitle.trim(),
    landPracticeSteps: normalizeLinesInput(value.landPracticeSteps),
    landPracticeSafetyNote: value.landPracticeSafetyNote.trim(),
    waterPracticeTitle: value.waterPracticeTitle.trim(),
    waterPracticeSteps: normalizeLinesInput(value.waterPracticeSteps),
    waterPracticeSafetyNote: value.waterPracticeSafetyNote.trim(),
    commonMistakes: value.commonMistakes
      .map((row) => ({
        mistake: row.mistake.trim(),
        fix: row.fix.trim(),
      }))
      .filter((row) => row.mistake.length > 0 || row.fix.length > 0),
    feelCues: normalizeLinesInput(value.feelCues),
    nextStep: value.nextStep.trim(),
    supportTitle: value.supportTitle.trim(),
    supportBody: value.supportBody.trim(),
  };
}

function setOptionalString(target: Record<string, unknown>, key: string, value: string): void {
  if (value.length > 0) {
    target[key] = value;
  } else {
    delete target[key];
  }
}

function setOptionalStringArray(
  target: Record<string, unknown>,
  key: string,
  value: string[]
): void {
  if (value.length > 0) {
    target[key] = value;
  } else {
    delete target[key];
  }
}

function hasObjectValues(value: Record<string, unknown>): boolean {
  return Object.keys(value).length > 0;
}

function isValidYouTubeVideoId(value: string): boolean {
  return /^[A-Za-z0-9_-]{11}$/.test(value);
}

function buildLessonExperiencePracticePayload(input: {
  existingPractice: unknown;
  title: string;
  steps: string[];
  safetyNote?: string;
}): Record<string, unknown> | undefined {
  const practice: Record<string, unknown> = isRecord(input.existingPractice)
    ? { ...input.existingPractice }
    : {};
  setOptionalString(practice, "title", input.title);
  setOptionalStringArray(practice, "steps", input.steps);
  if (typeof input.safetyNote === "string") {
    setOptionalString(practice, "safetyNote", input.safetyNote);
  }
  return hasObjectValues(practice) ? practice : undefined;
}

function buildLessonExperiencePayload(
  existingExperience: unknown,
  value: LessonExperienceEditState
): Record<string, unknown> | undefined {
  const lessonExperience: Record<string, unknown> = isRecord(existingExperience)
    ? { ...existingExperience }
    : {};
  const normalized = normalizeLessonExperienceForCompare(value);

  lessonExperience.variant = normalized.variant;
  lessonExperience.display = normalized.display;

  setOptionalString(lessonExperience, "quickExplanation", normalized.quickExplanation);
  setOptionalString(lessonExperience, "whyThisMatters", normalized.whyThisMatters);

  const existingLandPractice = parseNestedRecord(lessonExperience, "landPractice");
  const landPractice = buildLessonExperiencePracticePayload({
    existingPractice: existingLandPractice,
    title: normalized.landPracticeTitle,
    steps: normalized.landPracticeSteps,
    safetyNote: normalized.landPracticeSafetyNote,
  });
  if (landPractice) {
    lessonExperience.landPractice = landPractice;
  } else {
    delete lessonExperience.landPractice;
  }

  const existingWaterPractice = parseNestedRecord(lessonExperience, "waterPractice");
  const waterPractice = buildLessonExperiencePracticePayload({
    existingPractice: existingWaterPractice,
    title: normalized.waterPracticeTitle,
    steps: normalized.waterPracticeSteps,
    safetyNote: normalized.waterPracticeSafetyNote,
  });
  if (waterPractice) {
    lessonExperience.waterPractice = waterPractice;
  } else {
    delete lessonExperience.waterPractice;
  }

  if (normalized.commonMistakes.length > 0) {
    lessonExperience.commonMistakes = normalized.commonMistakes
      .filter((row) => row.mistake.length > 0)
      .map((row) => ({
        mistake: row.mistake,
        ...(row.fix ? { fix: row.fix } : {}),
      }));
  } else {
    delete lessonExperience.commonMistakes;
  }

  setOptionalStringArray(lessonExperience, "feelCues", normalized.feelCues);
  setOptionalString(lessonExperience, "nextStep", normalized.nextStep);

  const support = isRecord(lessonExperience.support) ? { ...lessonExperience.support } : {};
  setOptionalString(support, "title", normalized.supportTitle);
  setOptionalString(support, "body", normalized.supportBody);
  if (hasObjectValues(support)) {
    lessonExperience.support = support;
  } else {
    delete lessonExperience.support;
  }

  return hasObjectValues(lessonExperience) ? lessonExperience : undefined;
}

function normalizeLessonBodyForCompare(value: LessonBodyEditState) {
  const supportActionVideoAnalysis = value.supportActionVideoAnalysis;
  const supportActionPoolsideGuide = value.supportActionPoolsideGuide;
  const supportActionGuide0To1000 = value.supportActionGuide0To1000;
  const supportActionContact = value.supportActionContact;
  const supportPrimaryAction =
    (value.supportPrimaryAction === "videoAnalysis" && supportActionVideoAnalysis) ||
    (value.supportPrimaryAction === "poolsideGuide" && supportActionPoolsideGuide) ||
    (value.supportPrimaryAction === "guide0To1000" && supportActionGuide0To1000) ||
    (value.supportPrimaryAction === "contact" && supportActionContact)
      ? value.supportPrimaryAction
      : "";

  return {
    youtubeId: value.youtubeId.trim(),
    estMinutes: (() => {
      const raw = value.estMinutes.trim();
      if (!raw) return null;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.NaN;
    })(),
    videoPlanningNotes: value.videoPlanningNotes.trim(),
    lessonType: value.lessonType,
    drillLabel: value.drillLabel.trim(),
    supportStartAtLessonInModule: (() => {
      const raw = value.supportStartAtLessonInModule.trim();
      if (!raw) return null;
      const parsed = Number.parseInt(raw, 10);
      return Number.isFinite(parsed) && parsed >= 1 ? parsed : Number.NaN;
    })(),
    supportActionVideoAnalysis,
    supportActionPoolsideGuide,
    supportActionGuide0To1000,
    supportActionContact,
    supportPrimaryAction,
    goal: value.goal.trim(),
    displayGoal: value.displayGoal,
    displayCues: value.displayCues,
    displayCommonMistakes: value.displayCommonMistakes,
    displayDrill: value.displayDrill,
    displayCheckpoint: value.displayCheckpoint,
    displayNextStep: value.displayNextStep,
    displaySupport: value.displaySupport,
    cues: normalizeLinesInput(value.cues),
    commonMistakes: normalizeLinesInput(value.commonMistakes),
    drillTitle: value.drillTitle.trim(),
    drillSteps: normalizeLinesInput(value.drillSteps),
    nextStep: value.nextStep.trim(),
    passCriteria: normalizeLinesInput(value.passCriteria),
    lessonExperience: normalizeLessonExperienceForCompare(value.lessonExperience),
  };
}

function buildLessonBodyPayload(
  existingBody: unknown,
  value: LessonBodyEditState
): Record<string, unknown> {
  const nextBody: Record<string, unknown> = isRecord(existingBody) ? { ...existingBody } : {};
  const normalized = normalizeLessonBodyForCompare(value);

  if (normalized.youtubeId.length > 0) {
    nextBody.youtubeId = normalized.youtubeId;
  } else {
    delete nextBody.youtubeId;
  }
  if (typeof normalized.estMinutes === "number" && Number.isFinite(normalized.estMinutes)) {
    nextBody.estMinutes = normalized.estMinutes;
  } else {
    delete nextBody.estMinutes;
  }
  const videoPlanning = isRecord(nextBody.videoPlanning) ? { ...nextBody.videoPlanning } : {};
  setOptionalString(videoPlanning, "notes", normalized.videoPlanningNotes);
  if (hasObjectValues(videoPlanning)) {
    nextBody.videoPlanning = videoPlanning;
  } else {
    delete nextBody.videoPlanning;
  }
  if (normalized.lessonType) {
    nextBody.lessonType = normalized.lessonType;
  } else {
    delete nextBody.lessonType;
  }
  if (normalized.drillLabel.length > 0) {
    nextBody.drillLabel = normalized.drillLabel;
  } else {
    delete nextBody.drillLabel;
  }
  if (
    typeof normalized.supportStartAtLessonInModule === "number" &&
    Number.isFinite(normalized.supportStartAtLessonInModule)
  ) {
    nextBody.supportStartAtLessonInModule = normalized.supportStartAtLessonInModule;
  } else {
    delete nextBody.supportStartAtLessonInModule;
  }
  nextBody.goal = normalized.goal;
  nextBody.cues = normalized.cues;
  nextBody.commonMistakes = normalized.commonMistakes;
  nextBody.drill = {
    title: normalized.drillTitle,
    steps: normalized.drillSteps,
  };
  const existingDisplay = isRecord(nextBody.display) ? { ...nextBody.display } : {};
  existingDisplay.goal = normalized.displayGoal;
  existingDisplay.cues = normalized.displayCues;
  existingDisplay.commonMistakes = normalized.displayCommonMistakes;
  existingDisplay.drill = normalized.displayDrill;
  existingDisplay.checkpoint = normalized.displayCheckpoint;
  existingDisplay.nextStep = normalized.displayNextStep;
  existingDisplay.support = normalized.displaySupport;
  nextBody.display = existingDisplay;
  nextBody.supportCard = {
    actions: {
      videoAnalysis: normalized.supportActionVideoAnalysis,
      poolsideGuide: normalized.supportActionPoolsideGuide,
      guide0To1000: normalized.supportActionGuide0To1000,
      contact: normalized.supportActionContact,
    },
    ...(normalized.supportPrimaryAction ? { primaryAction: normalized.supportPrimaryAction } : {}),
  };
  nextBody.nextStep = normalized.nextStep;
  if (normalized.passCriteria.length > 0) {
    nextBody.passCriteria = normalized.passCriteria;
  } else {
    delete nextBody.passCriteria;
  }
  const lessonExperience = buildLessonExperiencePayload(
    nextBody.lessonExperience,
    value.lessonExperience
  );
  if (lessonExperience) {
    nextBody.lessonExperience = lessonExperience;
  } else {
    delete nextBody.lessonExperience;
  }

  return nextBody;
}

function lessonOpenHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return buildCourseLessonHref(COURSE_MODULES, lessonId);
}

function courseLessonOpenHref(lessonId: string): string {
  return buildCourseLessonHref(COURSE_MODULES, lessonId);
}

function lessonPreviewHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return buildCoursePreviewHref({
    lessonId,
    mode: resolveCoursePreviewModeFromStatus(item.status),
    previewType: "lesson",
    previewRef: item.slug,
  });
}

function modulePreviewHref(item: AdminContentItemRow, lessonId: string): string {
  return buildCoursePreviewHref({
    lessonId,
    mode: resolveCoursePreviewModeFromStatus(item.status),
    previewType: "module",
    previewRef: item.slug,
  });
}

function lessonQrPrefillHref(item: AdminContentItemRow): string {
  const lessonId = resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
  return buildAdminQrPrefillHref({
    slugHint: lessonId,
    destinationPath: lessonOpenHref(item),
    contentItemId: item.id,
    contentLabel: item.title,
    placementKey: "course.lesson.share",
  });
}

function toEditFormState(item: AdminContentItemRow): EditFormState {
  return {
    title: item.title,
    slug: item.slug,
    summary: item.summary ?? "",
    category: item.category,
    sortOrder: String(item.sort_order),
    parentId: item.parent_id ?? "",
    lessonBody: item.content_type === "course_lesson" ? toLessonBodyEditState(item) : null,
  };
}

function resizeAdminTextarea(textarea: HTMLTextAreaElement) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
}

export default function AdminContentManager() {
  const [items, setItems] = useState<AdminContentItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [mirror, setMirror] = useState<MirrorSnapshot | null>(null);
  const [adminRole, setAdminRole] = useState<AdminRole | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openRevisionsItemId, setOpenRevisionsItemId] = useState<string | null>(null);
  const [revisionsByItemId, setRevisionsByItemId] = useState<Record<string, ContentRevisionItem[]>>(
    {}
  );
  const [canRestoreByItemId, setCanRestoreByItemId] = useState<Record<string, boolean>>({});
  const [revisionErrorByItemId, setRevisionErrorByItemId] = useState<Record<string, string | null>>(
    {}
  );
  const [revisionsLoadingItemId, setRevisionsLoadingItemId] = useState<string | null>(null);
  const [restoringRevisionId, setRestoringRevisionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormState, setEditFormState] = useState<EditFormState | null>(null);
  const [editBaselineState, setEditBaselineState] = useState<EditFormState | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [listQuery, setListQuery] = useState("");
  const [listTypeFilter, setListTypeFilter] = useState<"all" | AdminContentType>(() => {
    if (typeof window === "undefined") return DEFAULT_ALL_CONTENT_SCOPE;
    const storedScope = parseStoredAllContentScope(
      window.localStorage.getItem(ALL_CONTENT_SCOPE_STORAGE_KEY)
    );
    return storedScope ?? DEFAULT_ALL_CONTENT_SCOPE;
  });
  const [listStatusFilter, setListStatusFilter] = useState<"all" | AdminContentStatus>("all");
  const [listSort, setListSort] = useState<ListSortOption>("default");
  const [listModuleFilter, setListModuleFilter] = useState("");
  const [listFocusState, setListFocusState] = useState<ContentListFocusState | null>(null);
  const [contentPrimaryView, setContentPrimaryView] = useState<ContentPrimaryView>(() => {
    if (typeof window === "undefined") return "course_workspace";
    const storedView = parseStoredContentPrimaryView(
      window.localStorage.getItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY)
    );
    return storedView ?? "course_workspace";
  });
  const [showCourseRowsInContentList, setShowCourseRowsInContentList] = useState(false);
  const [workspaceModuleId, setWorkspaceModuleId] = useState(WORKSPACE_ALL_MODULES_ID);
  const [workspaceLessonCreateOpen, setWorkspaceLessonCreateOpen] = useState(false);
  const [workspaceLessonCreateState, setWorkspaceLessonCreateState] =
    useState<WorkspaceLessonCreateState>(INITIAL_WORKSPACE_LESSON_CREATE_FORM);
  const [workspaceLessonCreateSubmitting, setWorkspaceLessonCreateSubmitting] = useState(false);
  const [workspaceLessonCreateError, setWorkspaceLessonCreateError] = useState<string | null>(null);
  const [courseStructureBusy, setCourseStructureBusy] = useState(false);
  const [courseStructureMessage, setCourseStructureMessage] = useState<string | null>(null);
  const [lessonMoveTargetById, setLessonMoveTargetById] = useState<Record<string, string>>({});
  const [pendingModuleDelete, setPendingModuleDelete] = useState<PendingModuleDeleteState | null>(
    null
  );
  const [moduleDeleteSubmitting, setModuleDeleteSubmitting] = useState(false);
  const [cleanupSubmitting, setCleanupSubmitting] = useState(false);
  const [mirrorDetailsOpen, setMirrorDetailsOpen] = useState(false);
  const [openStatusActionsItemId, setOpenStatusActionsItemId] = useState<string | null>(null);

  useEffect(() => {
    document
      .querySelectorAll<HTMLTextAreaElement>("textarea.admin-auto-grow-textarea")
      .forEach(resizeAdminTextarea);
  }, [editingItemId, editFormState, formState]);

  useEffect(() => {
    function handleTextareaInput(event: Event) {
      const target = event.target;
      if (!(target instanceof HTMLTextAreaElement)) return;
      if (!target.classList.contains("admin-auto-grow-textarea")) return;
      resizeAdminTextarea(target);
    }

    document.addEventListener("input", handleTextareaInput);
    return () => document.removeEventListener("input", handleTextareaInput);
  }, []);

  const moduleOptions = useMemo(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title))
        .map((item) => ({
          id: item.id,
          label: `${item.sort_order + 1}. ${item.title}`,
        })),
    [items]
  );

  const moduleIdSet = useMemo(
    () => new Set(moduleOptions.map((entry) => entry.id)),
    [moduleOptions]
  );

  const moduleLabelById = useMemo(
    () => new Map(moduleOptions.map((entry) => [entry.id, entry.label] as const)),
    [moduleOptions]
  );

  const courseLessonWorkspaceItems = useMemo<CourseLessonWorkspaceItem[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_lesson")
        .sort(
          (left, right) =>
            left.sort_order - right.sort_order || left.title.localeCompare(right.title)
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          sortOrder: item.sort_order,
          parentId: item.parent_id,
          moduleLabel: item.parent_id ? (moduleLabelById.get(item.parent_id) ?? null) : null,
          runtimeLessonId: resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim(),
        })),
    [items, moduleLabelById]
  );

  const courseModuleWorkspaceItems = useMemo<CourseModuleWorkspaceItem[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .sort(
          (left, right) =>
            left.sort_order - right.sort_order || left.title.localeCompare(right.title)
        )
        .map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          status: item.status,
          sortOrder: item.sort_order,
        })),
    [items]
  );

  const courseStructureModuleRows = useMemo<CourseStructureModuleRow[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_module")
        .map((item) => ({
          id: item.id,
          sortOrder: item.sort_order,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          title: item.title,
        })),
    [items]
  );

  const courseStructureLessonRows = useMemo<CourseStructureLessonRow[]>(
    () =>
      items
        .filter((item) => item.content_type === "course_lesson")
        .map((item) => ({
          id: item.id,
          parentId: item.parent_id,
          sortOrder: item.sort_order,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          title: item.title,
        })),
    [items]
  );

  const courseStructureIntegrity = useMemo(
    () =>
      buildCourseStructureIntegrity(
        courseStructureModuleRows,
        courseStructureLessonRows,
        moduleIdSet
      ),
    [courseStructureLessonRows, courseStructureModuleRows, moduleIdSet]
  );

  const moduleMoveBoundsById = useMemo(() => {
    const bounds = new Map<string, { canMoveUp: boolean; canMoveDown: boolean }>();
    for (const moduleRow of courseStructureModuleRows) {
      bounds.set(moduleRow.id, {
        canMoveUp: Boolean(getAdjacentModuleId(courseStructureModuleRows, moduleRow.id, "up")),
        canMoveDown: Boolean(getAdjacentModuleId(courseStructureModuleRows, moduleRow.id, "down")),
      });
    }
    return bounds;
  }, [courseStructureModuleRows]);

  const lessonMoveBoundsById = useMemo(() => {
    const bounds = new Map<string, { canMoveUp: boolean; canMoveDown: boolean }>();
    for (const lesson of courseStructureLessonRows) {
      bounds.set(lesson.id, {
        canMoveUp: Boolean(getAdjacentLessonId(courseStructureLessonRows, lesson.id, "up")),
        canMoveDown: Boolean(getAdjacentLessonId(courseStructureLessonRows, lesson.id, "down")),
      });
    }
    return bounds;
  }, [courseStructureLessonRows]);

  const firstRuntimeLessonIdByModuleId = useMemo(() => {
    const byModuleId = new Map<string, string>();

    const sortedLessons = [...courseLessonWorkspaceItems]
      .filter((item) => item.parentId && moduleIdSet.has(item.parentId))
      .sort((left, right) => {
        const parentCompare = (left.parentId ?? "").localeCompare(right.parentId ?? "");
        if (parentCompare !== 0) return parentCompare;
        if (left.sortOrder !== right.sortOrder) return left.sortOrder - right.sortOrder;
        return left.title.localeCompare(right.title);
      });

    for (const lesson of sortedLessons) {
      if (!lesson.parentId) continue;
      if (byModuleId.has(lesson.parentId)) continue;
      byModuleId.set(lesson.parentId, lesson.runtimeLessonId);
    }

    return byModuleId;
  }, [courseLessonWorkspaceItems, moduleIdSet]);

  const unlinkedLessonCount = useMemo(
    () =>
      courseLessonWorkspaceItems.filter((item) => !item.parentId || !moduleIdSet.has(item.parentId))
        .length,
    [courseLessonWorkspaceItems, moduleIdSet]
  );

  const moduleStatusCounts = useMemo<StatusCountByState>(() => {
    const counts = createStatusCountByState();
    for (const moduleItem of courseModuleWorkspaceItems) {
      counts[moduleItem.status] += 1;
    }
    return counts;
  }, [courseModuleWorkspaceItems]);

  const lessonStatusCounts = useMemo<StatusCountByState>(() => {
    const counts = createStatusCountByState();
    for (const lessonItem of courseLessonWorkspaceItems) {
      counts[lessonItem.status] += 1;
    }
    return counts;
  }, [courseLessonWorkspaceItems]);

  const lessonStatusCountsByModuleId = useMemo(() => {
    const byModuleId = new Map<string, StatusCountByState>();
    for (const moduleItem of courseModuleWorkspaceItems) {
      byModuleId.set(moduleItem.id, createStatusCountByState());
    }

    for (const lessonItem of courseLessonWorkspaceItems) {
      if (!lessonItem.parentId || !byModuleId.has(lessonItem.parentId)) continue;
      const counts = byModuleId.get(lessonItem.parentId);
      if (!counts) continue;
      counts[lessonItem.status] += 1;
    }

    return byModuleId;
  }, [courseLessonWorkspaceItems, courseModuleWorkspaceItems]);

  const workspaceLessonsByModuleId = useMemo(
    () =>
      buildCourseWorkspaceLessonsByModuleId(courseModuleWorkspaceItems, courseLessonWorkspaceItems),
    [courseLessonWorkspaceItems, courseModuleWorkspaceItems]
  );

  const contentItemById = useMemo(
    () => new Map<string, AdminContentItemRow>(items.map((item) => [item.id, item])),
    [items]
  );

  const hasNonCourseItems = useMemo(
    () => items.some((item) => !COURSE_CONTENT_TYPES.has(item.content_type)),
    [items]
  );

  const hasCourseWorkspaceItems =
    schemaReady && (courseModuleWorkspaceItems.length > 0 || courseLessonWorkspaceItems.length > 0);
  const isCourseWorkspaceView =
    contentPrimaryView === "course_workspace" && hasCourseWorkspaceItems;
  const isAllContentView = !isCourseWorkspaceView;

  const shouldHideCourseRowsInCatalog =
    !showCourseRowsInContentList &&
    listTypeFilter === "all" &&
    listModuleFilter.length === 0 &&
    hasNonCourseItems;

  const workspaceLessons = useMemo(() => {
    if (!workspaceModuleId) return [];
    if (workspaceModuleId === WORKSPACE_ALL_MODULES_ID) return courseLessonWorkspaceItems;
    if (workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      return courseLessonWorkspaceItems.filter(
        (item) => !item.parentId || !moduleIdSet.has(item.parentId)
      );
    }
    return courseLessonWorkspaceItems.filter((item) => item.parentId === workspaceModuleId);
  }, [courseLessonWorkspaceItems, moduleIdSet, workspaceModuleId]);

  const workspaceScopeLabel = useMemo(() => {
    if (workspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      return `All modules (${courseLessonWorkspaceItems.length} lessons)`;
    }
    if (workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      return `Unlinked lessons (${unlinkedLessonCount})`;
    }
    return moduleLabelById.get(workspaceModuleId) ?? "Selected module";
  }, [courseLessonWorkspaceItems.length, moduleLabelById, unlinkedLessonCount, workspaceModuleId]);

  const isFocusedCourseWorkspace =
    workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID || moduleIdSet.has(workspaceModuleId);

  const filteredItems = useMemo(() => {
    const normalizedQuery = listQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (shouldHideCourseRowsInCatalog && COURSE_CONTENT_TYPES.has(item.content_type)) {
        return false;
      }
      if (listTypeFilter !== "all" && item.content_type !== listTypeFilter) return false;
      if (listModuleFilter) {
        if (item.content_type !== "course_lesson") return false;
        if (listModuleFilter === WORKSPACE_UNLINKED_MODULE_ID) {
          return !item.parent_id || !moduleIdSet.has(item.parent_id);
        }
        if (item.parent_id !== listModuleFilter) return false;
      }
      if (listStatusFilter !== "all" && item.status !== listStatusFilter) return false;
      if (!normalizedQuery) return true;
      const haystack = [
        item.title,
        item.slug,
        item.category,
        item.summary ?? "",
        CONTENT_TYPE_LABEL[item.content_type],
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [
    items,
    listModuleFilter,
    listQuery,
    listStatusFilter,
    listTypeFilter,
    moduleIdSet,
    shouldHideCourseRowsInCatalog,
  ]);

  const sortedItems = useMemo(() => {
    if (listSort === "default") return filteredItems;

    const sorted = [...filteredItems];
    sorted.sort((left, right) => {
      if (listSort === "title_asc") return left.title.localeCompare(right.title);
      if (listSort === "title_desc") return right.title.localeCompare(left.title);
      if (listSort === "updated_desc") return right.updated_at.localeCompare(left.updated_at);
      if (listSort === "updated_asc") return left.updated_at.localeCompare(right.updated_at);

      const statusDelta = STATUS_SORT_RANK[left.status] - STATUS_SORT_RANK[right.status];
      if (statusDelta !== 0) return statusDelta;
      const typeDelta = CONTENT_TYPE_LABEL[left.content_type].localeCompare(
        CONTENT_TYPE_LABEL[right.content_type]
      );
      if (typeDelta !== 0) return typeDelta;
      const orderDelta = left.sort_order - right.sort_order;
      if (orderDelta !== 0) return orderDelta;
      return left.title.localeCompare(right.title);
    });

    return sorted;
  }, [filteredItems, listSort]);

  const typeCounts = useMemo(() => {
    const counts: Record<"all" | AdminContentType, number> = {
      all: items.length,
      course_module: 0,
      course_lesson: 0,
      guide_session: 0,
      guide_drill: 0,
      page: 0,
      product: 0,
    };

    for (const item of items) {
      counts[item.content_type] += 1;
    }

    return counts;
  }, [items]);

  const isEditDirty = useMemo(() => {
    if (!editingItemId || !editFormState || !editBaselineState) return false;
    const normalize = (value: EditFormState) => ({
      title: value.title.trim(),
      slug: value.slug.trim(),
      summary: value.summary.trim(),
      category: normalizeCategoryInput(value.category),
      sortOrder: Number.parseInt(value.sortOrder, 10),
      parentId: value.parentId.trim(),
      lessonBody: value.lessonBody ? normalizeLessonBodyForCompare(value.lessonBody) : null,
    });
    const current = normalize(editFormState);
    const baseline = normalize(editBaselineState);
    return (
      current.title !== baseline.title ||
      current.slug !== baseline.slug ||
      current.summary !== baseline.summary ||
      current.category !== baseline.category ||
      current.sortOrder !== baseline.sortOrder ||
      current.parentId !== baseline.parentId ||
      JSON.stringify(current.lessonBody) !== JSON.stringify(baseline.lessonBody)
    );
  }, [editingItemId, editFormState, editBaselineState]);

  function formatRevisionDate(iso: string): string {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "Unknown time";
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(parsed);
  }

  async function loadItems() {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentListResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok
            ? "Could not load content list."
            : (payload.error ?? "Could not load content list.")
        );
        setItems([]);
        setAdminRole(null);
        setSchemaReady(true);
        setMirror(null);
        return;
      }
      setAdminRole(payload.role);
      setItems(payload.items);
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
      setMirror(payload.mirror ?? null);

      const categoriesResponse = await fetch("/api/admin/categories/content", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const categoriesPayload = (await categoriesResponse.json()) as AdminCategoriesResponse;
      if (categoriesResponse.ok && categoriesPayload.ok) {
        setCategoryOptions(
          categoriesPayload.items
            .filter((item) => item.is_active)
            .map((item) => item.title)
            .filter((value, index, self) => self.indexOf(value) === index)
        );
      } else {
        setCategoryOptions([]);
      }
    } catch {
      setError("Could not load content list.");
      setItems([]);
      setAdminRole(null);
      setSchemaReady(true);
      setMirror(null);
      setCategoryOptions([]);
    } finally {
      setLoading(false);
    }
  }

  function clearModuleDeleteDialog() {
    if (moduleDeleteSubmitting) return;
    setPendingModuleDelete(null);
    setCourseStructureMessage(null);
  }

  async function runCourseStructureAction(
    payload: CourseStructureActionPayload,
    options?: {
      successNotice?: string;
      reloadItems?: boolean;
    }
  ): Promise<boolean> {
    if (courseStructureBusy || moduleDeleteSubmitting) return false;
    setCourseStructureBusy(true);
    setActionError(null);
    setCourseStructureMessage(null);
    setActionNotice(null);

    try {
      const response = await fetch("/api/admin/content/course-structure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });
      const actionPayload = (await response.json()) as CourseStructureActionResponse;
      if (!response.ok || !actionPayload.ok) {
        setActionError(
          actionPayload.ok
            ? "Could not update course structure."
            : (actionPayload.error ?? "Could not update course structure.")
        );
        return false;
      }

      if (options?.reloadItems !== false) {
        await loadItems();
      }

      const integrity = actionPayload.integrity;
      if (integrity) {
        const fragments: string[] = [];
        if (integrity.unlinkedLessonCount > 0) {
          fragments.push(`${integrity.unlinkedLessonCount} unlinked lesson(s)`);
        }
        if (integrity.duplicateModuleSortOrderCount > 0) {
          fragments.push(
            `${integrity.duplicateModuleSortOrderCount} duplicate module sort order slot(s)`
          );
        }
        if (integrity.duplicateLessonSortGroupCount > 0) {
          fragments.push(
            `${integrity.duplicateLessonSortGroupCount} lesson group(s) with duplicate sort orders`
          );
        }
        if (fragments.length > 0) {
          setCourseStructureMessage(`Integrity check: ${fragments.join(" · ")}.`);
        }
      }

      setActionNotice(options?.successNotice ?? "Course structure updated.");
      return true;
    } catch {
      setActionError("Could not update course structure.");
      return false;
    } finally {
      setCourseStructureBusy(false);
    }
  }

  async function handleMoveModule(moduleId: string, direction: "up" | "down") {
    await runCourseStructureAction(
      {
        action: "move_module",
        moduleId,
        direction,
      },
      {
        successNotice: direction === "up" ? "Module moved up." : "Module moved down.",
      }
    );
  }

  async function handleMoveLesson(lessonId: string, direction: "up" | "down") {
    await runCourseStructureAction(
      {
        action: "move_lesson",
        lessonId,
        direction,
      },
      {
        successNotice: direction === "up" ? "Lesson moved up." : "Lesson moved down.",
      }
    );
  }

  async function handleMoveLessonToModule(lessonId: string, targetModuleId: string) {
    await runCourseStructureAction(
      {
        action: "move_lesson_to_module",
        lessonId,
        targetModuleId,
        targetPosition: "end",
      },
      {
        successNotice: "Lesson moved to target module.",
      }
    );
  }

  function openModuleDeleteDialog(item: AdminContentItemRow) {
    const lessonCount = items.filter(
      (entry) => entry.content_type === "course_lesson" && entry.parent_id === item.id
    ).length;
    const alternativeModules = moduleOptions.filter((entry) => entry.id !== item.id);
    const defaultStrategy =
      lessonCount > 0 && alternativeModules.length > 0 ? "reassign" : "archive_lessons";
    setPendingModuleDelete({
      moduleId: item.id,
      moduleTitle: item.title,
      lessonCount,
      strategy: defaultStrategy,
      targetModuleId: alternativeModules[0]?.id ?? "",
    });
    setCourseStructureMessage(null);
    setActionError(null);
  }

  async function confirmModuleDelete() {
    if (!pendingModuleDelete || moduleDeleteSubmitting) return;
    if (
      pendingModuleDelete.lessonCount > 0 &&
      pendingModuleDelete.strategy === "reassign" &&
      !pendingModuleDelete.targetModuleId
    ) {
      setCourseStructureMessage("Select target module before deleting.");
      return;
    }

    setModuleDeleteSubmitting(true);
    const ok = await runCourseStructureAction(
      {
        action: "delete_module",
        moduleId: pendingModuleDelete.moduleId,
        strategy: pendingModuleDelete.strategy,
        targetModuleId:
          pendingModuleDelete.strategy === "reassign"
            ? pendingModuleDelete.targetModuleId
            : undefined,
      },
      {
        successNotice: "Module deleted with selected lesson handling strategy.",
      }
    );
    setModuleDeleteSubmitting(false);
    if (ok) {
      setPendingModuleDelete(null);
      setCourseStructureMessage(null);
    }
  }

  useEffect(() => {
    void loadItems();
  }, []);

  useEffect(() => {
    if (!isEditDirty) return;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditDirty]);

  useEffect(() => {
    if (moduleOptions.length === 0 && unlinkedLessonCount === 0) {
      if (workspaceModuleId !== WORKSPACE_ALL_MODULES_ID) {
        setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
      }
      return;
    }

    const hasSelectedModule =
      workspaceModuleId === WORKSPACE_ALL_MODULES_ID ||
      workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID ||
      moduleOptions.some((option) => option.id === workspaceModuleId);

    if (hasSelectedModule) return;

    setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
  }, [moduleOptions, unlinkedLessonCount, workspaceModuleId]);

  useEffect(() => {
    if (loading) return;
    if (hasCourseWorkspaceItems) return;
    if (contentPrimaryView !== "all_content") {
      setContentPrimaryView("all_content");
    }
  }, [contentPrimaryView, hasCourseWorkspaceItems, loading]);

  useEffect(() => {
    setLessonMoveTargetById((previous) => {
      const next: Record<string, string> = {};
      const fallbackModuleId = moduleOptions[0]?.id ?? "";

      for (const lesson of courseLessonWorkspaceItems) {
        const currentParentId = lesson.parentId ?? "";
        const existingTarget = previous[lesson.id];

        if (existingTarget && moduleIdSet.has(existingTarget)) {
          next[lesson.id] = existingTarget;
          continue;
        }

        if (currentParentId && moduleIdSet.has(currentParentId)) {
          next[lesson.id] = currentParentId;
          continue;
        }

        next[lesson.id] = fallbackModuleId;
      }

      return next;
    });
  }, [courseLessonWorkspaceItems, moduleIdSet, moduleOptions]);

  useEffect(() => {
    if (!workspaceLessonCreateOpen) return;
    if (
      workspaceLessonCreateState.parentId &&
      moduleIdSet.has(workspaceLessonCreateState.parentId)
    ) {
      return;
    }

    setWorkspaceLessonCreateState((previous) => ({
      ...previous,
      parentId: moduleOptions[0]?.id ?? "",
    }));
  }, [moduleIdSet, moduleOptions, workspaceLessonCreateOpen, workspaceLessonCreateState.parentId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ALL_CONTENT_SCOPE_STORAGE_KEY, listTypeFilter);
  }, [listTypeFilter]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CONTENT_PRIMARY_VIEW_STORAGE_KEY, contentPrimaryView);
  }, [contentPrimaryView]);

  const groupedCountLabel = useMemo(() => {
    if (!schemaReady) return "Content catalog will appear after admin content setup is ready.";
    if (items.length === 0) return "No content items yet.";
    return `${items.length} content item${items.length === 1 ? "" : "s"} in admin catalog.`;
  }, [items, schemaReady]);

  const filteredCountLabel = useMemo(() => {
    if (items.length === 0) return null;
    if (filteredItems.length === items.length) return "Showing all items";
    return `Showing ${filteredItems.length} of ${items.length}`;
  }, [filteredItems.length, items.length]);

  const moduleScopeLabel = useMemo(() => {
    if (!listModuleFilter) return null;
    if (listModuleFilter === WORKSPACE_UNLINKED_MODULE_ID) return "Module scope: Unlinked lessons";
    return `Module scope: ${moduleLabelById.get(listModuleFilter) ?? "Selected module"}`;
  }, [listModuleFilter, moduleLabelById]);

  const activeMirrorMetricKey = useMemo(() => {
    if (listTypeFilter === "all") return null;
    return MIRROR_METRIC_KEY_BY_CONTENT_TYPE[listTypeFilter] ?? null;
  }, [listTypeFilter]);

  const courseStructureIntegrityFragments = useMemo(() => {
    const fragments: string[] = [];
    if (courseStructureIntegrity.unlinkedLessonCount > 0) {
      fragments.push(`${courseStructureIntegrity.unlinkedLessonCount} unlinked lesson(s)`);
    }
    if (courseStructureIntegrity.duplicateModuleSortOrderCount > 0) {
      fragments.push(
        `${courseStructureIntegrity.duplicateModuleSortOrderCount} duplicate module sort order slot(s)`
      );
    }
    if (courseStructureIntegrity.duplicateLessonSortGroupCount > 0) {
      fragments.push(
        `${courseStructureIntegrity.duplicateLessonSortGroupCount} lesson group(s) with duplicate sort orders`
      );
    }
    return fragments;
  }, [courseStructureIntegrity]);

  function canEditInline(item: AdminContentItemRow): boolean {
    return EDITABLE_CONTENT_TYPES.has(item.content_type);
  }

  function closeEditMode(force = false): boolean {
    if (!force && isEditDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Cancel edit and discard these changes?"
      );
      if (!confirmed) return false;
    }

    setEditingItemId(null);
    setEditFormState(null);
    setEditBaselineState(null);
    setEditError(null);
    return true;
  }

  function handleStartEdit(item: AdminContentItemRow) {
    if (!canEditInline(item)) {
      setActionNotice("Inline edit is not available for this content type yet.");
      return;
    }
    if (savingEditId || updatingId || deletingId || restoringRevisionId) return;
    if (!closeEditMode()) return;

    const nextState = toEditFormState(item);
    setEditingItemId(item.id);
    setEditFormState(nextState);
    setEditBaselineState(nextState);
    setActionError(null);
    setActionNotice(null);
  }

  function updateLessonExperience(
    updater: (current: LessonExperienceEditState) => LessonExperienceEditState
  ) {
    setEditFormState((previous) =>
      previous?.lessonBody
        ? {
            ...previous,
            lessonBody: {
              ...previous.lessonBody,
              lessonExperience: updater(previous.lessonBody.lessonExperience),
            },
          }
        : previous
    );
  }

  function updateLessonBodyField<K extends keyof LessonBodyEditState>(
    key: K,
    value: LessonBodyEditState[K]
  ) {
    setEditFormState((previous) =>
      previous?.lessonBody
        ? {
            ...previous,
            lessonBody: {
              ...previous.lessonBody,
              [key]: value,
            },
          }
        : previous
    );
  }

  function updateLessonExperienceField(
    key: Exclude<keyof LessonExperienceEditState, "variant" | "display" | "commonMistakes">,
    value: string
  ) {
    updateLessonExperience((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateLessonExperienceVariant(variant: LessonExperienceVariantOption) {
    updateLessonExperience((current) => ({
      ...current,
      variant,
      display:
        variant === "custom" ? current.display : { ...LESSON_EXPERIENCE_DISPLAY_DEFAULTS[variant] },
    }));
  }

  function updateLessonExperienceDisplay(key: LessonExperienceDisplayKey, value: boolean) {
    updateLessonExperience((current) => ({
      ...current,
      variant: "custom",
      display: {
        ...current.display,
        [key]: value,
      },
    }));
  }

  function renderLessonContentScopeBadge(label: "Admin/list only" | "Technical fallback") {
    const className =
      label === "Admin/list only"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : "border-slate-200 bg-white text-slate-700";

    return (
      <span
        className={[
          "inline-flex min-h-6 items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
          className,
        ].join(" ")}
      >
        {label}
      </span>
    );
  }

  function renderLessonSectionVisibilityToggle(
    key: LessonExperienceDisplayKey,
    sectionLabel: string,
    visibleLabel?: string
  ) {
    const checked = editFormState?.lessonBody?.lessonExperience.display[key] ?? false;
    const statusLabel = checked ? "Shown" : "Hidden";

    return (
      <label
        className={[
          "inline-flex min-h-7 cursor-pointer items-center gap-1.5 rounded-[var(--fs-radius-control)] border px-2 py-0.5 text-[11px] font-semibold transition",
          checked
            ? "border-slate-200 bg-white/72 text-slate-600 hover:border-blue-200 hover:text-blue-700"
            : "border-slate-200/80 bg-slate-50/70 text-slate-500 hover:border-slate-300 hover:bg-white",
        ].join(" ")}
      >
        <input
          type="checkbox"
          aria-label={`Show ${sectionLabel} on lesson page`}
          checked={checked}
          onChange={(event) => updateLessonExperienceDisplay(key, event.target.checked)}
          className={compactCheckboxClass}
        />
        <span>{visibleLabel ?? statusLabel}</span>
      </label>
    );
  }

  function renderLessonSafetyNoteVisibilityToggle(
    key: Extract<LessonExperienceDisplayKey, "landSafetyNote" | "waterSafetyNote">,
    sectionLabel: string
  ) {
    const checked = editFormState?.lessonBody?.lessonExperience.display[key] ?? false;

    return (
      <label className="inline-flex min-h-7 cursor-pointer items-center gap-1.5 rounded-[var(--fs-radius-control)] border border-slate-200/80 bg-white/68 px-2 py-0.5 text-[11px] font-semibold text-slate-600 transition hover:bg-white">
        <input
          type="checkbox"
          aria-label={`Show ${sectionLabel} safety note on lesson page`}
          checked={checked}
          onChange={(event) => updateLessonExperienceDisplay(key, event.target.checked)}
          className={compactCheckboxClass}
        />
        <span>{checked ? "Shown" : "Hidden"}</span>
      </label>
    );
  }

  function renderHiddenLessonSectionNotice(sectionLabel: string) {
    return (
      <AdminManagerState tone="empty" density="compact" className="!mt-0">
        Hidden. Saved {sectionLabel.toLowerCase()} content is kept.
      </AdminManagerState>
    );
  }

  function renderLessonPracticeVisualPlaceholder(tone: "land" | "water") {
    const label = tone === "land" ? "Dryland practice visual" : "Water practice visual";
    const testId =
      tone === "land"
        ? "admin-lesson-dryland-visual-placeholder"
        : "admin-lesson-water-visual-placeholder";

    return (
      <div
        data-testid={testId}
        className="flex min-h-8 w-full max-w-full items-center justify-between gap-2 rounded-[var(--fs-radius-control)] border border-slate-200 bg-white/78 px-2.5 py-1 text-[11px] font-semibold text-slate-600"
        role="img"
        aria-label={`${label} not editable in this slice`}
      >
        <span className="truncate">{label}</span>
        <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] tracking-wide text-slate-500 uppercase">
          Media deferred
        </span>
      </div>
    );
  }

  function updateLessonExperienceMistakeRow(
    index: number,
    key: keyof LessonExperienceMistakeEditRow,
    value: string
  ) {
    updateLessonExperience((current) => ({
      ...current,
      commonMistakes: ensureLessonExperienceMistakeRows(
        current.commonMistakes.map((row, rowIndex) =>
          rowIndex === index ? { ...row, [key]: value } : row
        )
      ),
    }));
  }

  function addLessonExperienceMistakeRow() {
    updateLessonExperience((current) => ({
      ...current,
      commonMistakes: [...current.commonMistakes, { mistake: "", fix: "" }],
    }));
  }

  function removeLessonExperienceMistakeRow(index: number) {
    updateLessonExperience((current) => ({
      ...current,
      commonMistakes: ensureLessonExperienceMistakeRows(
        current.commonMistakes.filter((_, rowIndex) => rowIndex !== index)
      ),
    }));
  }

  function scrollToContentRow(itemId: string) {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      const target = document.getElementById(`admin-content-item-${itemId}`);
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function scrollToContentList() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      const target = document.getElementById("admin-content-list-anchor");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function clearFocusMode() {
    setListFocusState(null);
    setListQuery("");
    setListTypeFilter(DEFAULT_ALL_CONTENT_SCOPE);
    setListStatusFilter("all");
    setListSort("default");
    setListModuleFilter("");
    setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
  }

  function handleContentPrimaryViewChange(nextView: ContentPrimaryView) {
    if (nextView === "course_workspace" && !hasCourseWorkspaceItems) return;
    setContentPrimaryView(nextView);
  }

  function handleWorkspaceScopeChange(nextWorkspaceModuleId: string) {
    setWorkspaceModuleId(nextWorkspaceModuleId);
    setListTypeFilter("course_lesson");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");

    if (nextWorkspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      setListModuleFilter("");
      setListFocusState({
        source: "workspace",
        label: "Focus mode: all course lessons",
        detail: "Workspace and content list are synced to show all lessons.",
      });
      scrollToContentList();
      return;
    }

    if (nextWorkspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID) {
      setListModuleFilter(WORKSPACE_UNLINKED_MODULE_ID);
      setListFocusState({
        source: "workspace",
        label: "Focus mode: unlinked lessons",
        detail: "Showing lessons that are not attached to a valid module yet.",
      });
      scrollToContentList();
      return;
    }

    setListModuleFilter(nextWorkspaceModuleId);
    const moduleLabel = moduleLabelById.get(nextWorkspaceModuleId) ?? "selected module";
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Workspace and content list are synced to this module.",
    });
    scrollToContentList();
  }

  function handleMirrorMetricFocus(metric: MirrorMetric) {
    const metricTypeMap: Record<MirrorMetric["key"], AdminContentType> = {
      course_module: "course_module",
      course_lesson: "course_lesson",
      guide_session: "guide_session",
      guide_drill: "guide_drill",
      programs: "product",
    };
    const targetType = metricTypeMap[metric.key];
    setContentPrimaryView("all_content");
    setListTypeFilter(targetType);
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter("");
    if (targetType === "course_lesson") {
      setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
    }
    setListFocusState({
      source: "mirror",
      label: `Focus mode: ${metric.label}`,
      detail:
        metric.status === "matched"
          ? "Counts are aligned. Use this view to spot-check content quality."
          : "Mismatch detected. Use this filtered view to resolve missing/extra records.",
    });
    scrollToContentList();
  }

  function handleManualTypeFilterChange(nextType: "all" | AdminContentType) {
    setListFocusState(null);
    setListTypeFilter(nextType);
    setListModuleFilter("");
    if (nextType === "course_lesson") {
      setWorkspaceModuleId(WORKSPACE_ALL_MODULES_ID);
    }
  }

  function handleWorkspaceFocusModule(moduleId: string) {
    focusCourseWorkspaceScope(moduleId);
  }

  function scrollToCourseWorkspace() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="admin-course-lesson-workspace"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function scrollToCourseWorkspaceFocusPanel() {
    if (typeof document === "undefined") return;
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>('[data-testid="admin-course-workspace-focus-panel"]')
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function focusCourseWorkspaceScope(nextWorkspaceModuleId: string) {
    handleWorkspaceScopeChange(nextWorkspaceModuleId);
    setContentPrimaryView("course_workspace");
    if (nextWorkspaceModuleId === WORKSPACE_ALL_MODULES_ID) {
      scrollToCourseWorkspace();
      return;
    }
    scrollToCourseWorkspaceFocusPanel();
  }

  function focusModuleEdit(moduleItem: AdminContentItemRow) {
    handleStartEdit(moduleItem);
    setContentPrimaryView("all_content");
    setWorkspaceModuleId(moduleItem.id);
    setShowCourseRowsInContentList(true);
    setListTypeFilter("course_module");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter("");
    const moduleLabel = moduleLabelById.get(moduleItem.id) ?? moduleItem.title;
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Editing one module inside the course workspace.",
    });
    scrollToContentRow(moduleItem.id);
  }

  function handleWorkspaceEditModule(itemId: string) {
    const moduleItem = items.find(
      (item) => item.id === itemId && item.content_type === "course_module"
    );
    if (!moduleItem) return;
    focusModuleEdit(moduleItem);
  }

  function focusLessonEdit(lessonItem: AdminContentItemRow) {
    handleStartEdit(lessonItem);
    setContentPrimaryView("all_content");
    const moduleScope =
      lessonItem.parent_id && moduleIdSet.has(lessonItem.parent_id)
        ? lessonItem.parent_id
        : WORKSPACE_UNLINKED_MODULE_ID;
    setWorkspaceModuleId(moduleScope);
    setListTypeFilter("course_lesson");
    setListStatusFilter("all");
    setListQuery("");
    setListSort("default");
    setListModuleFilter(moduleScope);
    const moduleLabel = moduleLabelById.get(moduleScope) ?? "unlinked lessons";
    setListFocusState({
      source: "workspace",
      label: `Focus mode: ${moduleLabel}`,
      detail: "Editing one lesson inside a module-scoped workspace.",
    });
    scrollToContentRow(lessonItem.id);
  }

  function handleWorkspaceEditLesson(itemId: string) {
    const lessonItem = items.find(
      (item) => item.id === itemId && item.content_type === "course_lesson"
    );
    if (!lessonItem) return;
    focusLessonEdit(lessonItem);
  }

  function openWorkspaceLessonCreate(moduleId: string) {
    setWorkspaceModuleId(moduleId);
    setWorkspaceLessonCreateState({
      ...INITIAL_WORKSPACE_LESSON_CREATE_FORM,
      parentId: moduleId,
    });
    setWorkspaceLessonCreateError(null);
    setWorkspaceLessonCreateOpen(true);
  }

  async function createContentItem(params: {
    contentType: AdminContentType;
    title: string;
    slug: string;
    summary: string;
    category: string;
    status: AdminContentStatus;
    parentId?: string;
  }): Promise<AdminContentCreateResponse> {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "same-origin",
      body: JSON.stringify({
        contentType: params.contentType,
        title: params.title,
        slug: params.slug,
        summary: params.summary,
        category: params.category,
        status: params.status,
        ...(params.parentId ? { parentId: params.parentId } : {}),
      }),
    });

    return (await response.json()) as AdminContentCreateResponse;
  }

  async function handleWorkspaceLessonCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (workspaceLessonCreateSubmitting) return;

    setWorkspaceLessonCreateSubmitting(true);
    setWorkspaceLessonCreateError(null);
    setActionError(null);
    setActionNotice(null);

    try {
      const payload = await createContentItem({
        contentType: "course_lesson",
        title: workspaceLessonCreateState.title,
        slug: workspaceLessonCreateState.slug,
        summary: workspaceLessonCreateState.summary,
        category: "Course lessons",
        status: workspaceLessonCreateState.status,
        parentId: workspaceLessonCreateState.parentId,
      });

      if (!payload.ok) {
        setWorkspaceLessonCreateError(payload.error ?? "Could not create lesson.");
        return;
      }

      setItems((previous) => [payload.item, ...previous]);
      setWorkspaceLessonCreateOpen(false);
      setWorkspaceLessonCreateState({
        ...INITIAL_WORKSPACE_LESSON_CREATE_FORM,
        parentId: workspaceLessonCreateState.parentId,
      });
      focusLessonEdit(payload.item);
      setActionNotice("Lesson created in selected module. Opening editor.");
    } catch {
      setWorkspaceLessonCreateError("Could not create lesson.");
    } finally {
      setWorkspaceLessonCreateSubmitting(false);
    }
  }

  function validateEditForm(item: AdminContentItemRow, form: EditFormState): string | null {
    const title = form.title.trim();
    if (title.length < 2 || title.length > 120) {
      return "Title must be between 2 and 120 characters.";
    }

    const slug = form.slug.trim();
    if (slug.length < 2) {
      return "Slug must be at least 2 characters.";
    }

    const category = normalizeCategoryInput(form.category);
    if (category.length > 80) {
      return "Category must be 80 characters or less.";
    }

    const sortOrder = Number.parseInt(form.sortOrder, 10);
    if (!Number.isFinite(sortOrder) || sortOrder < -10000 || sortOrder > 10000) {
      return "Sort order must be between -10000 and 10000.";
    }

    if (item.content_type === "course_lesson") {
      const parentId = form.parentId.trim();
      if (!parentId) {
        return "Course lesson must be linked to a parent module.";
      }
      if (!moduleIdSet.has(parentId)) {
        return "Selected parent module is invalid.";
      }

      if (!form.lessonBody) {
        return "Lesson body editor is not ready for this lesson.";
      }

      const normalizedBody = normalizeLessonBodyForCompare(form.lessonBody);
      if (normalizedBody.goal.length < 5 || normalizedBody.goal.length > 500) {
        return "Lesson goal must be between 5 and 500 characters.";
      }
      if (normalizedBody.youtubeId.length > 0 && !isValidYouTubeVideoId(normalizedBody.youtubeId)) {
        return "Video ID must be the 11-character YouTube video ID, not a full URL.";
      }
      if (
        Number.isNaN(normalizedBody.estMinutes) ||
        (typeof normalizedBody.estMinutes === "number" && normalizedBody.estMinutes > 240)
      ) {
        return "Estimated minutes must be an integer between 1 and 240.";
      }
      if (normalizedBody.videoPlanningNotes.length > 4000) {
        return "Video planning notes must be 4000 characters or less.";
      }
      if (normalizedBody.drillLabel.length > 40) {
        return "Section badge label must be 40 characters or less.";
      }
      if (
        Number.isNaN(normalizedBody.supportStartAtLessonInModule) ||
        (typeof normalizedBody.supportStartAtLessonInModule === "number" &&
          normalizedBody.supportStartAtLessonInModule > 200)
      ) {
        return "Extra help start lesson must be an integer between 1 and 200.";
      }
      if (normalizedBody.displayCues && normalizedBody.cues.length === 0) {
        return "Add at least one cue (one line per cue).";
      }
      if (
        normalizedBody.displayDrill &&
        (normalizedBody.drillTitle.length < 2 || normalizedBody.drillTitle.length > 120)
      ) {
        return "Drill title must be between 2 and 120 characters.";
      }
      if (normalizedBody.displayDrill && normalizedBody.drillSteps.length === 0) {
        return "Add at least one drill step (one line per step).";
      }
      if (
        normalizedBody.nextStep.length > 0 &&
        (normalizedBody.nextStep.length < 2 || normalizedBody.nextStep.length > 240)
      ) {
        return "Legacy next step fallback must be between 2 and 240 characters.";
      }

      const experience = normalizedBody.lessonExperience;
      if (
        experience.quickExplanation.length > 0 &&
        (experience.quickExplanation.length < 5 || experience.quickExplanation.length > 700)
      ) {
        return "Lesson experience quick explanation must be between 5 and 700 characters.";
      }
      if (experience.whyThisMatters.length > 700) {
        return "Why this matters must be 700 characters or less.";
      }
      if (experience.landPracticeTitle.length > 120) {
        return "Dryland practice title must be 120 characters or less.";
      }
      if (
        experience.display.landPractice &&
        experience.landPracticeSteps.length > 0 &&
        experience.landPracticeTitle.length < 2
      ) {
        return "Add a land practice title when showing land practice steps.";
      }
      if (experience.landPracticeSafetyNote.length > 240) {
        return "Dryland practice safety note must be 240 characters or less.";
      }
      if (experience.waterPracticeTitle.length > 120) {
        return "Pool drill title must be 120 characters or less.";
      }
      if (
        experience.display.waterPractice &&
        experience.waterPracticeSteps.length > 0 &&
        experience.waterPracticeTitle.length < 2
      ) {
        return "Add a water practice title when showing water practice steps.";
      }
      if (experience.waterPracticeSafetyNote.length > 240) {
        return "Water practice safety note must be 240 characters or less.";
      }
      if (
        experience.nextStep.length > 0 &&
        (experience.nextStep.length < 2 || experience.nextStep.length > 240)
      ) {
        return "Next step must be between 2 and 240 characters.";
      }
      if (experience.supportTitle.length > 100) {
        return "Support card title must be 100 characters or less.";
      }
      if (experience.supportBody.length > 500) {
        return "Support card body must be 500 characters or less.";
      }
      for (const row of experience.commonMistakes) {
        if (row.fix.length > 0 && row.mistake.length === 0) {
          return "Correction requires a matching common mistake.";
        }
        if (row.mistake.length > 180) {
          return "Common mistake text must be 180 characters or less.";
        }
        if (row.fix.length > 240) {
          return "Correction must be 240 characters or less.";
        }
      }
    }

    return null;
  }

  async function handleSaveEdit(item: AdminContentItemRow) {
    if (!editFormState || savingEditId || updatingId || deletingId || restoringRevisionId) return;
    setActionError(null);
    setActionNotice(null);
    setEditError(null);

    const validationError = validateEditForm(item, editFormState);
    if (validationError) {
      setEditError(validationError);
      return;
    }

    if (!isEditDirty) {
      setActionNotice("No changes to save.");
      return;
    }

    const normalizedTitle = editFormState.title.trim();
    const normalizedSlug = editFormState.slug.trim();
    const normalizedSummary = editFormState.summary.trim();
    const normalizedCategory = normalizeCategoryInput(editFormState.category);
    const normalizedSortOrder = Number.parseInt(editFormState.sortOrder, 10);
    const normalizedParentId = editFormState.parentId.trim();

    const updatePayload: Record<string, unknown> = {};
    if (normalizedTitle !== item.title) {
      updatePayload.title = normalizedTitle;
    }
    if (normalizedSlug !== item.slug) {
      updatePayload.slug = normalizedSlug;
    }
    if (normalizedSummary !== (item.summary ?? "")) {
      updatePayload.summary = normalizedSummary;
    }
    if (normalizedCategory !== item.category) {
      updatePayload.category = normalizedCategory;
    }
    if (normalizedSortOrder !== item.sort_order) {
      updatePayload.sortOrder = normalizedSortOrder;
    }

    if (item.content_type === "course_lesson") {
      const itemParentId = item.parent_id ?? "";
      if (normalizedParentId !== itemParentId) {
        updatePayload.parentId = normalizedParentId || null;
      }
      if (editFormState.lessonBody) {
        updatePayload.body = buildLessonBodyPayload(item.body, editFormState.lessonBody);
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      setActionNotice("No changes to save.");
      return;
    }

    setSavingEditId(item.id);
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(updatePayload),
      });
      const payload = (await response.json()) as AdminContentUpdateResponse;
      if (!response.ok || !payload.ok) {
        setEditError(
          payload.ok
            ? "Could not save content changes."
            : (payload.error ?? "Could not save content changes.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );

      const shouldNormalizeCourseStructure =
        (item.content_type === "course_module" || item.content_type === "course_lesson") &&
        ("sortOrder" in updatePayload || "parentId" in updatePayload);

      if (shouldNormalizeCourseStructure) {
        const normalized = await runCourseStructureAction(
          { action: "normalize" },
          {
            successNotice: "Content item updated and course order normalized.",
          }
        );
        if (!normalized) {
          setCourseStructureMessage(
            "Content item was saved, but order normalization failed. Retry normalization from course structure actions."
          );
        }
      } else {
        setActionNotice("Content item updated.");
      }

      const nextEditState = toEditFormState(payload.item);
      setEditingItemId(payload.item.id);
      setEditFormState(nextEditState);
      setEditBaselineState(nextEditState);
      setEditError(null);
    } catch {
      setEditError("Could not save content changes.");
    } finally {
      setSavingEditId(null);
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setActionError(null);
    setActionNotice(null);

    try {
      if (formState.contentType === "course_lesson" && !formState.parentId.trim()) {
        setActionError("Course lessons must be created with a parent module.");
        return;
      }

      const payload = await createContentItem({
        contentType: formState.contentType,
        title: formState.title,
        slug: formState.slug,
        summary: formState.summary,
        category: formState.category,
        status: formState.status,
        parentId: formState.contentType === "course_lesson" ? formState.parentId : undefined,
      });

      if (!payload.ok) {
        setActionError(payload.error ?? "Could not create content item.");
        return;
      }

      setItems((prev) => [payload.item, ...prev]);
      if (COURSE_CONTENT_TYPES.has(payload.item.content_type)) {
        setShowCourseRowsInContentList(true);
      }
      setFormState(INITIAL_FORM);
      setActionNotice("Content item created.");
    } catch {
      setActionError("Could not create content item.");
    } finally {
      setSubmitting(false);
    }
  }

  function statusNotice(status: AdminContentStatus): string {
    if (status === "published") return "Content item published.";
    if (status === "review") return "Moved to review.";
    if (status === "archived") return "Content item archived.";
    return "Moved to draft.";
  }

  function statusActionLabel(status: AdminContentStatus): string {
    if (status === "published") return "Publish";
    if (status === "review") return "Move to review";
    if (status === "archived") return "Archive";
    return "Move to draft";
  }

  function statusLabel(status: AdminContentStatus): string {
    return STATUS_LABEL_BY_VALUE[status];
  }

  function statusChipClass(status: AdminContentStatus): string {
    return STATUS_CHIP_CLASS_BY_VALUE[status];
  }

  function statusCountSummary(counts: StatusCountByState): string {
    return STATUS_OPTIONS.map(
      (option) => `${counts[option.value]} ${option.label.toLowerCase()}`
    ).join(" · ");
  }

  function rowContextHint(item: AdminContentItemRow): string | null {
    if (item.content_type === "course_module") {
      return `Module ${item.sort_order + 1}`;
    }

    if (item.content_type === "course_lesson") {
      const parentLabel = item.parent_id ? moduleLabelById.get(item.parent_id) : null;
      const runtimeLessonId =
        resolveCourseLessonRuntimeId(item.body, item.slug) ?? item.slug.trim();
      return parentLabel
        ? `Parent: ${parentLabel} · Runtime ID: ${runtimeLessonId}`
        : `Parent module not linked · Runtime ID: ${runtimeLessonId}`;
    }

    if (item.content_type === "guide_session") {
      const weekNumber = parseBodyNumber(item.body, "weekNumber");
      const sessionId = resolveGuideSessionRuntimeId(item.body, item.slug).runtimeId;
      if (weekNumber) return `Week ${weekNumber}${sessionId ? ` · ${sessionId}` : ""}`;
      if (sessionId) return sessionId;
      return `Session ${item.sort_order + 1}`;
    }

    if (item.content_type === "guide_drill") {
      const drillId = resolveGuideDrillRuntimeId(item.body, item.slug).runtimeId;
      if (drillId) return drillId;
      return `Drill ${item.sort_order + 1}`;
    }

    if (item.content_type === "page") {
      return `Route: /${item.slug}`;
    }

    if (item.content_type === "product") {
      const productId = parseBodyString(item.body, "productId");
      return productId ? `Linked product id: ${productId}` : "Use this for product-specific copy.";
    }

    return null;
  }

  async function handleSetStatus(item: AdminContentItemRow, nextStatus: AdminContentStatus) {
    if (updatingId || deletingId) return;
    if (item.status === nextStatus) return;
    setActionError(null);
    setActionNotice(null);
    setUpdatingId(item.id);

    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as AdminContentUpdateResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not update content item."
            : (payload.error ?? "Could not update content item.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      setActionNotice(statusNotice(nextStatus));
    } catch {
      setActionError("Could not update content item.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete(item: AdminContentItemRow) {
    if (updatingId || deletingId) return;
    if (item.content_type === "course_module") {
      openModuleDeleteDialog(item);
      return;
    }
    const confirmed = window.confirm(
      `Delete "${item.title}"? This cannot be undone and removes this content record.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setDeletingId(item.id);
    try {
      const response = await fetch(`/api/admin/content/${item.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminContentDeleteResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not delete content item."
            : (payload.error ?? "Could not delete content item.")
        );
        return;
      }

      setItems((prev) => prev.filter((entry) => entry.id !== payload.id));
      setActionNotice("Content item deleted.");
    } catch {
      setActionError("Could not delete content item.");
    } finally {
      setDeletingId(null);
    }
  }

  async function loadRevisionsForItem(itemId: string, force = false): Promise<boolean> {
    if (!force && revisionsByItemId[itemId] && !revisionErrorByItemId[itemId]) {
      return true;
    }

    setRevisionsLoadingItemId(itemId);
    setActionError(null);
    setRevisionErrorByItemId((prev) => ({
      ...prev,
      [itemId]: null,
    }));
    try {
      const response = await fetch(`/api/admin/content/${itemId}/revisions`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminContentRevisionsResponse;
      if (!response.ok || !payload.ok) {
        setRevisionErrorByItemId((prev) => ({
          ...prev,
          [itemId]: payload.ok
            ? "Could not load revision history."
            : (payload.error ?? "Could not load revision history."),
        }));
        setRevisionsByItemId((prev) => ({
          ...prev,
          [itemId]: [],
        }));
        return false;
      }

      setRevisionsByItemId((prev) => ({
        ...prev,
        [itemId]: payload.items,
      }));
      setCanRestoreByItemId((prev) => ({
        ...prev,
        [itemId]: payload.canRestore,
      }));
      setRevisionErrorByItemId((prev) => ({
        ...prev,
        [itemId]: null,
      }));
      return true;
    } catch {
      setRevisionErrorByItemId((prev) => ({
        ...prev,
        [itemId]: "Could not load revision history.",
      }));
      setRevisionsByItemId((prev) => ({
        ...prev,
        [itemId]: [],
      }));
      return false;
    } finally {
      setRevisionsLoadingItemId(null);
    }
  }

  function handleToggleRevisions(itemId: string) {
    if (openRevisionsItemId === itemId) {
      setOpenRevisionsItemId(null);
      return;
    }

    setOpenRevisionsItemId(itemId);
    if (revisionsByItemId[itemId] && !revisionErrorByItemId[itemId]) {
      return;
    }

    void loadRevisionsForItem(itemId);
  }

  async function handleRestoreRevision(item: AdminContentItemRow, revisionId: string) {
    if (restoringRevisionId || updatingId || deletingId) return;
    const confirmed = window.confirm(
      `Restore "${item.title}" to this revision? Current values will be replaced.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setRestoringRevisionId(revisionId);

    try {
      const response = await fetch(`/api/admin/content/${item.id}/revisions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ revisionId }),
      });
      const payload = (await response.json()) as AdminContentRestoreResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not restore revision."
            : (payload.error ?? "Could not restore revision.")
        );
        return;
      }

      setItems((prev) =>
        prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry))
      );
      await loadRevisionsForItem(item.id, true);
      setActionNotice("Revision restored.");
    } catch {
      setActionError("Could not restore revision.");
    } finally {
      setRestoringRevisionId(null);
    }
  }

  async function handleCleanupQaTestRecords() {
    if (cleanupSubmitting) return;
    const ignoredRecordCount = mirror?.summary.ignoredRecordCount ?? 0;
    if (ignoredRecordCount === 0) return;

    const confirmed = window.confirm(
      `Delete ${ignoredRecordCount} ignored QA/test content record(s)? This only removes explicit e2e-admin-content-* rows.`
    );
    if (!confirmed) return;

    setActionError(null);
    setActionNotice(null);
    setCleanupSubmitting(true);

    try {
      const response = await fetch("/api/admin/content/test-records", {
        method: "POST",
        credentials: "same-origin",
      });
      const payload = (await response.json()) as AdminContentCleanupTestRecordsResponse;
      if (!response.ok || !payload.ok) {
        setActionError(
          payload.ok
            ? "Could not clean up QA/test records."
            : (payload.error ?? "Could not clean up QA/test records.")
        );
        return;
      }

      await loadItems();
      if (payload.deletedCount === 0) {
        setActionNotice("No QA/test content records needed cleanup.");
        return;
      }

      const deletedCountLabel = `Deleted ${payload.deletedCount} QA/test content record${
        payload.deletedCount === 1 ? "" : "s"
      }.`;
      if (payload.normalizedCourseStructure === false) {
        setActionNotice(
          payload.warning
            ? `${deletedCountLabel} ${payload.warning}`
            : `${deletedCountLabel} Course order normalization needs retry.`
        );
        return;
      }

      setActionNotice(
        payload.warning ? `${deletedCountLabel} ${payload.warning}` : deletedCountLabel
      );
    } catch {
      setActionError("Could not clean up QA/test records.");
    } finally {
      setCleanupSubmitting(false);
    }
  }

  return (
    <div className="space-y-6" data-testid="admin-content-manager">
      <section className={managerHeaderClass} data-testid="admin-content-manager-header">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,auto)] lg:items-start">
          <div>
            <h2 id="admin-content-list-anchor" className={headingClass}>
              Content
            </h2>
            <p className={["mt-2", mutedTextClass].join(" ")}>{groupedCountLabel}</p>
            {isAllContentView && filteredCountLabel ? (
              <p className={["mt-1", metadataClass].join(" ")}>{filteredCountLabel}</p>
            ) : null}
            {isAllContentView && moduleScopeLabel ? (
              <p className="mt-1 text-xs font-semibold text-[color:var(--fs-color-brand-700)]">
                {moduleScopeLabel}
              </p>
            ) : null}
            {isAllContentView && schemaReady && courseLessonWorkspaceItems.length > 0 ? (
              <p className={["mt-1", metadataClass].join(" ")}>
                {shouldHideCourseRowsInCatalog
                  ? "Course module/lesson rows are hidden in full catalog by default. Use workspace or enable full list visibility."
                  : "Course module/lesson rows are visible in full catalog."}
              </p>
            ) : null}
          </div>
          {isAllContentView ? (
            <div className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-[minmax(14rem,16rem)_minmax(10rem,auto)_minmax(10rem,auto)_minmax(10rem,auto)_auto]">
              <label className="sr-only" htmlFor="admin-content-search">
                Search content items
              </label>
              <input
                id="admin-content-search"
                type="search"
                value={listQuery}
                onChange={(event) => {
                  setListFocusState(null);
                  setListQuery(event.target.value);
                }}
                placeholder="Search title, slug, category..."
                className={[inlineFieldClass, "w-full"].join(" ")}
              />
              <label className="sr-only" htmlFor="admin-content-type-filter">
                Filter by type
              </label>
              <select
                id="admin-content-type-filter"
                value={listTypeFilter}
                onChange={(event) =>
                  handleManualTypeFilterChange(event.target.value as "all" | AdminContentType)
                }
                className={[inlineFieldClass, "w-full"].join(" ")}
              >
                {ALL_CONTENT_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="admin-content-status-filter">
                Filter by status
              </label>
              <select
                id="admin-content-status-filter"
                value={listStatusFilter}
                onChange={(event) => {
                  setListFocusState(null);
                  setListStatusFilter(event.target.value as "all" | AdminContentStatus);
                }}
                className={[inlineFieldClass, "w-full"].join(" ")}
              >
                <option value="all">All statuses</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <label className="sr-only" htmlFor="admin-content-sort">
                Sort content list
              </label>
              <select
                id="admin-content-sort"
                value={listSort}
                onChange={(event) => {
                  setListFocusState(null);
                  setListSort(event.target.value as ListSortOption);
                }}
                className={[inlineFieldClass, "w-full"].join(" ")}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => void loadItems()}
                className={[secondaryActionClass, "w-full sm:w-auto"].join(" ")}
              >
                Refresh
              </button>
            </div>
          ) : null}
        </div>

        <div
          className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/62 p-1"
          data-testid="admin-content-primary-view-tabs"
        >
          <button
            type="button"
            data-testid="admin-content-view-tab-course-workspace"
            onClick={() => handleContentPrimaryViewChange("course_workspace")}
            aria-pressed={isCourseWorkspaceView}
            disabled={!hasCourseWorkspaceItems}
            className={[
              tabButtonClass,
              isCourseWorkspaceView ? tabButtonActiveClass : tabButtonInactiveClass,
              !hasCourseWorkspaceItems ? "cursor-not-allowed opacity-60" : "",
            ].join(" ")}
          >
            Course Workspace
          </button>
          <button
            type="button"
            data-testid="admin-content-view-tab-all-content"
            onClick={() => handleContentPrimaryViewChange("all_content")}
            aria-pressed={isAllContentView}
            className={[
              tabButtonClass,
              isAllContentView ? tabButtonActiveClass : tabButtonInactiveClass,
            ].join(" ")}
          >
            All Content
          </button>
        </div>

        {isAllContentView ? (
          <div className="mt-4 space-y-2">
            <div className="hidden flex-wrap items-center gap-2 sm:flex">
              {ALL_CONTENT_SCOPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  data-testid={`admin-content-type-chip-${option.value}`}
                  onClick={() => handleManualTypeFilterChange(option.value)}
                  className={[
                    statusFilterClass,
                    listTypeFilter === option.value
                      ? statusFilterActiveClass
                      : "text-[color:var(--fs-color-ink)] hover:bg-white",
                  ].join(" ")}
                >
                  {option.label} (
                  {option.value === "all" ? typeCounts.all : typeCounts[option.value]})
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {isAllContentView && listTypeFilter === "all" ? (
          <AdminManagerState
            tone="warning"
            density="compact"
            testId="admin-content-audit-mode-state"
            className="!mt-3"
          >
            All content audit mode is enabled. This can be a long mixed list.
          </AdminManagerState>
        ) : null}

        {isAllContentView && schemaReady && courseLessonWorkspaceItems.length > 0 ? (
          <label className="mt-3 inline-flex items-center gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/68 px-3 py-2 text-xs font-semibold text-[color:var(--fs-color-ink)]">
            <input
              type="checkbox"
              checked={showCourseRowsInContentList}
              onChange={(event) => setShowCourseRowsInContentList(event.target.checked)}
              data-testid="admin-course-list-visibility-toggle"
              className="h-4 w-4 rounded border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500"
            />
            Show course modules and lessons in full content list
          </label>
        ) : null}

        {isAllContentView && listFocusState ? (
          <AdminManagerState
            tone="info"
            title={listFocusState.label}
            testId="admin-content-focus-mode"
            className="!mt-3"
            actionsClassName="mt-3 flex flex-wrap gap-2"
            actions={
              <button
                type="button"
                onClick={clearFocusMode}
                className={compactSecondaryActionClass}
              >
                Clear focus
              </button>
            }
          >
            {listFocusState.detail}
          </AdminManagerState>
        ) : null}

        {!schemaReady && warning ? (
          <AdminManagerState tone="warning" testId="admin-content-schema-warning-state">
            {warning}
          </AdminManagerState>
        ) : null}

        {isAllContentView && schemaReady && mirror ? (
          <AdminManagerState as="article" tone="neutral" testId="admin-content-mirror-state">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className={smallHeadingClass}>Platform mirror snapshot</h3>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={[
                      "inline-flex h-6 items-center rounded-full border px-2 font-semibold",
                      mirror.summary.mismatchCount === 0
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-800",
                    ].join(" ")}
                  >
                    {mirror.summary.mismatchCount === 0
                      ? "All aligned"
                      : `${mirror.summary.mismatchCount} mismatch${
                          mirror.summary.mismatchCount === 1 ? "" : "es"
                        }`}
                  </span>
                  {mirror.summary.coverageMismatchCount > 0 ? (
                    <span className="text-slate-600">
                      {mirror.summary.coverageMismatchCount} identity drift
                      {mirror.summary.coverageMismatchCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                  {mirror.summary.ignoredRecordCount > 0 ? (
                    <span className="text-slate-600">
                      {mirror.summary.ignoredRecordCount} ignored QA/test record
                      {mirror.summary.ignoredRecordCount === 1 ? "" : "s"}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setMirrorDetailsOpen((current) => !current)}
                  aria-expanded={mirrorDetailsOpen}
                  aria-controls="admin-mirror-details-panel"
                  data-testid="admin-mirror-summary"
                  className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(" ")}
                >
                  {mirrorDetailsOpen ? "Hide mirror details" : "View mirror details"}
                </button>
                {mirror.summary.ignoredRecordCount > 0 ? (
                  adminRole === "admin" ? (
                    <button
                      type="button"
                      onClick={handleCleanupQaTestRecords}
                      disabled={cleanupSubmitting}
                      data-testid="admin-mirror-cleanup-test-records"
                      className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(" ")}
                    >
                      {cleanupSubmitting
                        ? "Cleaning QA/test records..."
                        : "Delete ignored QA/test records"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Sign in as admin to delete ignored QA/test records.
                    </span>
                  )
                ) : null}
              </div>
            </div>
            <div
              id="admin-mirror-details-panel"
              data-testid="admin-mirror-details"
              hidden={!mirrorDetailsOpen}
              className="mt-3"
            >
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {mirror.metrics.map((metric) => (
                  <li key={metric.key}>
                    <button
                      type="button"
                      data-testid={`admin-mirror-metric-${metric.key}`}
                      onClick={() => handleMirrorMetricFocus(metric)}
                      aria-pressed={activeMirrorMetricKey === metric.key}
                      className={[
                        "w-full rounded-lg border px-3 py-2 text-left text-xs text-slate-700 transition hover:border-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300",
                        metric.status === "matched"
                          ? "border-slate-200 bg-white hover:bg-slate-50"
                          : "border-amber-300 bg-amber-50/40 hover:bg-amber-50/70",
                        activeMirrorMetricKey === metric.key ? "ring-2 ring-blue-300" : "",
                      ].join(" ")}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p
                          className={[
                            "font-semibold",
                            metric.status === "matched" ? "text-slate-900" : "text-amber-900",
                          ].join(" ")}
                        >
                          {metric.label}
                        </p>
                        <span
                          className={[
                            "inline-flex h-5 items-center rounded-full border px-2 text-[11px] font-semibold",
                            metric.status === "matched"
                              ? "border-slate-200 bg-slate-50 text-slate-600"
                              : "border-amber-200 bg-white text-amber-800",
                          ].join(" ")}
                        >
                          {metric.status === "matched" ? "Aligned" : "Review"}
                        </span>
                      </div>
                      <p className="mt-1">
                        Platform: {metric.platformCount} · Admin: {metric.adminCount}
                        {metric.delta !== 0
                          ? ` · Delta: ${metric.delta > 0 ? "+" : ""}${metric.delta}`
                          : ""}
                      </p>
                      {metric.coverage.missingCount > 0 ? (
                        <p className="mt-1">
                          Missing IDs: {metric.coverage.missingCount}
                          {metric.coverage.missingSamples.length > 0
                            ? ` (${metric.coverage.missingSamples.join(", ")})`
                            : ""}
                        </p>
                      ) : null}
                      {metric.coverage.extraCount > 0 ? (
                        <p className="mt-1">
                          Extra IDs: {metric.coverage.extraCount}
                          {metric.coverage.extraSamples.length > 0
                            ? ` (${metric.coverage.extraSamples.join(", ")})`
                            : ""}
                        </p>
                      ) : null}
                      {metric.coverage.ignoredCount > 0 ? (
                        <p className="mt-1">
                          Ignored QA/test IDs: {metric.coverage.ignoredCount}
                          {metric.coverage.ignoredSamples.length > 0
                            ? ` (${metric.coverage.ignoredSamples.join(", ")})`
                            : ""}
                        </p>
                      ) : null}
                      <p className="mt-2 text-[11px] font-medium opacity-80">
                        {activeMirrorMetricKey === metric.key
                          ? "Active scope"
                          : "Click to focus content list"}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Snapshot checks current platform modules/lessons/guides/products against admin
                records and excludes explicit QA/test slugs such as `e2e-admin-content-*` from
                parity counts.
              </p>
            </div>
          </AdminManagerState>
        ) : null}

        {isCourseWorkspaceView ? (
          <article
            className={["mt-5 flex flex-col", workspacePanelClass].join(" ")}
            data-testid="admin-course-lesson-workspace"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={smallHeadingClass}>Course workspace overview</h3>
                <span className="inline-flex h-6 items-center rounded-full border border-[color:var(--fs-border-soft)] bg-white/82 px-2 text-[11px] font-semibold text-[color:var(--fs-color-muted)]">
                  {isFocusedCourseWorkspace ? "Focus mode active" : "Overview mode"}
                </span>
              </div>
              <p className={metadataClass}>
                {courseLessonWorkspaceItems.length} lesson
                {courseLessonWorkspaceItems.length === 1 ? "" : "s"} ready for edit
              </p>
            </div>
            <p className={["mt-2", metadataClass].join(" ")}>
              {isFocusedCourseWorkspace
                ? "Selected module is open below."
                : "Open a module when you need ordering, moves, or deeper edits."}
            </p>

            <div
              className={["mt-3 grid gap-2 sm:grid-cols-2", nestedPanelClass].join(" ")}
              data-testid="admin-course-status-overview"
            >
              <div className={mutedPanelClass}>
                <p className={metadataLabelClass}>Modules</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {courseModuleWorkspaceItems.length} total
                </p>
                <p className={["mt-1", metadataClass].join(" ")}>
                  {statusCountSummary(moduleStatusCounts)}
                </p>
              </div>
              <div className={mutedPanelClass}>
                <p className={metadataLabelClass}>Lessons</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                  {courseLessonWorkspaceItems.length} total
                </p>
                <p className={["mt-1", metadataClass].join(" ")}>
                  {statusCountSummary(lessonStatusCounts)}
                </p>
              </div>
            </div>

            {courseModuleWorkspaceItems.length > 0 ? (
              <ul className="mt-3 grid gap-2" data-testid="admin-course-module-status-list">
                {courseModuleWorkspaceItems.map((moduleItem) => {
                  const moduleLessonCounts =
                    lessonStatusCountsByModuleId.get(moduleItem.id) ?? createStatusCountByState();
                  const moduleLessons = workspaceLessonsByModuleId.get(moduleItem.id) ?? [];
                  const moduleLessonPreview = buildCourseWorkspaceLessonPreview(
                    moduleLessons,
                    isFocusedCourseWorkspace ? 0 : COURSE_WORKSPACE_OVERVIEW_PREVIEW_LIMIT
                  );
                  const moduleLessonCount = Object.values(moduleLessonCounts).reduce(
                    (sum, value) => sum + value,
                    0
                  );
                  const moduleScopeActive = workspaceModuleId === moduleItem.id;
                  const modulePreviewLessonId = firstRuntimeLessonIdByModuleId.get(moduleItem.id);
                  const moduleRecord = contentItemById.get(moduleItem.id) ?? null;
                  const modulePreviewUrl = modulePreviewLessonId
                    ? buildCoursePreviewHref({
                        lessonId: modulePreviewLessonId,
                        mode: resolveCoursePreviewModeFromStatus(moduleItem.status),
                        previewType: "module",
                        previewRef: moduleItem.slug,
                      })
                    : null;

                  return (
                    <li
                      key={moduleItem.id}
                      className={[
                        rowCardClass,
                        moduleScopeActive ? "border-[color:var(--fs-border-brand)]" : "",
                      ].join(" ")}
                      data-testid="admin-course-module-status-row"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                          {moduleItem.sortOrder + 1}. {moduleItem.title}
                        </p>
                        <span
                          className={[
                            "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-semibold",
                            statusChipClass(moduleItem.status),
                          ].join(" ")}
                        >
                          {statusLabel(moduleItem.status)}
                        </span>
                      </div>
                      {moduleScopeActive ? (
                        <p className="mt-1 text-[11px] font-semibold text-[color:var(--fs-color-brand-700)]">
                          Active module scope
                        </p>
                      ) : null}
                      <p className={["mt-1", metadataClass].join(" ")}>
                        {moduleLessonCount} linked lesson{moduleLessonCount === 1 ? "" : "s"} ·{" "}
                        {statusCountSummary(moduleLessonCounts)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleWorkspaceFocusModule(moduleItem.id)}
                          className={compactPrimaryActionClass}
                        >
                          Open module scope
                        </button>
                        <button
                          type="button"
                          onClick={() => openWorkspaceLessonCreate(moduleItem.id)}
                          className={compactSuccessActionClass}
                        >
                          Add lesson
                        </button>
                        <details>
                          <summary className={compactDetailsSummaryClass}>More actions</summary>
                          <div className={compactActionRailClass}>
                            <button
                              type="button"
                              onClick={() => handleWorkspaceEditModule(moduleItem.id)}
                              className={compactSecondaryActionClass}
                            >
                              Edit module
                            </button>
                            {modulePreviewUrl ? (
                              <a
                                href={modulePreviewUrl}
                                target="_blank"
                                rel="noreferrer"
                                className={compactWarningActionClass}
                              >
                                Open module preview
                              </a>
                            ) : (
                              <span className="inline-flex min-h-9 items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/60 px-3 text-xs font-semibold text-[color:var(--fs-color-muted)]">
                                Open module preview (no lessons)
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                if (!moduleRecord) return;
                                void handleDelete(moduleRecord);
                              }}
                              disabled={!moduleRecord}
                              className={compactDangerActionClass}
                            >
                              Delete module
                            </button>
                          </div>
                        </details>
                      </div>
                      {isFocusedCourseWorkspace ? (
                        <p className="mt-3 text-[11px] text-[color:var(--fs-color-muted)]">
                          {moduleScopeActive
                            ? "Detailed lesson order and actions are shown below in Module workspace."
                            : "Overview stays compact while one module is focused below."}
                        </p>
                      ) : (
                        <div className={["mt-3", mutedPanelClass].join(" ")}>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className={metadataLabelClass}>Lesson preview</p>
                          </div>
                          {moduleLessons.length === 0 ? (
                            <AdminManagerState
                              tone="empty"
                              density="compact"
                              className="!mt-2"
                              testId="admin-course-module-lesson-preview-empty-state"
                            >
                              No lessons linked to this module yet.
                            </AdminManagerState>
                          ) : (
                            <div
                              data-testid={`admin-course-module-lesson-preview-${moduleItem.id}`}
                            >
                              <ol className="mt-2 space-y-1">
                                {moduleLessonPreview.visibleLessons.map((lesson, lessonIndex) => {
                                  const lessonRecord = contentItemById.get(lesson.id) ?? null;

                                  return (
                                    <li
                                      key={lesson.id}
                                      data-testid="admin-course-module-lesson-preview-row"
                                      className="rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/88 px-3 py-2"
                                    >
                                      <div className="flex flex-wrap items-center justify-between gap-2">
                                        <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                          {lessonIndex + 1}. {lesson.title}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                          <a
                                            href={courseLessonOpenHref(lesson.runtimeLessonId)}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={compactSecondaryActionClass}
                                          >
                                            Open lesson
                                          </a>
                                          <button
                                            type="button"
                                            onClick={() => handleWorkspaceEditLesson(lesson.id)}
                                            className={compactPrimaryActionClass}
                                          >
                                            Edit lesson
                                          </button>
                                          <details>
                                            <summary className={compactDetailsSummaryClass}>
                                              More
                                            </summary>
                                            <div className={compactActionRailClass}>
                                              <button
                                                type="button"
                                                onClick={() => {
                                                  if (!lessonRecord) return;
                                                  void handleDelete(lessonRecord);
                                                }}
                                                disabled={!lessonRecord}
                                                className={compactDangerActionClass}
                                              >
                                                Delete lesson
                                              </button>
                                            </div>
                                          </details>
                                        </div>
                                      </div>
                                    </li>
                                  );
                                })}
                              </ol>
                              {moduleLessonPreview.hiddenCount > 0 ? (
                                <p className="mt-2 text-[11px] text-[color:var(--fs-color-muted)]">
                                  {moduleLessonPreview.hiddenCount} more lesson
                                  {moduleLessonPreview.hiddenCount === 1 ? "" : "s"} in module
                                  workspace.
                                </p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {workspaceModuleId !== WORKSPACE_ALL_MODULES_ID ? (
              <div
                className={[
                  "order-first mt-3 flex flex-wrap items-center justify-between gap-2",
                  activePanelClass,
                ].join(" ")}
                data-testid="admin-course-workspace-current-scope"
              >
                <div>
                  <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                    Current workspace scope
                  </p>
                  <p className="text-xs text-[color:var(--fs-color-brand-700)]">
                    {workspaceScopeLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => focusCourseWorkspaceScope(WORKSPACE_ALL_MODULES_ID)}
                  className={compactSecondaryActionClass}
                >
                  Show all modules
                </button>
              </div>
            ) : null}

            <div
              className={["order-first mt-3", rowCardClass].join(" ")}
              data-testid="admin-course-workspace-focus-panel"
            >
              <div className="flex flex-wrap items-end justify-between gap-3">
                <label className={compactLabelClass}>
                  <span>Module workspace</span>
                  <select
                    value={workspaceModuleId}
                    onChange={(event) => focusCourseWorkspaceScope(event.target.value)}
                    className={[compactFieldClass, "min-w-[240px]"].join(" ")}
                  >
                    <option value={WORKSPACE_ALL_MODULES_ID}>
                      All modules ({courseLessonWorkspaceItems.length})
                    </option>
                    {moduleOptions.map((option) => {
                      const moduleLessonCount = courseLessonWorkspaceItems.filter(
                        (item) => item.parentId === option.id
                      ).length;
                      return (
                        <option key={option.id} value={option.id}>
                          {option.label} ({moduleLessonCount})
                        </option>
                      );
                    })}
                    {unlinkedLessonCount > 0 ? (
                      <option value={WORKSPACE_UNLINKED_MODULE_ID}>
                        Unlinked lessons ({unlinkedLessonCount})
                      </option>
                    ) : null}
                  </select>
                </label>
                {moduleIdSet.has(workspaceModuleId) ? (
                  <button
                    type="button"
                    onClick={() => openWorkspaceLessonCreate(workspaceModuleId)}
                    className={compactSuccessActionClass}
                  >
                    Add lesson in this module
                  </button>
                ) : null}
              </div>

              <p className={["mt-2", metadataClass].join(" ")}>
                {workspaceModuleId === WORKSPACE_ALL_MODULES_ID
                  ? "Current workspace stays on top. Use overview below to scan modules quickly, then open a module here when you need full lesson ordering, move controls, or in-context create."
                  : workspaceModuleId === WORKSPACE_UNLINKED_MODULE_ID
                    ? "Focused exception view: repair lessons that are not attached to a valid module."
                    : "Focused module workspace: use this as the primary place to reorder, move, preview, and edit lessons in one module."}
              </p>

              {workspaceLessonCreateOpen ? (
                <form
                  className={["mt-3 grid gap-3 sm:grid-cols-2", activePanelClass].join(" ")}
                  onSubmit={handleWorkspaceLessonCreate}
                  data-testid="admin-workspace-lesson-create-form"
                >
                  <div className="sm:col-span-2">
                    <h4 className={smallHeadingClass}>Create lesson in context</h4>
                    <p className={["mt-1", metadataClass].join(" ")}>
                      Start in the intended module now. You can still override the parent module
                      before save if you intentionally want another module.
                    </p>
                  </div>

                  <label className={compactLabelClass}>
                    <span>Parent module</span>
                    <select
                      value={workspaceLessonCreateState.parentId}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          parentId: event.target.value,
                        }))
                      }
                      className={compactFieldClass}
                    >
                      <option value="">Select module</option>
                      {moduleOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={compactLabelClass}>
                    <span>Status</span>
                    <select
                      value={workspaceLessonCreateState.status}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          status: event.target.value as AdminContentStatus,
                        }))
                      }
                      className={compactFieldClass}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                    <span>Title</span>
                    <input
                      type="text"
                      required
                      value={workspaceLessonCreateState.title}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          title: event.target.value,
                        }))
                      }
                      className={compactFieldClass}
                      placeholder="First breaths"
                    />
                  </label>

                  <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                    <span>Slug (optional)</span>
                    <input
                      type="text"
                      value={workspaceLessonCreateState.slug}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          slug: event.target.value,
                        }))
                      }
                      className={compactFieldClass}
                      placeholder="first-breaths"
                    />
                    <p className="text-[11px] font-normal text-[color:var(--fs-color-muted)]">
                      Slug stays human-readable. Runtime lesson ID is assigned automatically and
                      locked after creation.
                    </p>
                  </label>

                  <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                    <span>Summary</span>
                    <textarea
                      rows={3}
                      value={workspaceLessonCreateState.summary}
                      onChange={(event) =>
                        setWorkspaceLessonCreateState((previous) => ({
                          ...previous,
                          summary: event.target.value,
                        }))
                      }
                      className={textAreaClass}
                      placeholder="What this lesson helps the swimmer do."
                    />
                  </label>

                  {workspaceLessonCreateError ? (
                    <AdminManagerState
                      tone="error"
                      announcement="polite"
                      density="compact"
                      className="!mt-0 sm:col-span-2"
                      testId="admin-workspace-lesson-create-error-state"
                    >
                      {workspaceLessonCreateError}
                    </AdminManagerState>
                  ) : null}

                  <div className="flex flex-wrap gap-2 sm:col-span-2">
                    <button
                      type="submit"
                      disabled={workspaceLessonCreateSubmitting}
                      className={compactSuccessActionClass}
                    >
                      {workspaceLessonCreateSubmitting ? "Creating…" : "Create lesson"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setWorkspaceLessonCreateOpen(false);
                        setWorkspaceLessonCreateError(null);
                      }}
                      disabled={workspaceLessonCreateSubmitting}
                      className={compactSecondaryActionClass}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {workspaceModuleId === WORKSPACE_ALL_MODULES_ID ? (
                <p
                  className="mt-3 rounded-[var(--fs-radius-control)] border border-dashed border-[color:var(--fs-border-soft)] bg-white/62 px-3 py-2 text-xs text-[color:var(--fs-color-muted)]"
                  data-testid="admin-course-workspace-overview-guidance"
                >
                  Overview shows open/edit actions. Use module scope for ordering and moves.
                </p>
              ) : workspaceLessons.length === 0 ? (
                <AdminManagerState
                  tone="empty"
                  density="compact"
                  className="!mt-3"
                  testId="admin-course-workspace-empty-state"
                >
                  No lessons in this module yet.
                </AdminManagerState>
              ) : (
                <ul className="mt-3 space-y-2">
                  {workspaceLessons.map((lesson, index) => {
                    const moveBounds = lessonMoveBoundsById.get(lesson.id);
                    const selectedTargetModuleId = lessonMoveTargetById[lesson.id] ?? "";
                    const canMoveToTargetModule =
                      selectedTargetModuleId.length > 0 &&
                      selectedTargetModuleId !== (lesson.parentId ?? "");
                    const workspaceActionBusy = Boolean(
                      courseStructureBusy ||
                      moduleDeleteSubmitting ||
                      updatingId ||
                      deletingId ||
                      restoringRevisionId ||
                      savingEditId
                    );

                    return (
                      <li
                        key={lesson.id}
                        data-testid="admin-workspace-lesson-row"
                        className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/78 px-3 py-3"
                      >
                        <div className="min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                              Lesson {index + 1}: {lesson.title}
                            </p>
                            <span
                              className={[
                                "inline-flex h-6 items-center rounded-full border px-2 text-[11px] font-semibold",
                                statusChipClass(lesson.status),
                              ].join(" ")}
                            >
                              {statusLabel(lesson.status)}
                            </span>
                          </div>
                          <p className={["mt-1", metadataClass].join(" ")}>
                            {lesson.moduleLabel ?? "Unlinked module"} · /{lesson.slug} · id:{" "}
                            {lesson.runtimeLessonId}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleWorkspaceEditLesson(lesson.id)}
                            className={compactPrimaryActionClass}
                          >
                            Edit lesson
                          </button>
                          <a
                            href={courseLessonOpenHref(lesson.runtimeLessonId)}
                            target="_blank"
                            rel="noreferrer"
                            className={compactSecondaryActionClass}
                          >
                            Open lesson
                          </a>
                          <details>
                            <summary className={compactDetailsSummaryClass}>Reorder / move</summary>
                            <div className={compactActionRailClass}>
                              <button
                                type="button"
                                onClick={() => void handleMoveLesson(lesson.id, "up")}
                                disabled={workspaceActionBusy || !moveBounds?.canMoveUp}
                                className={compactSecondaryActionClass}
                              >
                                Move up
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleMoveLesson(lesson.id, "down")}
                                disabled={workspaceActionBusy || !moveBounds?.canMoveDown}
                                className={compactSecondaryActionClass}
                              >
                                Move down
                              </button>
                              <label
                                className="sr-only"
                                htmlFor={`workspace-move-target-${lesson.id}`}
                              >
                                Move lesson to module
                              </label>
                              <select
                                id={`workspace-move-target-${lesson.id}`}
                                value={selectedTargetModuleId}
                                onChange={(event) =>
                                  setLessonMoveTargetById((previous) => ({
                                    ...previous,
                                    [lesson.id]: event.target.value,
                                  }))
                                }
                                disabled={workspaceActionBusy || moduleOptions.length === 0}
                                className={[compactFieldClass, "min-w-[170px] text-xs"].join(" ")}
                              >
                                <option value="">Select module</option>
                                {moduleOptions.map((option) => (
                                  <option key={option.id} value={option.id}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleMoveLessonToModule(lesson.id, selectedTargetModuleId)
                                }
                                disabled={workspaceActionBusy || !canMoveToTargetModule}
                                className={compactQuietActionClass}
                              >
                                Move to module
                              </button>
                              <a
                                href={buildCoursePreviewHref({
                                  lessonId: lesson.runtimeLessonId,
                                  mode: resolveCoursePreviewModeFromStatus(lesson.status),
                                  previewType: "lesson",
                                  previewRef: lesson.slug,
                                })}
                                target="_blank"
                                rel="noreferrer"
                                className={compactWarningActionClass}
                              >
                                Open preview
                              </a>
                            </div>
                          </details>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </article>
        ) : null}

        {loading ? (
          <AdminManagerState tone="loading" testId="admin-content-loading-state">
            Loading content list…
          </AdminManagerState>
        ) : null}

        {!loading && error ? (
          <AdminManagerState
            tone="error"
            testId="admin-content-load-error-state"
            actions={
              <button
                type="button"
                onClick={() => void loadItems()}
                className={compactDangerActionClass}
              >
                Retry
              </button>
            }
          >
            {error}
          </AdminManagerState>
        ) : null}

        {!loading && !error && courseStructureIntegrityFragments.length > 0 ? (
          <AdminManagerState
            tone="warning"
            testId="admin-content-course-structure-warning-state"
            className="flex flex-wrap items-center justify-between gap-3"
            actionsClassName="mt-0 flex flex-wrap gap-2"
            actions={
              <button
                type="button"
                onClick={() =>
                  void runCourseStructureAction(
                    { action: "normalize" },
                    {
                      successNotice: "Course order normalized.",
                    }
                  )
                }
                disabled={courseStructureBusy || moduleDeleteSubmitting}
                className={compactWarningActionClass}
              >
                {courseStructureBusy ? "Normalizing…" : "Normalize order"}
              </button>
            }
          >
            Course structure integrity warning: {courseStructureIntegrityFragments.join(" · ")}.
          </AdminManagerState>
        ) : null}

        {courseStructureMessage ? (
          <AdminManagerState
            tone="warning"
            announcement="polite"
            testId="admin-content-course-structure-message-state"
          >
            {courseStructureMessage}
          </AdminManagerState>
        ) : null}

        {actionNotice ? (
          <AdminManagerState tone="success" testId="admin-content-action-notice-state">
            {actionNotice}
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && schemaReady && items.length === 0 ? (
          <AdminManagerState tone="empty" testId="admin-content-empty-state">
            No content items created yet. Use the form below to create your first draft.
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && items.length > 0 && sortedItems.length === 0 ? (
          <AdminManagerState tone="no-results" testId="admin-content-no-results-state">
            No content items match current search/filter.
          </AdminManagerState>
        ) : null}

        {isAllContentView && !loading && !error && sortedItems.length > 0 ? (
          <ul className="mt-5 space-y-2">
            {sortedItems.map((item) => {
              const isEditingRow = editingItemId === item.id;
              const isInlineEditable = canEditInline(item);
              const rowPreviewHref =
                item.content_type === "course_lesson"
                  ? lessonPreviewHref(item)
                  : item.content_type === "course_module"
                    ? (() => {
                        const firstLessonId = firstRuntimeLessonIdByModuleId.get(item.id);
                        if (!firstLessonId) return null;
                        return modulePreviewHref(item, firstLessonId);
                      })()
                    : null;
              const rowBusy = Boolean(
                courseStructureBusy ||
                moduleDeleteSubmitting ||
                updatingId ||
                deletingId ||
                restoringRevisionId ||
                savingEditId
              );
              const rowTypeLabel = CONTENT_TYPE_LABEL[item.content_type];
              const rowHint = rowContextHint(item);
              const editNotesContext = isEditingRow
                ? resolveAdminContentEditNotesContext(item)
                : null;
              const editQrContext = isEditingRow ? resolveAdminContentEditQrContext(item) : null;
              const isStatusActionsOpen = openStatusActionsItemId === item.id;
              const courseWorkspaceScopeId =
                item.content_type === "course_module"
                  ? item.id
                  : item.content_type === "course_lesson"
                    ? item.parent_id && moduleIdSet.has(item.parent_id)
                      ? item.parent_id
                      : WORKSPACE_UNLINKED_MODULE_ID
                    : null;
              const courseWorkspaceScopeLabel =
                courseWorkspaceScopeId === WORKSPACE_UNLINKED_MODULE_ID
                  ? "unlinked lessons"
                  : courseWorkspaceScopeId
                    ? (moduleLabelById.get(courseWorkspaceScopeId) ?? "selected module")
                    : null;
              const moduleMoveBounds =
                item.content_type === "course_module"
                  ? moduleMoveBoundsById.get(item.id)
                  : undefined;
              const lessonMoveBounds =
                item.content_type === "course_lesson"
                  ? lessonMoveBoundsById.get(item.id)
                  : undefined;
              const revisionItems = revisionsByItemId[item.id] ?? [];
              const revisionError = revisionErrorByItemId[item.id] ?? null;
              const isRevisionLoading = revisionsLoadingItemId === item.id;

              return (
                <li
                  key={item.id}
                  id={`admin-content-item-${item.id}`}
                  data-testid="admin-content-item"
                  className={rowCardClass}
                >
                  <div
                    className={[
                      "flex flex-wrap items-start justify-between gap-3",
                      !isEditingRow ? "sm:items-center" : "",
                    ].join(" ")}
                  >
                    <div className="min-w-[280px] flex-1">
                      <p className="text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                        {item.title}
                      </p>
                      <p className={["mt-1", metadataClass].join(" ")}>
                        {rowTypeLabel} · {item.category} · {item.status} · /{item.slug}
                      </p>
                      {rowHint ? (
                        <p className={["mt-1", metadataClass].join(" ")}>{rowHint}</p>
                      ) : null}

                      {isEditingRow && editFormState ? (
                        <div
                          className={["mt-3", nestedPanelClass].join(" ")}
                          data-testid="admin-content-edit-form"
                        >
                          {courseWorkspaceScopeId && courseWorkspaceScopeLabel ? (
                            <div
                              className={[
                                "mb-3 flex flex-wrap items-center justify-between gap-2",
                                activePanelClass,
                              ].join(" ")}
                            >
                              <div>
                                <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                  Course workspace context
                                </p>
                                <p className={metadataClass}>
                                  Return to {courseWorkspaceScopeLabel} to continue module-scoped
                                  editing.
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => focusCourseWorkspaceScope(courseWorkspaceScopeId)}
                                className={compactSecondaryActionClass}
                              >
                                {courseWorkspaceScopeId === WORKSPACE_UNLINKED_MODULE_ID
                                  ? "Back to unlinked lessons"
                                  : "Back to module workspace"}
                              </button>
                            </div>
                          ) : null}
                          <div className="grid gap-3 sm:grid-cols-2">
                            <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                              <span>Title</span>
                              <input
                                type="text"
                                value={editFormState.title}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, title: event.target.value } : prev
                                  )
                                }
                                className={compactFieldClass}
                              />
                            </label>

                            <label className={compactLabelClass}>
                              <span>Slug</span>
                              <input
                                type="text"
                                value={editFormState.slug}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, slug: event.target.value } : prev
                                  )
                                }
                                className={compactFieldClass}
                              />
                              {item.content_type === "course_module" ||
                              item.content_type === "course_lesson" ? (
                                <p className="text-[11px] font-normal text-[color:var(--fs-color-muted)]">
                                  Slug is the human-readable content key. It can be renamed
                                  carefully; internal runtime IDs stay locked after creation.
                                </p>
                              ) : null}
                            </label>

                            <label className={compactLabelClass}>
                              <span>Category</span>
                              <input
                                type="text"
                                value={editFormState.category}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, category: event.target.value } : prev
                                  )
                                }
                                className={compactFieldClass}
                              />
                            </label>

                            <label className={compactLabelClass}>
                              <span>Sort order</span>
                              <input
                                type="number"
                                value={editFormState.sortOrder}
                                onChange={(event) =>
                                  setEditFormState((prev) =>
                                    prev ? { ...prev, sortOrder: event.target.value } : prev
                                  )
                                }
                                className={compactFieldClass}
                              />
                            </label>

                            {item.content_type === "course_lesson" ? (
                              <label className={compactLabelClass}>
                                <span>Parent module</span>
                                <select
                                  value={editFormState.parentId}
                                  onChange={(event) =>
                                    setEditFormState((prev) =>
                                      prev ? { ...prev, parentId: event.target.value } : prev
                                    )
                                  }
                                  className={compactFieldClass}
                                >
                                  <option value="">Select module</option>
                                  {moduleOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            ) : null}

                            {item.content_type !== "course_lesson" ? (
                              <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                                <span>Summary</span>
                                <textarea
                                  rows={3}
                                  value={editFormState.summary}
                                  onChange={(event) =>
                                    setEditFormState((prev) =>
                                      prev ? { ...prev, summary: event.target.value } : prev
                                    )
                                  }
                                  className={textAreaClass}
                                />
                              </label>
                            ) : null}

                            {item.content_type === "course_lesson" && editFormState.lessonBody ? (
                              <>
                                <div
                                  className={["sm:col-span-2", lessonMirrorEditorClass].join(" ")}
                                  data-testid="admin-lesson-public-field-editor"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100/72 pb-3">
                                    <div className="min-w-0">
                                      <h4 className={lessonMirrorSectionEyebrowClass}>
                                        Public lesson mirror
                                      </h4>
                                      <p className="mt-1 truncate text-sm font-semibold text-[color:var(--fs-color-ink-strong)]">
                                        {editFormState.title || item.title}
                                      </p>
                                    </div>
                                    <span className="inline-flex min-h-8 items-center rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                                      Lesson editor
                                    </span>
                                  </div>

                                  <div
                                    className={lessonMirrorShellClass}
                                    data-testid="admin-lesson-experience-editor"
                                  >
                                    <section
                                      className={["space-y-3", activePanelClass].join(" ")}
                                      aria-label="Lesson container layout"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                          <p className={lessonMirrorSectionEyebrowClass}>
                                            Public sections
                                          </p>
                                        </div>
                                        <label
                                          className={[compactLabelClass, "min-w-[240px]"].join(" ")}
                                        >
                                          <span>Lesson experience layout</span>
                                          <select
                                            aria-label="Lesson experience layout"
                                            value={
                                              editFormState.lessonBody.lessonExperience.variant
                                            }
                                            onChange={(event) =>
                                              updateLessonExperienceVariant(
                                                event.target.value as LessonExperienceVariantOption
                                              )
                                            }
                                            className={compactFieldClass}
                                          >
                                            {LESSON_EXPERIENCE_VARIANT_OPTIONS.map((option) => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                      </div>
                                    </section>

                                    <fieldset
                                      className={["space-y-3", lessonMirrorCardClass].join(" ")}
                                    >
                                      <legend className="w-full">
                                        <span className="flex flex-wrap items-center justify-between gap-2">
                                          <span className={lessonMirrorSectionEyebrowClass}>
                                            Video / estimated time
                                          </span>
                                        </span>
                                      </legend>
                                      <div className="grid gap-3 sm:grid-cols-2">
                                        <label className={compactLabelClass}>
                                          <span>Video ID</span>
                                          <input
                                            aria-label="Video ID"
                                            type="text"
                                            value={editFormState.lessonBody.youtubeId}
                                            onChange={(event) =>
                                              updateLessonBodyField("youtubeId", event.target.value)
                                            }
                                            className={compactFieldClass}
                                            placeholder="Xh6OblO06LY"
                                          />
                                        </label>

                                        <label className={compactLabelClass}>
                                          <span>Estimated minutes</span>
                                          <input
                                            aria-label="Estimated minutes"
                                            type="number"
                                            min={1}
                                            max={240}
                                            step={1}
                                            value={editFormState.lessonBody.estMinutes}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "estMinutes",
                                                event.target.value
                                              )
                                            }
                                            className={compactFieldClass}
                                            placeholder="3"
                                          />
                                        </label>
                                      </div>
                                    </fieldset>

                                    <details
                                      className={["space-y-3", lessonMirrorCardClass].join(" ")}
                                    >
                                      <summary className={compactDetailsSummaryClass}>
                                        Video planning notes
                                      </summary>
                                      <label className={["mt-3", compactLabelClass].join(" ")}>
                                        <span>Video script notes</span>
                                        <textarea
                                          aria-label="Video script notes"
                                          rows={5}
                                          value={editFormState.lessonBody.videoPlanningNotes}
                                          onChange={(event) =>
                                            updateLessonBodyField(
                                              "videoPlanningNotes",
                                              event.target.value
                                            )
                                          }
                                          className={textAreaClass}
                                          placeholder="Opening line, key demo shots, camera notes, retake reminders..."
                                        />
                                      </label>
                                    </details>

                                    <section
                                      className={["space-y-4", lessonMirrorLargeCardClass].join(
                                        " "
                                      )}
                                      aria-label="Lesson"
                                    >
                                      <div className="flex flex-wrap items-start justify-between gap-2">
                                        <div>
                                          <p className={lessonMirrorSectionEyebrowClass}>Lesson</p>
                                        </div>
                                      </div>

                                      <div className="grid gap-4 border-t border-slate-200/72 pt-4 lg:grid-cols-2 lg:divide-x lg:divide-slate-200/72">
                                        <label
                                          className={[compactLabelClass, "space-y-2"].join(" ")}
                                        >
                                          <span
                                            className={[
                                              lessonMirrorSectionEyebrowClass,
                                              "flex min-h-7 items-center",
                                            ].join(" ")}
                                          >
                                            Goal
                                          </span>
                                          <textarea
                                            aria-label="Lesson goal"
                                            rows={3}
                                            value={editFormState.lessonBody.goal}
                                            onChange={(event) =>
                                              updateLessonBodyField("goal", event.target.value)
                                            }
                                            className={lessonMirrorFocusTextareaClass}
                                          />
                                        </label>

                                        <div className="space-y-2 lg:pl-5">
                                          <div className={lessonMirrorHeaderRowClass}>
                                            <p className={lessonMirrorSectionEyebrowClass}>
                                              Quick explanation
                                            </p>
                                            {renderLessonSectionVisibilityToggle(
                                              "quickExplanation",
                                              "Quick explanation"
                                            )}
                                          </div>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .quickExplanation ? (
                                            <label className={compactLabelClass}>
                                              <span className="sr-only">Quick explanation</span>
                                              <textarea
                                                aria-label="Quick explanation"
                                                rows={3}
                                                value={
                                                  editFormState.lessonBody.lessonExperience
                                                    .quickExplanation
                                                }
                                                onChange={(event) =>
                                                  updateLessonExperienceField(
                                                    "quickExplanation",
                                                    event.target.value
                                                  )
                                                }
                                                className={lessonMirrorFocusTextareaClass}
                                                placeholder="One plain-language explanation of what the swimmer should do."
                                              />
                                            </label>
                                          ) : (
                                            renderHiddenLessonSectionNotice("Quick explanation")
                                          )}
                                        </div>
                                      </div>

                                      <div
                                        className={["space-y-3", lessonMirrorSoftCalloutClass].join(
                                          " "
                                        )}
                                      >
                                        <div className={lessonMirrorHeaderRowClass}>
                                          <p className="text-[13px] font-bold tracking-wide text-blue-700 uppercase">
                                            Why this matters
                                          </p>
                                          {renderLessonSectionVisibilityToggle(
                                            "whyThisMatters",
                                            "Why this matters"
                                          )}
                                        </div>
                                        {editFormState.lessonBody.lessonExperience.display
                                          .whyThisMatters ? (
                                          <label className={compactLabelClass}>
                                            <span className="sr-only">Why this matters</span>
                                            <textarea
                                              aria-label="Why this matters"
                                              rows={3}
                                              value={
                                                editFormState.lessonBody.lessonExperience
                                                  .whyThisMatters
                                              }
                                              onChange={(event) =>
                                                updateLessonExperienceField(
                                                  "whyThisMatters",
                                                  event.target.value
                                                )
                                              }
                                              className={lessonMirrorComfortTextareaClass}
                                            />
                                          </label>
                                        ) : (
                                          renderHiddenLessonSectionNotice("Why this matters")
                                        )}
                                      </div>
                                    </section>

                                    <div className="grid gap-3 lg:grid-cols-2">
                                      <fieldset
                                        className={[
                                          "space-y-3",
                                          lessonMirrorPracticeCardClass,
                                        ].join(" ")}
                                      >
                                        <legend className="sr-only">Dryland practice</legend>
                                        <div className="space-y-4">
                                          <div className={lessonMirrorPracticeHeaderClass}>
                                            <div className={lessonMirrorHeaderRowClass}>
                                              <p className={lessonMirrorSectionEyebrowClass}>
                                                Dryland practice
                                              </p>
                                              {renderLessonSectionVisibilityToggle(
                                                "landPractice",
                                                "Dryland practice"
                                              )}
                                            </div>
                                            {editFormState.lessonBody.lessonExperience.display
                                              .landPractice
                                              ? renderLessonPracticeVisualPlaceholder("land")
                                              : null}
                                          </div>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .landPractice ? (
                                            <>
                                              <div className="space-y-3 px-1 pb-2 sm:px-2">
                                                <label className={compactLabelClass}>
                                                  <span>Title</span>
                                                  <input
                                                    aria-label="Dryland practice title"
                                                    type="text"
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .landPracticeTitle
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "landPracticeTitle",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={compactFieldClass}
                                                  />
                                                </label>
                                                <label className={compactLabelClass}>
                                                  <span>Steps</span>
                                                  <textarea
                                                    aria-label="Dryland practice steps (one per line)"
                                                    rows={4}
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .landPracticeSteps
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "landPracticeSteps",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={textAreaClass}
                                                  />
                                                </label>
                                                <label className={compactLabelClass}>
                                                  <span className="flex flex-wrap items-center justify-between gap-2">
                                                    <span>Safety note</span>
                                                    {renderLessonSafetyNoteVisibilityToggle(
                                                      "landSafetyNote",
                                                      "Dryland practice"
                                                    )}
                                                  </span>
                                                  <textarea
                                                    aria-label="Dryland practice safety note"
                                                    rows={2}
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .landPracticeSafetyNote
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "landPracticeSafetyNote",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={lessonMirrorComfortTextareaClass}
                                                  />
                                                </label>
                                              </div>
                                            </>
                                          ) : (
                                            renderHiddenLessonSectionNotice("Dryland practice")
                                          )}
                                        </div>
                                      </fieldset>

                                      <fieldset
                                        className={[
                                          "space-y-3",
                                          lessonMirrorWaterPracticeCardClass,
                                        ].join(" ")}
                                      >
                                        <legend className="sr-only">
                                          Pool drill / water practice
                                        </legend>
                                        <div className="space-y-4">
                                          <div className={lessonMirrorPracticeHeaderClass}>
                                            <div className={lessonMirrorHeaderRowClass}>
                                              <p className={lessonMirrorSectionEyebrowClass}>
                                                Pool drill
                                              </p>
                                              {renderLessonSectionVisibilityToggle(
                                                "waterPractice",
                                                "Pool drill / water practice"
                                              )}
                                            </div>
                                            {editFormState.lessonBody.lessonExperience.display
                                              .waterPractice
                                              ? renderLessonPracticeVisualPlaceholder("water")
                                              : null}
                                          </div>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .waterPractice ? (
                                            <>
                                              <div className="space-y-3 px-1 pb-2 sm:px-2">
                                                <label className={compactLabelClass}>
                                                  <span>Title</span>
                                                  <input
                                                    aria-label="Pool drill title"
                                                    type="text"
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .waterPracticeTitle
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "waterPracticeTitle",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={compactFieldClass}
                                                  />
                                                </label>
                                                <label className={compactLabelClass}>
                                                  <span>Steps</span>
                                                  <textarea
                                                    aria-label="Pool drill steps (one per line)"
                                                    rows={4}
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .waterPracticeSteps
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "waterPracticeSteps",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={textAreaClass}
                                                  />
                                                </label>
                                                <label className={compactLabelClass}>
                                                  <span className="flex flex-wrap items-center justify-between gap-2">
                                                    <span>Safety note</span>
                                                    {renderLessonSafetyNoteVisibilityToggle(
                                                      "waterSafetyNote",
                                                      "Water practice"
                                                    )}
                                                  </span>
                                                  <textarea
                                                    aria-label="Water practice safety note"
                                                    rows={2}
                                                    value={
                                                      editFormState.lessonBody.lessonExperience
                                                        .waterPracticeSafetyNote
                                                    }
                                                    onChange={(event) =>
                                                      updateLessonExperienceField(
                                                        "waterPracticeSafetyNote",
                                                        event.target.value
                                                      )
                                                    }
                                                    className={lessonMirrorComfortTextareaClass}
                                                  />
                                                </label>
                                              </div>
                                            </>
                                          ) : (
                                            renderHiddenLessonSectionNotice(
                                              "Pool drill / water practice"
                                            )
                                          )}
                                        </div>
                                      </fieldset>
                                    </div>

                                    <section
                                      className={["space-y-4", lessonMirrorCoachCheckClass].join(
                                        " "
                                      )}
                                      aria-label="Coach check"
                                    >
                                      <div className={lessonMirrorHeaderRowClass}>
                                        <p className="text-[12px] font-semibold tracking-wide text-blue-700 uppercase">
                                          Coach check
                                        </p>
                                      </div>

                                      <div className="space-y-4">
                                        <div className="space-y-3">
                                          <div className={lessonMirrorHeaderRowClass}>
                                            <p className={lessonMirrorSectionEyebrowClass}>
                                              What good looks and feels like
                                            </p>
                                            {renderLessonSectionVisibilityToggle(
                                              "feelCues",
                                              "What good looks and feels like",
                                              "Cues"
                                            )}
                                          </div>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .feelCues ? (
                                            <label className={compactLabelClass}>
                                              <span className="sr-only">
                                                What good looks and feels like (one per line)
                                              </span>
                                              <textarea
                                                aria-label="What good looks and feels like (one per line)"
                                                rows={3}
                                                value={
                                                  editFormState.lessonBody.lessonExperience.feelCues
                                                }
                                                onChange={(event) =>
                                                  updateLessonExperienceField(
                                                    "feelCues",
                                                    event.target.value
                                                  )
                                                }
                                                className={lessonMirrorComfortTextareaClass}
                                              />
                                            </label>
                                          ) : (
                                            renderHiddenLessonSectionNotice(
                                              "What good looks and feels like"
                                            )
                                          )}
                                        </div>

                                        <div className="space-y-3">
                                          <div className={lessonMirrorHeaderRowClass}>
                                            <p className={lessonMirrorSectionEyebrowClass}>
                                              Common mistakes
                                            </p>
                                            {renderLessonSectionVisibilityToggle(
                                              "commonMistakes",
                                              "Common mistakes",
                                              "Mistakes"
                                            )}
                                          </div>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .commonMistakes ? (
                                            <>
                                              <div className="space-y-2">
                                                {editFormState.lessonBody.lessonExperience.commonMistakes.map(
                                                  (row, mistakeIndex) => (
                                                    <div
                                                      key={mistakeIndex}
                                                      className={[
                                                        "grid gap-2",
                                                        lessonMirrorCoachCheckRowClass,
                                                      ].join(" ")}
                                                    >
                                                      <div className="grid gap-2 sm:grid-cols-2">
                                                        <label
                                                          className={[
                                                            compactLabelClass,
                                                            lessonMirrorAvoidFieldClass,
                                                          ].join(" ")}
                                                        >
                                                          <span>
                                                            Common mistake {mistakeIndex + 1}
                                                          </span>
                                                          <textarea
                                                            aria-label={`Common mistake ${mistakeIndex + 1}`}
                                                            rows={2}
                                                            value={row.mistake}
                                                            onChange={(event) =>
                                                              updateLessonExperienceMistakeRow(
                                                                mistakeIndex,
                                                                "mistake",
                                                                event.target.value
                                                              )
                                                            }
                                                            className={textAreaClass}
                                                          />
                                                        </label>
                                                        <label
                                                          className={[
                                                            compactLabelClass,
                                                            lessonMirrorFixFieldClass,
                                                          ].join(" ")}
                                                        >
                                                          <span>Correction {mistakeIndex + 1}</span>
                                                          <textarea
                                                            aria-label={`Correction ${mistakeIndex + 1}`}
                                                            rows={2}
                                                            value={row.fix}
                                                            onChange={(event) =>
                                                              updateLessonExperienceMistakeRow(
                                                                mistakeIndex,
                                                                "fix",
                                                                event.target.value
                                                              )
                                                            }
                                                            className={textAreaClass}
                                                          />
                                                        </label>
                                                      </div>
                                                      <div className="flex justify-end">
                                                        <button
                                                          type="button"
                                                          onClick={() =>
                                                            removeLessonExperienceMistakeRow(
                                                              mistakeIndex
                                                            )
                                                          }
                                                          className={compactSecondaryActionClass}
                                                        >
                                                          Remove row
                                                        </button>
                                                      </div>
                                                    </div>
                                                  )
                                                )}
                                              </div>
                                              <button
                                                type="button"
                                                onClick={addLessonExperienceMistakeRow}
                                                className={compactSuccessActionClass}
                                              >
                                                Add mistake row
                                              </button>
                                            </>
                                          ) : (
                                            renderHiddenLessonSectionNotice("Common mistakes")
                                          )}
                                        </div>
                                      </div>
                                    </section>

                                    <section
                                      className={["space-y-3", lessonMirrorReadyCheckClass].join(
                                        " "
                                      )}
                                      aria-label="Ready check"
                                    >
                                      <div className={lessonMirrorHeaderRowClass}>
                                        <p className="text-[12px] font-semibold tracking-wide text-blue-700 uppercase">
                                          Ready check
                                        </p>
                                        <div className="flex flex-wrap items-center gap-2">
                                          {renderLessonSectionVisibilityToggle(
                                            "nextStep",
                                            "Next step",
                                            "Next"
                                          )}
                                          {renderLessonSectionVisibilityToggle(
                                            "support",
                                            "Support card",
                                            "Support"
                                          )}
                                        </div>
                                      </div>

                                      <div className="grid gap-3 lg:grid-cols-2">
                                        <label
                                          className={[
                                            compactLabelClass,
                                            "block",
                                            lessonMirrorReadyFieldClass,
                                          ].join(" ")}
                                        >
                                          <span className={lessonMirrorSectionEyebrowClass}>
                                            Pass criteria
                                          </span>
                                          <textarea
                                            aria-label="Pass criteria (one per line)"
                                            rows={3}
                                            value={editFormState.lessonBody.passCriteria}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "passCriteria",
                                                event.target.value
                                              )
                                            }
                                            className={lessonMirrorComfortTextareaClass}
                                            placeholder="Do not mark done before you can swim 12.5m relaxed."
                                          />
                                        </label>

                                        <div
                                          className={[
                                            "space-y-2",
                                            lessonMirrorReadyFieldClass,
                                          ].join(" ")}
                                        >
                                          <p className={lessonMirrorSectionEyebrowClass}>
                                            Next step
                                          </p>
                                          {editFormState.lessonBody.lessonExperience.display
                                            .nextStep ? (
                                            <label className={compactLabelClass}>
                                              <span className="sr-only">Next step</span>
                                              <textarea
                                                aria-label="Next step"
                                                rows={3}
                                                value={
                                                  editFormState.lessonBody.lessonExperience.nextStep
                                                }
                                                onChange={(event) =>
                                                  updateLessonExperienceField(
                                                    "nextStep",
                                                    event.target.value
                                                  )
                                                }
                                                className={lessonMirrorComfortTextareaClass}
                                              />
                                            </label>
                                          ) : (
                                            renderHiddenLessonSectionNotice("Next step")
                                          )}
                                        </div>
                                      </div>

                                      <div
                                        className={[
                                          "space-y-3",
                                          lessonMirrorSupportFieldClass,
                                        ].join(" ")}
                                      >
                                        <div className={lessonMirrorHeaderRowClass}>
                                          <p className={lessonMirrorSectionEyebrowClass}>
                                            Support card
                                          </p>
                                        </div>
                                        {editFormState.lessonBody.lessonExperience.display
                                          .support ? (
                                          <div className="grid gap-3 lg:grid-cols-[minmax(180px,0.72fr)_minmax(0,1.28fr)]">
                                            <label className={compactLabelClass}>
                                              <span>Support card title</span>
                                              <input
                                                aria-label="Support card title"
                                                type="text"
                                                value={
                                                  editFormState.lessonBody.lessonExperience
                                                    .supportTitle
                                                }
                                                onChange={(event) =>
                                                  updateLessonExperienceField(
                                                    "supportTitle",
                                                    event.target.value
                                                  )
                                                }
                                                className={compactFieldClass}
                                              />
                                            </label>
                                            <label className={compactLabelClass}>
                                              <span>Support card body</span>
                                              <textarea
                                                aria-label="Support card body"
                                                rows={3}
                                                value={
                                                  editFormState.lessonBody.lessonExperience
                                                    .supportBody
                                                }
                                                onChange={(event) =>
                                                  updateLessonExperienceField(
                                                    "supportBody",
                                                    event.target.value
                                                  )
                                                }
                                                className={lessonMirrorComfortTextareaClass}
                                              />
                                            </label>
                                          </div>
                                        ) : (
                                          renderHiddenLessonSectionNotice("Support card")
                                        )}
                                      </div>
                                    </section>

                                    <details className={["space-y-3", nestedPanelClass].join(" ")}>
                                      <summary className={compactDetailsSummaryClass}>
                                        <span>Admin/list fallback</span>
                                        {renderLessonContentScopeBadge("Admin/list only")}
                                      </summary>
                                      <label className={compactLabelClass}>
                                        <span>Summary</span>
                                        <textarea
                                          aria-label="Summary"
                                          rows={3}
                                          value={editFormState.summary}
                                          onChange={(event) =>
                                            setEditFormState((prev) =>
                                              prev ? { ...prev, summary: event.target.value } : prev
                                            )
                                          }
                                          className={textAreaClass}
                                        />
                                      </label>
                                    </details>

                                    <details className={["space-y-3", nestedPanelClass].join(" ")}>
                                      <summary className={compactDetailsSummaryClass}>
                                        <span>Technical fallback fields</span>
                                        {renderLessonContentScopeBadge("Technical fallback")}
                                      </summary>

                                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                        <div
                                          className={[compactLabelClass, "sm:col-span-2"].join(" ")}
                                        >
                                          <span>Lesson runtime ID</span>
                                          <div className={readOnlyValueClass}>
                                            <code>{editFormState.lessonBody.lessonId}</code>
                                          </div>
                                        </div>

                                        <label className={compactLabelClass}>
                                          <span>Lesson type</span>
                                          <select
                                            aria-label="Lesson type"
                                            value={editFormState.lessonBody.lessonType}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "lessonType",
                                                event.target.value as LessonTypeOption
                                              )
                                            }
                                            className={compactFieldClass}
                                          >
                                            {LESSON_TYPE_OPTIONS.map((option) => (
                                              <option
                                                key={option.value || "empty"}
                                                value={option.value}
                                              >
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                        </label>

                                        <label
                                          className={[compactLabelClass, "sm:col-span-2"].join(" ")}
                                        >
                                          <span>Section badge label (optional)</span>
                                          <input
                                            aria-label="Section badge label (optional)"
                                            type="text"
                                            value={editFormState.lessonBody.drillLabel}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "drillLabel",
                                                event.target.value
                                              )
                                            }
                                            className={compactFieldClass}
                                            placeholder="Defaults to Learn / Drill / Swim"
                                          />
                                        </label>

                                        <label
                                          className={[compactLabelClass, "sm:col-span-2"].join(" ")}
                                        >
                                          <span>
                                            Extra help start lesson number in module (optional)
                                          </span>
                                          <input
                                            aria-label="Extra help start lesson number in module (optional)"
                                            type="number"
                                            min={1}
                                            max={200}
                                            step={1}
                                            value={
                                              editFormState.lessonBody.supportStartAtLessonInModule
                                            }
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "supportStartAtLessonInModule",
                                                event.target.value
                                              )
                                            }
                                            className={compactFieldClass}
                                            placeholder="Example: 4"
                                          />
                                        </label>

                                        <fieldset
                                          className={[
                                            "space-y-2 sm:col-span-2",
                                            mutedPanelClass,
                                          ].join(" ")}
                                        >
                                          <legend className={metadataLabelClass}>
                                            Extra help actions
                                          </legend>
                                          <div className="grid gap-2 sm:grid-cols-2">
                                            {[
                                              ["supportActionVideoAnalysis", "Show Video Analysis"],
                                              ["supportActionPoolsideGuide", "Show Poolside guide"],
                                              ["supportActionGuide0To1000", "Show 0-1000 guide"],
                                              ["supportActionContact", "Show Contact"],
                                            ].map(([key, label]) => (
                                              <label
                                                key={key}
                                                className="inline-flex items-center gap-2 text-xs font-semibold text-[color:var(--fs-color-ink)]"
                                              >
                                                <input
                                                  type="checkbox"
                                                  checked={Boolean(
                                                    editFormState.lessonBody?.[
                                                      key as keyof LessonBodyEditState
                                                    ]
                                                  )}
                                                  onChange={(event) =>
                                                    updateLessonBodyField(
                                                      key as keyof LessonBodyEditState,
                                                      event.target
                                                        .checked as LessonBodyEditState[keyof LessonBodyEditState]
                                                    )
                                                  }
                                                  className={compactCheckboxClass}
                                                />
                                                <span>{label}</span>
                                              </label>
                                            ))}
                                          </div>

                                          <label className={compactLabelClass}>
                                            <span>Primary highlighted action (optional)</span>
                                            <select
                                              value={editFormState.lessonBody.supportPrimaryAction}
                                              onChange={(event) =>
                                                updateLessonBodyField(
                                                  "supportPrimaryAction",
                                                  event.target.value as SupportPrimaryActionOption
                                                )
                                              }
                                              className={compactFieldClass}
                                            >
                                              <option value="">None (all neutral)</option>
                                              {SUPPORT_ACTION_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                  {option.label}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                        </fieldset>

                                        <label className={compactLabelClass}>
                                          <span>Legacy cues (one per line)</span>
                                          <textarea
                                            aria-label="Legacy cues (one per line)"
                                            rows={4}
                                            value={editFormState.lessonBody.cues}
                                            onChange={(event) =>
                                              updateLessonBodyField("cues", event.target.value)
                                            }
                                            className={textAreaClass}
                                          />
                                        </label>

                                        <label className={compactLabelClass}>
                                          <span>Legacy common mistakes (one per line)</span>
                                          <textarea
                                            aria-label="Legacy common mistakes (one per line)"
                                            rows={4}
                                            value={editFormState.lessonBody.commonMistakes}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "commonMistakes",
                                                event.target.value
                                              )
                                            }
                                            className={textAreaClass}
                                          />
                                        </label>

                                        <label className={compactLabelClass}>
                                          <span>Legacy drill title</span>
                                          <input
                                            aria-label="Legacy drill title"
                                            type="text"
                                            value={editFormState.lessonBody.drillTitle}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "drillTitle",
                                                event.target.value
                                              )
                                            }
                                            className={compactFieldClass}
                                          />
                                        </label>

                                        <label
                                          className={[compactLabelClass, "sm:col-span-2"].join(" ")}
                                        >
                                          <span>Legacy drill steps (one per line)</span>
                                          <textarea
                                            aria-label="Legacy drill steps (one per line)"
                                            rows={4}
                                            value={editFormState.lessonBody.drillSteps}
                                            onChange={(event) =>
                                              updateLessonBodyField(
                                                "drillSteps",
                                                event.target.value
                                              )
                                            }
                                            className={textAreaClass}
                                          />
                                        </label>

                                        <label
                                          className={[compactLabelClass, "sm:col-span-2"].join(" ")}
                                        >
                                          <span>Legacy next step fallback</span>
                                          <textarea
                                            aria-label="Legacy next step fallback"
                                            rows={3}
                                            value={editFormState.lessonBody.nextStep}
                                            onChange={(event) =>
                                              updateLessonBodyField("nextStep", event.target.value)
                                            }
                                            className={textAreaClass}
                                          />
                                        </label>
                                      </div>
                                    </details>
                                  </div>
                                </div>
                              </>
                            ) : null}
                          </div>

                          {editNotesContext ? (
                            <AdminContextNotesPanel
                              contextType={editNotesContext.contextType}
                              contextRef={editNotesContext.contextRef}
                              contextLabel={editNotesContext.contextLabel}
                              includeModuleContextForCourseLesson={
                                editNotesContext.includeModuleContextForCourseLesson
                              }
                              collapsedByDefault
                              className="mt-3"
                            />
                          ) : null}

                          {editQrContext ? (
                            <AdminContextQrPanel
                              contentItemId={editQrContext.contentItemId}
                              contentLabel={editQrContext.contentLabel}
                              slugHint={editQrContext.slugHint}
                              destinationPath={editQrContext.destinationPath}
                              placementKey={editQrContext.placementKey}
                              destinationHelpText={editQrContext.destinationHelpText}
                              collapsedByDefault
                              className="mt-3"
                            />
                          ) : null}

                          {isEditDirty ? (
                            <AdminManagerState
                              tone="warning"
                              density="compact"
                              className="!mt-3"
                              testId="admin-content-edit-dirty-state"
                            >
                              You have unsaved changes.
                            </AdminManagerState>
                          ) : null}

                          {editError ? (
                            <AdminManagerState
                              tone="error"
                              announcement="polite"
                              density="compact"
                              className="!mt-3"
                              testId="admin-content-edit-error-state"
                            >
                              {editError}
                            </AdminManagerState>
                          ) : null}

                          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap [&>*:last-child:nth-child(odd)]:col-span-2">
                            <button
                              type="button"
                              onClick={() => void handleSaveEdit(item)}
                              disabled={Boolean(rowBusy)}
                              className={[compactPrimaryActionClass, "w-full sm:w-auto"].join(" ")}
                            >
                              {savingEditId === item.id ? "Saving…" : "Save changes"}
                            </button>
                            {rowPreviewHref ? (
                              <a
                                href={rowPreviewHref}
                                target="_blank"
                                rel="noreferrer"
                                className={[compactWarningActionClass, "w-full sm:w-auto"].join(
                                  " "
                                )}
                              >
                                View changes
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => {
                                closeEditMode();
                              }}
                              disabled={Boolean(rowBusy)}
                              className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                " "
                              )}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex w-full flex-col items-end gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                      <span className={metadataClass}>Order: {item.sort_order}</span>
                      <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end [&>*:last-child:nth-child(odd)]:col-span-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleStartEdit(item);
                          }}
                          disabled={Boolean(rowBusy) || (Boolean(editingItemId) && !isEditingRow)}
                          className={[compactPrimaryActionClass, "w-full sm:w-auto"].join(" ")}
                        >
                          {isEditingRow ? "Editing" : isInlineEditable ? "Edit" : "Edit (soon)"}
                        </button>
                        {!isEditingRow ? (
                          <>
                            {item.content_type === "course_module" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleMoveModule(item.id, "up")}
                                  disabled={Boolean(rowBusy) || !moduleMoveBounds?.canMoveUp}
                                  className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                    " "
                                  )}
                                >
                                  Move up
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleMoveModule(item.id, "down")}
                                  disabled={Boolean(rowBusy) || !moduleMoveBounds?.canMoveDown}
                                  className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                    " "
                                  )}
                                >
                                  Move down
                                </button>
                              </>
                            ) : null}
                            {item.content_type === "course_lesson" ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => void handleMoveLesson(item.id, "up")}
                                  disabled={Boolean(rowBusy) || !lessonMoveBounds?.canMoveUp}
                                  className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                    " "
                                  )}
                                >
                                  Move up
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void handleMoveLesson(item.id, "down")}
                                  disabled={Boolean(rowBusy) || !lessonMoveBounds?.canMoveDown}
                                  className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                    " "
                                  )}
                                >
                                  Move down
                                </button>
                              </>
                            ) : null}
                            {item.content_type === "course_lesson" ||
                            item.content_type === "course_module" ? (
                              rowPreviewHref ? (
                                <a
                                  href={rowPreviewHref}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={[compactWarningActionClass, "w-full sm:w-auto"].join(
                                    " "
                                  )}
                                >
                                  Open preview
                                </a>
                              ) : (
                                <span className="inline-flex min-h-9 w-full items-center justify-center rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/60 px-3 text-xs font-semibold text-[color:var(--fs-color-muted)] sm:w-auto">
                                  Open preview (no lessons)
                                </span>
                              )
                            ) : null}
                            {item.content_type === "course_lesson" ? (
                              <a
                                href={lessonQrPrefillHref(item)}
                                className={[compactSuccessActionClass, "w-full sm:w-auto"].join(
                                  " "
                                )}
                              >
                                Create QR link
                              </a>
                            ) : null}
                            {item.content_type === "course_lesson" ? (
                              <a
                                href={lessonOpenHref(item)}
                                target="_blank"
                                rel="noreferrer"
                                className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                  " "
                                )}
                              >
                                Open lesson
                              </a>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => void handleToggleRevisions(item.id)}
                              disabled={Boolean(rowBusy)}
                              className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                " "
                              )}
                            >
                              {openRevisionsItemId === item.id ? "Hide revisions" : "Revisions"}
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setOpenStatusActionsItemId((current) =>
                                  current === item.id ? null : item.id
                                )
                              }
                              aria-expanded={isStatusActionsOpen}
                              aria-controls={`admin-content-status-actions-panel-${item.id}`}
                              data-testid="admin-content-status-actions"
                              className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                " "
                              )}
                            >
                              {isStatusActionsOpen ? "Hide status actions" : "Status actions"}
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDelete(item)}
                              disabled={Boolean(rowBusy)}
                              className={[compactDangerActionClass, "w-full sm:w-auto"].join(" ")}
                            >
                              {deletingId === item.id ? "Deleting…" : "Delete"}
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  {!isEditingRow && isStatusActionsOpen ? (
                    <div
                      id={`admin-content-status-actions-panel-${item.id}`}
                      data-testid="admin-content-status-actions-panel"
                      className="mt-3 w-full rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-slate-50/72 p-2 sm:ml-auto sm:max-w-xl"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                        <p className={metadataLabelClass}>Lifecycle status</p>
                        <span className={metadataClass}>
                          Current: {STATUS_LABEL_BY_VALUE[item.status]}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:flex sm:flex-wrap sm:justify-end">
                        {STATUS_OPTIONS.filter((option) => option.value !== item.status).map(
                          (option) => (
                            <button
                              key={`${item.id}-${option.value}`}
                              type="button"
                              onClick={() => void handleSetStatus(item, option.value)}
                              disabled={Boolean(rowBusy)}
                              className={[compactSecondaryActionClass, "w-full sm:w-auto"].join(
                                " "
                              )}
                            >
                              {updatingId === item.id ? "Saving…" : statusActionLabel(option.value)}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  ) : null}
                  {openRevisionsItemId === item.id ? (
                    <div
                      className={["mt-3", nestedPanelClass].join(" ")}
                      data-testid="admin-content-revision-history-panel"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={metadataLabelClass}>Revision history</h4>
                      </div>
                      {isRevisionLoading ? (
                        <AdminManagerState tone="loading" density="compact" className="!mt-2">
                          Loading revisions…
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && revisionError ? (
                        <AdminManagerState
                          tone="error"
                          density="compact"
                          className="!mt-2"
                          actionsClassName="mt-2 flex flex-wrap gap-2"
                          actions={
                            <button
                              type="button"
                              onClick={() => void loadRevisionsForItem(item.id, true)}
                              className={compactSecondaryActionClass}
                            >
                              Retry
                            </button>
                          }
                        >
                          {revisionError}
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && !revisionError && revisionItems.length === 0 ? (
                        <AdminManagerState tone="empty" density="compact" className="!mt-2">
                          No revisions yet.
                        </AdminManagerState>
                      ) : null}
                      {!isRevisionLoading && !revisionError && revisionItems.length > 0 ? (
                        <ul className="mt-2 space-y-2">
                          {revisionItems.map((revision) => (
                            <li
                              key={revision.id}
                              data-testid="admin-content-revision-item"
                              className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/82 px-3 py-2"
                            >
                              <div>
                                <p className="text-xs font-semibold text-[color:var(--fs-color-ink-strong)]">
                                  Rev {revision.revisionNumber} · {revision.action}
                                </p>
                                <p className={["mt-1", metadataClass].join(" ")}>
                                  {revision.snapshotTitle} · {revision.snapshotStatus} ·{" "}
                                  {formatRevisionDate(revision.createdAt)}
                                </p>
                                <p className={["mt-1", metadataClass].join(" ")}>
                                  {revision.changedByEmail ?? "Unknown actor"}
                                </p>
                              </div>
                              {canRestoreByItemId[item.id] ? (
                                <button
                                  type="button"
                                  onClick={() => void handleRestoreRevision(item, revision.id)}
                                  disabled={
                                    Boolean(
                                      updatingId ||
                                      deletingId ||
                                      restoringRevisionId ||
                                      savingEditId
                                    ) || revision.action === "delete"
                                  }
                                  className={compactPrimaryActionClass}
                                >
                                  {restoringRevisionId === revision.id ? "Restoring…" : "Restore"}
                                </button>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>

      {pendingModuleDelete
        ? (() => {
            const alternativeModules = moduleOptions.filter(
              (option) => option.id !== pendingModuleDelete.moduleId
            );
            const canReassign = alternativeModules.length > 0;
            const requiresTargetModule =
              pendingModuleDelete.lessonCount > 0 && pendingModuleDelete.strategy === "reassign";
            const deleteDisabled =
              moduleDeleteSubmitting ||
              (requiresTargetModule &&
                (!pendingModuleDelete.targetModuleId ||
                  pendingModuleDelete.targetModuleId === pendingModuleDelete.moduleId));

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6">
                <div
                  className="fs-library-card w-full max-w-xl p-5 shadow-xl"
                  data-testid="admin-module-delete-dialog"
                >
                  <h3 className={headingClass}>Delete module</h3>
                  <p className="mt-2 text-sm text-[color:var(--fs-color-ink)]">
                    Delete <span className="font-semibold">{pendingModuleDelete.moduleTitle}</span>?
                    {pendingModuleDelete.lessonCount > 0
                      ? ` ${pendingModuleDelete.lessonCount} lesson${
                          pendingModuleDelete.lessonCount === 1 ? "" : "s"
                        } will be handled based on the strategy below.`
                      : " No lessons are currently linked to this module."}
                  </p>

                  {pendingModuleDelete.lessonCount > 0 ? (
                    <fieldset className={["mt-4 space-y-2", mutedPanelClass].join(" ")}>
                      <legend className="px-1 text-xs font-semibold text-[color:var(--fs-color-muted)]">
                        Lesson handling strategy
                      </legend>
                      <label className="flex items-start gap-2 text-sm text-[color:var(--fs-color-ink)]">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "reassign"}
                          disabled={!canReassign || moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous
                                ? {
                                    ...previous,
                                    strategy: "reassign",
                                    targetModuleId:
                                      previous.targetModuleId || alternativeModules[0]?.id || "",
                                  }
                                : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500"
                        />
                        <span>
                          Reassign lessons to another module
                          {!canReassign ? " (no target module available)" : ""}
                        </span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-[color:var(--fs-color-ink)]">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "archive_lessons"}
                          disabled={moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous ? { ...previous, strategy: "archive_lessons" } : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500"
                        />
                        <span>Archive lessons and unlink from module</span>
                      </label>
                      <label className="flex items-start gap-2 text-sm text-[color:var(--fs-color-ink)]">
                        <input
                          type="radio"
                          name="module-delete-strategy"
                          checked={pendingModuleDelete.strategy === "unlink_lessons"}
                          disabled={moduleDeleteSubmitting}
                          onChange={() =>
                            setPendingModuleDelete((previous) =>
                              previous ? { ...previous, strategy: "unlink_lessons" } : previous
                            )
                          }
                          className="mt-1 h-4 w-4 border border-[color:var(--fs-border-soft)] text-[color:var(--fs-color-brand-700)] focus:ring-blue-500"
                        />
                        <span>Unlink lessons only (keep current status)</span>
                      </label>

                      {pendingModuleDelete.strategy === "reassign" ? (
                        <label className={["mt-2 block", compactLabelClass].join(" ")}>
                          <span>Target module</span>
                          <select
                            value={pendingModuleDelete.targetModuleId}
                            onChange={(event) =>
                              setPendingModuleDelete((previous) =>
                                previous
                                  ? {
                                      ...previous,
                                      targetModuleId: event.target.value,
                                    }
                                  : previous
                              )
                            }
                            disabled={!canReassign || moduleDeleteSubmitting}
                            data-testid="admin-module-delete-target-select"
                            className={compactFieldClass}
                          >
                            <option value="">Select target module</option>
                            {alternativeModules.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      ) : null}
                    </fieldset>
                  ) : null}

                  <div className="mt-5 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={clearModuleDeleteDialog}
                      disabled={moduleDeleteSubmitting}
                      className={compactSecondaryActionClass}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => void confirmModuleDelete()}
                      disabled={deleteDisabled}
                      data-testid="admin-module-delete-confirm"
                      className={compactDangerActionClass}
                    >
                      {moduleDeleteSubmitting ? "Deleting module…" : "Delete module"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })()
        : null}

      {isAllContentView && !editingItemId ? (
        <section className={rowCardClass}>
          <h2 className={headingClass}>Create content item</h2>
          <p className={["mt-2", mutedTextClass].join(" ")}>
            Create and stage content records for modules, lessons, guides, pages, and product copy.
          </p>
          {!schemaReady ? (
            <AdminManagerState
              tone="warning"
              className="!mt-3"
              testId="admin-content-create-schema-warning-state"
            >
              Setup is not ready yet. Apply latest admin schema migrations before creating content.
            </AdminManagerState>
          ) : null}
          <form
            className="mt-5 grid gap-3 sm:grid-cols-2"
            onSubmit={handleCreate}
            data-testid="admin-content-create-form"
          >
            <fieldset
              disabled={!schemaReady || submitting}
              className="contents disabled:cursor-not-allowed disabled:opacity-70"
            >
              <label className={compactLabelClass}>
                <span>Type</span>
                <select
                  value={formState.contentType}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      contentType: e.target.value as AdminContentType,
                    }))
                  }
                  className={compactFieldClass}
                >
                  {CONTENT_TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className={compactLabelClass}>
                <span>Status</span>
                <select
                  value={formState.status}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      status: e.target.value as AdminContentStatus,
                    }))
                  }
                  className={compactFieldClass}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {formState.contentType === "course_lesson" ? (
                <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                  <span>Parent module</span>
                  <select
                    value={formState.parentId}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        parentId: e.target.value,
                      }))
                    }
                    className={compactFieldClass}
                  >
                    <option value="">Select module</option>
                    {moduleOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] font-normal text-[color:var(--fs-color-muted)]">
                    Lessons are now created with locked module context from the start. If you want a
                    different module, choose it here before saving.
                  </p>
                </label>
              ) : null}

              <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                <span>Title</span>
                <input
                  type="text"
                  required
                  value={formState.title}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  className={compactFieldClass}
                  placeholder="Module 1 foundations"
                />
              </label>

              <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                <span>Slug (optional)</span>
                <input
                  type="text"
                  value={formState.slug}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      slug: e.target.value,
                    }))
                  }
                  className={compactFieldClass}
                  placeholder="module-1-foundations"
                />
                {formState.contentType === "course_module" ||
                formState.contentType === "course_lesson" ? (
                  <p className="text-[11px] font-normal text-[color:var(--fs-color-muted)]">
                    Slug is the human-readable key and can be renamed later. Internal runtime IDs
                    are assigned separately and stay fixed after creation.
                  </p>
                ) : null}
              </label>

              <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                <span>Summary</span>
                <textarea
                  rows={3}
                  value={formState.summary}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                  className={textAreaClass}
                  placeholder="Short purpose or editor note."
                />
              </label>

              <label className={[compactLabelClass, "sm:col-span-2"].join(" ")}>
                <span>Category</span>
                <input
                  type="text"
                  list="admin-content-category-options"
                  value={formState.category}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className={compactFieldClass}
                  placeholder="General"
                />
                <datalist id="admin-content-category-options">
                  {categoryOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </label>

              {actionError ? (
                <AdminManagerState
                  tone="error"
                  announcement="polite"
                  density="compact"
                  className="!mt-0 sm:col-span-2"
                  testId="admin-content-action-error-state"
                >
                  {actionError}
                </AdminManagerState>
              ) : null}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={!schemaReady || submitting}
                  className={[compactPrimaryActionClass, "w-full sm:w-auto"].join(" ")}
                >
                  {submitting ? "Saving…" : "Save content item"}
                </button>
              </div>
            </fieldset>
          </form>
        </section>
      ) : null}
    </div>
  );
}
