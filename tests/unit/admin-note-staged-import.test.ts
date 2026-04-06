import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildAdminNoteAttachmentStoragePath as buildAppAttachmentStoragePath,
  validateAdminNoteAttachment,
} from "@/lib/admin/notes";
import {
  ADMIN_NOTE_ATTACHMENT_MAX_BYTES,
  ADMIN_NOTE_IMPORT_STAGING_DIR,
  buildAdminNoteAttachmentStoragePath as buildScriptAttachmentStoragePath,
  buildAdminNoteVerificationUrl,
  resolveStagedAttachmentPath,
  validateStagedAdminNoteAttachment,
} from "../../scripts/lib/admin-note-staged-import.mjs";

const tempRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    tempRoots.splice(0).map((tempRoot) =>
      rm(tempRoot, {
        recursive: true,
        force: true,
      })
    )
  );
});

async function createTempRepo() {
  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "admin-note-staged-import-"));
  tempRoots.push(tempRoot);
  await mkdir(path.join(tempRoot, ADMIN_NOTE_IMPORT_STAGING_DIR), { recursive: true });
  return tempRoot;
}

describe("admin note staged import helper", () => {
  it("matches the app attachment validation rules for supported and unsupported files", () => {
    const pngInput = {
      fileName: "Skjermbilde 01.PNG",
      sizeBytes: 128_000,
    };

    const appPng = validateAdminNoteAttachment({
      fileName: pngInput.fileName,
      mimeType: "image/png",
      sizeBytes: pngInput.sizeBytes,
    });
    expect(appPng.ok).toBe(true);
    if (!appPng.ok) {
      throw new Error(appPng.error);
    }
    expect(validateStagedAdminNoteAttachment(pngInput)).toEqual(appPng.value);

    expect(() =>
      validateStagedAdminNoteAttachment({
        fileName: "notes.txt",
        sizeBytes: 10,
      })
    ).toThrow("Only PNG, JPEG, WEBP, and GIF images are allowed.");

    expect(() =>
      validateStagedAdminNoteAttachment({
        fileName: "huge.png",
        sizeBytes: ADMIN_NOTE_ATTACHMENT_MAX_BYTES + 1,
      })
    ).toThrow("Attachments must be 5 MB or smaller.");
  });

  it("uses the same storage-path contract as the app route", () => {
    const params = {
      noteId: "123e4567-e89b-42d3-a456-426614174000",
      attachmentId: "123e4567-e89b-42d3-a456-426614174111",
      fileName: "Skjermbilde 01.PNG",
    };

    expect(buildScriptAttachmentStoragePath(params)).toBe(buildAppAttachmentStoragePath(params));
  });

  it("builds direct admin verification links for open and done notes", () => {
    expect(
      buildAdminNoteVerificationUrl({
        noteId: "123E4567-E89B-42D3-A456-426614174000",
        isDone: false,
      })
    ).toBe(
      "https://freeswimming.org/admin?tab=notes&notesQuery=123e4567-e89b-42d3-a456-426614174000&notesStatus=open"
    );

    expect(
      buildAdminNoteVerificationUrl({
        noteId: "123e4567-e89b-42d3-a456-426614174000",
        isDone: true,
      })
    ).toBe(
      "https://freeswimming.org/admin?tab=notes&notesQuery=123e4567-e89b-42d3-a456-426614174000&notesStatus=done"
    );
  });

  it("accepts files inside the staging directory and rejects files outside it", async () => {
    const repoRoot = await createTempRepo();
    const stagedFile = path.join(repoRoot, ADMIN_NOTE_IMPORT_STAGING_DIR, "capture.png");
    const outsideFile = path.join(repoRoot, "capture.png");
    await writeFile(stagedFile, "png");
    await writeFile(outsideFile, "png");

    await expect(
      resolveStagedAttachmentPath(".tmp/admin-note-imports/capture.png", { repoRoot })
    ).resolves.toMatchObject({
      repoRelativePath: ".tmp/admin-note-imports/capture.png",
      sizeBytes: 3,
    });

    await expect(
      resolveStagedAttachmentPath("./capture.png", { repoRoot })
    ).rejects.toThrow("Staged file must live under .tmp/admin-note-imports.");
  });
});
