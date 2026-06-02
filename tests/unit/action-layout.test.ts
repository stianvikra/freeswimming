import { expect, it } from "vitest";
import { getMobileActionGroupClass, mobileSegmentedTrioClass } from "@/components/ui/actionLayout";

it("maps mobile action counts without treating five as a hard technical limit", () => {
  expect(getMobileActionGroupClass(1)).toContain("grid-cols-1");
  expect(getMobileActionGroupClass(2)).toContain("grid-cols-2");
  expect(getMobileActionGroupClass(3)).toContain("[&>*:nth-child(3)]:col-span-2");
  expect(getMobileActionGroupClass(3, { equalTrio: true })).toContain("grid-cols-3");
  expect(getMobileActionGroupClass(3, { stackOnMobile: true })).toContain("grid-cols-1");
  expect(getMobileActionGroupClass(4)).toContain("grid-cols-2");
  expect(getMobileActionGroupClass(5)).toContain("[&>*:nth-child(5)]:col-span-2");
  expect(getMobileActionGroupClass(6)).toContain("grid-cols-2");
  expect(mobileSegmentedTrioClass).toContain("grid-cols-3");
});
