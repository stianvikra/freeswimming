"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ADMIN_EMAIL_TEMPLATE_STATUS_VALUES,
  canTransitionAdminEmailTemplateStatus,
  extractAdminEmailTemplatePlaceholders,
  type AdminEmailTemplateRow,
  type AdminEmailTemplateStatus,
} from "@/lib/admin/email-templates";

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

type CreateFormState = {
  templateKey: string;
  locale: string;
  subject: string;
  body: string;
  requiredPlaceholders: string;
  optionalPlaceholders: string;
  status: "draft" | "review";
};

type EditFormState = {
  templateKey: string;
  locale: string;
  subject: string;
  body: string;
  requiredPlaceholders: string;
  optionalPlaceholders: string;
  status: AdminEmailTemplateStatus;
};

const CREATE_FORM_INITIAL: CreateFormState = {
  templateKey: "",
  locale: "nb-NO",
  subject: "",
  body: "",
  requiredPlaceholders: "",
  optionalPlaceholders: "",
  status: "draft",
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

  const placeholderPreview = useMemo(() => {
    if (!editState) return [];
    return extractAdminEmailTemplatePlaceholders(`${editState.subject}\n${editState.body}`);
  }, [editState]);

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
        <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {warning}
        </p>
      ) : null}

      {loading ? (
        <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Loading email templates…
        </p>
      ) : null}

      {!loading && error ? (
        <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
          <p className="text-sm font-medium text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => void loadTemplates()}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-rose-200 bg-white px-3 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      ) : null}

      {actionError ? (
        <p className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {actionError}
        </p>
      ) : null}

      {actionNotice ? (
        <p className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {actionNotice}
        </p>
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
        <p className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No templates created yet.
        </p>
      ) : null}

      {!loading && !error && items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {items.map((item) => {
            const isEditing = editingId === item.id;
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
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
