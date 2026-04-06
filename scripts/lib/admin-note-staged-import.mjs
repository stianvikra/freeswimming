import { existsSync, readFileSync } from "node:fs";
import { mkdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const ADMIN_NOTE_ATTACHMENT_BUCKET = "admin-note-attachments";
export const ADMIN_NOTE_ATTACHMENT_MAX_BYTES = 5 * 1024 * 1024;
export const ADMIN_NOTE_IMPORT_STAGING_DIR = ".tmp/admin-note-imports";
export const ADMIN_NOTE_ALLOWED_ATTACHMENT_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
];
export const ADMIN_NOTES_BASE_URL = "https://freeswimming.org";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EXTENSION_TO_MIME_TYPE = new Map([
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".gif", "image/gif"],
]);
const ENV_FILE_NAMES = [".env.local", ".env"];
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(SCRIPT_DIR, "..", "..");

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function isUuid(value) {
  return UUID_REGEX.test(value);
}

export function normalizeAdminNoteId(value) {
  const noteId = normalizeString(value).toLowerCase();
  if (!isUuid(noteId)) {
    throw new Error("A valid admin note ID is required.");
  }
  return noteId;
}

export function sanitizeAttachmentFileName(fileName) {
  const baseName = normalizeString(fileName)
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

  return baseName || "attachment";
}

export function inferAdminNoteAttachmentMimeType(fileName) {
  const extension = path.extname(normalizeString(fileName)).toLowerCase();
  return EXTENSION_TO_MIME_TYPE.get(extension) ?? null;
}

export function validateStagedAdminNoteAttachment(params) {
  const fileName = sanitizeAttachmentFileName(params.fileName);
  const mimeType = inferAdminNoteAttachmentMimeType(fileName);
  const sizeBytes = Number.isFinite(params.sizeBytes) ? Math.trunc(params.sizeBytes) : 0;

  if (!mimeType || !ADMIN_NOTE_ALLOWED_ATTACHMENT_MIME_TYPES.includes(mimeType)) {
    throw new Error("Only PNG, JPEG, WEBP, and GIF images are allowed.");
  }

  if (sizeBytes <= 0) {
    throw new Error("Attachment file is empty.");
  }

  if (sizeBytes > ADMIN_NOTE_ATTACHMENT_MAX_BYTES) {
    throw new Error(
      `Attachments must be ${Math.round(ADMIN_NOTE_ATTACHMENT_MAX_BYTES / (1024 * 1024))} MB or smaller.`
    );
  }

  return {
    fileName,
    mimeType,
    sizeBytes,
  };
}

export function buildAdminNoteAttachmentStoragePath(params) {
  const safeFileName = sanitizeAttachmentFileName(params.fileName);
  return `notes/${params.noteId}/${params.attachmentId}-${safeFileName}`;
}

export function buildAdminNoteVerificationUrl(params) {
  const searchParams = new URLSearchParams([
    ["tab", "notes"],
    ["notesQuery", normalizeAdminNoteId(params.noteId)],
    ["notesStatus", params.isDone ? "done" : "open"],
  ]);
  return `${ADMIN_NOTES_BASE_URL}/admin?${searchParams.toString()}`;
}

export function readEnvFileValue(name, options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  for (const fileName of ENV_FILE_NAMES) {
    const filePath = path.join(repoRoot, fileName);
    if (!existsSync(filePath)) continue;

    for (const line of readFileSync(filePath, "utf8").split(/\r?\n/)) {
      if (!line.startsWith(`${name}=`)) continue;

      let value = line.slice(name.length + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (value) return value;
    }
  }

  return null;
}

export function requireEnvValue(name, options = {}) {
  const env = options.env ?? process.env;
  const value = normalizeString(env[name] ?? "") || readEnvFileValue(name, options);
  if (!value) {
    throw new Error(`${name} is required for staged admin-note attachment import.`);
  }
  return value;
}

export async function ensureAdminNoteImportStagingDir(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const stagingDir = path.resolve(repoRoot, ADMIN_NOTE_IMPORT_STAGING_DIR);
  await mkdir(stagingDir, { recursive: true });
  return realpath(stagingDir);
}

export async function resolveStagedAttachmentPath(filePath, options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const resolvedRepoRoot = await realpath(repoRoot).catch(() => path.resolve(repoRoot));
  const rawPath = normalizeString(filePath);
  if (!rawPath) {
    throw new Error("A staged screenshot file path is required.");
  }

  const stagingDir = await ensureAdminNoteImportStagingDir({ repoRoot });
  const candidatePath = path.isAbsolute(rawPath)
    ? path.resolve(rawPath)
    : path.resolve(repoRoot, rawPath);

  let absolutePath;
  try {
    absolutePath = await realpath(candidatePath);
  } catch {
    throw new Error(`Staged file was not found: ${rawPath}`);
  }

  const withinStagingDir =
    absolutePath.startsWith(`${stagingDir}${path.sep}`) && absolutePath !== stagingDir;
  if (!withinStagingDir) {
    throw new Error(`Staged file must live under ${ADMIN_NOTE_IMPORT_STAGING_DIR}.`);
  }

  const fileStat = await stat(absolutePath);
  if (!fileStat.isFile()) {
    throw new Error(`Staged path is not a file: ${rawPath}`);
  }

  return {
    absolutePath,
    repoRelativePath: path.relative(resolvedRepoRoot, absolutePath) || rawPath,
    sizeBytes: fileStat.size,
  };
}

export function parseStagedAdminNoteImportArgs(argv) {
  const options = {
    noteId: "",
    filePath: "",
    help: false,
  };
  const positionals = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--help" || arg === "-h") {
      options.help = true;
      continue;
    }
    if (arg === "--note-id" || arg === "-n") {
      options.noteId = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg === "--file" || arg === "-f") {
      options.filePath = argv[index + 1] ?? "";
      index += 1;
      continue;
    }
    if (arg.startsWith("--note-id=")) {
      options.noteId = arg.slice("--note-id=".length);
      continue;
    }
    if (arg.startsWith("--file=")) {
      options.filePath = arg.slice("--file=".length);
      continue;
    }
    positionals.push(arg);
  }

  if (!options.noteId && positionals[0]) {
    options.noteId = positionals[0];
  }
  if (!options.filePath && positionals[1]) {
    options.filePath = positionals[1];
  }

  return options;
}
