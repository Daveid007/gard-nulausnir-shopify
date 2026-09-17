import { COLLECTIONS } from "../pages/storefront/_shared/fabric-collections.ts";
import type { RollerWorkbookFabric } from "../data/rollerWorkbookFabrics.ts";

const codeKey = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "");

// Only the explicit roller fabric catalogue may supply roller swatches.
// Never search filenames: supplier codes can also occur inside timestamps
// on unrelated honeycomb photos in the shared asset directory.
const rollerImagesByCode = new Map(
  COLLECTIONS.flatMap((collection) =>
    collection.swatches.map((swatch) => [codeKey(swatch.code), swatch.img] as const),
  ),
);

export function rollerWorkbookSwatchFilename(
  fabric: Pick<RollerWorkbookFabric, "family" | "code">,
): string | undefined {
  if (fabric.family !== "roller") return undefined;
  const code = codeKey(fabric.code);
  // Some workbook roller codes add RS to the existing supplier code.
  // Both lookups are exact catalogue keys, never filename substrings.
  return rollerImagesByCode.get(code) ??
    (code.startsWith("RS") ? rollerImagesByCode.get(code.slice(2)) : undefined);
}