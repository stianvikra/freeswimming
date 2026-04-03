import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import AuthPasskeyReadinessCard from "@/components/auth/AuthPasskeyReadinessCard";

describe("AuthPasskeyReadinessCard", () => {
  beforeEach(() => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(window, "PublicKeyCredential", {
      configurable: true,
      value: function PublicKeyCredential() {},
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("shows passkey-ready messaging when the browser supports WebAuthn", () => {
    render(<AuthPasskeyReadinessCard sent={false} />);

    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "What works on this device"
    );
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent("Email code today");
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "Email code sign-in works on this device today."
    );
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "This browser supports passkeys, but freeswimming still uses email codes today."
    );
  });

  it("shows email-code-only fallback messaging when passkeys are unavailable", () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });

    render(<AuthPasskeyReadinessCard sent={true} />);

    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent("Email code today");
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "Check your email, then enter the code below."
    );
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "Passkeys require a secure browser context. Email codes still work here today."
    );
  });
});
