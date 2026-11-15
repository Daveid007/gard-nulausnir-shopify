export const RETAIL_INCREASE = 1.25 * 1.05;
export const INSTALLATION_ISK = 0;
export const SUPPLIER_TO_RETAIL_ISK = 2 * (1 / 0.6) * 121.16 * 1.24 * RETAIL_INCREASE;
export function fixedFreightBlindRetailPrice(supplierUsd: number): number {
  if (!Number.isFinite(supplierUsd) || supplierUsd < 0) throw new Error("Invalid supplier cost");
  return Math.round((supplierUsd + 100) * SUPPLIER_TO_RETAIL_ISK / 2);
}
