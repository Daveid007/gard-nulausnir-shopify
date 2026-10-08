import { retailPriceFromSupplierUsd } from "./pricing.ts";

// Curtain-how_to_caculate_price-0612 - Iceland.xlsx, price sheet column G.
export const CURTAIN_FABRIC_USD: Record<string, number> = {
  "curtains-1000": 13.2161764705882,
  "curtains-2828": 12.3044117647059,
  "curtains-2883": 18.2308823529412,
  "curtains-2889": 18.2308823529412,
  "curtains-2890": 18.2308823529412,
  "curtains-3009": 15.0397058823529,
  "curtains-25965": 10,
};

export type CurtainStyle = "standard" | "s-wave";
export type CurtainControl = "manual" | "motorized";

export function calculateCurtainPrice(input: {
  productId: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  style: CurtainStyle;
  control: CurtainControl;
}) {
  const { productId, widthCm, heightCm, quantity, style, control } = input;
  const rate = Object.hasOwn(CURTAIN_FABRIC_USD, productId) ? CURTAIN_FABRIC_USD[productId] : undefined;
  if (rate === undefined) throw new Error("Verð fæst eftir fyrirspurn fyrir þetta efni.");
  if (![widthCm, heightCm, quantity].every(Number.isFinite) || widthCm <= 0 || heightCm <= 0 ||
      !Number.isSafeInteger(quantity) || quantity < 1) {
    throw new Error("Sláðu inn jákvæð mál og heilan fjölda.");
  }
  if (!["standard", "s-wave"].includes(style) || !["manual", "motorized"].includes(control)) {
    throw new Error("Veldu gilda útfærslu og stjórnun.");
  }
  // No confirmed finished-height allowance or manufacturing limits are provided.
  // This is an estimate, not an automatically purchasable made-to-measure item.
  const widthM = widthCm / 100;
  const fabricM = widthM * 2.5 + 0.2;
  const wave = style === "s-wave";
  const motorized = control === "motorized";
  const railRate = wave ? (motorized ? 17.5 : 11.2) : (motorized ? 11.5 : 5.58);
  const supplierUsd = fabricM * (rate + (wave ? 5.3 : 2.35294117647059) +
    (wave ? 3 : 1.47058823529412)) + widthM * railRate +
    2 * 2.20588235294118 + (motorized ? 81 : 0);
  const unitPrice = retailPriceFromSupplierUsd(supplierUsd);
  const totalPrice = unitPrice * quantity;
  if (!Number.isSafeInteger(totalPrice)) throw new Error("Mál eða fjöldi eru of stór.");
  return { fabricM, supplierUsd, unitPrice, totalPrice };
}
