import { cx } from "@/components/ui/cx";

type MobileActionGroupOptions = {
  desktopJustify?: "start" | "end";
  equalTrio?: boolean;
};

const desktopJustifyClass: Record<
  NonNullable<MobileActionGroupOptions["desktopJustify"]>,
  string
> = {
  start: "sm:justify-start",
  end: "sm:justify-end",
};

function getMobileGridClass(count: number, equalTrio: boolean) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-2";
  if (count === 3) {
    return equalTrio
      ? "grid-cols-3"
      : "grid-cols-2 min-[420px]:grid-cols-3 [&>*:nth-child(3)]:col-span-2 min-[420px]:[&>*:nth-child(3)]:col-span-1";
  }
  if (count === 4) return "grid-cols-2";
  if (count === 5) {
    return "grid-cols-2 [&>*:nth-child(5)]:col-span-2 sm:[&>*:nth-child(5)]:col-span-1";
  }

  return "grid-cols-2";
}

export const mobileActionItemClass = "w-full min-w-0 text-center sm:w-auto";
export const mobilePrimaryActionItemClass = "w-full min-w-0 text-center sm:w-auto";

export const mobileSegmentedTrioClass = "grid w-full grid-cols-3 gap-1 sm:inline-grid sm:w-auto";

export function getMobileActionGroupClass(
  count: number,
  { desktopJustify = "end", equalTrio = false }: MobileActionGroupOptions = {}
) {
  return cx(
    "grid w-full gap-2",
    getMobileGridClass(count, equalTrio),
    "sm:w-auto sm:flex sm:flex-wrap sm:items-center",
    desktopJustifyClass[desktopJustify]
  );
}
