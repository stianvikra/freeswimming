import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccountSecurityEntryCard from "@/components/my-library/security/AccountSecurityEntryCard";

const { createBrowserSupabaseClientMock } = vi.hoisted(() => ({
  createBrowserSupabaseClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: createBrowserSupabaseClientMock,
}));

describe("AccountSecurityEntryCard", () => {
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
    vi.clearAllMocks();
  });

  it("recommends adding a passkey on this device when none are saved yet", async () => {
    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors: vi.fn().mockResolvedValue({
            data: { all: [] },
            error: null,
          }),
          getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
            data: {
              currentLevel: "aal1",
              nextLevel: "aal2",
            },
            error: null,
          }),
        },
      },
    });

    render(<AccountSecurityEntryCard />);

    await waitFor(() => {
      expect(screen.getByTestId("account-security-entry-card")).toHaveTextContent(
        "Recommended next step"
      );
    });

    expect(screen.getByRole("link", { name: "Add passkey on this device" })).toHaveAttribute(
      "href",
      "/my-library/security"
    );
  });

  it("falls back to email-code guidance when passkeys are unavailable", async () => {
    Object.defineProperty(window, "PublicKeyCredential", {
      configurable: true,
      value: undefined,
    });

    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors: vi.fn(),
          getAuthenticatorAssuranceLevel: vi.fn(),
        },
      },
    });

    render(<AccountSecurityEntryCard />);

    expect(screen.getByTestId("account-security-entry-card")).toHaveTextContent(
      "Email code fallback"
    );
    expect(screen.getByRole("link", { name: "Open Account & Security" })).toHaveAttribute(
      "href",
      "/my-library/security"
    );
  });
});
