import QRCode from "qrcode";

export type QrGeneratedAssets = {
  svgMarkup: string;
  svgDataUrl: string;
  pngDataUrl: string;
};

const DEFAULT_QR_OPTIONS = {
  errorCorrectionLevel: "M" as const,
  margin: 2,
  width: 320,
  color: {
    dark: "#0f172a",
    light: "#ffffff",
  },
};

function toSvgDataUrl(svgMarkup: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
}

export async function generateQrAssets(value: string): Promise<QrGeneratedAssets> {
  const [svgMarkup, pngDataUrl] = await Promise.all([
    QRCode.toString(value, {
      ...DEFAULT_QR_OPTIONS,
      type: "svg",
    }),
    QRCode.toDataURL(value, {
      ...DEFAULT_QR_OPTIONS,
      type: "image/png",
    }),
  ]);

  return {
    svgMarkup,
    svgDataUrl: toSvgDataUrl(svgMarkup),
    pngDataUrl,
  };
}
