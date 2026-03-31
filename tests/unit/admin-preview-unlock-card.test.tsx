import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AdminPreviewUnlockCard from "@/components/auth/AdminPreviewUnlockCard";

describe("AdminPreviewUnlockCard", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows an admin sign-in link when no admin session is present", () => {
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

  it("shows honest fallback-password guidance for signed-in admins", () => {
    render(
      <AdminPreviewUnlockCard
        nextPath="/admin"
        signInHref="/auth/sign-in?next=%2Fpreview-access"
        signedInEmail="admin@example.com"
        isAdmin={true}
      />
    );

    expect(screen.getByTestId("admin-preview-unlock-card")).toHaveTextContent("Admin signed in");
    expect(screen.getByTestId("admin-preview-unlock-card")).toHaveTextContent(
      "Use the shared preview password below to unlock preview access in this browser."
    );
    expect(screen.getByTestId("admin-preview-unlock-card")).not.toHaveTextContent(
      "Device-based admin unlock"
    );
    expect(screen.queryByRole("button", { name: /unlock with passkey/i })).not.toBeInTheDocument();
  });
});
