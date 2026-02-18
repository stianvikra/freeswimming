import { describe, expect, it } from "vitest";
import { buildCatalogOverridesFromRows } from "@/lib/commerce/catalog-overrides";

describe("buildCatalogOverridesFromRows", () => {
  it("builds title/active overrides for known catalog product ids", () => {
    const overrides = buildCatalogOverridesFromRows([
      {
        id: "guide_poolside",
        slug: "poolside-guide",
        title: " Poolside Plus ",
        kind: "course_addon",
        active: false,
      },
    ]);

    expect(overrides.guide_poolside).toMatchObject({
      slug: "poolside-guide",
      title: "Poolside Plus",
      kind: "course_addon",
      active: false,
    });
  });

  it("ignores unknown product ids", () => {
    const overrides = buildCatalogOverridesFromRows([
      {
        id: "custom_offer",
        slug: "custom-offer",
        title: "Custom offer",
        kind: "course_addon",
        active: true,
      },
    ]);

    expect(overrides).toEqual({});
  });
});
