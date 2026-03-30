import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import AccountSecurityHub from "@/components/my-library/security/AccountSecurityHub";

describe("AccountSecurityHub", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the honest current auth contract and preview fallback for admins", () => {
    render(<AccountSecurityHub email="owner@example.com" isAdmin={true} siteLockEnabled={true} />);

    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Email code today");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("One-time email code");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Not live yet");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Admin fallback ready");
    expect(screen.getByRole("link", { name: "Open preview access" })).toHaveAttribute(
      "href",
      "/preview-access?next=%2Fadmin"
    );
  });

  it("shows public-site guidance without preview password actions when the site is open", () => {
    render(
      <AccountSecurityHub email="owner@example.com" isAdmin={false} siteLockEnabled={false} />
    );

    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Site public");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Public mode");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Standard account");
    expect(screen.getByTestId("account-security-hub")).toHaveTextContent("Not needed right now");
    expect(screen.queryByRole("link", { name: "Open preview access" })).not.toBeInTheDocument();
  });
});
