import Image from "next/image";
import { cx } from "@/components/ui/cx";
import { getBrandAsset, getBrandAssetAlt, type BrandAssetId } from "@/lib/brand";

type BrandImageProps = {
  asset: BrandAssetId;
  alt?: string;
  decorative?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

export default function BrandImage({
  asset,
  alt,
  decorative = false,
  className,
  sizes,
  priority = false,
}: BrandImageProps) {
  const meta = getBrandAsset(asset);

  return (
    <Image
      src={meta.src_png}
      alt={decorative ? "" : (alt ?? getBrandAssetAlt(asset))}
      width={meta.width}
      height={meta.height}
      sizes={sizes ?? `${Math.max(64, Math.min(meta.width, 1600))}px`}
      priority={priority}
      className={cx("h-auto w-auto", className)}
    />
  );
}
