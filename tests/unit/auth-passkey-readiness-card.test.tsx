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
      "Passkeys on this device"
    );
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent("Passkey-ready browser");
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "This browser can use passkeys after your first email sign-in."
    );
  });

  it("shows email-code-only fallback messaging when passkeys are unavailable", () => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: false,
    });

    render(<AuthPasskeyReadinessCard sent={true} />);

    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent("Email code only here");
    expect(screen.getByTestId("auth-passkey-readiness")).toHaveTextContent(
      "Passkeys require a secure browser context."
    );
  });
});
