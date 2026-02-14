import { describe, expect, it } from "vitest";
import { isIOSUserAgent, isMacSafariUserAgent } from "@/components/install/install-context";

describe("install context user agent detection", () => {
  it("detects iOS phones and iPadOS desktop-class user agents", () => {
    const iPhoneUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1";

    expect(isIOSUserAgent(iPhoneUA, "iPhone", 0)).toBe(true);
    expect(
      isIOSUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "MacIntel",
        5
      )
    ).toBe(true);
    expect(
      isIOSUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15",
        "MacIntel",
        0
      )
    ).toBe(false);
  });

  it("detects macOS Safari only and excludes other browsers or iOS", () => {
    const macSafariUA =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15";
    const macChromeUA =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36";
    const iOSSafariUA =
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1";

    expect(isMacSafariUserAgent(macSafariUA, "MacIntel", 0)).toBe(true);
    expect(isMacSafariUserAgent(macChromeUA, "MacIntel", 0)).toBe(false);
    expect(isMacSafariUserAgent(iOSSafariUA, "iPhone", 0)).toBe(false);
  });
});
