/**
 * WINdoûr supplier estimates.
 *
 * These rates are intentionally kept separate from the established blind
 * calculators.  The supplier family match is still tentative, so this module
 * exposes a quote (not a firm retail price) and keeps all assumptions explicit.
 */

export const WINDOUR_USD_TO_ISK = 121.16;
export const WINDOUR_SHIPPING_MULTIPLIER = 2;
// 40% margin on landed cost (not a 40% markup).
export const WINDOUR_MARKUP_MULTIPLIER = 1 / 0.6;
export const WINDOUR_VAT_MULTIPLIER = 1.24;
export const WINDOUR_QUOTE_VALID_DAYS = 30;
export const WINDOUR_QUOTE_EXPIRY_LABEL = "4. júlí — fyrra tilboð útrunnið";

export const WINDOUR_PRODUCT_IDS = [
  "windour-single-999",
  "windour-single-2000",
  "windour-duo-999",
  "windour-duo-2000",
] as const;

export type WindourProductId = (typeof WINDOUR_PRODUCT_IDS)[number];
export type WindourKind = "single" | "duo";
export type WindourMaterial = "honeycomb" | "polyester-net" | "taiwan-pet-net";

export type WindourProductConfig = {
  id: WindourProductId;
  kind: WindourKind;
  tier: "999" | "2000";
  maxDimensionCm: number;
  minimumChargeableSqm: number;
};

export type WindourMaterialOption = {
  value: WindourMaterial;
  label: string;
  supplierUsdPerSqm: number;
};

export const WINDOUR_MATERIAL_OPTIONS: readonly WindourMaterialOption[] = [
  {
    value: "honeycomb",
     label: "Myrkvunargardína",
    supplierUsdPerSqm: 29.5,
  },
  {
    value: "polyester-net",
    label: "Net · polyester",
    supplierUsdPerSqm: 27,
  },
  {
    value: "taiwan-pet-net",
    label: "Net · Taiwan PET",
    supplierUsdPerSqm: 25.5,
  },
] as const;

const PRODUCT_CONFIGS: Record<WindourProductId, WindourProductConfig> = {
  "windour-single-999": {
    id: "windour-single-999",
    kind: "single",
    tier: "999",
    maxDimensionCm: 99.9,
    minimumChargeableSqm: 1,
  },
  "windour-single-2000": {
    id: "windour-single-2000",
    kind: "single",
    tier: "2000",
    maxDimensionCm: 200,
    minimumChargeableSqm: 1,
  },
  "windour-duo-999": {
    id: "windour-duo-999",
    kind: "duo",
    tier: "999",
    maxDimensionCm: 99.9,
    minimumChargeableSqm: 1.2,
  },
  "windour-duo-2000": {
    id: "windour-duo-2000",
    kind: "duo",
    tier: "2000",
    maxDimensionCm: 200,
    minimumChargeableSqm: 1.2,
  },
};

export function isWindourProductId(value: string | undefined): value is WindourProductId {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(PRODUCT_CONFIGS, value);
}

export function getWindourProductConfig(id: WindourProductId): WindourProductConfig {
  return PRODUCT_CONFIGS[id];
}

export function materialOption(value: WindourMaterial): WindourMaterialOption {
  return WINDOUR_MATERIAL_OPTIONS.find((option) => option.value === value) ?? WINDOUR_MATERIAL_OPTIONS[0];
}

export type WindourQuoteInput = {
  productId: WindourProductId;
  widthCm: number;
  heightCm: number;
  quantity: number;
  material?: WindourMaterial;
};

export type WindourInputErrors = {
  width?: string;
  height?: string;
  quantity?: string;
  material?: string;
};

export type WindourQuote = {
  productId: WindourProductId;
  kind: WindourKind;
  tier: "999" | "2000";
  material: WindourMaterial;
  materialLabel: string;
  supplierUsdPerSqm: number;
  rawSqm: number;
  chargeableSqm: number;
  supplierProductUsd: number;
  estimatedShippingUsd: number;
  beforeVatUsd: number;
  estimatedVatUsd: number;
  totalUsd: number;
  unitIsk: number;
  quantity: number;
  totalIsk: number;
  provisional: true;
};

export function validateWindourInput(input: WindourQuoteInput): WindourInputErrors {
  const config = PRODUCT_CONFIGS[input.productId];
  const errors: WindourInputErrors = {};

  if (!Number.isFinite(input.widthCm) || input.widthCm <= 0) {
    errors.width = "Breidd verður að vera stærri en 0 cm.";
  } else if (input.widthCm > config.maxDimensionCm) {
    errors.width = `Hámarksbreidd fyrir ${config.tier} er ${config.maxDimensionCm} cm.`;
  }

  if (!Number.isFinite(input.heightCm) || input.heightCm <= 0) {
    errors.height = "Hæð verður að vera stærri en 0 cm.";
  } else if (input.heightCm > config.maxDimensionCm) {
    errors.height = `Hámarkshæð fyrir ${config.tier} er ${config.maxDimensionCm} cm.`;
  }

  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
    errors.quantity = "Fjöldi verður að vera heil tala frá 1 til 99.";
  }

  if (config.kind === "single") {
    const selectedMaterial = input.material;
    if (!selectedMaterial || !WINDOUR_MATERIAL_OPTIONS.some((option) => option.value === selectedMaterial)) {
       errors.material = "Veldu eitt efni fyrir einfaldar rúllugardínur.";
    }
  }

  return errors;
}

export function calculateWindourQuote(input: WindourQuoteInput): WindourQuote | null {
  const errors = validateWindourInput(input);
  if (Object.keys(errors).length > 0) return null;

  const config = PRODUCT_CONFIGS[input.productId];
  // Duo is one integrated system.  It is deliberately not multiplied by two
  // and does not receive the separate dual-opening surcharge.
  const material = config.kind === "duo"
     ? { value: "honeycomb" as const, label: "Tvískiptar Rúllugardínur (Duo) · myrkvun + net", supplierUsdPerSqm: 37 }
    : materialOption(input.material as WindourMaterial);
  const rawSqm = (input.widthCm * input.heightCm) / 10000;
  const chargeableSqm = Math.max(rawSqm, config.minimumChargeableSqm);
  const supplierProductUsd = material.supplierUsdPerSqm * chargeableSqm;
  const estimatedShippingUsd = supplierProductUsd * (WINDOUR_SHIPPING_MULTIPLIER - 1);
  const beforeVatUsd = supplierProductUsd * WINDOUR_SHIPPING_MULTIPLIER * WINDOUR_MARKUP_MULTIPLIER;
  const estimatedVatUsd = beforeVatUsd * (WINDOUR_VAT_MULTIPLIER - 1);
  const totalUsd = beforeVatUsd + estimatedVatUsd;
  const unitIsk = Math.round(totalUsd * WINDOUR_USD_TO_ISK);

  return {
    productId: input.productId,
    kind: config.kind,
    tier: config.tier,
    material: material.value,
    materialLabel: material.label,
    supplierUsdPerSqm: material.supplierUsdPerSqm,
    rawSqm,
    chargeableSqm,
    supplierProductUsd,
    estimatedShippingUsd,
    beforeVatUsd,
    estimatedVatUsd,
    totalUsd,
    unitIsk,
    quantity: input.quantity,
    totalIsk: unitIsk * input.quantity,
    provisional: true,
  };
}