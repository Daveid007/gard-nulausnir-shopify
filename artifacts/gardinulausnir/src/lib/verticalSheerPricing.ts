/**
 * Authoritative supplier pricing for Vertical Sheer Shades / Dream Shades.
 *
 * Source: "Vertical_Sheer_Shades_-_How_to_caculate_the_price_-_20260610"
 * (sheets 1, 2, 4.price sheet and Size limit). The workbook prices every
 * fabric at the same USD/m² rate, bills at least 1 m² per blind, and adds
 * the motor and remote as separate supplier lines.
 */

import {
  SUPPLIER_TO_RETAIL_ISK,
  retailPriceFromSupplierUsd,
} from "./pricing.ts";

export const VERTICAL_SHEER_PRODUCT_ID = "vertical-sheer-shades";
export const VERTICAL_SHEER_RATE_USD_PER_SQM = 18.3985949617201;
export const VERTICAL_SHEER_MOTOR_USD = 88;
export const VERTICAL_SHEER_REMOTE_USD = 7;
export const VERTICAL_SHEER_WIDTH_DEDUCTION_MM = 5;
export const VERTICAL_SHEER_MINIMUM_BILLED_SQM = 1;

export type VerticalSheerOperation = "manual-chain" | "manual-wand" | "motor";
export type VerticalSheerInstallation = "inmount" | "outmount";

export type VerticalSheerSizeLimits = {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  maxAreaSqm: number;
};

/**
 * These are the two actual rows in the workbook's "Size limit" sheet:
 * manual = 500–4000 × 500–4000 mm, 12 m²; motor = 1000–6000 ×
 * 500–4000 mm, 24 m². The same manual envelope covers the plastic-chain and
 * WAND rows shown in the manual price sheet.
 */
export const VERTICAL_SHEER_LIMITS: Record<
  VerticalSheerOperation,
  VerticalSheerSizeLimits
> = {
  "manual-chain": {
    minWidthMm: 500,
    maxWidthMm: 4000,
    minHeightMm: 500,
    maxHeightMm: 4000,
    maxAreaSqm: 12,
  },
  "manual-wand": {
    minWidthMm: 500,
    maxWidthMm: 4000,
    minHeightMm: 500,
    maxHeightMm: 4000,
    maxAreaSqm: 12,
  },
  motor: {
    minWidthMm: 1000,
    maxWidthMm: 6000,
    minHeightMm: 500,
    maxHeightMm: 4000,
    maxAreaSqm: 24,
  },
};

export type VerticalSheerFabricType = "translucent" | "room-darkening";

/**
 * The 17 supplier codes from "4.price sheet". All rows have the exact same
 * cached supplier rate; retaining the map avoids a client-selected price
 * being trusted by the cart.
 */
export const VERTICAL_SHEER_FABRIC_RATES: Readonly<
  Record<string, { type: VerticalSheerFabricType; rateUsdPerSqm: number }>
> = {
  "MC-A-100601": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-A-100602": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-A-100605": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100101": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100102": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100103": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100105": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100111": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-B-100113": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-C-101101": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-D-101601": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-E-103101": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-E-103102": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-E-103111": { type: "translucent", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-RD-6001-1": { type: "room-darkening", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-RD-6001-2": { type: "room-darkening", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
  "MC-RD-6001-13": { type: "room-darkening", rateUsdPerSqm: VERTICAL_SHEER_RATE_USD_PER_SQM },
};

export const VERTICAL_SHEER_RAIL = "White track";
export const VERTICAL_SHEER_CHAIN_SIDE = "L-R";

export function verticalSheerFabricRate(code: string): number | undefined {
  return VERTICAL_SHEER_FABRIC_RATES[code]?.rateUsdPerSqm;
}

function isValidPositiveNumber(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export type VerticalSheerDimensions = {
  widthCm: number;
  heightCm: number;
  operation: VerticalSheerOperation;
  installation?: VerticalSheerInstallation;
};

export type VerticalSheerDimensionResult =
  | {
      ok: true;
      widthMm: number;
      heightMm: number;
      productionWidthMm: number;
      productionHeightMm: number;
      areaSqm: number;
      billedAreaSqm: number;
      limits: VerticalSheerSizeLimits;
    }
  | {
      ok: false;
      widthMm: number;
      heightMm: number;
      productionWidthMm: number;
      productionHeightMm: number;
      areaSqm: number;
      billedAreaSqm: number;
      limits?: VerticalSheerSizeLimits;
      reason: "invalid" | "outside-limits";
    };

/**
 * Workbook conversion from its inch examples, expressed for the storefront's
 * centimetre inputs: production width is input millimetres minus 5 mm and
 * production height is input millimetres unchanged. The sheet's note says
 * "deduct 20 mm" for in-mount, but its actual cached formula is J*25.4-5;
 * this helper follows the formula and does not silently substitute the note.
 */
export function validateVerticalSheerDimensions(
  input: VerticalSheerDimensions,
): VerticalSheerDimensionResult {
  const widthMm = input.widthCm * 10;
  const heightMm = input.heightCm * 10;
  const productionWidthMm = widthMm - VERTICAL_SHEER_WIDTH_DEDUCTION_MM;
  const productionHeightMm = heightMm;
  const areaSqm = (productionWidthMm / 1000) * (productionHeightMm / 1000);
  const billedAreaSqm = Math.max(VERTICAL_SHEER_MINIMUM_BILLED_SQM, areaSqm);
  const limits = VERTICAL_SHEER_LIMITS[input.operation];

  if (
    !isValidPositiveNumber(input.widthCm) ||
    !isValidPositiveNumber(input.heightCm) ||
    !Number.isFinite(widthMm) ||
    !Number.isFinite(heightMm) ||
    !Number.isFinite(areaSqm)
  ) {
    return {
      ok: false,
      widthMm,
      heightMm,
      productionWidthMm,
      productionHeightMm,
      areaSqm,
      billedAreaSqm,
      limits,
      reason: "invalid",
    };
  }

  const ok = Boolean(
    limits &&
      productionWidthMm >= limits.minWidthMm &&
      productionWidthMm <= limits.maxWidthMm &&
      productionHeightMm >= limits.minHeightMm &&
      productionHeightMm <= limits.maxHeightMm &&
      areaSqm <= limits.maxAreaSqm,
  );
  return ok
    ? {
        ok: true,
        widthMm,
        heightMm,
        productionWidthMm,
        productionHeightMm,
        areaSqm,
        billedAreaSqm,
        limits: limits!,
      }
    : {
        ok: false,
        widthMm,
        heightMm,
        productionWidthMm,
        productionHeightMm,
        areaSqm,
        billedAreaSqm,
        limits,
        reason: "outside-limits",
      };
}

export type VerticalSheerQuoteInput = VerticalSheerDimensions & {
  fabricCode: string;
  remoteController?: boolean;
  quantity?: number;
};

export type VerticalSheerQuote = {
  fabricCode: string;
  fabricType: VerticalSheerFabricType;
  operation: VerticalSheerOperation;
  remoteController: boolean;
  widthMm: number;
  heightMm: number;
  productionWidthMm: number;
  productionHeightMm: number;
  areaSqm: number;
  billedAreaSqm: number;
  fabricSupplierUsd: number;
  motorSupplierUsd: number;
  remoteSupplierUsd: number;
  supplierCostUsd: number;
  unitIsk: number;
  quantity: number;
  totalIsk: number;
};

/**
 * Complete supplier quote and retail conversion. The retail total rounds once
 * at unit level, then multiplies quantity, matching the existing pricing lib.
 */
export function calculateVerticalSheerQuote(input: VerticalSheerQuoteInput): VerticalSheerQuote {
  const fabric = VERTICAL_SHEER_FABRIC_RATES[input.fabricCode];
  if (!fabric) throw new Error(`No workbook rate for Vertical Sheer fabric ${input.fabricCode}`);
  const dimensions = validateVerticalSheerDimensions(input);
  if (!dimensions.ok) {
    throw new Error(
      `Vertical Sheer size ${input.widthCm}×${input.heightCm}cm exceeds workbook limits`,
    );
  }
  const quantity = input.quantity ?? 1;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw new Error(`Invalid Vertical Sheer quantity: ${quantity}`);
  }
  const remoteController = input.operation === "motor" && input.remoteController === true;
  const motorSupplierUsd = input.operation === "motor" ? VERTICAL_SHEER_MOTOR_USD : 0;
  const remoteSupplierUsd = remoteController ? VERTICAL_SHEER_REMOTE_USD : 0;
  const fabricSupplierUsd = fabric.rateUsdPerSqm * dimensions.billedAreaSqm;
  const supplierCostUsd = fabricSupplierUsd + motorSupplierUsd + remoteSupplierUsd;
  const unitIsk = retailPriceFromSupplierUsd(supplierCostUsd);
  return {
    fabricCode: input.fabricCode,
    fabricType: fabric.type,
    operation: input.operation,
    remoteController,
    ...dimensions,
    fabricSupplierUsd,
    motorSupplierUsd,
    remoteSupplierUsd,
    supplierCostUsd,
    unitIsk,
    quantity,
    totalIsk: unitIsk * quantity,
  };
}

export const VERTICAL_SHEER_RETAIL_FORMULA =
  "supplierCostUsd × 2 ÷ 0.6 × 121.16 × 1.24; round once per unit, then multiply quantity";

// Keep this export alongside the formula so regression tests can independently
// verify the source conversion without reaching into a component.
export const VERTICAL_SHEER_RETAIL_FACTOR = SUPPLIER_TO_RETAIL_ISK;