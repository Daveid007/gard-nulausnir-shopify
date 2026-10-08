import lifestyle1000 from "@/assets/curtains/gluggatjold-1000-lifestyle.png";
import {
  CURTAIN_PHOTO_FILES,
  CURTAIN_PRODUCT_DEFINITIONS,
  type CurtainProductId,
  type CurtainSwatchCode,
} from "./curtains";

// Explicit code-to-file mappings live in curtains.ts. These globs only turn
// those file names into bundled URLs (legacy swatches + extracted catalogue).
const legacyFiles = import.meta.glob("@/assets/curtains/*.jpg", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const catalogFiles = import.meta.glob("@/assets/curtains/catalog/*.jpeg", { eager: true, import: "default", query: "?url" }) as Record<string, string>;

const urlByFileName = new Map<string, string>();
for (const [path, url] of [...Object.entries(legacyFiles), ...Object.entries(catalogFiles)]) {
  urlByFileName.set(path.slice(path.lastIndexOf("/") + 1), url);
}

function fileUrl(fileName: string): string {
  const url = urlByFileName.get(fileName);
  if (!url) throw new Error(`Missing curtain asset: ${fileName}`);
  return url;
}

export type CurtainSwatchAsset = { code: string; fileName: string; image: string };

export const CURTAIN_SWATCH_ASSETS = Object.fromEntries(
  CURTAIN_PRODUCT_DEFINITIONS.map((product) => [
    product.id,
    product.swatches.map((swatch) => ({ ...swatch, image: fileUrl(swatch.fileName) })),
  ]),
) as Record<CurtainProductId, CurtainSwatchAsset[]>;

export const GLUGGATJOLD_1000_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-1000"];
export const GLUGGATJOLD_2828_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-2828"];
export const GLUGGATJOLD_2883_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-2883"];

export function curtainSwatchImage(productId: CurtainProductId, code: CurtainSwatchCode): string | undefined {
  return CURTAIN_SWATCH_ASSETS[productId].find((swatch) => swatch.code === code)?.image;
}

// The previously supplied 1000 lifestyle photo is kept; it reads better than the PDF crop.
const lifestyleOverrides: Partial<Record<CurtainProductId, string>> = {
  "curtains-1000": lifestyle1000,
};

export function curtainProductLifestyleImage(productId: CurtainProductId): string {
  return lifestyleOverrides[productId] ?? fileUrl(CURTAIN_PHOTO_FILES[productId].lifestyle);
}

export function curtainProductDetailImage(productId: CurtainProductId): string {
  return fileUrl(CURTAIN_PHOTO_FILES[productId].detail);
}

export function curtainProductCoverImage(productId: CurtainProductId): string {
  return curtainProductLifestyleImage(productId);
}

/** Secondary card image: the detail photo (index kept for API compatibility). */
export function curtainProductSwatchImage(productId: CurtainProductId, index: number): string {
  if (index === 1) return curtainProductDetailImage(productId);
  return CURTAIN_SWATCH_ASSETS[productId][index]?.image ?? curtainProductDetailImage(productId);
}
