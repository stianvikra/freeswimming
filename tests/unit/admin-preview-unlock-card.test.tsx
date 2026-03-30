import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPreviewUnlockCard from "@/components/auth/AdminPreviewUnlockCard";

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

describe("AdminPreviewUnlockCard", () => {
  beforeEach(() => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: true,
    });
    Object.defineProperty(window, "PublicKeyCredential", {
      configurable: true,
      value: function PublicKeyCredential() {},
    });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("shows an admin sign-in link when no admin session is present", () => {
    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors: vi.fn(),
          getAuthenticatorAssuranceLevel: vi.fn(),
          webauthn: {
            authenticate: vi.fn(),
          },
        },
      },
    });

    render(
      <AdminPreviewUnlockCard
        nextPath="/admin"
        signInHref="/auth/sign-in?next=%2Fpreview-access"
        signedInEmail={null}
        isAdmin={false}
      />
    );

    expect(screen.getByRole("link", { name: "Sign in as admin" })).toHaveAttribute(
      "href",
      "/auth/sign-in?next=%2Fpreview-access"
    );
  });

  it("authenticates passkey and unlocks preview for admin users", async () => {
    const authenticate = vi.fn().mockResolvedValue({
      data: {},
      error: null,
    });
    createBrowserSupabaseClientMock.mockReturnValue({
      auth: {
        mfa: {
          listFactors: vi.fn().mockResolvedValue({
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
          }),
          getAuthenticatorAssuranceLevel: vi.fn().mockResolvedValue({
            data: {
              currentLevel: "aal1",
              nextLevel: "aal2",
            },
            error: null,
          }),
          webauthn: {
            authenticate,
          },
        },
      },
    });
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        redirectPath: "/admin",
      }),
    } as Response);

    render(
      <AdminPreviewUnlockCard
        nextPath="/admin"
        signInHref="/auth/sign-in?next=%2Fpreview-access"
        signedInEmail="admin@example.com"
        isAdmin={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Unlock with passkey" })).toBeVisible();
    });

    fireEvent.click(screen.getByRole("button", { name: "Unlock with passkey" }));

    await waitFor(() => {
      expect(authenticate).toHaveBeenCalledWith({
        factorId: "factor-1",
      });
    });
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/preview-access/admin-unlock",
        expect.objectContaining<Record<string, unknown>>({
          method: "POST",
          body: JSON.stringify({ next: "/admin" }),
        })
      );
    });
    await waitFor(() => {
      expect(navigationState.push).toHaveBeenCalledWith("/admin");
    });
  });
});
