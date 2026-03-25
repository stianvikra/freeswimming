import type { AdminNoteRow } from "@/lib/admin/notes";

type AdminNoteArtifactCandidate = Pick<AdminNoteRow, "title" | "body">;

export const ADMIN_NOTE_TEST_ARTIFACT_PREFIX = "[E2E Admin Note Artifact]";

const LEGACY_ARTIFACT_RULES: Array<{
  title: RegExp;
  bodies: string[];
}> = [
  {
    title: /^Dashboard Quick Note \d+-\d+$/,
    bodies: ["Dashboard-level quick capture from Playwright."],
  },
  {
    title: /^Plans Note \d+-\d+$/,
    bodies: ["Page-level admin note for plans."],
  },
  {
    title: /^Context Note(?: Updated)? \d+-\d+$/,
    bodies: ["Context note body from Playwright."],
  },
  {
    title: /^E2E Note(?: Updated)? \d+-\d+$/,
    bodies: ["Initial note body from Playwright.", "Updated note body from Playwright."],
  },
  {
    title: /^E2E Related Note \d+-\d+$/,
    bodies: ["Secondary note used for related-link flow."],
  },
];

export function buildAdminNoteTestArtifactScopePrefix(scope: string) {
  return `${ADMIN_NOTE_TEST_ARTIFACT_PREFIX}[${scope.trim().toLowerCase()}]`;
}

export function buildAdminNoteTestArtifactTitle(params: {
  scope: string;
  label: string;
  unique: string;
}) {
  const normalizedLabel = params.label.trim().replace(/\s+/g, " ");
  return `${buildAdminNoteTestArtifactScopePrefix(params.scope)} ${normalizedLabel} ${params.unique}`;
}

export function isLegacyAdminNoteTestArtifact(note: AdminNoteArtifactCandidate) {
  const title = note.title.trim();
  const body = note.body?.trim() ?? "";

  return LEGACY_ARTIFACT_RULES.some((rule) => rule.title.test(title) && rule.bodies.includes(body));
}

export function isAdminNoteTestArtifactForScope(note: AdminNoteArtifactCandidate, scope: string) {
  return note.title.trim().startsWith(buildAdminNoteTestArtifactScopePrefix(scope));
}

export function isAdminNoteTestArtifact(note: AdminNoteArtifactCandidate) {
  return note.title.trim().startsWith(ADMIN_NOTE_TEST_ARTIFACT_PREFIX)
    ? true
    : isLegacyAdminNoteTestArtifact(note);
}
