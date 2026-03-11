import { describe, expect, it } from "vitest";
import {
  canTransitionAdminEmailTemplateStatus,
  extractAdminEmailTemplatePlaceholders,
  parseCreateAdminEmailTemplatePayload,
  parseUpdateAdminEmailTemplatePayload,
  validateAdminEmailTemplatePlaceholders,
} from "@/lib/admin/email-templates";

describe("parseCreateAdminEmailTemplatePayload", () => {
  it("accepts valid payload with placeholder declarations", () => {
    const parsed = parseCreateAdminEmailTemplatePayload({
      templateKey: "auth_login_code",
      locale: "nb-NO",
      subject: "Din kode er {{code}}",
      body: "Bruk {{code}} innen {{expires_minutes}} minutter.",
      requiredPlaceholders: ["code"],
      optionalPlaceholders: ["expires_minutes"],
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.value.templateKey).toBe("auth_login_code");
    expect(parsed.value.status).toBe("draft");
    expect(parsed.value.requiredPlaceholders).toEqual(["code"]);
    expect(parsed.value.optionalPlaceholders).toEqual(["expires_minutes"]);
  });

  it("rejects invalid template key format", () => {
    const parsed = parseCreateAdminEmailTemplatePayload({
      templateKey: "Auth Login Code",
      locale: "nb-NO",
      subject: "Hei",
      body: "Body",
    });
    expect(parsed.ok).toBe(false);
  });
});

describe("extractAdminEmailTemplatePlaceholders", () => {
  it("extracts unique normalized placeholders from subject/body text", () => {
    const placeholders = extractAdminEmailTemplatePlaceholders(
      "Use {{ CODE }} and {{expires_minutes}}; code={{code}}"
    );
    expect(placeholders).toEqual(["code", "expires_minutes"]);
  });
});

describe("validateAdminEmailTemplatePlaceholders", () => {
  it("rejects undeclared placeholders and missing required placeholders", () => {
    const validation = validateAdminEmailTemplatePlaceholders({
      subject: "Kode: {{code}}",
      body: "Link: {{magic_link}}",
      requiredPlaceholders: ["code", "expires_minutes"],
      optionalPlaceholders: [],
    });

    expect(validation.ok).toBe(false);
    if (validation.ok) return;
    expect(validation.details.join(" ")).toContain("expires_minutes");
    expect(validation.details.join(" ")).toContain("magic_link");
  });

  it("passes when required/optional declarations match usage", () => {
    const validation = validateAdminEmailTemplatePlaceholders({
      subject: "Kode: {{code}}",
      body: "Bruk innen {{expires_minutes}} min.",
      requiredPlaceholders: ["code"],
      optionalPlaceholders: ["expires_minutes"],
    });
    expect(validation.ok).toBe(true);
  });
});

describe("parseUpdateAdminEmailTemplatePayload", () => {
  it("accepts patch fields with expectedUpdatedAt", () => {
    const parsed = parseUpdateAdminEmailTemplatePayload({
      subject: "Ny subject {{code}}",
      status: "review",
      expectedUpdatedAt: "2026-03-11T10:00:00.000Z",
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.value.patch.subject).toBe("Ny subject {{code}}");
    expect(parsed.value.patch.status).toBe("review");
    expect(parsed.value.expectedUpdatedAt).toBe("2026-03-11T10:00:00.000Z");
  });

  it("rejects payload without updatable fields", () => {
    const parsed = parseUpdateAdminEmailTemplatePayload({});
    expect(parsed.ok).toBe(false);
  });
});

describe("canTransitionAdminEmailTemplateStatus", () => {
  it("allows review -> published and blocks draft -> published", () => {
    expect(canTransitionAdminEmailTemplateStatus("review", "published")).toBe(true);
    expect(canTransitionAdminEmailTemplateStatus("draft", "published")).toBe(false);
  });
});
