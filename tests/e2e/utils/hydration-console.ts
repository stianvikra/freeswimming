import type { Page } from "@playwright/test";

const HYDRATION_WARNING_PATTERN =
  /hydration|server rendered html.*client|client properties|did not match|text content does not match/i;

export function collectHydrationConsoleMessages(page: Page) {
  const messages: string[] = [];

  page.on("console", (message) => {
    const type = message.type();
    if (type !== "error" && type !== "warning") {
      return;
    }

    const text = message.text();
    if (!HYDRATION_WARNING_PATTERN.test(text)) {
      return;
    }

    messages.push(`${type}: ${text}`);
  });

  page.on("pageerror", (error) => {
    const text = error.message;
    if (!HYDRATION_WARNING_PATTERN.test(text)) {
      return;
    }

    messages.push(`pageerror: ${text}`);
  });

  return messages;
}
