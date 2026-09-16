export const CURTAINS_CATEGORY = "curtains" as const;
export const GLUGGATJOLD_1000_ID = "curtains-1000" as const;
export const GLUGGATJOLD_2828_ID = "curtains-2828" as const;
export const GLUGGATJOLD_2883_ID = "curtains-2883" as const;

/**
 * Supplied swatches are the source of truth for each curtain product. Keep
 * every code-to-file mapping explicit: the numeric suffix is a colour code,
 * not a generated colour value or a product specification.
 */
export const GLUGGATJOLD_1000_SWATCHES = [
  { code: "1000.24", fileName: "SKU__0070_1000.24_1789585604366.jpg" },
  { code: "1000.25", fileName: "SKU__0071_1000.25_1789585604367.jpg" },
  { code: "1000.13", fileName: "SKU__0072_1000.13_1789585604367.jpg" },
  { code: "1000.19", fileName: "SKU__0073_1000.19_1789585604367.jpg" },
  { code: "1000.20", fileName: "SKU__0074_1000.20_1789585604367.jpg" },
  { code: "1000.01", fileName: "SKU__0075_1000.01_1789585604368.jpg" },
  { code: "1000.09", fileName: "SKU__0076_1000.09_1789585604368.jpg" },
  { code: "1000.30", fileName: "SKU__0077_1000.30_1789585604368.jpg" },
  { code: "1000.08", fileName: "SKU__0078_1000.08_1789585604368.jpg" },
  { code: "1000.07", fileName: "SKU__0079_1000.07_1789585604369.jpg" },
  { code: "1000.11", fileName: "SKU__0080_1000.11_1789585604370.jpg" },
  { code: "1000.06", fileName: "SKU__0081_1000.06_1789585604370.jpg" },
  { code: "1000.31", fileName: "SKU__0082_1000.31_1789585604370.jpg" },
  { code: "1000.04", fileName: "SKU__0083_1000.04_1789585604371.jpg" },
] as const;

export const GLUGGATJOLD_2828_SWATCHES = [
  { code: "2828.07", fileName: "SKU__0053_2828.07_1789592952571.jpg" },
  { code: "2828.08", fileName: "SKU__0054_2828.08_1789592952589.jpg" },
  { code: "2828.03", fileName: "SKU__0055_2828.03_1789592952589.jpg" },
  { code: "2828.09", fileName: "SKU__0056_2828.09_1789592952590.jpg" },
  { code: "2828.23", fileName: "SKU__0057_2828.23_1789592952590.jpg" },
  { code: "2828.06", fileName: "SKU__0058_2828.06_1789592952591.jpg" },
  { code: "2828.22", fileName: "SKU__0059_2828.22_1789592952591.jpg" },
  { code: "2828.21", fileName: "SKU__0060_2828.21_1789592952591.jpg" },
  { code: "2828.12", fileName: "SKU__0061_2828.12_1789592952591.jpg" },
  { code: "2828.02", fileName: "SKU__0062_2828.02_1789592952592.jpg" },
  { code: "2828.20", fileName: "SKU__0063_2828.20_1789592952592.jpg" },
  { code: "2828.19", fileName: "SKU__0064_2828.19_1789592952592.jpg" },
  { code: "2828.18", fileName: "SKU__0065_2828.18_1789592952592.jpg" },
  { code: "2828.17", fileName: "SKU__0066_2828.17_1789592952593.jpg" },
  { code: "2828.13", fileName: "SKU__0067_2828.13_1789592952593.jpg" },
  { code: "2828.16", fileName: "SKU__0068_2828.16_1789592952593.jpg" },
  { code: "2828.15", fileName: "SKU__0069_2828.15_1789592952594.jpg" },
] as const;

export const GLUGGATJOLD_2883_SWATCHES = [
  { code: "2883.03", fileName: "SKU__0047_2883.03_1789593007101.jpg" },
  { code: "2883.11", fileName: "SKU__0048_2883.11_1789593007103.jpg" },
  { code: "2883.10", fileName: "SKU__0049_2883.10_1789593007104.jpg" },
  { code: "2883.07", fileName: "SKU__0050_2883.07_1789593007104.jpg" },
  { code: "2883.02", fileName: "SKU__0051_2883.02_1789593007105.jpg" },
  { code: "2883.01", fileName: "SKU__0052_2883.01_1789593007105.jpg" },
] as const;

export type CurtainProductId =
  | typeof GLUGGATJOLD_1000_ID
  | typeof GLUGGATJOLD_2828_ID
  | typeof GLUGGATJOLD_2883_ID;
export type CurtainSwatchCode =
  | (typeof GLUGGATJOLD_1000_SWATCHES)[number]["code"]
  | (typeof GLUGGATJOLD_2828_SWATCHES)[number]["code"]
  | (typeof GLUGGATJOLD_2883_SWATCHES)[number]["code"];

export type CurtainProductDefinition = {
  id: CurtainProductId;
  title: string;
  productCode: string;
  lightControl?: string;
  swatches: readonly { code: string; fileName: string }[];
};

export const CURTAIN_PRODUCT_DEFINITIONS: readonly CurtainProductDefinition[] = [
  {
    id: GLUGGATJOLD_1000_ID,
    title: "Gluggatjöld — 1000",
    productCode: "1000",
    lightControl: "100% myrkvun",
    swatches: GLUGGATJOLD_1000_SWATCHES,
  },
  {
    id: GLUGGATJOLD_2828_ID,
    title: "Gluggatjöld — 2828",
    productCode: "2828",
    lightControl: "85% myrkvun",
    swatches: GLUGGATJOLD_2828_SWATCHES,
  },
  {
    id: GLUGGATJOLD_2883_ID,
    title: "Gluggatjöld — 2883",
    productCode: "2883",
    swatches: GLUGGATJOLD_2883_SWATCHES,
  },
] as const;

export function isCurtainProductId(value: string): value is CurtainProductId {
  return value === GLUGGATJOLD_1000_ID || value === GLUGGATJOLD_2828_ID || value === GLUGGATJOLD_2883_ID;
}

export function getCurtainProductDefinition(productId: string): CurtainProductDefinition | undefined {
  return CURTAIN_PRODUCT_DEFINITIONS.find((product) => product.id === productId);
}

export function curtainInquiryHref(code: string): string;
export function curtainInquiryHref(productId: CurtainProductId, code: string): string;
export function curtainInquiryHref(productIdOrCode: string, selectedCode?: string): string {
  const productId = selectedCode ? productIdOrCode as CurtainProductId : GLUGGATJOLD_1000_ID;
  const code = selectedCode ?? productIdOrCode;
  const productTitle = getCurtainProductDefinition(productId)?.title ?? "Gluggatjöld";
  const subject = `Fyrirspurn um ${productTitle} · ${code}`;
  const body = [
    "Góðan dag,",
    "",
    `Ég hef áhuga á ${productTitle}.`,
    `Valinn litakóði: ${code}`,
    "",
    "Vinsamlega sendið mér frekari upplýsingar.",
  ].join("\n");
  return `mailto:hallo@gardinulausnir.is?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
