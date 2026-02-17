"use client";

import { useEffect } from "react";
import { sendClientAnalyticsEvent } from "@/lib/analytics/client";
import type { AnalyticsEventName } from "@/lib/analytics/events";

type Props = {
  eventName: AnalyticsEventName;
  payload?: Record<string, unknown>;
};

export default function TrackEventOnMount({ eventName, payload }: Props) {
  useEffect(() => {
    void sendClientAnalyticsEvent(eventName, payload);
  }, [eventName, payload]);

  return null;
}
