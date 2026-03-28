"use client";

import { useEffect, type Dispatch, type SetStateAction } from "react";

export const WORKOUT_NOTICE_AUTO_DISMISS_MS = 5000;

export function useAutoDismissNotice(
  value: string,
  setValue: Dispatch<SetStateAction<string>>,
  delayMs = WORKOUT_NOTICE_AUTO_DISMISS_MS
) {
  useEffect(() => {
    if (!value) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setValue("");
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [delayMs, setValue, value]);
}
