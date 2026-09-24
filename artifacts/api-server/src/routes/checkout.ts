import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  createShopifyDraftOrder,
  ShopifyCheckoutError,
  type ShopifyDraftOrderLine,
} from "../lib/shopifyAdminClient";
import {
  quoteRollerWorkbookBlind,
  type RollerWorkbookQuoteInput,
} from "../lib/rollerWorkbookPricing";

const router: IRouter = Router();

// One supplier USD receives 100% shipping, then 40% margin, FX and VAT.
// This is applied once to the complete per-unit supplier cost.
const USD_TO_ISK_RETAIL = 2 * (1 / 0.6) * 121.16 * 1.24;
const HOLDER_USD = 5.0;

// Honeycomb (cellular) — 45 mm Standard, with supplier USD/m² rates.
// Day & Night — 45 mm, with per-combination supplier USD/m² rates.
const DN_CORDLESS_USD_PER_SQM = 3;
const DN_MOTOR_USD = 34.5573219076603;
const DN_REMOTE_USD = 0;
const DN_SIDETRACK_USD_PER_M = 10;
const DN_MIN_SQM = 1;
const MOTOR_OVER_4M2_USD = 71.1311073101807;
const INSIDE_MOUNT_DEDUCTION_MM = 5;
type HoneycombOperation = "manual" | "cordless" | "motor";
type TdbuOperation = "manual" | "cordless";
type HoneycombSizeLimits = {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  maxAreaSqm: number;
};
const HONEYCOMB_45_LIMITS: Record<HoneycombOperation, HoneycombSizeLimits> = {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
  motor: { minWidthMm: 550, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
};
const HONEYCOMB_25_LIMITS: Record<"manual" | "cordless", HoneycombSizeLimits> = {
  manual: { minWidthMm: 500, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
};
const TDBU_45_LIMITS: Record<TdbuOperation, HoneycombSizeLimits> = {
  manual: { minWidthMm: 800, maxWidthMm: 2750, minHeightMm: 800, maxHeightMm: 3000, maxAreaSqm: 5.6 },
  cordless: { minWidthMm: 500, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 1800, maxAreaSqm: 3 },
};

function motorSupplierUsd(areaSqm: number): number {
  return areaSqm > 4 ? MOTOR_OVER_4M2_USD : DN_MOTOR_USD;
}

function effectiveWidthMm(widthMm: number, mountPosition: "inside" | "outside"): number {
  const width = mountPosition === "inside" ? widthMm - INSIDE_MOUNT_DEDUCTION_MM : widthMm;
  if (width <= 0) throw new Error(`Inside-mount width must exceed ${INSIDE_MOUNT_DEDUCTION_MM}mm`);
  return width;
}

function assertHoneycombSize(input: {
  product: "honeycomb-45" | "honeycomb-25" | "daynight" | "tdbu";
  operation: HoneycombOperation;
  widthMm: number;
  heightMm: number;
  mountPosition: "inside" | "outside";
}): void {
  const limits = input.product === "honeycomb-45" || input.product === "daynight"
    ? HONEYCOMB_45_LIMITS[input.operation]
    : input.product === "honeycomb-25"
      ? HONEYCOMB_25_LIMITS[input.operation as "manual" | "cordless"]
      : TDBU_45_LIMITS[input.operation as TdbuOperation];
  const effectiveWidth = effectiveWidthMm(input.widthMm, input.mountPosition);
  const areaSqm = (effectiveWidth / 1000) * (input.heightMm / 1000);
  if (
    !limits ||
    effectiveWidth < limits.minWidthMm ||
    effectiveWidth > limits.maxWidthMm ||
    input.heightMm < limits.minHeightMm ||
    input.heightMm > limits.maxHeightMm ||
    areaSqm > limits.maxAreaSqm
  ) {
    const envelope = limits
      ? `${limits.minWidthMm}–${limits.maxWidthMm} × ${limits.minHeightMm}–${limits.maxHeightMm}mm, ${limits.maxAreaSqm}m²`
      : "this operation is not supported";
    throw new Error(
      `${input.product} ${input.operation} size ${input.widthMm}×${input.heightMm}mm ` +
      `(${areaSqm.toFixed(2)}m² effective) exceeds workbook limits: ${envelope}`,
    );
  }
}

// Server-side roller fabric catalog — single source of truth for pricing.
// Client only sends fabricCode; server determines USD/m² and rejects unknown codes.
// Keep in sync with FABRICS in artifacts/solmyrkvun/src/components/PriceCalculator.tsx.
const ROLLER_FABRICS: Record<string, { name: string; usdPerSqm: number }> = {
  "TSD2261-1": { name: "DECO 2261 Ivory", usdPerSqm: 33.48 },
  "TSD2261-2": { name: "DECO 2261 Shell", usdPerSqm: 33.48 },
  "TSD2261-4": { name: "DECO 2261 Smoke", usdPerSqm: 33.48 },
  "TSD2262-2": { name: "DECO 2262 Oyster", usdPerSqm: 33.48 },
  "TSD2262-4": { name: "DECO 2262 Chrome", usdPerSqm: 33.48 },
  "TSD2262-5": { name: "DECO 2262 Sail", usdPerSqm: 33.48 },
  "TSD2265-1": { name: "DECO 2265 Cotton", usdPerSqm: 33.48 },
  "TSD2265-2": { name: "DECO 2265 Linen", usdPerSqm: 33.48 },
  "TSD2265-3": { name: "DECO 2265 Parchment", usdPerSqm: 33.48 },
  "TSD2265-4": { name: "DECO 2265 Pebble", usdPerSqm: 33.48 },
  "TSD2265-5": { name: "DECO 2265 Mica", usdPerSqm: 33.48 },
  "TSD2266-1": { name: "DECO 2266 Chalk", usdPerSqm: 33.48 },
  "TSD2266-3": { name: "DECO 2266 Cream", usdPerSqm: 33.48 },
  "TSD2266-4": { name: "DECO 2266 Concrete", usdPerSqm: 33.48 },
  "MA0-551": { name: "Private Nature 1% White/White", usdPerSqm: 39.78 },
  "MA0-552": { name: "Private Nature 1% White/Sand", usdPerSqm: 39.78 },
  "MA0-553": { name: "Private Nature 1% White/Grey", usdPerSqm: 39.78 },
  "CV3-0101": { name: "Clear Vision 3% White/White", usdPerSqm: 36.8 },
  "CV3-0104": { name: "Clear Vision 3% White/Black", usdPerSqm: 36.8 },
  "CV3-0105": { name: "Clear Vision 3% White/Grey", usdPerSqm: 36.8 },
  "CV3-0107": { name: "Clear Vision 3% White/Sand", usdPerSqm: 36.8 },
  "CV10-0101": { name: "Clear Vision 10% White/White", usdPerSqm: 36.8 },
  "CV10-0105": { name: "Clear Vision 10% White/Grey", usdPerSqm: 36.8 },
  "CV10-0107": { name: "Clear Vision 10% White/Sand", usdPerSqm: 36.8 },
  "MA0-M01": { name: "Mario 1% White/White", usdPerSqm: 31.15 },
  "MA0-M02": { name: "Mario 1% White/Sand", usdPerSqm: 31.15 },
  "MA0-M16": { name: "Mario 1% White/Linen", usdPerSqm: 31.15 },
  "MA0-M17": { name: "Mario 1% White/Dark Grey", usdPerSqm: 31.15 },
  "MA5-M01": { name: "Mario 5% White/White", usdPerSqm: 31.15 },
  "MA5-M02": { name: "Mario 5% White/Sand", usdPerSqm: 31.15 },
  "MA5-M16": { name: "Mario 5% White/Linen", usdPerSqm: 31.15 },
  "MA5-M17": { name: "Mario 5% White/Dark Grey", usdPerSqm: 31.15 },
  "HB3-0101": { name: "Horizontal Basket 3% White/White", usdPerSqm: 33.48 },
  "HB3-0105": { name: "Horizontal Basket 3% White/Grey", usdPerSqm: 33.48 },
  "HB3-0107": { name: "Horizontal Basket 3% White/Sand", usdPerSqm: 33.48 },
  "HB3-0403": { name: "Horizontal Basket 3% Black/Pearl", usdPerSqm: 33.48 },
  "HB3-0404": { name: "Horizontal Basket 3% Black/Black", usdPerSqm: 33.48 },
  "HB5-0101": { name: "Horizontal Basket 5% White/White", usdPerSqm: 32.83 },
  "HB5-0105": { name: "Horizontal Basket 5% White/Grey", usdPerSqm: 32.83 },
  "HB5-0107": { name: "Horizontal Basket 5% White/Sand", usdPerSqm: 32.83 },
  "HB5-0403": { name: "Horizontal Basket 5% Black/Pearl", usdPerSqm: 32.83 },
  "HB5-0404": { name: "Horizontal Basket 5% Black/Black", usdPerSqm: 32.83 },
  "D1-0103": { name: "D Series 1% White/Pearl", usdPerSqm: 32.63 },
  "D1-0104": { name: "D Series 1% White/Black", usdPerSqm: 32.63 },
  "D1-0105": { name: "D Series 1% White/Grey", usdPerSqm: 32.63 },
  "D1-0107": { name: "D Series 1% White/Sand", usdPerSqm: 32.63 },
  "D3-0103": { name: "D Series 3% White/Pearl", usdPerSqm: 32.28 },
  "D3-0104": { name: "D Series 3% White/Black", usdPerSqm: 32.28 },
  "BO-0101": { name: "Scala Blockout White", usdPerSqm: 36.28 },
  "BO-0102": { name: "Scala Blockout Linen", usdPerSqm: 36.28 },
  "BO-0103": { name: "Scala Blockout Grey", usdPerSqm: 36.28 },
  "BO-0105": { name: "Scala Blockout Pewter", usdPerSqm: 36.28 },
  "BO-0107": { name: "Scala Blockout Pearl", usdPerSqm: 36.28 },
  "SK00-0101": { name: "Solar Blockout 0% White/White", usdPerSqm: 36.8 },
  "SK00-0105": { name: "Solar Blockout 0% White/Grey", usdPerSqm: 36.8 },
  "SK00-0107": { name: "Solar Blockout 0% White/Sand", usdPerSqm: 36.8 },
  "SK00-0404": { name: "Solar Blockout 0% Black", usdPerSqm: 36.8 },
  "SK00-0405": { name: "Solar Blockout 0% Black/Grey", usdPerSqm: 36.8 },
  "SK00-0406": { name: "Solar Blockout 0% Black/Bronze", usdPerSqm: 36.8 },
  "SK00-0505": { name: "Solar Blockout 0% Grey", usdPerSqm: 36.8 },
  "SK00-0540": { name: "Solar Blockout 0% Grey/Dark Grey", usdPerSqm: 36.8 },
  "NPG-0101": { name: "NPG Blockout White", usdPerSqm: 37.53 },
  "NPG-0102": { name: "NPG Blockout Linen", usdPerSqm: 37.53 },
  "NPG-0103": { name: "NPG Blockout Grey", usdPerSqm: 37.53 },
  "NPG-0104": { name: "NPG Blockout Black", usdPerSqm: 37.53 },
  "NPDS2261-1": { name: "DECO 2261 Blockout Ivory", usdPerSqm: 41.15 },
  "NPDS2261-2": { name: "DECO 2261 Blockout Shell", usdPerSqm: 41.15 },
  "NPDS2261-4": { name: "DECO 2261 Blockout Smoke", usdPerSqm: 41.15 },
  "NPDS2262-2": { name: "DECO 2262 Blockout Oyster", usdPerSqm: 42.4 },
  "NPDS2262-4": { name: "DECO 2262 Blockout Chrome", usdPerSqm: 42.4 },
  "NPDS2262-5": { name: "DECO 2262 Blockout Sail", usdPerSqm: 42.4 },
  "NPDS2265-1": { name: "DECO 2265 Blockout Cotton", usdPerSqm: 43.65 },
  "NPDS2265-2": { name: "DECO 2265 Blockout Linen", usdPerSqm: 43.65 },
  "NPDS2265-3": { name: "DECO 2265 Blockout Parchment", usdPerSqm: 43.65 },
  "NPDS2265-4": { name: "DECO 2265 Blockout Pebble", usdPerSqm: 43.65 },
  "NPDS2265-5": { name: "DECO 2265 Blockout Mica", usdPerSqm: 43.65 },
  "NPDS2266-1": { name: "DECO 2266 Blockout Chalk", usdPerSqm: 44.9 },
  "NPDS2266-3": { name: "DECO 2266 Blockout Cream", usdPerSqm: 44.9 },
  "NPDS2266-4": { name: "DECO 2266 Blockout Concrete", usdPerSqm: 44.9 },
  "BR170710001": { name: "BR17071 Blockout White", usdPerSqm: 52.13 },
  "BR170710002": { name: "BR17071 Blockout Cream", usdPerSqm: 52.13 },
  "BR170710006": { name: "BR17071 Blockout Taupe", usdPerSqm: 52.13 },
  "BR170710008": { name: "BR17071 Blockout Black", usdPerSqm: 52.13 },
  "BR200493404": { name: "BR20049 Blockout Ivory", usdPerSqm: 49.68 },
  "BR200493504": { name: "BR20049 Blockout Light Grey", usdPerSqm: 49.68 },
  "BR200494304": { name: "BR20049 Blockout White", usdPerSqm: 49.68 },
  "BR200490804": { name: "BR20049 Blockout Dark Grey", usdPerSqm: 49.68 },
  "BR200498608": { name: "BR20049 Blockout Cobalt Blue", usdPerSqm: 49.68 },
  "BR130210001": { name: "BR13021 Blockout Linen", usdPerSqm: 52.43 },
  "BR130210002": { name: "BR13021 Blockout Tortilla", usdPerSqm: 52.43 },
  "BR130210003": { name: "BR13021 Blockout Ash-gray Brown", usdPerSqm: 52.43 },
  "BR130210004": { name: "BR13021 Blockout Light Brown", usdPerSqm: 52.43 },
  "BR130210006": { name: "BR13021 Blockout Black Brown", usdPerSqm: 52.43 },
  "EBR120220001": { name: "EBR12022 Blockout Grey Brown", usdPerSqm: 53.2 },
  "EBR120220002": { name: "EBR12022 Blockout Black", usdPerSqm: 53.2 },
  "EBR120220003": { name: "EBR12022 Blockout Taupe", usdPerSqm: 53.2 },
};

// Roller item — client sends fabricCode only; server looks up price.
const holderColorSchema = z.enum(["white", "navy", "black"]);
const railColorSchema = z.enum(["Svartur", "Hvítur", "Silfur / Grár", "Sandur / Beige", "Krémhvítur"]);
const mountPositionSchema = z.enum(["inside", "outside"]).default("outside");
const sideTrackTypeSchema = z.enum(["u", "l"]).default("u");
const rollerCassetteSchema = z.string().regex(/^(C1|C2|C3|C4|C5|C6|C7)\s+—\s+.+$/);
const rollerBottomRailSchema = z.string().refine(
  (value) =>
    ["Efnisvafið", "Ferningsstöng", "Hljóðlát stöng", "Þung stöng", "Boginn brún", "Rúnnuð stöng"]
      .some((name) => value.startsWith(`${name} (`)) &&
    ["Svartur", "Hvítur", "Silfur / Grár", "Sandur / Beige", "Krémhvítur"]
      .some((color) => value.endsWith(` · ${color}`)),
  { message: "Unknown roller bottom rail" },
);

const rollerItemSchema = z.object({
  type: z.literal("roller"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(300).max(3000),
  height: z.number().min(300).max(3500),
  cassette: rollerCassetteSchema,
  rail: rollerBottomRailSchema,
  fabricCode: z.string().min(1).max(40).refine((c) => c in ROLLER_FABRICS, {
    message: "Unknown fabric code",
  }),
  fabricColor: z.string().min(1).max(80),
  fabricType: z.enum(["blackout", "light-filtering"]),
  bottomRailType: z.enum(["Hulinn botnlisti", "Álbotnlisti"]),
  bottomRailColor: z.enum(["Sami litur og dúkur", "Hvítur", "Svartur", "Silfur / Grár"]),
  mountType: z.enum(["Veggfesting", "Loftfesting", "Smellifesting", "Klemma án borunar"]),
  operation: z.enum(["chain", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  holder: holderColorSchema.optional().nullable(),
});

// 45mm Day & Night — supplier "Middle Open Day & Night" combination sheet.
// Each combo defines which fabric families are valid for front/back layers.
const DAYNIGHT_COMBOS: Record<string, { front: "KS" | "KT"; back: "KB" | "KT"; usdPerSqm: number; label: string }> = {
  "KS+KB": { front: "KS", back: "KB", usdPerSqm: 28.6931231792052, label: "Sheer + Blackout" },
  "KT+KB": { front: "KT", back: "KB", usdPerSqm: 28.6931231792052, label: "Translucent + Blackout" },
  "KS+KT": { front: "KS", back: "KT", usdPerSqm: 26.3427429770029, label: "Sheer + Translucent" },
};

const DAYNIGHT_BACK_RATES: Record<string, number> = {
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
};

function fabricFamily(code: string): "KS" | "KT" | "KB" | "KN" | null {
  if (code.startsWith("KS")) return "KS";
  if (code.startsWith("KT")) return "KT";
  if (code.startsWith("KB")) return "KB";
  if (code.startsWith("KN")) return "KN";
  return null;
}

// Note: front/back family match validation happens in priceDaynightUsd so this schema stays
// a plain ZodObject (required by z.discriminatedUnion below).
const daynightItemSchema = z.object({
  type: z.literal("daynight"),
  qty: z.number().int().min(1).max(99),
   width: z.number().min(500).max(2750),
  height: z.number().min(500).max(3000),
  comboKey: z.enum(["KS+KB", "KT+KB", "KS+KT"]),
  frontCode: z.string().min(1).max(20),
  backCode: z.string().min(1).max(20),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  sideTrackType: sideTrackTypeSchema,
  mountPosition: mountPositionSchema,
  noDrill: z.boolean().default(false),
  railColor: railColorSchema,
});

// Dual Roller (Tvöfalt rúll) — two independent roller layers on one headrail.
// Uses the same KS/KT/KB fabric families as Day & Night; pricing mirrors the daynight
// supplier sheet since it draws from the same supplier catalogue.
const DUAL_ROLLER_COMBOS: Record<string, { front: "KS" | "KT"; back: "KB" | "KT"; usdPerSqm: number; label: string }> = {
  "KS+KB": { front: "KS", back: "KB", usdPerSqm: 64.48, label: "Sheer + Blackout" },
  "KT+KB": { front: "KT", back: "KB", usdPerSqm: 61.20, label: "Translucent + Blackout" },
  "KS+KT": { front: "KS", back: "KT", usdPerSqm: 62.50, label: "Sheer + Translucent" },
};

const DR_CORDLESS_USD_PER_SQM = 20;
const DR_MOTOR_USD = 142.26;
const DR_REMOTE_USD = 14;
const DR_SIDETRACK_USD_PER_M = 20;
const DR_MIN_SQM = 1;
const DR_MAX_SQM = 5.6;

const dualrollerItemSchema = z.object({
  type: z.literal("dualroller"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(400).max(3000),
  height: z.number().min(500).max(3000),
  comboKey: z.enum(["KS+KB", "KT+KB", "KS+KT"]),
  frontCode: z.string().min(1).max(20),
  backCode: z.string().min(1).max(20),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  railColor: railColorSchema,
});

// 45 mm Standard Honeycomb fabrics — supplier "Honeycomb Standard" table. Must mirror
// STANDARD_FABRICS in artifacts/solmyrkvun/src/components/HoneycombCalculator.tsx.
const STANDARD_HONEYCOMB_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "sheer" | "translucent" | "blackout" | "dualdeck" }> = {
  // Sheer
  KS401: { name: "White Sheer",        usdPerSqm: 18.02, type: "sheer" },
  KS402: { name: "Creamy Sheer",       usdPerSqm: 18.02, type: "sheer" },
  KS404: { name: "Pink Sheer",         usdPerSqm: 18.02, type: "sheer" },
  KS406: { name: "Lilac White Sheer",  usdPerSqm: 18.02, type: "sheer" },
  KS407: { name: "Mocha Sheer",        usdPerSqm: 18.02, type: "sheer" },
  KS408: { name: "Dove Grey Sheer",    usdPerSqm: 18.02, type: "sheer" },
  KS414: { name: "Black Sheer",        usdPerSqm: 18.02, type: "sheer" },
  // Translucent basic
  KT401: { name: "Simply White",       usdPerSqm: 12.5, type: "translucent" },
  KT402: { name: "Buckskin",           usdPerSqm: 12.5, type: "translucent" },
  KT403: { name: "Impatiens",          usdPerSqm: 12.5, type: "translucent" },
  KT404: { name: "Lavender Lily",      usdPerSqm: 12.5, type: "translucent" },
  KT405: { name: "Spring Green",       usdPerSqm: 12.5, type: "translucent" },
  KT406: { name: "Lime Light",         usdPerSqm: 12.5, type: "translucent" },
  KT407: { name: "Papyrus",            usdPerSqm: 12.5, type: "translucent" },
  KT408: { name: "Café",               usdPerSqm: 12.5, type: "translucent" },
  KT409: { name: "Indigo",             usdPerSqm: 12.5, type: "translucent" },
  KT410: { name: "Chocolate",          usdPerSqm: 12.5, type: "translucent" },
  KT411: { name: "Water Edge",         usdPerSqm: 12.5, type: "translucent" },
  KT412: { name: "Pottery Red",        usdPerSqm: 12.5, type: "translucent" },
  // Translucent premium
  KT413: { name: "Cloud White",        usdPerSqm: 24.6, type: "translucent" },
  KT414: { name: "Palegoldenrod",      usdPerSqm: 24.6, type: "translucent" },
  KT415: { name: "Sage",               usdPerSqm: 24.6, type: "translucent" },
  KT428: { name: "Linen",              usdPerSqm: 24.6, type: "translucent" },
  KT431: { name: "White",              usdPerSqm: 13, type: "translucent" },
  KT432: { name: "Light Apricot",      usdPerSqm: 13, type: "translucent" },
  KT433: { name: "Camel",              usdPerSqm: 13, type: "translucent" },
  KT434: { name: "Black",              usdPerSqm: 13, type: "translucent" },
  KT435: { name: "Grey Blue",          usdPerSqm: 13, type: "translucent" },
  // Blackout
  KB401: { name: "Liveingston",        usdPerSqm: 14.26, type: "blackout" },
  KB402: { name: "Tan",                usdPerSqm: 14.26, type: "blackout" },
  KB403: { name: "Maize",              usdPerSqm: 14.26, type: "blackout" },
  KB404: { name: "Bisque",             usdPerSqm: 14.26, type: "blackout" },
  KB405: { name: "Pottery Red",        usdPerSqm: 14.26, type: "blackout" },
  KB406: { name: "Indigo",             usdPerSqm: 14.26, type: "blackout" },
  KB420: { name: "White",              usdPerSqm: 27.18, type: "blackout" },
  KB422: { name: "Buckskin",           usdPerSqm: 27.18, type: "blackout" },
  KB426: { name: "Dove Grey",          usdPerSqm: 27.18, type: "blackout" },
  KB428: { name: "Linen",              usdPerSqm: 27.18, type: "blackout" },
  KB431: { name: "White",              usdPerSqm: 14.26, type: "blackout" },
  KB432: { name: "Light Apricot",      usdPerSqm: 14.26, type: "blackout" },
  KB433: { name: "Camel",              usdPerSqm: 14.26, type: "blackout" },
  KB434: { name: "Black",              usdPerSqm: 14.26, type: "blackout" },
  KB435: { name: "Grey Blue",          usdPerSqm: 14.26, type: "blackout" },
  // Dual-Deck Blackout (premium)
  KN405: { name: "Cloud White Dual-Deck", usdPerSqm: 40.01, type: "dualdeck" },
  KN406: { name: "Shell Dual-Deck",       usdPerSqm: 40.01, type: "dualdeck" },
  KN407: { name: "Sage Dual-Deck",        usdPerSqm: 40.01, type: "dualdeck" },
};

const HONEYCOMB25_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "sheer" | "translucent" | "blackout" }> = {};
for (const [code, name] of Object.entries({ KS801: "White", KS802: "Almond", KS803: "Pink", KS814: "Black" })) {
  HONEYCOMB25_FABRICS[code] = { name, usdPerSqm: 18.02, type: "sheer" };
}
for (const [code, name] of Object.entries({ KT802: "Buckskin", KT803: "Impatiens", KT804: "Spring Green", KT805: "Cumulus", KT807: "Zephyr", KT808: "Café", KT810: "Snow", KT811: "Eclipse", KT812: "Eventide", KT813: "Thistle", KT814: "Maize", KT815: "Glass Block" })) {
  HONEYCOMB25_FABRICS[code] = { name, usdPerSqm: 12.5, type: "translucent" };
}
for (const [code, name] of Object.entries({ KT831: "White", KT832: "Light Apricot", KT833: "Camel", KT834: "Black", KT835: "Grey Blue" })) {
  HONEYCOMB25_FABRICS[code] = { name, usdPerSqm: 13, type: "translucent" };
}
for (const [code, name] of Object.entries({ KB801: "Liveingston", KB802: "Pale Yellow", KB803: "Water Edge", KB804: "Spring Green", KB805: "Sedona", KB806: "Savannah", KB807: "Sawmill", KB808: "Chocolate", KB809: "Husk", KB810: "Thistle", KB811: "Maize", KB812: "Mink", KB831: "White", KB832: "Light Apricot", KB833: "Camel", KB834: "Black", KB835: "Grey Blue" })) {
  HONEYCOMB25_FABRICS[code] = { name, usdPerSqm: 14.26, type: "blackout" };
}

const honeycombItemSchema = z.object({
  type: z.literal("honeycomb"),
  qty: z.number().int().min(1).max(99),
   width: z.number().min(500).max(2750),
   height: z.number().min(500).max(3000),
  fabricCode: z.string().min(1).max(20).refine((c) => c in STANDARD_HONEYCOMB_FABRICS, {
    message: "Unknown honeycomb fabric code",
  }),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  sideTrackType: sideTrackTypeSchema,
  mountPosition: mountPositionSchema,
  noDrill: z.boolean().default(false),
  railColor: railColorSchema,
  bottomRail: railColorSchema,
  holder: holderColorSchema.optional().nullable(),
});

// 25 mm Standard Honeycomb — distinct 25mm supplier fabric table.
const honeycomb25ItemSchema = z.object({
  type: z.literal("honeycomb-25"),
  qty: z.number().int().min(1).max(99),
   width: z.number().min(500).max(2750),
   height: z.number().min(500).max(3000),
  fabricCode: z.string().min(1).max(20).refine((c) => c in HONEYCOMB25_FABRICS, {
    message: "Unknown honeycomb-25 fabric code",
  }),
  operation: z.enum(["manual", "cordless"]),
  sideTrack: z.boolean().optional().default(false),
  sideTrackType: z.literal("l").default("l"),
  mountPosition: mountPositionSchema,
  noDrill: z.boolean().default(false),
  railColor: railColorSchema,
  bottomRail: railColorSchema,
  holder: holderColorSchema.optional().nullable(),
});

// 45 mm TDBU (Top-Down Bottom-Up) fabrics — distinct supplier "Honeycomb TDBU" table.
// Sheer and Dual-Deck are not offered in TDBU (mechanism requires single-layer fabric).
const TDBU_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "translucent" | "blackout" }> = {
  KT401: { name: "Simply White",  usdPerSqm: 16.0010700873129, type: "translucent" },
  KT402: { name: "Buckskin",      usdPerSqm: 16.0010700873129, type: "translucent" },
  KT403: { name: "Impatiens",     usdPerSqm: 16.0010700873129, type: "translucent" },
  KT404: { name: "Lavender Lily", usdPerSqm: 16.0010700873129, type: "translucent" },
  KT405: { name: "Spring Green",  usdPerSqm: 16.0010700873129, type: "translucent" },
  KT406: { name: "Lime Light",    usdPerSqm: 16.0010700873129, type: "translucent" },
  KT407: { name: "Papyrus",       usdPerSqm: 16.0010700873129, type: "translucent" },
  KT408: { name: "Café",          usdPerSqm: 16.0010700873129, type: "translucent" },
  KT409: { name: "Indigo",        usdPerSqm: 16.0010700873129, type: "translucent" },
  KT410: { name: "Chocolate",     usdPerSqm: 16.0010700873129, type: "translucent" },
  KT411: { name: "Water Edge",    usdPerSqm: 16.0010700873129, type: "translucent" },
  KT412: { name: "Pottery Red",   usdPerSqm: 16.0010700873129, type: "translucent" },
  KT413: { name: "Cloud White",   usdPerSqm: 28.6931231792052, type: "translucent" },
  KT414: { name: "Palegoldenrod", usdPerSqm: 28.6931231792052, type: "translucent" },
  KT415: { name: "Sage",          usdPerSqm: 28.6931231792052, type: "translucent" },
  KT431: { name: "White",         usdPerSqm: 16.5010700873129, type: "translucent" },
  KT432: { name: "Light Apricot", usdPerSqm: 16.5010700873129, type: "translucent" },
  KT433: { name: "Camel",         usdPerSqm: 16.5010700873129, type: "translucent" },
  KT434: { name: "Black",         usdPerSqm: 16.5010700873129, type: "translucent" },
  KT435: { name: "Grey Blue",     usdPerSqm: 16.5010700873129, type: "translucent" },
  KB401: { name: "Liveingston",   usdPerSqm: 18.3514502895152, type: "blackout" },
  KB402: { name: "Tan",           usdPerSqm: 18.3514502895152, type: "blackout" },
  KB403: { name: "Maize",         usdPerSqm: 18.3514502895152, type: "blackout" },
  KB404: { name: "Bisque",        usdPerSqm: 18.3514502895152, type: "blackout" },
  KB405: { name: "Pottery Red",   usdPerSqm: 18.3514502895152, type: "blackout" },
  KB406: { name: "Indigo",        usdPerSqm: 18.3514502895152, type: "blackout" },
  KB420: { name: "White",         usdPerSqm: 28.26, type: "blackout" },
  KB422: { name: "Buckskin",      usdPerSqm: 28.26, type: "blackout" },
  KB426: { name: "Dove Grey",     usdPerSqm: 28.26, type: "blackout" },
  KB428: { name: "Linen",         usdPerSqm: 28.26, type: "blackout" },
  KB431: { name: "White",         usdPerSqm: 18.3514502895152, type: "blackout" },
  KB432: { name: "Light Apricot", usdPerSqm: 18.3514502895152, type: "blackout" },
  KB433: { name: "Camel",         usdPerSqm: 18.3514502895152, type: "blackout" },
  KB434: { name: "Black",         usdPerSqm: 18.3514502895152, type: "blackout" },
  KB435: { name: "Grey Blue",     usdPerSqm: 18.3514502895152, type: "blackout" },
};

const tdbuItemSchema = z.object({
  type: z.literal("tdbu"),
  qty: z.number().int().min(1).max(99),
   width: z.number().min(500).max(2750),
   height: z.number().min(500).max(3000),
  fabricCode: z.string().min(1).max(20).refine((c) => c in TDBU_FABRICS, {
    message: "Unknown TDBU fabric code",
  }),
   operation: z.enum(["manual", "cordless"]),
  sideTrack: z.boolean().optional().default(false),
  sideTrackType: sideTrackTypeSchema,
  mountPosition: mountPositionSchema,
  noDrill: z.boolean().default(false),
  railColor: railColorSchema,
});

// 45 mm Vertical (lóðrétt) — supplier "Vertical" sheet.
// Slats hang vertically; sheer/dual-deck not offered. No side track.
const VERTICAL_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "translucent" | "blackout" }> = {
  KT401: { name: "Simply White",  usdPerSqm: 36.41, type: "translucent" },
  KT402: { name: "Buckskin",      usdPerSqm: 36.41, type: "translucent" },
  KT403: { name: "Impatiens",     usdPerSqm: 36.41, type: "translucent" },
  KT404: { name: "Lavender Lily", usdPerSqm: 36.41, type: "translucent" },
  KT405: { name: "Spring Green",  usdPerSqm: 36.41, type: "translucent" },
  KT406: { name: "Lime Light",    usdPerSqm: 36.41, type: "translucent" },
  KT407: { name: "Papyrus",       usdPerSqm: 36.41, type: "translucent" },
  KT408: { name: "Café",          usdPerSqm: 36.41, type: "translucent" },
  KT409: { name: "Indigo",        usdPerSqm: 36.41, type: "translucent" },
  KT410: { name: "Chocolate",     usdPerSqm: 36.41, type: "translucent" },
  KT411: { name: "Water Edge",    usdPerSqm: 36.41, type: "translucent" },
  KT412: { name: "Pottery Red",   usdPerSqm: 36.41, type: "translucent" },
  KT413: { name: "Cloud White",   usdPerSqm: 36.41, type: "translucent" },
  KT414: { name: "Palegoldenrod", usdPerSqm: 36.41, type: "translucent" },
  KT415: { name: "Sage",          usdPerSqm: 36.41, type: "translucent" },
  KB401: { name: "Liveingston",   usdPerSqm: 42.48, type: "blackout" },
  KB402: { name: "Tan",           usdPerSqm: 42.48, type: "blackout" },
  KB403: { name: "Maize",         usdPerSqm: 42.48, type: "blackout" },
  KB404: { name: "Bisque",        usdPerSqm: 42.48, type: "blackout" },
  KB405: { name: "Pottery Red",   usdPerSqm: 42.48, type: "blackout" },
  KB406: { name: "Indigo",        usdPerSqm: 42.48, type: "blackout" },
  KB420: { name: "White",         usdPerSqm: 42.48, type: "blackout" },
  KB422: { name: "Buckskin",      usdPerSqm: 42.48, type: "blackout" },
  KB426: { name: "Dove Grey",     usdPerSqm: 42.48, type: "blackout" },
  KB428: { name: "Linen",         usdPerSqm: 42.48, type: "blackout" },
  KB431: { name: "White",         usdPerSqm: 42.48, type: "blackout" },
  KB432: { name: "Light Apricot", usdPerSqm: 42.48, type: "blackout" },
  KB433: { name: "Camel",         usdPerSqm: 42.48, type: "blackout" },
  KB434: { name: "Black",         usdPerSqm: 42.48, type: "blackout" },
  KB435: { name: "Grey Blue",     usdPerSqm: 42.48, type: "blackout" },
};

const VERTICAL_MAX_SQM = 14;

const verticalItemSchema = z.object({
  type: z.literal("vertical"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(800).max(4000),
  height: z.number().min(600).max(3500),
  fabricCode: z.string().min(1).max(20).refine((c) => c in VERTICAL_FABRICS, {
    message: "Unknown vertical fabric code",
  }),
  operation: z.enum(["manual", "motor"]),
  openingType: z.enum(["centre", "left", "right"]),
  railColor: railColorSchema,
});

const ZEBRA_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "translucent" | "room-darkening" | "blackout" }> = {
  "ZT-B1": { name: "Slæðugardína — Budget", usdPerSqm: 14.22, type: "translucent" },
  "ZT-BL52": { name: "Slæðugardína — Classic", usdPerSqm: 16.03, type: "translucent" },
  "ZT-G31": { name: "Slæðugardína — Premium", usdPerSqm: 16.12, type: "translucent" },
  "ZT-BL25": { name: "Slæðugardína — Lux", usdPerSqm: 17.94, type: "translucent" },
  "ZT-G37": { name: "Slæðugardína — Ultra", usdPerSqm: 17.19, type: "translucent" },
  "ZR-G35": { name: "85% Myrkvun — Grunnlína", usdPerSqm: 18.12, type: "room-darkening" },
  "ZR-BL200": { name: "90% Myrkvun — Venja", usdPerSqm: 18.59, type: "room-darkening" },
  "ZR-DF57": { name: "90% Myrkvun — Miðlæg", usdPerSqm: 19.05, type: "room-darkening" },
  "ZR-BL46": { name: "95% Myrkvun — Premium", usdPerSqm: 19.52, type: "room-darkening" },
  "ZB-BK2": { name: "100% Myrkvun — Venja", usdPerSqm: 20.45, type: "blackout" },
  "ZB-BK5": { name: "100% Myrkvun — Premium", usdPerSqm: 20.45, type: "blackout" },
  "ZB-HYBZ": { name: "100% Myrkvun — Hybrid", usdPerSqm: 20.45, type: "blackout" },
};

const zebraSizeLimits = {
  chain: { minW: 300, maxW: 2300, minH: 500, maxH: 2600, maxArea: 5.5 },
  cordless: { minW: 500, maxW: 1800, minH: 500, maxH: 2000, maxArea: 3.5 },
  motor: { minW: 520, maxW: 2300, minH: 500, maxH: 2600, maxArea: 5.5 },
} as const;

const zebraItemSchema = z.object({
  type: z.literal("zebra"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(300).max(2300),
  height: z.number().min(500).max(2600),
  fabricCode: z.string().refine((code) => code in ZEBRA_FABRICS, { message: "Unknown Zebra fabric code" }),
  operation: z.enum(["chain", "cordless", "motor"]),
  railColor: railColorSchema,
});

const rollerWorkbookConfigurationSchema = z.object({
  family: z.enum(["roller", "zebra", "sheer", "butterfly"]),
  fabricCode: z.string().min(1).max(80),
  widthCm: z.number().positive().max(400),
  heightCm: z.number().positive().max(400),
  operation: z.enum(["manual", "cordless", "motor"]),
  manualControl: z.enum(["cord", "plastic-chain", "steel-chain"]).optional(),
  motorType: z.enum(["battery-standard", "battery-wifi", "battery-zigbee", "wired", "wired-wifi"]).optional(),
  remote: z.boolean().optional(),
  hub: z.boolean().optional(),
  noDrill: z.boolean().optional(),
  mountPosition: z.enum(["inside", "outside"]),
  track: z.enum(["none", "u-white", "u-grey", "l-white", "l-black"]).optional(),
  cassette: z.enum(["Square with fabric inserted", "Arc with fabric inserted"]),
}).strict();

const rollerWorkbookItemSchema = z.object({
  type: z.literal("roller-workbook"),
  qty: z.number().int().min(1).max(99),
  // The two new IDs without confirmed Shopify variants are handled as custom
  // draft-order lines; existing catalogue IDs retain their real link.
  productId: z.enum(["square-cassette", "arc-cassette", "zebra-blind", "sheer-shades", "butterfly-blinds"]),
  configuration: rollerWorkbookConfigurationSchema,
  fabricName: z.string().min(1).max(120),
}).strict();

function productMatchesRollerWorkbookConfiguration(
  productId: z.infer<typeof rollerWorkbookItemSchema>["productId"],
  configuration: z.infer<typeof rollerWorkbookItemSchema>["configuration"],
): boolean {
  return (productId === "square-cassette" &&
      configuration.family === "roller" &&
      configuration.cassette === "Square with fabric inserted") ||
    (productId === "arc-cassette" &&
      configuration.family === "roller" &&
      configuration.cassette === "Arc with fabric inserted") ||
    (productId === "zebra-blind" && configuration.family === "zebra") ||
    (productId === "sheer-shades" && configuration.family === "sheer") ||
    (productId === "butterfly-blinds" && configuration.family === "butterfly");
}

const cartItemSchema = z.discriminatedUnion("type", [
  rollerItemSchema,
  daynightItemSchema,
  dualrollerItemSchema,
  honeycombItemSchema,
  honeycomb25ItemSchema,
  tdbuItemSchema,
  verticalItemSchema,
  zebraItemSchema,
  rollerWorkbookItemSchema,
]);

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
}).superRefine(({ items }, ctx) => {
  items.forEach((item, index) => {
    // The old roller/zebra tables are superseded by the Roller Blinds workbook.
    // Reject rather than allowing a stale client cart to receive old rates.
    if (item.type === "roller" || item.type === "zebra") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items", index, "type"],
        message: "Legacy roller and zebra lines must be reconfigured using the Roller Blinds workbook.",
      });
      return;
    }
    if (item.type !== "roller-workbook") return;
    if (!productMatchesRollerWorkbookConfiguration(item.productId, item.configuration)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items", index, "productId"],
        message: `${item.productId} does not match the selected Roller Blinds workbook configuration.`,
      });
    }
    const quote = quoteRollerWorkbookBlind({
      ...item.configuration,
      quantity: item.qty,
    } satisfies RollerWorkbookQuoteInput);
    if (!quote.ok) {
      quote.errors.forEach((message) => ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["items", index, "configuration"],
        message,
      }));
    }
  });
});

type RollerItem = z.infer<typeof rollerItemSchema>;
type DaynightItem = z.infer<typeof daynightItemSchema>;
type DualRollerItem = z.infer<typeof dualrollerItemSchema>;
type HoneycombItem = z.infer<typeof honeycombItemSchema>;
type Honeycomb25Item = z.infer<typeof honeycomb25ItemSchema>;
type TdbuItem = z.infer<typeof tdbuItemSchema>;
type VerticalItem = z.infer<typeof verticalItemSchema>;
type ZebraItem = z.infer<typeof zebraItemSchema>;
type RollerWorkbookItem = z.infer<typeof rollerWorkbookItemSchema>;
type CartItem = z.infer<typeof cartItemSchema>;

function priceRollerWorkbookUsd(item: RollerWorkbookItem): { unitUsd: number; description: string; name: string } {
  const quote = quoteRollerWorkbookBlind({
    ...item.configuration,
    quantity: item.qty,
  } satisfies RollerWorkbookQuoteInput);
  if (!quote.ok) throw new Error(`Invalid Roller Blinds workbook configuration: ${quote.errors.join(" ")}`);
  const manual = quote.manualControl ? ` · manual control: ${quote.manualControl}` : "";
  const motor = quote.motorType ? ` · motor: ${quote.motorType}` : "";
  return {
    unitUsd: quote.supplier.unitUsd,
    name: item.productId === "sheer-shades"
      ? "Sheer Shades"
      : item.productId === "butterfly-blinds"
        ? "Fiðrildagardína"
        : item.productId === "zebra-blind"
          ? "Sebragardína"
          : "Rúllugardína",
    description: `${quote.fabric.name} (${quote.fabric.code}) · color: ${quote.fabric.color} · ${quote.enteredWidthMm / 10}×${quote.heightMm / 10}cm · ${quote.operation}${manual}${motor} · remote: ${quote.remote ? "yes" : "no"} · hub: ${quote.hub ? "yes" : "no"} · mount: ${quote.mountPosition} · no-drill: ${quote.noDrill ? "yes" : "no"} · track: ${quote.track} · cassette: ${quote.cassette}`,
  };
}

function priceRollerUsd(item: RollerItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const area = w * h;
  const fabricEntry = ROLLER_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown fabric code: ${item.fabricCode}`);
  }
  const fabric = fabricEntry.usdPerSqm * area;
  const cordless = item.operation === "cordless" ? 6.25 * area : 0;
  const motor = item.operation === "motor" ? 100 + 17.5 : 0;
  const sideTrack = item.sideTrack ? 21.25 * h : 0;
  const holder = item.holder ? HOLDER_USD : 0;
  const unitUsd = fabric + cordless + motor + sideTrack + holder;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "keðja";
  const description = `${item.cassette} · ${item.bottomRailType} · ${item.bottomRailColor} · ${item.mountType} · ${fabricEntry.name} (${item.fabricCode}) · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
  return { unitUsd, description };
}

function priceDualRollerUsd(item: DualRollerItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > DR_MAX_SQM) {
    throw new Error(`Dual Roller area ${rawArea.toFixed(2)} m² exceeds ${DR_MAX_SQM} m² maximum`);
  }
  const combo = DUAL_ROLLER_COMBOS[item.comboKey];
  if (!combo) throw new Error(`Unknown Dual Roller combo: ${item.comboKey}`);
  if (fabricFamily(item.frontCode) !== combo.front || fabricFamily(item.backCode) !== combo.back) {
    throw new Error(
      `Dual Roller fabric codes ${item.frontCode}+${item.backCode} do not match combo ${item.comboKey} (expected ${combo.front}+${combo.back})`,
    );
  }
  const billedArea = Math.max(DR_MIN_SQM, rawArea);
  const fabric = billedArea * combo.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DR_CORDLESS_USD_PER_SQM : 0;
  const motor = item.operation === "motor" ? DR_MOTOR_USD + DR_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? w * DR_SIDETRACK_USD_PER_M : 0;
  const unitUsd = fabric + cordless + motor + sideTrack;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Tvöfalt rúll · ${combo.label} · ${item.frontCode}+${item.backCode} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}`;
  return { unitUsd, description };
}

function priceDaynightUsd(item: DaynightItem): { unitUsd: number; description: string } {
  const w = effectiveWidthMm(item.width, item.mountPosition) / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  assertHoneycombSize({
    product: "daynight",
    operation: item.operation,
    widthMm: item.width,
    heightMm: item.height,
    mountPosition: item.mountPosition,
  });
  const combo = DAYNIGHT_COMBOS[item.comboKey];
  if (!combo) throw new Error(`Unknown Day & Night combo: ${item.comboKey}`);
  if (!(item.frontCode in STANDARD_HONEYCOMB_FABRICS) || !(item.backCode in STANDARD_HONEYCOMB_FABRICS)) {
    throw new Error(`Unknown Day & Night fabric codes: ${item.frontCode}+${item.backCode}`);
  }
  if (fabricFamily(item.frontCode) !== combo.front || fabricFamily(item.backCode) !== combo.back) {
    throw new Error(
      `Day & Night fabric codes ${item.frontCode}+${item.backCode} do not match combo ${item.comboKey} (expected ${combo.front}+${combo.back})`,
    );
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  // Fabric and accessories use the same supplier-cost conversion.
  const backRate = DAYNIGHT_BACK_RATES[item.backCode];
  if (backRate === undefined) {
    throw new Error(`Unknown Day & Night supplier rate for back fabric: ${item.backCode}`);
  }
  const fabric = billedArea * backRate;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const noDrill = item.noDrill ? billedArea * 3 : 0;
  const motor = item.operation === "motor" ? motorSupplierUsd(billedArea) + DN_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? h * (item.sideTrackType === "l" ? 5 : DN_SIDETRACK_USD_PER_M) : 0;
  const unitUsd = fabric + cordless + noDrill + motor + sideTrack;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Day & Night 45mm · ${combo.label} · ${item.frontCode}+${item.backCode} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}`;
  return { unitUsd, description };
}

function priceHoneycombUsd(item: HoneycombItem): { unitUsd: number; description: string } {
  assertHoneycombSize({
    product: "honeycomb-45",
    operation: item.operation,
    widthMm: item.width,
    heightMm: item.height,
    mountPosition: item.mountPosition,
  });
  const w = effectiveWidthMm(item.width, item.mountPosition) / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  const fabricEntry = STANDARD_HONEYCOMB_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown honeycomb fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const noDrill = item.noDrill ? billedArea * 3 : 0;
  const motor = item.operation === "motor" ? motorSupplierUsd(billedArea) + DN_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? h * (item.sideTrackType === "l" ? 5 : DN_SIDETRACK_USD_PER_M) : 0;
  const holder = item.holder ? HOLDER_USD : 0;
  const unitUsd = fabric + cordless + noDrill + motor + sideTrack + holder;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Hunangskamb 45mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
  return { unitUsd, description };
}

function priceHoneycomb25Usd(item: Honeycomb25Item): { unitUsd: number; description: string } {
  assertHoneycombSize({
    product: "honeycomb-25",
    operation: item.operation,
    widthMm: item.width,
    heightMm: item.height,
    mountPosition: item.mountPosition,
  });
  const effectiveWidth = effectiveWidthMm(item.width, item.mountPosition);
  const w = effectiveWidth / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  const fabricEntry = HONEYCOMB25_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown honeycomb-25 fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const noDrill = item.noDrill ? billedArea * 3 : 0;
  const sideTrack = item.sideTrack ? h * 5 : 0;
  const holder = item.holder ? HOLDER_USD : 0;
  const unitUsd = fabric + cordless + noDrill + sideTrack + holder;
  const opLabel =
    item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Hunangskamb 25mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
  return { unitUsd, description };
}

function priceTdbuUsd(item: TdbuItem): { unitUsd: number; description: string } {
  assertHoneycombSize({
    product: "tdbu",
    operation: item.operation,
    widthMm: item.width,
    heightMm: item.height,
    mountPosition: item.mountPosition,
  });
  const w = effectiveWidthMm(item.width, item.mountPosition) / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  const fabricEntry = TDBU_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown TDBU fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const noDrill = item.noDrill ? billedArea * 3 : 0;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const sideTrack = item.sideTrack ? h * (item.sideTrackType === "l" ? 5 : DN_SIDETRACK_USD_PER_M) : 0;
  const unitUsd = fabric + cordless + noDrill + sideTrack;
  const opLabel = item.operation === "cordless" ? "snærislaust" : "handvirkt";
  const description = `TDBU 45mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · með hliðarlista" : ""}`;
  return { unitUsd, description };
}

function priceVerticalUsd(item: VerticalItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > VERTICAL_MAX_SQM) {
    throw new Error(`Vertical area ${rawArea.toFixed(2)} m² exceeds ${VERTICAL_MAX_SQM} m² maximum`);
  }
  const fabricEntry = VERTICAL_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown vertical fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const motor = item.operation === "motor" ? 142.26 + 14 : 0;
  const unitUsd = fabric + motor;
  const opLabel = item.operation === "motor" ? "mótor+fjarstýring" : "handvirkt";
  const openLabel =
    item.openingType === "centre" ? "miðopnun" : item.openingType === "left" ? "vinstri" : "hægri";
  const description = `Lóðrétt · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel} · ${openLabel}`;
  return { unitUsd, description };
}

function priceZebraUsd(item: ZebraItem): { unitUsd: number; description: string } {
  const area = (item.width / 1000) * (item.height / 1000);
  const limits = zebraSizeLimits[item.operation];
  if (
    item.width < limits.minW ||
    item.width > limits.maxW ||
    item.height < limits.minH ||
    item.height > limits.maxH ||
    area > limits.maxArea
  ) {
    throw new Error(
      `Zebra ${item.operation} size ${item.width}×${item.height}mm (${area.toFixed(2)}m²) exceeds supported limits`,
    );
  }
  const fabricEntry = ZEBRA_FABRICS[item.fabricCode];
  if (!fabricEntry) throw new Error(`Unknown Zebra fabric code: ${item.fabricCode}`);
  const fabric = area * fabricEntry.usdPerSqm;
  const motor = item.operation === "motor" ? 142.26 + 14 : 0;
  const unitUsd = fabric + motor;
  const operation = item.operation === "motor" ? "rafknúið" : item.operation === "cordless" ? "snærislaust" : "keðja";
  return {
    unitUsd,
    description: `Sebragardína · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${operation} · ${item.railColor}`,
  };
}

function priceItem(item: CartItem): { unitUsd: number; description: string; name: string } {
  if (item.type === "roller-workbook") return priceRollerWorkbookUsd(item);
  if (item.type === "roller") {
    const { unitUsd, description } = priceRollerUsd(item);
    return { unitUsd, description, name: "Rúllugardína" };
  }
  if (item.type === "honeycomb") {
    const { unitUsd, description } = priceHoneycombUsd(item);
    return { unitUsd, description, name: "Hunangskamb 45 mm" };
  }
  if (item.type === "honeycomb-25") {
    const { unitUsd, description } = priceHoneycomb25Usd(item);
    return { unitUsd, description, name: "Hunangskamb 25 mm" };
  }
  if (item.type === "tdbu") {
    const { unitUsd, description } = priceTdbuUsd(item);
    return { unitUsd, description, name: "TDBU Hunangskamb" };
  }
  if (item.type === "vertical") {
    const { unitUsd, description } = priceVerticalUsd(item);
    return { unitUsd, description, name: "Lóðrétt gluggatjald" };
  }
  if (item.type === "dualroller") {
    const { unitUsd, description } = priceDualRollerUsd(item);
    return { unitUsd, description, name: "Tvöfalt rúll" };
  }
  if (item.type === "zebra") {
    const { unitUsd, description } = priceZebraUsd(item);
    return { unitUsd, description, name: "Sebragardína" };
  }
  const { unitUsd, description } = priceDaynightUsd(item);
  return { unitUsd, description, name: "Day & Night" };
}

function rollerProductHandle(cassette: string): "arc-cassette" | "square-cassette" | "open-roll" {
  const code = cassette.split(/\s|—/)[0]?.trim();
  if (code === "C5") return "open-roll";
  if (code === "C1" || code === "C6" || code === "C7") return "arc-cassette";
  return "square-cassette";
}

function productHandle(item: CartItem): string | null {
  if (item.type === "roller-workbook") {
    return item.productId === "sheer-shades" || item.productId === "butterfly-blinds"
      ? null
      : item.productId;
  }
  if (item.type === "roller") return rollerProductHandle(item.cassette);
  if (item.type === "honeycomb") return "honeycomb-45mm";
  if (item.type === "honeycomb-25") return "honeycomb-25mm";
  if (item.type === "daynight") return "day-night";
  if (item.type === "tdbu") return "top-down-bottom-up";
  if (item.type === "vertical") return "vertical-45mm";
  if (item.type === "dualroller") return "dual-roller";
  return "zebra-blind";
}

function configurationAttributes(item: CartItem, description: string): Array<{ key: string; value: string }> {
  if (item.type === "roller-workbook") {
    const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: item.qty });
    if (!quote.ok) throw new Error(`Invalid Roller Blinds workbook configuration: ${quote.errors.join(" ")}`);
    return [
      { key: "Vörutegund", value: item.productId },
      { key: "Fjölskylda", value: quote.fabric.family },
      { key: "Efnisnúmer", value: quote.fabric.code },
      { key: "Efni", value: quote.fabric.name },
      { key: "Litur", value: quote.fabric.color },
      { key: "Breidd (cm)", value: String(quote.enteredWidthMm / 10) },
      { key: "Hæð (cm)", value: String(quote.heightMm / 10) },
      { key: "Stýring", value: quote.operation },
      ...(quote.manualControl ? [{ key: "Handstýring", value: quote.manualControl }] : []),
      ...(quote.motorType ? [{ key: "Mótor", value: quote.motorType }] : []),
      { key: "Fjarstýring", value: quote.remote ? "Já" : "Nei" },
      { key: "Miðstöð", value: quote.hub ? "Já" : "Nei" },
      { key: "Festing", value: quote.mountPosition },
      { key: "Án borunar", value: quote.noDrill ? "Já" : "Nei" },
      { key: "Hliðarlisti", value: quote.track },
      { key: "Kassetta", value: quote.cassette },
      { key: "Samantekt", value: description.slice(0, 255) },
    ];
  }
  const labels: Record<string, string> = {
    type: "Vörutegund",
    width: "Breidd (mm)",
    height: "Hæð (mm)",
    cassette: "Kassetta",
    rail: "Botnstöng",
    fabricCode: "Efnisnúmer",
    fabricColor: "Litur",
    fabricType: "Dúkagerð",
    bottomRailType: "Botnlisti",
    bottomRailColor: "Litur botnlista",
    mountType: "Festing",
    mountPosition: "Innfelld/utanáliggjandi festing",
    noDrill: "Án borunar",
    sideTrackType: "Gerð hliðarlista",
    comboKey: "Efnasamsetning",
    frontCode: "Fremra efni",
    backCode: "Aftara efni",
    operation: "Stýring",
    sideTrack: "Hliðarlisti",
    holder: "Lásahaldari",
    openingType: "Opnun",
    railColor: "Litur brautar",
    bottomRail: "Litur botnstangar",
  };
  const attributes = Object.entries(item)
    .filter(([key, value]) => key !== "qty" && value !== undefined && value !== null)
    .map(([key, value]) => ({ key: labels[key] ?? key, value: typeof value === "boolean" ? (value ? "Já" : "Nei") : String(value) }));
  attributes.push({ key: "Samantekt", value: description.slice(0, 255) });
  return attributes;
}

export function buildShopifyDraftOrderLines(items: CartItem[]): ShopifyDraftOrderLine[] {
  const lines: ShopifyDraftOrderLine[] = items.map((item) => {
    const { unitUsd, description, name } = priceItem(item);
    const unitPriceIsk = Math.round(unitUsd * USD_TO_ISK_RETAIL);
    return {
      productHandle: productHandle(item),
      title: name,
      quantity: item.qty,
      unitPriceIsk,
      requiresShipping: true,
      attributes: configurationAttributes(item, description),
    };
  });
  lines.push({
    productHandle: null,
    title: "Uppsetning / Professional installation",
    quantity: 1,
    unitPriceIsk: 15000,
    requiresShipping: false,
    attributes: [{ key: "Lýsing", value: "Uppsetning á gardínum af fagmönnum" }],
  });
  return lines;
}

router.post("/sol/checkout", async (req, res) => {
  const parsed = checkoutRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.issues }, "Invalid checkout request");
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { items } = parsed.data;

  try {
    const order = await createShopifyDraftOrder(buildShopifyDraftOrderLines(items));
    req.log.info({ draftOrderId: order.id, draftOrderName: order.name }, "Shopify Draft Order checkout created");
    res.json({ url: order.url, id: order.id, orderName: order.name });
  } catch (err) {
    if (err instanceof ShopifyCheckoutError) {
      req.log.warn({ err, code: err.code }, "Shopify Draft Order checkout unavailable");
      res.status(err.statusCode).json({ error: err.userMessage, code: err.code });
      return;
    }
    req.log.error({ err }, "Shopify Draft Order checkout creation failed");
    res.status(500).json({ error: "Ekki tókst að búa til Shopify-greiðslu. Reyndu aftur." });
  }
});

router.get("/sol/health", (_req, res) => {
  res.json({ ok: true, service: "solmyrkvun-checkout" });
});

export default router;
