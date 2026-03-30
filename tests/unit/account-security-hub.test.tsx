import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AccountSecurityHub from "@/components/my-library/security/AccountSecurityHub";

const navigationState = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
}));
const { createBrowserSupabaseClientMock } = vi.hoisted(() => ({
  createBrowserSupabaseClientMock: vi.fn(),
}));
const { sendClientAnalyticsEventMock } = vi.hoisted(() => ({
  sendClientAnalyticsEventMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));
vi.mock("@/lib/supabase/browser", () => ({
  createBrowserSupabaseClient: createBrowserSupabaseClientMock,
}));
vi.mock("@/lib/analytics/client", () => ({
  sendClientAnalyticsEvent: sendClientAnalyticsEventMock,
}));

describe("AccountSecurityHub", () => {
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

  it("shows saved passkeys and session verification action", async () => {
    const listFactors = vi.fn().mockResolvedValue({
      data: {
        all: [
          {
            id: "factor-1",
            factor_type: "webauthn",
            friendly_name: "MacBook",
            status: "verified",
          },
        ],
      },
      error: null,
    });
    const getAuthenticatorAssuranceLevel = vi.fn().mockResolvedValue({
      data: {
        currentLevel: "aal1",
        nextLevel: "aal2",
      },
      error: null,
    });

    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors,
          getAuthenticatorAssuranceLevel,
          webauthn: {
            register: vi.fn(),
            authenticate: vi.fn(),
          },
          unenroll: vi.fn(),
        },
      },
    });

    render(<AccountSecurityHub email="owner@example.com" isAdmin={true} siteLockEnabled={true} />);

    await waitFor(() => {
      expect(screen.getByText("MacBook")).toBeVisible();
    });
    expect(screen.getByText("Standard session")).toBeVisible();
    expect(screen.getByRole("button", { name: "Verify this session" })).toBeVisible();
  });

  it("registers a new passkey and refreshes the page state", async () => {
    const listFactors = vi.fn().mockResolvedValue({
      data: {
        all: [],
      },
      error: null,
    });
    const getAuthenticatorAssuranceLevel = vi.fn().mockResolvedValue({
      data: {
        currentLevel: "aal1",
        nextLevel: "aal2",
      },
      error: null,
    });
    const register = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });

    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors,
          getAuthenticatorAssuranceLevel,
          webauthn: {
            register,
            authenticate: vi.fn(),
          },
          unenroll: vi.fn(),
        },
      },
    });

    render(<AccountSecurityHub email="owner@example.com" isAdmin={true} siteLockEnabled={true} />);

    await waitFor(() => {
      expect(screen.getByText("No passkeys added yet.")).toBeVisible();
    });

    fireEvent.change(screen.getByTestId("account-security-passkey-name"), {
      target: { value: "Office Mac" },
    });
    fireEvent.click(screen.getByTestId("account-security-add-passkey"));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        friendlyName: "Office Mac",
      });
    });
    await waitFor(() => {
      expect(screen.getByText("Passkey added and verified for this session.")).toBeVisible();
    });
    expect(navigationState.refresh).toHaveBeenCalled();
  });
});
