"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_EMAIL_TEMPLATE_STATUS_VALUES,
  canTransitionAdminEmailTemplateStatus,
  extractAdminEmailTemplatePlaceholders,
  renderAdminEmailTemplatePreview,
  type AdminEmailTemplateRow,
  type AdminEmailTemplateStatus,
} from "@/lib/admin/email-templates";
import AdminManagerState from "@/components/admin/AdminManagerState";

type AdminEmailTemplatesResponse =
  | {
      ok: true;
      items: AdminEmailTemplateRow[];
      schemaReady?: boolean;
      warning?: string | null;
    }
  | {
      ok: false;
      error?: string;
    };

type AdminEmailTemplateCreateResponse =
  | {
      ok: true;
      item: AdminEmailTemplateRow;
    }
  | {
      ok: false;
      error?: string;
      details?: string[];
    };

type AdminEmailTemplateUpdateResponse =
  | {
      ok: true;
      item: AdminEmailTemplateRow;
    }
  | {
      ok: false;
      error?: string;
      details?: string[];
    };

type AdminEmailTemplateRevisionItem = {
  id: string;
  revisionNumber: number;
  action: string;
  changedByEmail: string | null;
  createdAt: string;
  snapshotStatus: string;
  snapshotVersion: number | null;
};

type AdminEmailTemplateRevisionsResponse =
  | {
      ok: true;
      items: AdminEmailTemplateRevisionItem[];
    }
  | {
      ok: false;
      error?: string;
    };

type CreateFormState = {
  templateKey: string;
  locale: string;
  subject: string;
  body: string;
  requiredPlaceholders: string;
  optionalPlaceholders: string;
  previewSampleValues: string;
  status: "draft" | "review";
};

type EditFormState = {
  templateKey: string;
  locale: string;
  subject: string;
  body: string;
  requiredPlaceholders: string;
  optionalPlaceholders: string;
  previewSampleValues: string;
  status: AdminEmailTemplateStatus;
};

const CREATE_FORM_INITIAL: CreateFormState = {
  templateKey: "",
  locale: "nb-NO",
  subject: "",
  body: "",
  requiredPlaceholders: "",
  optionalPlaceholders: "",
  previewSampleValues: "{}",
  status: "draft",
};

type PreviewSampleParseResult = {
  values: Record<string, unknown>;
  error: string | null;
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function toStatusLabel(status: AdminEmailTemplateStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "review":
      return "Review";
    case "published":
      return "Published";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

function toStatusChipClasses(status: AdminEmailTemplateStatus): string {
  switch (status) {
    case "draft":
      return "border border-slate-200 bg-slate-100 text-slate-700";
    case "review":
      return "border border-amber-200 bg-amber-50 text-amber-800";
    case "published":
      return "border border-emerald-200 bg-emerald-50 text-emerald-800";
    case "archived":
      return "border border-rose-200 bg-rose-50 text-rose-800";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-700";
  }
}

function toRevisionActionLabel(action: string): string {
  if (action === "insert") return "Created";
  if (action === "update") return "Updated";
  if (action === "delete") return "Deleted";
  return action;
}

function toSnapshotStatusLabel(status: string): string {
  if (ADMIN_EMAIL_TEMPLATE_STATUS_VALUES.includes(status as AdminEmailTemplateStatus)) {
    return toStatusLabel(status as AdminEmailTemplateStatus);
  }
  return status;
}

function normalizeListInput(value: string): string[] {
  if (!value.trim()) return [];
  const unique = new Set<string>();
  for (const entry of value.split(/[\s,]+/)) {
    const token = entry.trim().toLowerCase();
    if (!token) continue;
    unique.add(token);
  }
  return [...unique].sort();
}

function toListInput(values: readonly string[] | null | undefined): string {
  if (!values || values.length === 0) return "";
  return [...values].sort().join(", ");
}

function arraysEqual(left: readonly string[], right: readonly string[]): boolean {
  if (left.length !== right.length) return false;
  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) return false;
  }
  return true;
}

function toEditFormState(item: AdminEmailTemplateRow): EditFormState {
  return {
    templateKey: item.template_key,
    locale: item.locale,
    subject: item.subject,
    body: item.body,
    requiredPlaceholders: toListInput(item.required_placeholders),
    optionalPlaceholders: toListInput(item.optional_placeholders),
    previewSampleValues: "{}",
    status: item.status,
  };
}

function sortTemplates(rows: AdminEmailTemplateRow[]): AdminEmailTemplateRow[] {
  return [...rows].sort((left, right) => {
    if (left.template_key !== right.template_key) {
      return left.template_key.localeCompare(right.template_key, "nb-NO");
    }
    return left.locale.localeCompare(right.locale, "nb-NO");
  });
}

function normalizeInput(value: string): string {
  return value.trim();
}

function parsePreviewSampleValues(raw: string): PreviewSampleParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { values: {}, error: null };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { values: {}, error: "Preview sample values must be a JSON object." };
    }
    return {
      values: parsed as Record<string, unknown>,
      error: null,
    };
  } catch {
    return { values: {}, error: "Preview sample values must be valid JSON." };
  }
}

function nextQuickStatusOptions(current: AdminEmailTemplateStatus): AdminEmailTemplateStatus[] {
  if (current === "draft") return ["review", "archived"];
  if (current === "review") return ["published", "draft", "archived"];
  if (current === "published") return ["review", "archived"];
  return ["draft"];
}

export default function AdminEmailTemplatesManager() {
  const [items, setItems] = useState<AdminEmailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [schemaReady, setSchemaReady] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [createState, setCreateState] = useState<CreateFormState>(CREATE_FORM_INITIAL);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editState, setEditState] = useState<EditFormState | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [quickStatusId, setQuickStatusId] = useState<string | null>(null);
  const [openHistoryId, setOpenHistoryId] = useState<string | null>(null);
  const [historyLoadingId, setHistoryLoadingId] = useState<string | null>(null);
  const [historyByTemplateId, setHistoryByTemplateId] = useState<
    Record<string, AdminEmailTemplateRevisionItem[]>
  >({});
  const [historyErrorByTemplateId, setHistoryErrorByTemplateId] = useState<
    Record<string, string | null>
  >({});

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    setWarning(null);
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminEmailTemplatesResponse;
      if (!response.ok || !payload.ok) {
        setError(
          payload.ok
            ? "Could not load email templates."
            : (payload.error ?? "Could not load email templates.")
        );
        setItems([]);
        setSchemaReady(true);
        return;
      }

      setItems(sortTemplates(payload.items));
      setSchemaReady(payload.schemaReady !== false);
      setWarning(payload.warning ?? null);
    } catch {
      setError("Could not load email templates.");
      setItems([]);
      setSchemaReady(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const summary = useMemo(() => {
    if (items.length === 0) return "No templates configured yet.";
    const published = items.filter((item) => item.status === "published").length;
    const review = items.filter((item) => item.status === "review").length;
    const draft = items.filter((item) => item.status === "draft").length;
    const archived = items.filter((item) => item.status === "archived").length;
    return `${items.length} total · ${published} published · ${review} review · ${draft} draft · ${archived} archived`;
  }, [items]);

  const activeEditItem = useMemo(
    () => (editingId ? (items.find((item) => item.id === editingId) ?? null) : null),
    [editingId, items]
  );

  const createPreviewSample = useMemo(
    () => parsePreviewSampleValues(createState.previewSampleValues),
    [createState.previewSampleValues]
  );
  const createPlaceholderPreview = useMemo(
    () => extractAdminEmailTemplatePlaceholders(`${createState.subject}\n${createState.body}`),
    [createState.subject, createState.body]
  );
  const createRenderedPreview = useMemo(
    () =>
      renderAdminEmailTemplatePreview({
        subject: createState.subject,
        body: createState.body,
        sampleValues: createPreviewSample.values,
      }),
    [createPreviewSample.values, createState.body, createState.subject]
  );

  const placeholderPreview = useMemo(() => {
    if (!editState) return [];
    return extractAdminEmailTemplatePlaceholders(`${editState.subject}\n${editState.body}`);
  }, [editState]);

  const editPreviewSample = useMemo(
    () => parsePreviewSampleValues(editState?.previewSampleValues ?? "{}"),
    [editState?.previewSampleValues]
  );
  const editRenderedPreview = useMemo(() => {
    if (!editState) return null;
    return renderAdminEmailTemplatePreview({
      subject: editState.subject,
      body: editState.body,
      sampleValues: editPreviewSample.values,
    });
  }, [editPreviewSample.values, editState]);

  function startEdit(item: AdminEmailTemplateRow) {
    if (savingId || quickStatusId) return;
    setActionError(null);
    setActionNotice(null);
    setEditingId(item.id);
    setEditState(toEditFormState(item));
  }

  function clearEdit() {
    setEditingId(null);
    setEditState(null);
  }

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submittingCreate || savingId || quickStatusId) return;

    setSubmittingCreate(true);
    setActionError(null);
    setActionNotice(null);
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          templateKey: normalizeInput(createState.templateKey),
          locale: normalizeInput(createState.locale),
          subject: createState.subject,
          body: createState.body,
          status: createState.status,
          requiredPlaceholders: normalizeListInput(createState.requiredPlaceholders),
          optionalPlaceholders: normalizeListInput(createState.optionalPlaceholders),
        }),
      });
      const payload = (await response.json()) as AdminEmailTemplateCreateResponse;
      if (!response.ok || !payload.ok) {
        const details =
          payload.ok || !payload.details?.length ? "" : ` ${payload.details.join(" ")}`;
        setActionError(
          payload.ok
            ? "Could not create email template."
            : `${payload.error ?? "Could not create email template."}${details}`
        );
        return;
      }

      setItems((prev) => sortTemplates([...prev, payload.item]));
      setCreateState(CREATE_FORM_INITIAL);
      setActionNotice(`Template ${payload.item.template_key} (${payload.item.locale}) created.`);
      startEdit(payload.item);
    } catch {
      setActionError("Could not create email template.");
    } finally {
      setSubmittingCreate(false);
    }
  }

  async function saveEdit() {
    if (!activeEditItem || !editState || savingId || quickStatusId) return;
    setSavingId(activeEditItem.id);
    setActionError(null);
    setActionNotice(null);

    const requiredPlaceholders = normalizeListInput(editState.requiredPlaceholders);
    const optionalPlaceholders = normalizeListInput(editState.optionalPlaceholders);
    const nextTemplateKey = normalizeInput(editState.templateKey).toLowerCase();
    const nextLocale = normalizeInput(editState.locale);

    const patch: Record<string, unknown> = {};
    if (activeEditItem.template_key !== nextTemplateKey) patch.templateKey = nextTemplateKey;
    if (activeEditItem.locale !== nextLocale) patch.locale = nextLocale;
    if (activeEditItem.subject !== editState.subject) patch.subject = editState.subject;
    if (activeEditItem.body !== editState.body) patch.body = editState.body;
    if (!arraysEqual(activeEditItem.required_placeholders ?? [], requiredPlaceholders)) {
      patch.requiredPlaceholders = requiredPlaceholders;
    }
    if (!arraysEqual(activeEditItem.optional_placeholders ?? [], optionalPlaceholders)) {
      patch.optionalPlaceholders = optionalPlaceholders;
    }
    if (activeEditItem.status !== editState.status) patch.status = editState.status;

    if (Object.keys(patch).length === 0) {
      setSavingId(null);
      setActionNotice("No template changes to save.");
      return;
    }

    patch.expectedUpdatedAt = activeEditItem.updated_at;

    try {
      const response = await fetch(`/api/admin/email-templates/${activeEditItem.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(patch),
      });
      const payload = (await response.json()) as AdminEmailTemplateUpdateResponse;
      if (!response.ok || !payload.ok) {
        const details =
          payload.ok || !payload.details?.length ? "" : ` ${payload.details.join(" ")}`;
        setActionError(
          payload.ok
            ? "Could not update email template."
            : `${payload.error ?? "Could not update email template."}${details}`
        );
        return;
      }

      setItems((prev) =>
        sortTemplates(prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry)))
      );
      setEditState(toEditFormState(payload.item));
      setActionNotice(`Template ${payload.item.template_key} saved.`);
    } catch {
      setActionError("Could not update email template.");
    } finally {
      setSavingId(null);
    }
  }

  async function updateTemplateStatus(
    item: AdminEmailTemplateRow,
    nextStatus: AdminEmailTemplateStatus
  ) {
    if (quickStatusId || savingId) return;
    if (!canTransitionAdminEmailTemplateStatus(item.status, nextStatus)) return;

    setQuickStatusId(item.id);
    setActionError(null);
    setActionNotice(null);
    try {
      const response = await fetch(`/api/admin/email-templates/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          status: nextStatus,
          expectedUpdatedAt: item.updated_at,
        }),
      });
      const payload = (await response.json()) as AdminEmailTemplateUpdateResponse;
      if (!response.ok || !payload.ok) {
        const details =
          payload.ok || !payload.details?.length ? "" : ` ${payload.details.join(" ")}`;
        setActionError(
          payload.ok
            ? "Could not update template status."
            : `${payload.error ?? "Could not update template status."}${details}`
        );
        return;
      }
      setItems((prev) =>
        sortTemplates(prev.map((entry) => (entry.id === payload.item.id ? payload.item : entry)))
      );
      if (editingId === payload.item.id) {
        setEditState(toEditFormState(payload.item));
      }
      setActionNotice(
        `Template ${payload.item.template_key} moved to ${toStatusLabel(payload.item.status)}.`
      );
    } catch {
      setActionError("Could not update template status.");
    } finally {
      setQuickStatusId(null);
    }
  }

  const loadTemplateHistory = useCallback(async (templateId: string) => {
    setHistoryLoadingId(templateId);
    setHistoryErrorByTemplateId((prev) => ({ ...prev, [templateId]: null }));
    try {
      const response = await fetch(`/api/admin/email-templates/${templateId}/revisions`, {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      const payload = (await response.json()) as AdminEmailTemplateRevisionsResponse;
      if (!response.ok || !payload.ok) {
        setHistoryErrorByTemplateId((prev) => ({
          ...prev,
          [templateId]: payload.ok
            ? "Could not load template history."
            : (payload.error ?? "Could not load template history."),
        }));
        setHistoryByTemplateId((prev) => ({ ...prev, [templateId]: [] }));
        return;
      }
      setHistoryByTemplateId((prev) => ({ ...prev, [templateId]: payload.items }));
    } catch {
      setHistoryErrorByTemplateId((prev) => ({
        ...prev,
        [templateId]: "Could not load template history.",
      }));
      setHistoryByTemplateId((prev) => ({ ...prev, [templateId]: [] }));
    } finally {
      setHistoryLoadingId((current) => (current === templateId ? null : current));
    }
  }, []);

  function toggleHistory(templateId: string) {
    if (openHistoryId === templateId) {
      setOpenHistoryId(null);
      return;
    }
    setOpenHistoryId(templateId);
    if (historyByTemplateId[templateId] || historyLoadingId === templateId) {
      return;
    }
    void loadTemplateHistory(templateId);
  }

  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-6"
      data-testid="admin-email-templates-manager"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Email templates</h2>
          <p className="mt-2 text-sm text-slate-600">{summary}</p>
        </div>
        <button
          type="button"
          onClick={() => void loadTemplates()}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {!schemaReady && warning ? (
        <AdminManagerState tone="warning">{warning}</AdminManagerState>
      ) : null}

      {loading ? (
        <AdminManagerState tone="loading">Loading email templates…</AdminManagerState>
      ) : null}

      {!loading && error ? (
        <AdminManagerState
          tone="error"
          actions={
            <button
              type="button"
              onClick={() => void loadTemplates()}
              className="inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
            >
              Retry
            </button>
          }
        >
          {error}
        </AdminManagerState>
      ) : null}

      {actionError ? (
        <AdminManagerState tone="error" announcement="polite" density="compact">
          {actionError}
        </AdminManagerState>
      ) : null}

      {actionNotice ? (
        <AdminManagerState tone="success" density="compact">
          {actionNotice}
        </AdminManagerState>
      ) : null}

      <form
        className="mt-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
        data-testid="admin-email-templates-create-form"
        onSubmit={(event) => void handleCreate(event)}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-slate-900">Create template</h3>
          <p className="text-xs text-slate-500">Create as draft/review, then publish from list.</p>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Template key</span>
            <input
              type="text"
              value={createState.templateKey}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, templateKey: event.target.value }))
              }
              placeholder="auth_login_code"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Locale</span>
            <input
              type="text"
              value={createState.locale}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, locale: event.target.value }))
              }
              placeholder="nb-NO"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              required
            />
          </label>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Status</span>
            <select
              value={createState.status}
              onChange={(event) =>
                setCreateState((prev) => ({
                  ...prev,
                  status: event.target.value as CreateFormState["status"],
                }))
              }
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
            >
              <option value="draft">Draft</option>
              <option value="review">Review</option>
            </select>
          </label>
        </div>

        <div className="mt-3 space-y-3">
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Subject</span>
            <input
              type="text"
              value={createState.subject}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, subject: event.target.value }))
              }
              placeholder="Din kode er {{code}}"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              required
            />
          </label>
          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Body</span>
            <textarea
              value={createState.body}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, body: event.target.value }))
              }
              rows={4}
              placeholder="Bruk {{code}} innen {{expires_minutes}} minutter."
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
              required
            />
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Required placeholders</span>
              <input
                type="text"
                value={createState.requiredPlaceholders}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    requiredPlaceholders: event.target.value,
                  }))
                }
                placeholder="code"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              />
            </label>
            <label className="space-y-1 text-sm font-medium text-slate-700">
              <span>Optional placeholders</span>
              <input
                type="text"
                value={createState.optionalPlaceholders}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    optionalPlaceholders: event.target.value,
                  }))
                }
                placeholder="expires_minutes"
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
              />
            </label>
          </div>

          <label className="space-y-1 text-sm font-medium text-slate-700">
            <span>Preview sample values (JSON object)</span>
            <textarea
              value={createState.previewSampleValues}
              onChange={(event) =>
                setCreateState((prev) => ({ ...prev, previewSampleValues: event.target.value }))
              }
              rows={4}
              placeholder='{"code":"654321","user_name":"Stian"}'
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>

          <div
            className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"
            data-testid="admin-email-template-create-preview"
          >
            <p data-testid="admin-email-template-create-preview-detected">
              <span className="font-semibold text-slate-700">Detected placeholders:</span>{" "}
              {createPlaceholderPreview.length > 0 ? createPlaceholderPreview.join(", ") : "none"}
            </p>
            {createPreviewSample.error ? (
              <p className="text-rose-700" data-testid="admin-email-template-create-preview-error">
                {createPreviewSample.error}
              </p>
            ) : null}
            <p data-testid="admin-email-template-create-preview-subject">
              <span className="font-semibold text-slate-700">Rendered subject:</span>{" "}
              {createRenderedPreview.subject || "—"}
            </p>
            <p className="font-semibold text-slate-700">Rendered body:</p>
            <pre
              className="font-mono text-xs whitespace-pre-wrap text-slate-700"
              data-testid="admin-email-template-create-preview-body"
            >
              {createRenderedPreview.body || "—"}
            </pre>
            {createRenderedPreview.usedFallbackKeys.length > 0 ? (
              <p data-testid="admin-email-template-create-preview-fallback">
                <span className="font-semibold text-slate-700">Fallback defaults used:</span>{" "}
                {createRenderedPreview.usedFallbackKeys.join(", ")}
              </p>
            ) : null}
            {createRenderedPreview.missingKeys.length > 0 ? (
              <p
                className="text-amber-700"
                data-testid="admin-email-template-create-preview-missing"
              >
                <span className="font-semibold text-amber-800">Missing preview values:</span>{" "}
                {createRenderedPreview.missingKeys.join(", ")}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={submittingCreate || Boolean(savingId) || Boolean(quickStatusId)}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {submittingCreate ? "Creating…" : "Create template"}
        </button>
      </form>

      {!loading && !error && items.length === 0 ? (
        <AdminManagerState tone="empty" testId="admin-email-templates-empty-state">
          No templates created yet.
        </AdminManagerState>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => {
            const isEditing = editingId === item.id;
            const isHistoryOpen = openHistoryId === item.id;
            const isHistoryLoading = historyLoadingId === item.id;
            const historyError = historyErrorByTemplateId[item.id] ?? null;
            const historyItems = historyByTemplateId[item.id] ?? [];
            const nextStatusOptions = nextQuickStatusOptions(item.status).filter((nextStatus) =>
              canTransitionAdminEmailTemplateStatus(item.status, nextStatus)
            );
            const disableRowActions = Boolean(savingId || quickStatusId || submittingCreate);

            return (
              <li
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                data-testid="admin-email-template-item"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {item.template_key} · {item.locale}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      v{item.version} · updated {formatDateTime(item.updated_at)} · last published{" "}
                      {formatDateTime(item.last_published_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={[
                        "inline-flex rounded-full px-2 py-1 text-xs font-semibold",
                        toStatusChipClasses(item.status),
                      ].join(" ")}
                    >
                      {toStatusLabel(item.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => (isEditing ? clearEdit() : startEdit(item))}
                      disabled={disableRowActions}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isEditing ? "Close editor" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleHistory(item.id)}
                      disabled={disableRowActions}
                      className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isHistoryOpen ? "Hide history" : "Show history"}
                    </button>
                  </div>
                </div>

                {nextStatusOptions.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {nextStatusOptions.map((nextStatus) => (
                      <button
                        key={`${item.id}-${nextStatus}`}
                        type="button"
                        disabled={disableRowActions}
                        onClick={() => void updateTemplateStatus(item, nextStatus)}
                        className="inline-flex h-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {quickStatusId === item.id
                          ? "Saving…"
                          : `Move to ${toStatusLabel(nextStatus)}`}
                      </button>
                    ))}
                  </div>
                ) : null}

                {isEditing && editState ? (
                  <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="space-y-1 text-sm font-medium text-slate-700">
                        <span>Template key</span>
                        <input
                          type="text"
                          value={editState.templateKey}
                          onChange={(event) =>
                            setEditState((prev) =>
                              prev ? { ...prev, templateKey: event.target.value } : prev
                            )
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>
                      <label className="space-y-1 text-sm font-medium text-slate-700">
                        <span>Locale</span>
                        <input
                          type="text"
                          value={editState.locale}
                          onChange={(event) =>
                            setEditState((prev) =>
                              prev ? { ...prev, locale: event.target.value } : prev
                            )
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>
                      <label className="space-y-1 text-sm font-medium text-slate-700">
                        <span>Status</span>
                        <select
                          value={editState.status}
                          onChange={(event) =>
                            setEditState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    status: event.target.value as AdminEmailTemplateStatus,
                                  }
                                : prev
                            )
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        >
                          {ADMIN_EMAIL_TEMPLATE_STATUS_VALUES.map((status) => (
                            <option key={status} value={status}>
                              {toStatusLabel(status)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Subject</span>
                      <input
                        type="text"
                        value={editState.subject}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, subject: event.target.value } : prev
                          )
                        }
                        className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                      />
                    </label>

                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Body</span>
                      <textarea
                        value={editState.body}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, body: event.target.value } : prev
                          )
                        }
                        rows={6}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </label>

                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm font-medium text-slate-700">
                        <span>Required placeholders</span>
                        <input
                          type="text"
                          value={editState.requiredPlaceholders}
                          onChange={(event) =>
                            setEditState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    requiredPlaceholders: event.target.value,
                                  }
                                : prev
                            )
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>
                      <label className="space-y-1 text-sm font-medium text-slate-700">
                        <span>Optional placeholders</span>
                        <input
                          type="text"
                          value={editState.optionalPlaceholders}
                          onChange={(event) =>
                            setEditState((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    optionalPlaceholders: event.target.value,
                                  }
                                : prev
                            )
                          }
                          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900"
                        />
                      </label>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                      <span className="font-semibold text-slate-700">Detected placeholders:</span>{" "}
                      {placeholderPreview.length > 0 ? placeholderPreview.join(", ") : "none"}
                    </div>

                    <label className="space-y-1 text-sm font-medium text-slate-700">
                      <span>Preview sample values (JSON object)</span>
                      <textarea
                        value={editState.previewSampleValues}
                        onChange={(event) =>
                          setEditState((prev) =>
                            prev ? { ...prev, previewSampleValues: event.target.value } : prev
                          )
                        }
                        rows={4}
                        placeholder='{"code":"654321","user_name":"Stian"}'
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                      />
                    </label>

                    {editRenderedPreview ? (
                      <div className="space-y-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
                        {editPreviewSample.error ? (
                          <p className="text-rose-700">{editPreviewSample.error}</p>
                        ) : null}
                        <p>
                          <span className="font-semibold text-slate-700">Rendered subject:</span>{" "}
                          {editRenderedPreview.subject || "—"}
                        </p>
                        <p className="font-semibold text-slate-700">Rendered body:</p>
                        <pre className="font-mono text-xs whitespace-pre-wrap text-slate-700">
                          {editRenderedPreview.body || "—"}
                        </pre>
                        {editRenderedPreview.usedFallbackKeys.length > 0 ? (
                          <p>
                            <span className="font-semibold text-slate-700">
                              Fallback defaults used:
                            </span>{" "}
                            {editRenderedPreview.usedFallbackKeys.join(", ")}
                          </p>
                        ) : null}
                        {editRenderedPreview.missingKeys.length > 0 ? (
                          <p className="text-amber-700">
                            <span className="font-semibold text-amber-800">
                              Missing preview values:
                            </span>{" "}
                            {editRenderedPreview.missingKeys.join(", ")}
                          </p>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void saveEdit()}
                        disabled={Boolean(savingId) || Boolean(quickStatusId)}
                        className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
                      >
                        {savingId === item.id ? "Saving…" : "Save changes"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditState(toEditFormState(item))}
                        disabled={Boolean(savingId) || Boolean(quickStatusId)}
                        className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Reset draft
                      </button>
                    </div>
                  </div>
                ) : null}

                {isHistoryOpen ? (
                  <div
                    className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white p-3"
                    data-testid="admin-email-template-history-panel"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
                        Revision history (latest 25)
                      </p>
                      <button
                        type="button"
                        onClick={() => void loadTemplateHistory(item.id)}
                        disabled={isHistoryLoading}
                        className="inline-flex h-7 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isHistoryLoading ? "Loading…" : "Refresh history"}
                      </button>
                    </div>

                    {isHistoryLoading ? (
                      <AdminManagerState tone="loading" density="compact" className="!mt-0">
                        Loading template history…
                      </AdminManagerState>
                    ) : null}

                    {!isHistoryLoading && historyError ? (
                      <AdminManagerState
                        tone="error"
                        density="compact"
                        className="!mt-0"
                        actionsClassName="mt-2 flex flex-wrap gap-2"
                        actions={
                          <button
                            type="button"
                            onClick={() => void loadTemplateHistory(item.id)}
                            className="inline-flex h-7 items-center justify-center rounded-lg border border-rose-200 bg-white px-2 text-xs font-medium text-rose-700 transition hover:bg-rose-50"
                          >
                            Retry
                          </button>
                        }
                      >
                        {historyError}
                      </AdminManagerState>
                    ) : null}

                    {!isHistoryLoading && !historyError && historyItems.length === 0 ? (
                      <AdminManagerState tone="empty" density="compact" className="!mt-0">
                        No revision entries yet.
                      </AdminManagerState>
                    ) : null}

                    {!isHistoryLoading && !historyError && historyItems.length > 0 ? (
                      <ul className="space-y-2">
                        {historyItems.map((entry) => (
                          <li
                            key={entry.id}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700"
                          >
                            <p className="font-semibold text-slate-800">
                              Rev {entry.revisionNumber} · {toRevisionActionLabel(entry.action)}
                            </p>
                            <p className="mt-1 text-slate-600">
                              {formatDateTime(entry.createdAt)} · by{" "}
                              {entry.changedByEmail ?? "unknown"}
                            </p>
                            <p className="mt-1 text-slate-600">
                              Snapshot status: {toSnapshotStatusLabel(entry.snapshotStatus)} ·
                              version {entry.snapshotVersion ?? "unknown"}
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
