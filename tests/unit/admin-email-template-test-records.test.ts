import { describe, expect, it } from "vitest";
import {
  ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIX,
  buildAdminEmailTemplateQaTestKey,
  isAdminEmailTemplateQaTestKey,
  isAdminEmailTemplateQaTestRecord,
  isLegacyAdminEmailTemplateQaTestKey,
} from "@/lib/admin/email-template-test-records";

describe("admin-email-template qa test record contract", () => {
  it("builds normalized qa template keys for automated coverage", () => {
    expect(
      buildAdminEmailTemplateQaTestKey({
        scope: "Preview Flow",
        unique: "1775443500161-42",
      })
    ).toBe(`${ADMIN_EMAIL_TEMPLATE_QA_TEST_KEY_PREFIX}preview_flow_1775443500161_42`);
  });

  it("recognizes new canonical qa template keys", () => {
    expect(isAdminEmailTemplateQaTestKey("e2e_admin_email_template_preview_1775443500161")).toBe(
      true
    );
    expect(
      isAdminEmailTemplateQaTestRecord({
        template_key: "e2e_admin_email_template_preview_1775443500161",
        locale: "nb-NO",
      })
    ).toBe(true);
  });

  it("recognizes legacy aw012 preview residue conservatively", () => {
    expect(isLegacyAdminEmailTemplateQaTestKey("aw012_publish_fallback_1775443500161")).toBe(
      true
    );
    expect(isAdminEmailTemplateQaTestKey("aw012_publish_fallback_1775443500161")).toBe(true);
  });

  it("does not classify normal operator template keys as qa artifacts", () => {
    expect(isAdminEmailTemplateQaTestKey("auth_login_code")).toBe(false);
    expect(
      isAdminEmailTemplateQaTestRecord({
        template_key: "weekly_digest",
        locale: "en-US",
      })
    ).toBe(false);
  });
});
