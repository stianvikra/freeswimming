"use client";

import type React from "react";
import Link, { type LinkProps } from "next/link";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

type Props = LinkProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    eventName: AnalyticsEventName;
    payload?: Record<string, unknown>;
  };

export default function TrackedLink({ eventName, payload, onClick, children, ...rest }: Props) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (event.defaultPrevented) return;
    void sendClientAnalyticsEvent(eventName, payload);
  }

  return (
    <Link {...rest} onClick={handleClick}>
      {children}
    </Link>
  );
}
