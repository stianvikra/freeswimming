import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ReviewActualPage from "@/app/my-library/calendar/actuals/[instanceId]/page";
import type { ReviewActualEditorModel } from "@/lib/my-library/review-actual";

const {
  getServerSupabaseUserIfAuthCookiePresentMock,
  loadReviewActualEditorModelMock,
  notFoundMock,
  redirectMock,
} = vi.hoisted(() => ({
  getServerSupabaseUserIfAuthCookiePresentMock: vi.fn(),
  loadReviewActualEditorModelMock: vi.fn(),
  notFoundMock: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
  redirectMock: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("@/components/SiteChrome", () => ({
  default: ({ children }: { children: ReactNode }) => (
    <div data-testid="site-chrome">{children}</div>
  ),
}));

vi.mock("@/components/my-library/ReviewActualEditor", () => ({
  default: ({ model }: { model: ReviewActualEditorModel }) => (
    <div data-testid="review-actual-editor" data-status={model.status} />
  ),
}));

vi.mock("@/lib/my-library/review-actual", () => ({
  loadReviewActualEditorModel: loadReviewActualEditorModelMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  getServerSupabaseUserIfAuthCookiePresent: getServerSupabaseUserIfAuthCookiePresentMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}));

const instanceId = "33333333-3333-4333-8333-333333333333";
const signedInUser = {
  id: "user-123",
  email: "swimmer@example.com",
};

describe("Review actual page", () => {
  beforeEach(() => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: { from: vi.fn() },
      user: signedInUser,
    });
    loadReviewActualEditorModelMock.mockResolvedValue({
      status: "missing_actual",
      returnHref: "/my-library/calendar?view=plan",
    } satisfies ReviewActualEditorModel);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it("renders the authenticated review actual route and preserves Calendar return context", async () => {
    render(
      await ReviewActualPage({
        params: Promise.resolve({ instanceId }),
        searchParams: Promise.resolve({ date: "2026-06-22", programId: "program-1" }),
      })
    );

    expect(screen.getByTestId("site-chrome")).toBeInTheDocument();
    expect(screen.getByTestId("review-actual-route-shell")).toHaveClass("max-w-[1120px]");
    expect(screen.getByRole("heading", { name: "Review actual", level: 1 })).toBeVisible();
    expect(screen.getByTestId("review-actual-editor")).toHaveAttribute(
      "data-status",
      "missing_actual"
    );
    expect(loadReviewActualEditorModelMock).toHaveBeenCalledWith(
      expect.any(Object),
      signedInUser.id,
      {
        plannedWorkoutInstanceId: instanceId,
        returnHref: "/my-library/calendar?view=plan&date=2026-06-22&programId=program-1",
      }
    );
  });

  it("redirects anonymous users before loading actual history", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(
      ReviewActualPage({
        params: Promise.resolve({ instanceId }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow(
      `NEXT_REDIRECT:/auth/sign-in?next=${encodeURIComponent(`/my-library/calendar/actuals/${instanceId}`)}`
    );
    expect(loadReviewActualEditorModelMock).not.toHaveBeenCalled();
  });

  it("preserves safe Calendar return context through anonymous sign-in redirects", async () => {
    getServerSupabaseUserIfAuthCookiePresentMock.mockResolvedValue({
      supabase: null,
      user: null,
    });

    await expect(
      ReviewActualPage({
        params: Promise.resolve({ instanceId }),
        searchParams: Promise.resolve({ date: "2026-06-22", programId: "program-1" }),
      })
    ).rejects.toThrow(
      `NEXT_REDIRECT:/auth/sign-in?next=${encodeURIComponent(
        `/my-library/calendar/actuals/${instanceId}?date=2026-06-22&programId=program-1`
      )}`
    );
    expect(loadReviewActualEditorModelMock).not.toHaveBeenCalled();
  });

  it("rejects invalid route params before auth or data load", async () => {
    await expect(
      ReviewActualPage({
        params: Promise.resolve({ instanceId: "not-a-uuid" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(getServerSupabaseUserIfAuthCookiePresentMock).not.toHaveBeenCalled();
    expect(loadReviewActualEditorModelMock).not.toHaveBeenCalled();
  });
});
