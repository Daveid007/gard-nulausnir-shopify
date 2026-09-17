/**
 * Supplier-to-retail pricing shared by the calculators and cart.
 *
 * The supplier price is in USD. Shipping is intentionally equal to the
 * supplier cost (100%), then the 40% margin is applied to the landed cost,
 * followed by the current USD/ISK rate and VAT.  Do not round individual
 * fabric/accessory components: the result is rounded exactly once per unit.
 */
export const USD_TO_ISK = 121.16;
export const VAT_FACTOR = 1.24;
export const MARGIN_FACTOR = 1 / 0.6;
export const SUPPLIER_TO_RETAIL_ISK = 2 * MARGIN_FACTOR * USD_TO_ISK * VAT_FACTOR;

export const MOTOR_UP_TO_4M2_USD = 34.5573219076603;
export const MOTOR_OVER_4M2_USD = 71.1311073101807;
export const CORDLESS_USD_PER_SQM = 3;
export const NO_DRILL_USD_PER_SQM = 3;
export const U_TRACK_USD_PER_M = 10;
export const L_TRACK_USD_PER_M = 5;
export const HOLDER_USD = 5;
export const INSIDE_MOUNT_DEDUCTION_MM = 5;
export type MountPosition = "inside" | "outside";

export type HoneycombOperation = "manual" | "cordless" | "motor";
export type TdbuOperation = "manual" | "cordless";
export type HoneycombSizeLimits = {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  maxAreaSqm: number;
};

/**
 * Workbook "5. Size limit" rows for Standard honeycomb:
 *
 *   cord:     500–2750 × 800–3000 mm, 5.6 m²
 *   cordless: 500–2000 × 500–1800 mm, 3 m²
 *   motor:    550–2000 × 500–2500 mm, 4 m²
 *
 * The motor row in the workbook is 38/45 mm hardware, so 45 mm is supported
 * here while the 25 mm calculator intentionally has no motor operation.
 */
export const HONEYCOMB_45_LIMITS: Record<HoneycombOperation, HoneycombSizeLimits> = {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
  motor: { minWidthMm: 550, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
};

export type Honeycomb25Operation = "manual" | "cordless";
export const HONEYCOMB_25_LIMITS: Record<Honeycomb25Operation, HoneycombSizeLimits> = {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
};

/** Day & Night is the 45 mm standard rail in the workbook. */
export const DAYNIGHT_45_LIMITS: Record<HoneycombOperation, HoneycombSizeLimits> = {
  ...HONEYCOMB_45_LIMITS,
};
export const DAYNIGHT_LIMITS = DAYNIGHT_45_LIMITS;

/**
 * Workbook "TDBU cord" and "TDBU cordless" rows for the 45 mm product.
 * The workbook only lists motorized TDBU for 38 mm, so no 45 mm motor key is
 * intentionally present.
 */
export const TDBU_45_LIMITS: Record<TdbuOperation, HoneycombSizeLimits> = {
  manual: { minWidthMm: 800, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
};
export const TDBU_LIMITS = TDBU_45_LIMITS;

export type HoneycombProduct = "honeycomb-45" | "honeycomb-25" | "daynight" | "tdbu";

export function honeycombSizeLimits(
  product: HoneycombProduct,
  operation: HoneycombOperation,
): HoneycombSizeLimits | undefined {
  if (product === "honeycomb-45") return HONEYCOMB_45_LIMITS[operation];
  if (product === "honeycomb-25") {
    return operation === "motor" ? undefined : HONEYCOMB_25_LIMITS[operation];
  }
  if (product === "daynight") return DAYNIGHT_45_LIMITS[operation];
  return operation === "motor" ? undefined : TDBU_45_LIMITS[operation];
}

export function validateHoneycombSize(input: {
  product: HoneycombProduct;
  operation: HoneycombOperation;
  widthMm: number;
  heightMm: number;
  mountPosition?: MountPosition;
}): { ok: true; effectiveWidthMm: number; areaSqm: number; limits: HoneycombSizeLimits } | {
  ok: false;
  effectiveWidthMm: number;
  areaSqm: number;
  limits?: HoneycombSizeLimits;
} {
  const effectiveWidthMm = input.mountPosition === "inside"
    ? input.widthMm - INSIDE_MOUNT_DEDUCTION_MM
    : input.widthMm;
  const areaSqm = (effectiveWidthMm / 1000) * (input.heightMm / 1000);
  const limits = honeycombSizeLimits(input.product, input.operation);
  const ok = Boolean(
    limits &&
      effectiveWidthMm >= limits.minWidthMm &&
      effectiveWidthMm <= limits.maxWidthMm &&
      input.heightMm >= limits.minHeightMm &&
      input.heightMm <= limits.maxHeightMm &&
      areaSqm <= limits.maxAreaSqm,
  );
  return ok
    ? { ok: true, effectiveWidthMm, areaSqm, limits: limits! }
    : { ok: false, effectiveWidthMm, areaSqm, limits };
}

export function assertHoneycombSize(input: {
  product: HoneycombProduct;
  operation: HoneycombOperation;
  widthMm: number;
  heightMm: number;
  mountPosition?: MountPosition;
}): asserts input is typeof input {
  const result = validateHoneycombSize(input);
  if (!result.ok) {
    const limits = result.limits
      ? `${result.limits.minWidthMm}–${result.limits.maxWidthMm} × ${result.limits.minHeightMm}–${result.limits.maxHeightMm}mm, ${result.limits.maxAreaSqm}m²`
      : "this operation is not supported";
    throw new Error(
      `${input.product} ${input.operation} size ${input.widthMm}×${input.heightMm}mm ` +
      `(${result.areaSqm.toFixed(2)}m² effective) exceeds workbook limits: ${limits}`,
    );
  }
}

export type BlindOperation = "manual" | "chain" | "cordless" | "motor";

/** Retail ISK for one unit, with one final unit-level rounding operation. */
export function retailPriceFromSupplierUsd(supplierUsd: number): number {
  if (!Number.isFinite(supplierUsd) || supplierUsd < 0) {
    throw new Error(`Invalid supplier cost: ${supplierUsd}`);
  }
  return Math.round(supplierUsd * SUPPLIER_TO_RETAIL_ISK);
}

export function retailTotalFromSupplierUsd(supplierUsd: number, quantity: number): number {
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error(`Invalid quantity: ${quantity}`);
  return retailPriceFromSupplierUsd(supplierUsd) * quantity;
}

export function billedArea(widthMm: number, heightMm: number, minimum = 1): number {
  const area = (widthMm / 1000) * (heightMm / 1000);
  return Math.max(minimum, area);
}

export function motorSupplierUsd(areaSqm: number): number {
  return areaSqm > 4 ? MOTOR_OVER_4M2_USD : MOTOR_UP_TO_4M2_USD;
}

export type BlindAccessoryOptions = {
  operation?: BlindOperation;
  sideTrack?: boolean;
  /** Honeycomb U track is the default; 25mm honeycomb uses L track. */
  sideTrackType?: "u" | "l";
  noDrill?: boolean;
  holder?: boolean;
  mountPosition?: MountPosition;
};

/**
 * Add the supplier-cost accessories used by the blind calculators.  Motor
 * price is a complete motor cost from the workbook (remote included), not a
 * second ad-hoc remote charge.
 */
export function blindAccessorySupplierUsd(
  widthMm: number,
  heightMm: number,
  areaSqm: number,
  options: BlindAccessoryOptions = {},
): number {
  const operation = options.operation ?? "manual";
  const cordless = operation === "cordless" ? areaSqm * CORDLESS_USD_PER_SQM : 0;
  const noDrill = options.noDrill ? areaSqm * NO_DRILL_USD_PER_SQM : 0;
  const motor = operation === "motor" ? motorSupplierUsd(areaSqm) : 0;
  const track = options.sideTrack
    ? (options.sideTrackType === "l" ? L_TRACK_USD_PER_M : U_TRACK_USD_PER_M) * (heightMm / 1000)
    : 0;
  const holder = options.holder ? HOLDER_USD : 0;
  return cordless + noDrill + motor + track + holder;
}

export function blindSupplierUsd(
  widthMm: number,
  heightMm: number,
  fabricUsdPerSqm: number,
  options: BlindAccessoryOptions = {},
  minimumArea = 1,
): number {
  const effectiveWidthMm = options.mountPosition === "inside"
    ? widthMm - INSIDE_MOUNT_DEDUCTION_MM
    : widthMm;
  if (effectiveWidthMm <= 0) throw new Error(`Inside-mount width must exceed ${INSIDE_MOUNT_DEDUCTION_MM}mm`);
  const area = billedArea(effectiveWidthMm, heightMm, minimumArea);
  if (!Number.isFinite(fabricUsdPerSqm) || fabricUsdPerSqm < 0) {
    throw new Error(`Invalid fabric supplier cost: ${fabricUsdPerSqm}`);
  }
  return area * fabricUsdPerSqm + blindAccessorySupplierUsd(widthMm, heightMm, area, options);
}

export function blindRetailPriceIsk(
  widthMm: number,
  heightMm: number,
  fabricUsdPerSqm: number,
  options: BlindAccessoryOptions = {},
  minimumArea = 1,
): number {
  return retailPriceFromSupplierUsd(blindSupplierUsd(widthMm, heightMm, fabricUsdPerSqm, options, minimumArea));
}

// Honeycomb Standard (45mm) from the workbook's 45mm supplier table.
export const HONEYCOMB_45_RATES: Record<string, number> = {
  KS401: 18.02, KS402: 18.02, KS404: 18.02, KS406: 18.02, KS407: 18.02, KS408: 18.02, KS414: 18.02,
  KT401: 12.5, KT402: 12.5, KT403: 12.5, KT404: 12.5, KT405: 12.5, KT406: 12.5, KT407: 12.5,
  KT408: 12.5, KT409: 12.5, KT410: 12.5, KT411: 12.5, KT412: 12.5,
  KT413: 24.6, KT414: 24.6, KT415: 24.6, KT428: 24.6,
  KT431: 13, KT432: 13, KT433: 13, KT434: 13, KT435: 13,
  KB401: 14.26, KB402: 14.26, KB403: 14.26, KB404: 14.26, KB405: 14.26, KB406: 14.26,
  KB420: 27.18, KB422: 27.18, KB426: 27.18, KB428: 27.18,
  KB431: 14.26, KB432: 14.26, KB433: 14.26, KB434: 14.26, KB435: 14.26,
  KN405: 40.01, KN406: 40.01, KN407: 40.01,
};

// Honeycomb Standard (25mm) has a distinct supplier table.  The current
// 25mm uses its own codes; this table is exposed independently for API/cart
// validation and the UI uses neutral code-only swatches until matching assets exist.
export const HONEYCOMB_25_RATES: Record<string, number> = {
  KS801: 18.02, KS802: 18.02, KS803: 18.02, KS814: 18.02,
  KT802: 12.5, KT803: 12.5, KT804: 12.5, KT805: 12.5, KT807: 12.5, KT808: 12.5,
  KT810: 12.5, KT811: 12.5, KT812: 12.5, KT813: 12.5, KT814: 12.5, KT815: 12.5,
  KT831: 13, KT832: 13, KT833: 13, KT834: 13, KT835: 13,
  KB801: 14.26, KB802: 14.26, KB803: 14.26, KB804: 14.26, KB805: 14.26,
  KB806: 14.26, KB807: 14.26, KB808: 14.26, KB809: 14.26, KB810: 14.26,
  KB811: 14.26, KB812: 14.26, KB831: 14.26, KB832: 14.26, KB833: 14.26,
  KB834: 14.26, KB835: 14.26,
};

// TDBU is intentionally not an alias of the Standard table.
export const TDBU_RATES: Record<string, number> = {
  KT401: 16.0010700873129, KT402: 16.0010700873129, KT403: 16.0010700873129,
  KT404: 16.0010700873129, KT405: 16.0010700873129, KT406: 16.0010700873129,
  KT407: 16.0010700873129, KT408: 16.0010700873129, KT409: 16.0010700873129,
  KT410: 16.0010700873129, KT411: 16.0010700873129, KT412: 16.0010700873129,
  KT413: 28.6931231792052, KT414: 28.6931231792052, KT415: 28.6931231792052,
  KT431: 16.5010700873129, KT432: 16.5010700873129, KT433: 16.5010700873129,
  KT434: 16.5010700873129, KT435: 16.5010700873129,
  KB401: 18.3514502895152, KB402: 18.3514502895152, KB403: 18.3514502895152,
  KB404: 18.3514502895152, KB405: 18.3514502895152, KB406: 18.3514502895152,
  KB420: 28.26, KB422: 28.26, KB426: 28.26, KB428: 28.26,
  KB431: 18.3514502895152, KB432: 18.3514502895152, KB433: 18.3514502895152,
  KB434: 18.3514502895152, KB435: 18.3514502895152,
};

// Sheet 4/6 Day & Night combinations are keyed by the back-layer code.  The
// first layer does not change the supplier rate within a given code family.
export const DAYNIGHT_BACK_RATES: Record<string, number> = {
  KT401: 26.3427429770029, KT402: 26.3427429770029, KT403: 26.3427429770029,
  KT404: 26.3427429770029, KT405: 26.3427429770029, KT406: 26.3427429770029,
  KT407: 26.3427429770029, KT408: 26.3427429770029, KT409: 26.3427429770029,
  KT410: 39.0347960688951, KT411: 39.0347960688951, KT412: 39.0347960688951,
  KT413: 39.0347960688951, KT414: 39.0347960688951, KT415: 39.0347960688951,
  KT428: 26.3427429770029, KT431: 27.34, KT432: 27.34, KT433: 27.34, KT434: 27.34, KT435: 27.34,
  KB401: 28.6931231792052, KB402: 28.6931231792052, KB403: 28.6931231792052,
  KB404: 28.6931231792052, KB405: 28.6931231792052, KB406: 28.6931231792052,
  KB420: 41.6691455343199, KB422: 41.6691455343199, KB426: 41.6691455343199,
  KB428: 41.6691455343199, KB431: 28.6931231792052, KB432: 28.6931231792052,
  KB433: 28.6931231792052, KB434: 28.6931231792052, KB435: 28.6931231792052,
  KN405: 54.2872016063062, KN406: 54.2872016063062, KN407: 54.2872016063062,
};

export function honeycombSupplierRate(code: string, size: 25 | 45): number | undefined {
  return (size === 25 ? HONEYCOMB_25_RATES : HONEYCOMB_45_RATES)[code];
}

export function tdbuSupplierRate(code: string): number | undefined {
  return TDBU_RATES[code];
}

export function dayNightSupplierRate(_frontCode: string, backCode: string): number | undefined {
  return DAYNIGHT_BACK_RATES[backCode];
}