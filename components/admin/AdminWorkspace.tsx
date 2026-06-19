"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  BarChart3,
  CircleHelp,
  CreditCard,
  Flag,
  FolderTree,
  Inbox,
  Mail,
  MessageSquareText,
  QrCode,
  Tags,
  Users,
  type LucideIcon,
} from "lucide-react";
import AdminAnalyticsDashboard from "@/components/admin/AdminAnalyticsDashboard";
import AdminCommerceManager from "@/components/admin/AdminCommerceManager";
import AdminContentManager from "@/components/admin/AdminContentManager";
import AdminCategoriesManager from "@/components/admin/AdminCategoriesManager";
import AdminEmailTemplatesManager from "@/components/admin/AdminEmailTemplatesManager";
import AdminHelpCenter, { ADMIN_HELP_QUICK_ACTIONS } from "@/components/admin/AdminHelpCenter";
import AdminMessagesManager from "@/components/admin/AdminMessagesManager";
import AdminNotesManager from "@/components/admin/AdminNotesManager";
import AdminOperationsManager from "@/components/admin/AdminOperationsManager";
import AdminQrLinksManager from "@/components/admin/AdminQrLinksManager";
import AdminUsersManager from "@/components/admin/AdminUsersManager";
import { cx } from "@/components/ui/cx";
import type { AdminRole } from "@/lib/admin/access";
import {
  applyAdminTabToSearchParams,
  parseAdminTab,
  type AdminTab,
} from "@/lib/admin/admin-workspace";
import {
  buildAdminMessagesTabAriaLabel,
  formatAdminMessagesNeedsReplyBadgeCount,
  type AdminMessagesSummaryResponse,
} from "@/lib/admin/messages";

const TAB_LABELS: Array<{ id: AdminTab; label: string; subtitle: string; icon: LucideIcon }> = [
  {
    id: "content",
    label: "Content",
    subtitle: "Lessons, guides, and publish state",
    icon: FolderTree,
  },
  {
    id: "qr-links",
    label: "QR Links",
    subtitle: "Stable redirect registry and ownership",
    icon: QrCode,
  },
  {
    id: "commerce",
    label: "Commerce",
    subtitle: "Products, titles, and active sales status",
    icon: CreditCard,
  },
  {
    id: "operations",
    label: "Operations",
    subtitle: "Runtime flags and private-access status",
    icon: Flag,
  },
  {
    id: "analytics",
    label: "Analytics",
    subtitle: "Safe event dashboard, funnel, and data health",
    icon: BarChart3,
  },
  {
    id: "users",
    label: "Users",
    subtitle: "Accounts, access, support, and audited role controls",
    icon: Users,
  },
  {
    id: "email-templates",
    label: "Email templates",
    subtitle: "Draft, review, publish, and rollback-safe message copy",
    icon: Mail,
  },
  {
    id: "messages",
    label: "Messages",
    subtitle: "Stored intake, triage status, and notification diagnostics",
    icon: Inbox,
  },
  {
    id: "notes",
    label: "Notes",
    subtitle: "Internal tasks, categories, and completion status",
    icon: MessageSquareText,
  },
  {
    id: "categories",
    label: "Categories",
    subtitle: "Manage note/content taxonomy for dashboard workflows",
    icon: Tags,
  },
  {
    id: "help",
    label: "Help/Guide",
    subtitle: "How admin works, what each service does, and recovery playbooks",
    icon: CircleHelp,
  },
];

const adminTabButtonBaseClass =
  "fs-library-card flex min-h-11 w-full min-w-0 items-center gap-2.5 !border-transparent !bg-transparent px-2.5 py-2 text-left !shadow-none transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2";
const adminTabActiveClass =
  "fs-library-card-accent !border-[color:var(--fs-border-brand)] !bg-white/86 !shadow-[0_6px_18px_rgba(15,23,42,0.055)]";
const adminTabInactiveClass = "hover:!border-[color:var(--fs-border-brand)] hover:!bg-white/72";
const adminTabBadgeClass =
  "ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-amber-100 px-1.5 text-[11px] font-bold leading-none text-amber-900 ring-1 ring-amber-300";
const adminHelpSubnavClass =
  "hidden rounded-[var(--fs-radius-control)] border border-[color:var(--fs-border-soft)] bg-white/75 p-3 lg:block";
const adminHelpSubnavLinkClass =
  "block rounded-[var(--fs-radius-control)] px-3 py-2 text-xs font-semibold text-[color:var(--fs-color-muted)] transition-colors hover:bg-white hover:text-[color:var(--fs-color-brand-700)] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-700";

type Props = {
  role: AdminRole | null;
};

export default function AdminWorkspace({ role }: Props) {
  const pathname = usePathname() ?? "/admin";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messagesNeedsReplyCount, setMessagesNeedsReplyCount] = useState<number | null>(null);
  const [messagesSummaryStatus, setMessagesSummaryStatus] = useState<
    "idle" | "loaded" | "unavailable"
  >("idle");
  const activeTab = useMemo(
    () => parseAdminTab(searchParams?.get("tab") ?? null) ?? "content",
    [searchParams]
  );

  const activeMeta = useMemo(
    () => TAB_LABELS.find((tab) => tab.id === activeTab) ?? TAB_LABELS[0],
    [activeTab]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadMessagesSummary() {
      try {
        const response = await fetch("/api/admin/messages/summary", {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        });
        const payload = (await response.json()) as AdminMessagesSummaryResponse;
        if (cancelled) return;
        if (!response.ok || !payload.ok || !payload.schemaReady) {
          setMessagesNeedsReplyCount(null);
          setMessagesSummaryStatus("unavailable");
          return;
        }
        setMessagesNeedsReplyCount(payload.needsReplyCount);
        setMessagesSummaryStatus("loaded");
      } catch {
        if (!cancelled) {
          setMessagesNeedsReplyCount(null);
          setMessagesSummaryStatus("unavailable");
        }
      }
    }

    void loadMessagesSummary();

    return () => {
      cancelled = true;
    };
  }, []);

  function selectTab(tab: AdminTab) {
    const nextParams = applyAdminTabToSearchParams(
      new URLSearchParams(searchParams?.toString() ?? ""),
      tab
    );
    const nextHref = nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
    startTransition(() => {
      router.replace(nextHref, { scroll: false });
    });
  }

  return (
    <div className="contents" data-testid="admin-workspace-shell">
      <nav
        aria-label="Admin sections"
        className="mt-4 grid grid-cols-2 gap-2 pb-1 sm:grid-cols-3 lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:mt-0 lg:max-h-[calc(100vh-8rem)] lg:grid-cols-1 lg:overflow-y-auto lg:rounded-[var(--fs-radius-card)] lg:border lg:border-[color:var(--fs-border-soft)] lg:bg-white/42 lg:p-2 lg:shadow-[0_8px_22px_rgba(15,23,42,0.04)]"
        data-testid="admin-tab-grid"
      >
        {activeTab === "help" ? (
          <nav
            aria-label="Help/Guide sections"
            className={adminHelpSubnavClass}
            data-testid="admin-help-subnav"
          >
            <p className="px-3 text-[11px] font-semibold tracking-wide text-[color:var(--fs-color-brand-700)] uppercase">
              On this page
            </p>
            <div className="mt-2 space-y-1">
              {ADMIN_HELP_QUICK_ACTIONS.map((action) => (
                <a
                  key={action.id}
                  href={`#${action.id}`}
                  className={adminHelpSubnavLinkClass}
                  data-testid={`admin-help-subnav-${action.id}`}
                >
                  {action.label}
                </a>
              ))}
            </div>
          </nav>
        ) : null}

        {TAB_LABELS.map((tab) => {
          const isActive = tab.id === activeTab;
          const TabIcon = tab.icon;
          const needsReplyBadge =
            tab.id === "messages"
              ? formatAdminMessagesNeedsReplyBadgeCount(messagesNeedsReplyCount ?? 0)
              : null;
          const messagesAriaLabel =
            tab.id === "messages"
              ? buildAdminMessagesTabAriaLabel(messagesNeedsReplyCount)
              : undefined;
          return (
            <div key={tab.id} className="min-w-0">
              <button
                type="button"
                onClick={() => selectTab(tab.id)}
                data-testid={`admin-tab-${tab.id}`}
                title={tab.subtitle}
                aria-label={messagesAriaLabel}
                className={cx(
                  adminTabButtonBaseClass,
                  isActive ? adminTabActiveClass : adminTabInactiveClass
                )}
                aria-pressed={isActive}
              >
                <TabIcon
                  className={cx(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-[color:var(--fs-color-brand-700)]" : "text-slate-500"
                  )}
                  aria-hidden="true"
                />
                <p
                  className={cx(
                    "min-w-0 truncate text-sm font-semibold",
                    isActive ? "text-[color:var(--fs-color-brand-700)]" : "text-slate-900"
                  )}
                >
                  {tab.label}
                </p>
                {needsReplyBadge ? (
                  <span
                    className={adminTabBadgeClass}
                    aria-hidden="true"
                    data-testid="admin-tab-messages-needs-reply-badge"
                    title={`${messagesNeedsReplyCount} messages need reply`}
                  >
                    {needsReplyBadge}
                  </span>
                ) : null}
              </button>
            </div>
          );
        })}
        {messagesSummaryStatus === "unavailable" ? (
          <span className="sr-only" role="status" data-testid="admin-messages-summary-status">
            Messages needs-reply count unavailable.
          </span>
        ) : null}
      </nav>

      <div className="mt-5 min-w-0 lg:col-start-1" data-testid="admin-workspace-main">
        <span className="sr-only" data-testid="admin-active-section-label">
          {activeMeta.label}
        </span>
        <div className="space-y-5">
          {activeTab === "content" ? <AdminContentManager /> : null}
          {activeTab === "qr-links" ? <AdminQrLinksManager /> : null}
          {activeTab === "commerce" ? <AdminCommerceManager /> : null}
          {activeTab === "operations" ? <AdminOperationsManager /> : null}
          {activeTab === "analytics" ? <AdminAnalyticsDashboard /> : null}
          {activeTab === "users" ? <AdminUsersManager adminRole={role} /> : null}
          {activeTab === "email-templates" ? <AdminEmailTemplatesManager /> : null}
          {activeTab === "messages" ? <AdminMessagesManager adminRole={role} /> : null}
          {activeTab === "notes" ? <AdminNotesManager /> : null}
          {activeTab === "categories" ? <AdminCategoriesManager /> : null}
          {activeTab === "help" ? <AdminHelpCenter /> : null}
        </div>
      </div>
    </div>
  );
}
