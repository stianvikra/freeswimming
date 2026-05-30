import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import AdminEmailTemplatesManager from "@/components/admin/AdminEmailTemplatesManager";
import type { AdminEmailTemplateRow } from "@/lib/admin/email-templates";

const emailTemplate: AdminEmailTemplateRow = {
  id: "template-auth-code",
  template_key: "auth_login_code",
  locale: "nb-NO",
  subject: "Din kode er {{code}}",
  body: "Bruk {{code}} innen {{expires_minutes}} minutter.",
  status: "draft",
  required_placeholders: ["code"],
  optional_placeholders: ["expires_minutes"],
  version: 1,
  created_by: "admin-user-id",
  updated_by: "admin-user-id",
  last_published_at: null,
  last_published_by: null,
  created_at: "2026-05-19T10:00:00.000Z",
  updated_at: "2026-05-19T10:00:00.000Z",
};

function templatesResponse(
  items: AdminEmailTemplateRow[] = [emailTemplate],
  options: { schemaReady?: boolean; warning?: string | null } = {}
) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items,
      schemaReady: options.schemaReady ?? true,
      warning: options.warning ?? null,
    }),
  };
}

function templatesErrorResponse(error = "Could not load email templates.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

function revisionsResponse(items: unknown[] = []) {
  return {
    ok: true,
    json: async () => ({
      ok: true,
      items,
    }),
  };
}

function revisionsErrorResponse(error = "Could not load template history.") {
  return {
    ok: false,
    json: async () => ({
      ok: false,
      error,
    }),
  };
}

describe("AdminEmailTemplatesManager state rendering", () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses AW-006 token cards and actions for template create, rows, edit, and history", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(templatesResponse())
      .mockResolvedValueOnce(revisionsResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    const templateItem = await screen.findByTestId("admin-email-template-item");

    expect(screen.getByTestId("admin-email-templates-manager")).toHaveClass("space-y-4");
    expect(screen.getByTestId("admin-email-templates-manager-header")).toHaveClass(
      "fs-library-card",
      "fs-library-card-accent"
    );
    expect(screen.getByRole("button", { name: "Refresh" })).toHaveClass("fs-cta-secondary");
    expect(screen.getByTestId("admin-email-templates-create-panel")).toHaveClass(
      "fs-library-card",
      "fs-library-card-muted"
    );
    expect(screen.getByRole("button", { name: "Create template" })).toHaveClass("fs-cta-primary");
    expect(templateItem).toHaveClass("fs-library-card");
    expect(within(templateItem).getByRole("button", { name: "Edit" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(templateItem).getByRole("button", { name: "Show history" })).toHaveClass(
      "fs-cta-secondary"
    );
    expect(within(templateItem).getByRole("button", { name: "Move to Review" })).toHaveClass(
      "fs-cta-primary"
    );

    fireEvent.click(within(templateItem).getByRole("button", { name: "Edit" }));

    expect(within(templateItem).getByRole("button", { name: "Save changes" })).toHaveClass(
      "fs-cta-primary"
    );
    expect(within(templateItem).getByRole("button", { name: "Reset draft" })).toHaveClass(
      "fs-cta-secondary"
    );

    fireEvent.click(within(templateItem).getByRole("button", { name: "Show history" }));

    const historyPanel = await within(templateItem).findByTestId(
      "admin-email-template-history-panel"
    );
    expect(historyPanel.className).toContain("rounded-[var(--fs-radius-control)]");
    expect(within(historyPanel).getByRole("button", { name: "Refresh history" })).toHaveClass(
      "fs-cta-secondary"
    );
  });

  it("shows a polite loading state before templates resolve", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(templatesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    const loading = screen.getByRole("status");
    expect(loading).toHaveTextContent("Loading email templates…");
    expect(loading).toHaveAttribute("aria-live", "polite");

    await screen.findByText("auth_login_code · nb-NO");
  });

  it("keeps load error retry wired to the original template loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(templatesErrorResponse())
      .mockResolvedValueOnce(templatesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Could not load email templates.");

    fireEvent.click(screen.getByRole("button", { name: "Retry" }));

    await screen.findByText("auth_login_code · nb-NO");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenLastCalledWith("/api/admin/email-templates", {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
  });

  it("renders the unchanged empty template guidance without live-region noise", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(templatesResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    const emptyState = await screen.findByTestId("admin-email-templates-empty-state");
    expect(emptyState).toHaveTextContent("No templates created yet.");
    expect(emptyState).not.toHaveAttribute("role");
    expect(emptyState).not.toHaveAttribute("aria-live");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("renders create-preview diagnostics through the admin state primitive", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(templatesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    await screen.findByText("auth_login_code · nb-NO");

    const createForm = screen.getByTestId("admin-email-templates-create-form");
    fireEvent.change(within(createForm).getByLabelText("Subject"), {
      target: { value: "Your token is {{custom_token}}" },
    });
    const sampleValuesField = within(createForm).getByLabelText(
      "Preview sample values (JSON object)"
    );

    fireEvent.change(sampleValuesField, { target: { value: '{"code":' } });

    const previewError = within(createForm).getByTestId(
      "admin-email-template-create-preview-error"
    );
    expect(previewError).toHaveTextContent("Preview sample values must be valid JSON.");
    expect(previewError).toHaveAttribute("role", "alert");
    expect(previewError).toHaveAttribute("aria-live", "assertive");

    fireEvent.change(sampleValuesField, { target: { value: "{}" } });

    await waitFor(() => {
      expect(
        within(createForm).queryByTestId("admin-email-template-create-preview-error")
      ).not.toBeInTheDocument();
    });
    const missingValues = within(createForm).getByTestId(
      "admin-email-template-create-preview-missing"
    );
    expect(missingValues).toHaveTextContent("Missing preview values: custom_token");
    expect(missingValues).toHaveAttribute("role", "status");
    expect(missingValues).toHaveAttribute("aria-live", "polite");

    fireEvent.change(sampleValuesField, { target: { value: '{"custom_token":"ready"}' } });

    await waitFor(() => {
      expect(
        within(createForm).queryByTestId("admin-email-template-create-preview-missing")
      ).not.toBeInTheDocument();
    });
  });

  it("renders edit-preview diagnostics through the admin state primitive", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(templatesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    const templateItem = await screen.findByTestId("admin-email-template-item");
    fireEvent.click(within(templateItem).getByRole("button", { name: "Edit" }));

    fireEvent.change(within(templateItem).getByLabelText("Body"), {
      target: { value: "Use {{code}} with {{custom_token}}." },
    });
    const sampleValuesField = within(templateItem).getByLabelText(
      "Preview sample values (JSON object)"
    );
    const missingValues = within(templateItem).getByTestId(
      "admin-email-template-edit-preview-missing"
    );
    expect(missingValues).toHaveTextContent("Missing preview values:");
    expect(missingValues).toHaveTextContent("custom_token");
    expect(missingValues).toHaveAttribute("role", "status");
    expect(missingValues).toHaveAttribute("aria-live", "polite");

    fireEvent.change(sampleValuesField, { target: { value: '{"code":' } });

    const previewError = within(templateItem).getByTestId(
      "admin-email-template-edit-preview-error"
    );
    expect(previewError).toHaveTextContent("Preview sample values must be valid JSON.");
    expect(previewError).toHaveAttribute("role", "alert");
    expect(previewError).toHaveAttribute("aria-live", "assertive");

    fireEvent.change(sampleValuesField, {
      target: { value: '{"custom_token":"ready"}' },
    });

    await waitFor(() => {
      expect(
        within(templateItem).queryByTestId("admin-email-template-edit-preview-error")
      ).not.toBeInTheDocument();
      expect(
        within(templateItem).queryByTestId("admin-email-template-edit-preview-missing")
      ).not.toBeInTheDocument();
    });
  });

  it("announces unchanged inline action feedback politely", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(templatesResponse());
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    await screen.findByText("auth_login_code · nb-NO");

    fireEvent.click(screen.getByRole("button", { name: "Edit" }));
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    const status = await screen.findByRole("status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("No template changes to save.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("renders revision-history loading and empty states through the shared helper", async () => {
    let resolveHistory: (value: ReturnType<typeof revisionsResponse>) => void = () => {};
    const historyPromise = new Promise<ReturnType<typeof revisionsResponse>>((resolve) => {
      resolveHistory = resolve;
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(templatesResponse())
      .mockReturnValueOnce(historyPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    await screen.findByText("auth_login_code · nb-NO");
    fireEvent.click(screen.getByRole("button", { name: "Show history" }));

    const historyPanel = await screen.findByTestId("admin-email-template-history-panel");
    const historyLoading = within(historyPanel).getByRole("status");
    expect(historyLoading).toHaveTextContent("Loading template history…");
    expect(historyLoading).toHaveAttribute("aria-live", "polite");

    resolveHistory(revisionsResponse([]));

    await waitFor(() => {
      expect(within(historyPanel).getByText("No revision entries yet.")).toBeInTheDocument();
    });
    const emptyHistory = within(historyPanel).getByText("No revision entries yet.").closest("div");
    expect(emptyHistory).not.toHaveAttribute("role");
    expect(emptyHistory).not.toHaveAttribute("aria-live");
  });

  it("keeps revision-history error retry wired to the original history loader", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(templatesResponse())
      .mockResolvedValueOnce(revisionsErrorResponse())
      .mockResolvedValueOnce(revisionsResponse([]));
    vi.stubGlobal("fetch", fetchMock);

    render(<AdminEmailTemplatesManager />);

    await screen.findByText("auth_login_code · nb-NO");
    fireEvent.click(screen.getByRole("button", { name: "Show history" }));

    const historyPanel = await screen.findByTestId("admin-email-template-history-panel");
    await within(historyPanel).findByRole("alert");
    expect(within(historyPanel).getByRole("alert")).toHaveTextContent(
      "Could not load template history."
    );

    fireEvent.click(within(historyPanel).getByRole("button", { name: "Retry" }));

    await within(historyPanel).findByText("No revision entries yet.");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "/api/admin/email-templates/template-auth-code/revisions",
      {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      }
    );
  });
});
