import { describe, expect, it } from "vitest";
import { generateQrAssets } from "@/lib/qr-links/codegen";

describe("qr code generation", () => {
  it("generates SVG and PNG assets for stable link", async () => {
    const assets = await generateQrAssets("https://freeswimming.org/go/v/intro-video");

    expect(assets.svgMarkup.startsWith("<svg")).toBe(true);
    expect(assets.svgDataUrl.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(assets.pngDataUrl.startsWith("data:image/png;base64,")).toBe(true);
  });
});
