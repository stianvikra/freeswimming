import { StrictMode } from "react";
import { cleanup, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigationState = vi.hoisted(() => ({
  refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => navigationState,
}));

import LocalDayTimezoneSynchronizer, {
  buildLocalDayTimezoneCookie,
  LOCAL_DAY_TIMEZONE_COOKIE_MAX_AGE_SECONDS,
} from "@/components/my-library/LocalDayTimezoneSynchronizer";

function setBrowserTimezone(timezone: string) {
  vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
    locale: "en-US",
    calendar: "gregory",
    numberingSystem: "latn",
    timeZone: timezone,
  });
}

function clearTimezoneCookie() {
  document.cookie = "fs_timezone=; Path=/; Max-Age=0; SameSite=Lax";
}

describe("LocalDayTimezoneSynchronizer", () => {
  beforeEach(() => {
    clearTimezoneCookie();
    navigationState.refresh.mockClear();
    setBrowserTimezone("Europe/Oslo");
  });

  afterEach(() => {
    cleanup();
    clearTimezoneCookie();
    vi.restoreAllMocks();
  });

  it("does not write or refresh when the functional cookie already matches", () => {
    document.cookie = "fs_timezone=Europe%2FOslo; Path=/; SameSite=Lax";
    const cookieBeforeRender = document.cookie;
    const cookieSetter = vi.spyOn(Document.prototype, "cookie", "set");

    render(<LocalDayTimezoneSynchronizer />);

    expect(document.cookie).toBe(cookieBeforeRender);
    expect(cookieSetter).not.toHaveBeenCalled();
    expect(navigationState.refresh).not.toHaveBeenCalled();
  });

  it("writes a missing cookie and refreshes at most once under repeated effects", async () => {
    render(
      <StrictMode>
        <LocalDayTimezoneSynchronizer />
      </StrictMode>
    );

    await waitFor(() => {
      expect(document.cookie).toContain("fs_timezone=Europe%2FOslo");
    });
    expect(navigationState.refresh).toHaveBeenCalledTimes(1);
  });

  it("reconciles a changed timezone without taking focus", async () => {
    document.cookie = "fs_timezone=UTC; Path=/; SameSite=Lax";
    const focusedButton = document.createElement("button");
    document.body.append(focusedButton);
    focusedButton.focus();

    render(<LocalDayTimezoneSynchronizer />);

    await waitFor(() => {
      expect(document.cookie).toContain("fs_timezone=Europe%2FOslo");
    });
    expect(navigationState.refresh).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(focusedButton);
    focusedButton.remove();
  });

  it("uses bounded functional-cookie attributes and Secure only for HTTPS", () => {
    const httpCookie = buildLocalDayTimezoneCookie("Europe/Oslo", false);
    const httpsCookie = buildLocalDayTimezoneCookie("Europe/Oslo", true);

    expect(httpCookie).toBe(
      `fs_timezone=Europe%2FOslo; Path=/; Max-Age=${LOCAL_DAY_TIMEZONE_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
    );
    expect(httpCookie).not.toContain("Secure");
    expect(httpCookie).not.toContain("Domain");
    expect(httpCookie).not.toContain("HttpOnly");
    expect(httpsCookie).toBe(`${httpCookie}; Secure`);
    expect(LOCAL_DAY_TIMEZONE_COOKIE_MAX_AGE_SECONDS).toBeLessThanOrEqual(366 * 24 * 60 * 60);
  });
});
