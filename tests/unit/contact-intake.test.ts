import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildContactNotificationPayload,
  buildPrivacySafeRequestMetadata,
  resolveContactIntakeStorageMode,
  storeContactIntakeMessage,
} from "@/lib/admin/contact-intake";

function env(values: Record<string, string>): NodeJS.ProcessEnv {
  return {
    NODE_ENV: "test",
    ...values,
  } as NodeJS.ProcessEnv;
}

describe("contact intake storage contract", () => {
  it("uses explicit local verify storage only outside production", () => {
    expect(
      resolveContactIntakeStorageMode(
        env({
          CONTACT_INTAKE_STORAGE: "local_verify",
          FS_SUPABASE_ENV: "test",
        })
      )
    ).toBe("local_verify");

    expect(
      resolveContactIntakeStorageMode(
        env({
          CONTACT_INTAKE_STORAGE: "local_verify",
          FS_SUPABASE_ENV: "production",
        })
      )
    ).toBe("supabase");

    expect(
      resolveContactIntakeStorageMode(
        env({
          CONTACT_INTAKE_STORAGE: "local_verify",
          FS_SUPABASE_ENV: "test",
          VERCEL_ENV: "production",
        })
      )
    ).toBe("supabase");

    expect(
      resolveContactIntakeStorageMode(
        env({
          CONTACT_INTAKE_STORAGE: "local_verify",
          VERCEL_ENV: "preview",
        })
      )
    ).toBe("supabase");

    expect(
      resolveContactIntakeStorageMode({
        CONTACT_INTAKE_STORAGE: "local_verify",
        NODE_ENV: "production",
      } as NodeJS.ProcessEnv)
    ).toBe("supabase");
  });

  it("builds privacy-safe request metadata without raw IP or user agent", () => {
    const request = new Request("https://freeswimming.test/api/contact", {
      headers: {
        origin: "https://freeswimming.test/contact",
        "user-agent": "Specific Browser With Device Details",
        "content-length": "234",
      },
    });

    const metadata = buildPrivacySafeRequestMetadata(request, "203.0.113.42");

    expect(metadata.originHost).toBe("freeswimming.test");
    expect(metadata.contentLength).toBe(234);
    expect(metadata.ipHash).toEqual(expect.any(String));
    expect(metadata.userAgentHash).toEqual(expect.any(String));
    expect(JSON.stringify(metadata)).not.toContain("203.0.113.42");
    expect(JSON.stringify(metadata)).not.toContain("Specific Browser");
  });

  it("creates a disabled notification result when recipient config is missing", () => {
    const result = buildContactNotificationPayload({
      messageId: "message-1",
      attemptId: "attempt-1",
      sourceVariant: "contact",
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      messageBody: "This is a valid message.",
      structuredIntake: {},
      requestMetadata: { ipHash: "hash" },
      env: env({
        MESSAGE_DELIVERY_FROM_EMAIL: "Freeswimming <hello@freeswimming.org>",
      }),
    });

    expect(result).toEqual({
      ok: false,
      result: {
        providerKey: "disabled",
        status: "disabled",
        errorCode: "provider_config_missing",
        redactedErrorMessage: "Contact notification recipient is missing.",
      },
    });
  });

  it("builds provider payload from stored intake without raw request metadata", () => {
    const result = buildContactNotificationPayload({
      messageId: "message-1",
      attemptId: "attempt-1",
      sourceVariant: "goals_coaching",
      submitterName: "Test User",
      submitterEmail: "test@example.com",
      messageBody: "",
      structuredIntake: {
        primaryGoal: "1000m under 18:00",
        trainingDaysPerWeek: 3,
      },
      requestMetadata: { ipHash: "hashed-ip" },
      env: env({
        CONTACT_TO_EMAIL: "Support <support@example.com>",
        MESSAGE_DELIVERY_FROM_EMAIL: "Freeswimming <hello@freeswimming.org>",
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toMatchObject({
      attemptId: "attempt-1",
      target: "inbound_notification",
      messageId: "message-1",
      to: "Support <support@example.com>",
      from: "Freeswimming <hello@freeswimming.org>",
      replyTo: "test@example.com",
      subject: "Freeswimming - Goals coaching intake (Test User)",
    });
    expect(result.payload.text).toContain("IP hash: hashed-ip");
    expect(result.payload.text).toContain("primaryGoal: 1000m under 18:00");
  });

  it("persists local verify intake to a file for no-egress Playwright runs", async () => {
    const dir = await mkdtemp(join(tmpdir(), "freeswimming-contact-intake-test-"));
    const localFilePath = join(dir, "intake.jsonl");
    const result = await storeContactIntakeMessage(
      {
        sourceVariant: "preview_access_notify",
        submitterName: "Test User",
        submitterEmail: "test@example.com",
        messageBody: "",
        structuredIntake: {},
        requestMetadata: { ipHash: "hash" },
      },
      {
        localFilePath,
        env: env({
          CONTACT_INTAKE_STORAGE: "local_verify",
          FS_SUPABASE_ENV: "test",
        }),
      }
    );

    expect(result).toMatchObject({ ok: true, storageMode: "local_verify" });
    const file = await readFile(localFilePath, "utf8");
    expect(file).toContain('"type":"admin_message"');
    expect(file).toContain('"sourceVariant":"preview_access_notify"');
  });
});
