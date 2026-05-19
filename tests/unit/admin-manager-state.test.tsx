import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminManagerState from "@/components/admin/AdminManagerState";

describe("AdminManagerState", () => {
  afterEach(() => {
    cleanup();
  });

  it("announces loading states politely", () => {
    render(<AdminManagerState tone="loading">Loading product catalog…</AdminManagerState>);

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Loading product catalog…");
    expect(status).toHaveClass("border-slate-200", "bg-slate-50", "text-slate-600");
  });

  it("keeps recoverable load errors assertive and wires retry actions", () => {
    const onRetry = vi.fn();

    render(
      <AdminManagerState
        tone="error"
        actions={
          <button type="button" onClick={onRetry}>
            Retry
          </button>
        }
      >
        Could not load products.
      </AdminManagerState>
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("aria-live", "assertive");
    expect(alert).toHaveTextContent("Could not load products.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("does not announce static empty states", () => {
    render(
      <AdminManagerState
        tone="empty"
        title="No QR links yet"
        testId="admin-empty-state"
        actions={<button type="button">Create first QR link</button>}
      >
        Start with one stable slug.
      </AdminManagerState>
    );

    const emptyState = screen.getByTestId("admin-empty-state");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.getByText("No QR links yet")).toHaveClass("text-slate-900");
    expect(screen.getByRole("button", { name: "Create first QR link" })).toBeInTheDocument();
  });

  it("can downgrade inline action errors to polite feedback", () => {
    render(
      <AdminManagerState tone="error" announcement="polite" density="compact">
        Could not update product.
      </AdminManagerState>
    );

    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("Could not update product.");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
