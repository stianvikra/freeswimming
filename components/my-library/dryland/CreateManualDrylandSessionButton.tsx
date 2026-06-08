"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import DrylandFeedback from "@/components/my-library/dryland/DrylandFeedback";
import { buildManualDrylandStarterDraft } from "@/lib/dryland/manual";
import type { DrylandSaveApiResponse, DrylandSessionKind } from "@/lib/dryland/shared";

type Props = {
  sessionKind: DrylandSessionKind;
  label: string;
  ariaLabel?: string;
  pendingLabel?: string;
  className?: string;
  testId?: string;
  describedById?: string;
  hideInlineError?: boolean;
  icon?: ReactNode;
  onErrorChange?: (message: string) => void;
};

export default function CreateManualDrylandSessionButton({
  sessionKind,
  label,
  ariaLabel,
  pendingLabel = "Creating session...",
  className = "",
  testId = "create-manual-dryland-session",
  describedById,
  hideInlineError = false,
  icon,
  onErrorChange,
}: Props) {
  const router = useRouter();
  const [clientReady, setClientReady] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");
  const errorId = `${testId}-error`;

  useEffect(() => {
    setClientReady(true);
  }, []);

  async function handleCreateSession() {
    setIsCreating(true);
    setError("");
    onErrorChange?.("");

    try {
      const response = await fetch("/api/my-library/dryland", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceKind: "manual",
          sessionKind,
          draft: buildManualDrylandStarterDraft(sessionKind),
        }),
      });
      const responseBody = (await response
        .json()
        .catch(() => null)) as DrylandSaveApiResponse | null;

      if (!response.ok || !responseBody?.ok) {
        const nextError =
          responseBody && !responseBody.ok
            ? responseBody.error
            : "Could not create dryland session.";
        setError(nextError);
        onErrorChange?.(nextError);
        return;
      }

      router.push(`/my-library/dryland/${responseBody.session.id}`);
      router.refresh();
    } catch {
      const nextError = "Could not create dryland session.";
      setError(nextError);
      onErrorChange?.(nextError);
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        data-testid={testId}
        data-client-ready={clientReady ? "true" : "false"}
        onClick={() => void handleCreateSession()}
        disabled={!clientReady || isCreating}
        aria-label={ariaLabel}
        aria-describedby={error ? (describedById ?? errorId) : undefined}
        className={className}
      >
        {isCreating ? (
          pendingLabel
        ) : (
          <>
            {icon}
            {label}
          </>
        )}
      </button>
      {error && !hideInlineError ? (
        <DrylandFeedback id={errorId} tone="error" density="compact" testId={errorId}>
          <p>{error}</p>
        </DrylandFeedback>
      ) : null}
    </div>
  );
}
