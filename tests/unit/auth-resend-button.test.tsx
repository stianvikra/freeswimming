import { cleanup, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";
import { afterEach, describe, expect, it } from "vitest";
import AuthResendButton from "@/components/auth/AuthResendButton";

function renderButton(props: ComponentProps<typeof AuthResendButton>) {
  render(
    <form>
      <AuthResendButton {...props} />
    </form>
  );
}

describe("AuthResendButton", () => {
  afterEach(() => {
    cleanup();
  });

  it("uses the stable initial clock for cooldown labels", () => {
    const initialNowMs = new Date("2026-05-19T10:00:00.000Z").getTime();

    renderButton({
      cooldownUntilMs: initialNowMs + 90_000,
      initialNowMs,
    });

    const button = screen.getByRole("button", { name: "Resend email in 90s" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-disabled", "true");
  });

  it("allows resend when no cooldown is active", () => {
    renderButton({ cooldownUntilMs: null, initialNowMs: 1_000 });

    const button = screen.getByRole("button", { name: "Resend sign-in email" });
    expect(button).toBeEnabled();
    expect(button).toHaveAttribute("aria-disabled", "false");
  });
});
