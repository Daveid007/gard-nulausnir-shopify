// Landed supplier cost is for TWO identical blinds, including freight to Iceland.
export const ROLDOUr_REFERENCE = {
  productId: "roldour-slimline-duo-vertical",
  unitPriceIsk: Math.round((42214.20 / 2) * 1.45 * 1.24),
  description: "DUO · lóðrétt · myrkvun + net · einföld opnun · innfelld festing · Dark Grey rammi og efni · breidd 1500–1599 mm · hæð 1200–1299 mm",
} as const;

type ReferenceSelection = {
  mappedProductId: string;
  family: string;
  direction: string;
  system: string;
  openingType: string;
  fitting: string;
  measurementMode: string;
  material: string;
  frameColor: string;
  materialColor: string;
  widthMm: number;
  heightMm: number;
};

export function getRoldourReferencePrice(selection: ReferenceSelection): number | null {
  return selection.mappedProductId === ROLDOUr_REFERENCE.productId &&
    selection.family === "roldour" && selection.direction === "vertical" &&
    selection.system === "duo" && selection.material === "honeycomb" &&
    selection.openingType === "single" && selection.fitting === "recessed" &&
    selection.measurementMode === "opening" &&
    selection.frameColor === "Dark Grey" && selection.materialColor === "Dark Grey" &&
    selection.widthMm >= 1500 && selection.widthMm < 1600 &&
    selection.heightMm >= 1200 && selection.heightMm < 1300
      ? ROLDOUr_REFERENCE.unitPriceIsk : null;
}
