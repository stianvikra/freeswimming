"use client";

import { useEffect, useRef } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";
import { getBrowserLocalDayTimezone } from "@/lib/my-library/local-day";

type Props = {
  eventName: AnalyticsEventName;
  payload?: Record<string, unknown>;
  localDayTimezone?: string;
};

export default function TrackEventOnMount({ eventName, payload, localDayTimezone }: Props) {
  const hasTrackedTimezoneAwareEventRef = useRef(false);

  useEffect(() => {
    if (localDayTimezone === undefined) {
      void sendClientAnalyticsEvent(eventName, payload);
      return;
    }

    if (
      hasTrackedTimezoneAwareEventRef.current ||
      localDayTimezone !== getBrowserLocalDayTimezone()
    ) {
      return;
    }
    hasTrackedTimezoneAwareEventRef.current = true;
    void sendClientAnalyticsEvent(eventName, payload);
  }, [eventName, localDayTimezone, payload]);

  return null;
}
