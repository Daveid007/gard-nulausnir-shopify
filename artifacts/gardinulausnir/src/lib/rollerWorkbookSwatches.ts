import { COLLECTIONS } from "../pages/storefront/_shared/fabric-collections.ts";
import type { RollerWorkbookFabric } from "../data/rollerWorkbookFabrics.ts";
import { ROLLER_SUPPLIER_PHOTOS } from "./rollerSupplierPhotos.ts";

import { zebraWorkbookSwatchFilename } from "./zebraWorkbookImages.ts";

const codeKey = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

// These workbook codes were reviewed against the complete supplier-code segment
// in the filename (the trailing timestamp is not part of that code). The public
// catalogue uses shortened display codes for these photos, so it cannot provide
// their exact workbook lookup keys.
const REVIEWED_WORKBOOK_IMAGE_MANIFEST: Readonly<Record<string, string>> = {
  // SK blackout photographs omit the workbook's RS prefix and 00 series
  // padding. Preserve the complete four-digit colour key for each match.
  RSSK000101: "柔景_0015_SK-0101_1779801913040.jpg",
  RSSK000105: "柔景_0016_SK-0105_1779801913040.jpg",
  RSSK000107: "柔景_0014_SK-0107_1779801913039.jpg",
  RSSK000404: "柔景_0013_SK-0404_1779801913039.jpg",
  RSSK000405: "柔景_0020_SK_0405_1779801913041.jpg",
  RSSK000406: "柔景_0019_SK_0406_1779801913040.jpg",
  RSSK000505: "柔景_0018_SK_0505_1779801913040.jpg",
  RSSK000540: "柔景_0017_SK_0540_1779801913040.jpg",
  RSBR170710001: "柔景_0036_RSBR_170710001_1779801961717.jpg",
  RSBR170710002: "柔景_0037_RSBR_170710002_1779801961718.jpg",
  RSBR170710006: "柔景_0038_RSBR_170710006_1779801961719.jpg",
  RSBR170710008: "柔景_0039_RSBR_170710008_1779801961719.jpg",
  RSEBR120220001: "柔景_0045_RSEBR_120220001_1779801961720.jpg",
  RSEBR120220002: "柔景_0046_RSEBR_120220002_1779801961724.jpg",
  RSEBR120220003: "柔景_0047_RSEBR_120220003_1779801961724.jpg",
  RSBR200490804: "柔景_0035_RSBR_20049_0804_1779801961716.jpg",
  RSBR200498608: "柔景_0031_RSBR_20049_8608_1779801913042.jpg",
  RSBR130210001: "柔景_0044_RSBR_130210001_1779801961720.jpg",
  RSBR130210002: "柔景_0043_RSBR_130210002_1779801961720.jpg",
  RSBR130210003: "柔景_0042_RSBR_130210003_1779801961720.jpg",
  RSBR130210004: "柔景_0041_RSBR_130210004_1779801961719.jpg",
  RSBR130210006: "柔景_0040_RSBR_130210006_1779801961719.jpg",
  RSGT30102: "柔景_0094_GT30102_1779802042322.jpg",
  RSGT30104: "柔景_0095_GT30104_1779802042322.jpg",
};

// All catalogue opacity categories contain roller-blind uses, so intentionally
// include every collection rather than filtering on collection.category.
// Never search filenames at runtime: supplier codes can also occur inside
// timestamps on unrelated honeycomb photos in the shared asset directory.
const rollerImagesByCode = new Map(
  COLLECTIONS.flatMap((collection) =>
    collection.swatches.map((swatch) => [codeKey(swatch.code), swatch.img] as const),
  ),
);

export function rollerWorkbookSwatchFilename(
  fabric: Pick<RollerWorkbookFabric, "family" | "code">,
): string | undefined {
  if (fabric.family === "zebra") return zebraWorkbookSwatchFilename(fabric.code);
  if (fabric.family !== "roller") return undefined;
  const supplierSource = ROLLER_SUPPLIER_PHOTOS[fabric.code];
  if (supplierSource) return `supplier-${fabric.code}.${supplierSource.includes(".pdf#") ? "jpg" : "webp"}`;
  const code = codeKey(fabric.code);
  // Some workbook roller codes add RS to the existing supplier code.
  // All lookups are exact catalogue/manifest keys, never filename substrings.
  return REVIEWED_WORKBOOK_IMAGE_MANIFEST[code] ??
    rollerImagesByCode.get(code) ??
    (code.startsWith("RS") ? rollerImagesByCode.get(code.slice(2)) : undefined);
}