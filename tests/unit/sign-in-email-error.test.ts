import { describe, expect, it } from "vitest";
import {
  classifySignInEmailError,
  SIGN_IN_EMAIL_DELIVERY_MESSAGE,
  SIGN_IN_SERVICE_RESTRICTED_MESSAGE,
  SIGN_IN_UNKNOWN_EMAIL_ERROR_MESSAGE,
} from "@/lib/auth/sign-in-email-error";

describe("sign-in email error classification", () => {
  it("classifies provider rate limits as cooldown-backed rate limits", () => {
    expect(
      classifySignInEmailError({
        message: "Email rate limit exceeded",
        status: 429,
      })
    ).toEqual({
      kind: "rate_limited",
      userMessage: "Please wait about a minute before requesting a new sign-in email.",
    });
  });

  it("classifies Supabase egress quota restrictions as service restrictions", () => {
    expect(
      classifySignInEmailError({
        message:
          "Service for this project is restricted due to the following violations: exceed_egress_quota.",
        status: 402,
      })
    ).toEqual({
      kind: "service_restricted",
      userMessage: SIGN_IN_SERVICE_RESTRICTED_MESSAGE,
    });
  });

  it("classifies email-provider failures without exposing raw provider details", () => {
    expect(
      classifySignInEmailError({
        message: "SMTP provider rejected the message",
        status: 500,
      })
    ).toEqual({
      kind: "email_delivery",
      userMessage: SIGN_IN_EMAIL_DELIVERY_MESSAGE,
    });
  });

  it("falls back to the generic sign-in email error", () => {
    expect(classifySignInEmailError({ message: "unexpected provider response" })).toEqual({
      kind: "unknown",
      userMessage: SIGN_IN_UNKNOWN_EMAIL_ERROR_MESSAGE,
    });
  });
});
