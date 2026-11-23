// Baseline factors are unchanged; apply the new uplift after existing unit rounding.
export const ADDITIONAL_RETAIL_INCREASE = 1.15;
export function increasedRetailPriceIsk(currentUnitIsk: number): number {
  if (!Number.isFinite(currentUnitIsk) || currentUnitIsk < 0) throw new Error("Invalid retail price");
  return Math.round(Math.round(currentUnitIsk) * ADDITIONAL_RETAIL_INCREASE);
}
export const RETAIL_INCREASE = 1;
export const INSTALLATION_ISK = 0;
export const SUPPLIER_TO_RETAIL_ISK = 2 * (1 / 0.6) * 121.16 * 1.24 * RETAIL_INCREASE;
// REV 5 cost + quantity freight; 40% gross margin before installation/overheads.
// No legacy 25%/5% uplifts or reference-basket adjustment.
export const BLIND_GROSS_MARGIN = 0.40;
export const LANDED_TO_RETAIL_ISK = 121.16 * 1.24 / (1 - BLIND_GROSS_MARGIN);
export function freightBlindRetailPrice(supplierUsd: number, freightUsd: number): number {
  if (!Number.isFinite(supplierUsd) || supplierUsd < 0) throw new Error("Invalid supplier cost");
  if (!Number.isFinite(freightUsd) || freightUsd < 0) throw new Error("Invalid freight cost");
  return Math.round((supplierUsd + freightUsd) * LANDED_TO_RETAIL_ISK);
}
