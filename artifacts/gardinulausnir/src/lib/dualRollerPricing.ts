import { normalizeQuantity } from "./quantity.ts";
import { retailPriceFromSupplierUsd, SUPPLIER_TO_RETAIL_ISK } from "./pricing";

export const DUAL_ROLLER_RETAIL_ISK = SUPPLIER_TO_RETAIL_ISK;
export const DUAL_ROLLER_ACCESSORY_ISK = SUPPLIER_TO_RETAIL_ISK;
export const DUAL_ROLLER_MIN_SQM = 1;
export const DUAL_ROLLER_MAX_SQM = 5.6;

export type DualRollerPricingInput = {
  width: number;
  height: number;
  quantity: number;
  comboUsdPerSqm: number;
  operation: "manual" | "cordless" | "motor";
  sideTrack: boolean;
};

export type DualRollerPrice = {
  rawArea: number;
  billedArea: number;
  perPieceUSD: number;
  totalUSD: number;
  fabricUSD: number;
  cordlessUSD: number;
  motorUSD: number;
  remoteUSD: number;
  sidetrackUSD: number;
  perPieceISK: number;
  totalISK: number;
  widthOK: boolean;
  heightOK: boolean;
  areaOK: boolean;
  w: number;
  h: number;
};

export function calculateDualRollerPrice(input: DualRollerPricingInput): DualRollerPrice {
  const width = Number.isFinite(input.width) ? input.width : 0;
  const height = Number.isFinite(input.height) ? input.height : 0;
  const quantity = normalizeQuantity(input.quantity);
  const w = Math.max(0.3, width / 1000);
  const h = Math.max(0.3, height / 1000);
  const rawArea = w * h;
  const billedArea = Math.max(DUAL_ROLLER_MIN_SQM, rawArea);

  const fabricUSD = billedArea * input.comboUsdPerSqm;
  const cordlessUSD = input.operation === "cordless" ? billedArea * 20 : 0;
  const motorUSD = input.operation === "motor" ? 142.26 : 0;
  const remoteUSD = input.operation === "motor" ? 14 : 0;
  const sidetrackUSD = input.sideTrack ? w * 20 : 0;

  const perPieceUSD = fabricUSD + cordlessUSD + motorUSD + remoteUSD + sidetrackUSD;
  const totalUSD = perPieceUSD * quantity;
  const perPieceISK = retailPriceFromSupplierUsd(perPieceUSD);
  const totalISK = perPieceISK * quantity;

  return {
    rawArea,
    billedArea,
    perPieceUSD,
    totalUSD,
    fabricUSD,
    cordlessUSD,
    motorUSD,
    remoteUSD,
    sidetrackUSD,
    perPieceISK,
    totalISK,
    widthOK: width >= 400 && width <= 3000,
    heightOK: height >= 500 && height <= 3000,
    areaOK: rawArea <= DUAL_ROLLER_MAX_SQM,
    w,
    h,
  };
}

export function calculateDualRollerCartTotal(input: DualRollerPricingInput): number {
  return calculateDualRollerPrice(input).totalISK;
}