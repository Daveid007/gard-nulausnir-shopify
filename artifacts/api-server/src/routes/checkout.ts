import { Router, type IRouter } from "express";
import { z } from "zod";
import {
  createShopifyDraftOrder,
  ShopifyCheckoutError,
  type ShopifyDraftOrderLine,
} from "../lib/shopifyAdminClient";

const router: IRouter = Router();

const USD_TO_ISK_RETAIL = 461;
// Accessories (motor, side track, cordless, holder) use ×276: $1 × 1.2 (freight 20%) × 124 × 1.5 × 1.24 ≈ 276.
// unitUsd is later multiplied by USD_TO_ISK_RETAIL, so accessory USD is pre-scaled by 276/461.
const ACCESSORY_FACTOR = 276 / 461;
const HOLDER_USD = 5.0;

// Honeycomb (cellular) — 45 mm Standard. Per-fabric pricing from supplier xlsx "Honeycomb Standard" × 2.5.
// Day & Night (zebra) — 45 mm, per-combo pricing from Vertical sheet × 2.5 (see DAYNIGHT_COMBOS below).
const DN_CORDLESS_USD_PER_SQM = 20;
const DN_MOTOR_USD = 142.26;
const DN_REMOTE_USD = 14;
const DN_SIDETRACK_USD_PER_M = 20;
const DN_MIN_SQM = 1;
const DN_MAX_SQM = 5.6;

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

// 45mm Day & Night — Vertical supplier "Middle Open Day & Night" × 2.5.
// Each combo defines which fabric families are valid for front/back layers.
const DAYNIGHT_COMBOS: Record<string, { front: "KS" | "KT"; back: "KB" | "KT"; usdPerSqm: number; label: string }> = {
  "KS+KB": { front: "KS", back: "KB", usdPerSqm: 161.20, label: "Sheer + Blackout" },
  "KT+KB": { front: "KT", back: "KB", usdPerSqm: 153.00, label: "Translucent + Blackout" },
  "KS+KT": { front: "KS", back: "KT", usdPerSqm: 156.25, label: "Sheer + Translucent" },
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
  width: z.number().min(800).max(2750),
  height: z.number().min(500).max(3000),
  comboKey: z.enum(["KS+KB", "KT+KB", "KS+KT"]),
  frontCode: z.string().min(1).max(20),
  backCode: z.string().min(1).max(20),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  railColor: railColorSchema,
});

// Dual Roller (Tvöfalt rúll) — two independent roller layers on one headrail.
// Uses the same KS/KT/KB fabric families as Day & Night; pricing mirrors the daynight
// supplier sheet since it draws from the same supplier catalogue.
const DUAL_ROLLER_COMBOS: Record<string, { front: "KS" | "KT"; back: "KB" | "KT"; usdPerSqm: number; label: string }> = {
  "KS+KB": { front: "KS", back: "KB", usdPerSqm: 161.20, label: "Sheer + Blackout" },
  "KT+KB": { front: "KT", back: "KB", usdPerSqm: 153.00, label: "Translucent + Blackout" },
  "KS+KT": { front: "KS", back: "KT", usdPerSqm: 156.25, label: "Sheer + Translucent" },
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

// 45 mm Standard Honeycomb fabrics — supplier "Honeycomb Standard" × 2.5. Must mirror
// STANDARD_FABRICS in artifacts/solmyrkvun/src/components/HoneycombCalculator.tsx.
const STANDARD_HONEYCOMB_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "sheer" | "translucent" | "blackout" | "dualdeck" }> = {
  // Sheer
  KS401: { name: "White Sheer",        usdPerSqm: 45.05, type: "sheer" },
  KS402: { name: "Creamy Sheer",       usdPerSqm: 45.05, type: "sheer" },
  KS404: { name: "Pink Sheer",         usdPerSqm: 45.05, type: "sheer" },
  KS406: { name: "Lilac White Sheer",  usdPerSqm: 45.05, type: "sheer" },
  KS407: { name: "Mocha Sheer",        usdPerSqm: 45.05, type: "sheer" },
  KS408: { name: "Dove Grey Sheer",    usdPerSqm: 45.05, type: "sheer" },
  KS414: { name: "Black Sheer",        usdPerSqm: 45.05, type: "sheer" },
  // Translucent basic
  KT401: { name: "Simply White",       usdPerSqm: 31.25, type: "translucent" },
  KT402: { name: "Buckskin",           usdPerSqm: 31.25, type: "translucent" },
  KT403: { name: "Impatiens",          usdPerSqm: 31.25, type: "translucent" },
  KT404: { name: "Lavender Lily",      usdPerSqm: 31.25, type: "translucent" },
  KT405: { name: "Spring Green",       usdPerSqm: 31.25, type: "translucent" },
  KT406: { name: "Lime Light",         usdPerSqm: 31.25, type: "translucent" },
  KT407: { name: "Papyrus",            usdPerSqm: 31.25, type: "translucent" },
  KT408: { name: "Café",               usdPerSqm: 31.25, type: "translucent" },
  KT409: { name: "Indigo",             usdPerSqm: 31.25, type: "translucent" },
  KT410: { name: "Chocolate",          usdPerSqm: 31.25, type: "translucent" },
  KT411: { name: "Water Edge",         usdPerSqm: 31.25, type: "translucent" },
  KT412: { name: "Pottery Red",        usdPerSqm: 31.25, type: "translucent" },
  // Translucent premium
  KT413: { name: "Cloud White",        usdPerSqm: 61.50, type: "translucent" },
  KT414: { name: "Palegoldenrod",      usdPerSqm: 61.50, type: "translucent" },
  KT415: { name: "Sage",               usdPerSqm: 61.50, type: "translucent" },
  // Blackout
  KB401: { name: "Liveingston",        usdPerSqm: 35.65, type: "blackout" },
  KB402: { name: "Tan",                usdPerSqm: 35.65, type: "blackout" },
  KB403: { name: "Maize",              usdPerSqm: 35.65, type: "blackout" },
  KB404: { name: "Bisque",             usdPerSqm: 35.65, type: "blackout" },
  KB405: { name: "Pottery Red",        usdPerSqm: 35.65, type: "blackout" },
  KB406: { name: "Indigo",             usdPerSqm: 35.65, type: "blackout" },
  KB420: { name: "White",              usdPerSqm: 35.65, type: "blackout" },
  KB422: { name: "Buckskin",           usdPerSqm: 35.65, type: "blackout" },
  KB426: { name: "Dove Grey",          usdPerSqm: 35.65, type: "blackout" },
  KB428: { name: "Linen",              usdPerSqm: 35.65, type: "blackout" },
  KB431: { name: "White",              usdPerSqm: 35.65, type: "blackout" },
  KB432: { name: "Light Apricot",      usdPerSqm: 35.65, type: "blackout" },
  KB433: { name: "Camel",              usdPerSqm: 35.65, type: "blackout" },
  KB434: { name: "Black",              usdPerSqm: 35.65, type: "blackout" },
  KB435: { name: "Grey Blue",          usdPerSqm: 35.65, type: "blackout" },
  // Dual-Deck Blackout (premium)
  KN405: { name: "Cloud White Dual-Deck", usdPerSqm: 40.01, type: "dualdeck" },
  KN406: { name: "Shell Dual-Deck",       usdPerSqm: 40.01, type: "dualdeck" },
  KN407: { name: "Sage Dual-Deck",        usdPerSqm: 40.01, type: "dualdeck" },
};

const honeycombItemSchema = z.object({
  type: z.literal("honeycomb"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(800).max(2750),
  height: z.number().min(500).max(3000),
  fabricCode: z.string().min(1).max(20).refine((c) => c in STANDARD_HONEYCOMB_FABRICS, {
    message: "Unknown honeycomb fabric code",
  }),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  railColor: railColorSchema,
  bottomRail: railColorSchema,
  holder: holderColorSchema.optional().nullable(),
});

// 25 mm Standard Honeycomb — same fabric catalog as 45mm, tighter size limits.
const honeycomb25ItemSchema = z.object({
  type: z.literal("honeycomb-25"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(400).max(2000),
  height: z.number().min(300).max(2500),
  fabricCode: z.string().min(1).max(20).refine((c) => c in STANDARD_HONEYCOMB_FABRICS, {
    message: "Unknown honeycomb-25 fabric code",
  }),
  operation: z.enum(["manual", "cordless", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  railColor: railColorSchema,
  bottomRail: railColorSchema,
  holder: holderColorSchema.optional().nullable(),
});

// 45 mm TDBU (Top-Down Bottom-Up) fabrics — supplier "Honeycomb TDBU" × 2.5.
// Sheer and Dual-Deck are not offered in TDBU (mechanism requires single-layer fabric).
const TDBU_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "translucent" | "blackout" }> = {
  KT401: { name: "Simply White",  usdPerSqm: 40.00, type: "translucent" },
  KT402: { name: "Buckskin",      usdPerSqm: 40.00, type: "translucent" },
  KT403: { name: "Impatiens",     usdPerSqm: 40.00, type: "translucent" },
  KT404: { name: "Lavender Lily", usdPerSqm: 40.00, type: "translucent" },
  KT405: { name: "Spring Green",  usdPerSqm: 40.00, type: "translucent" },
  KT406: { name: "Lime Light",    usdPerSqm: 40.00, type: "translucent" },
  KT407: { name: "Papyrus",       usdPerSqm: 40.00, type: "translucent" },
  KT408: { name: "Café",          usdPerSqm: 40.00, type: "translucent" },
  KT409: { name: "Indigo",        usdPerSqm: 40.00, type: "translucent" },
  KT410: { name: "Chocolate",     usdPerSqm: 40.00, type: "translucent" },
  KT411: { name: "Water Edge",    usdPerSqm: 40.00, type: "translucent" },
  KT412: { name: "Pottery Red",   usdPerSqm: 40.00, type: "translucent" },
  KT413: { name: "Cloud White",   usdPerSqm: 71.73, type: "translucent" },
  KT414: { name: "Palegoldenrod", usdPerSqm: 71.73, type: "translucent" },
  KT415: { name: "Sage",          usdPerSqm: 71.73, type: "translucent" },
  KB401: { name: "Liveingston",   usdPerSqm: 45.88, type: "blackout" },
  KB402: { name: "Tan",           usdPerSqm: 45.88, type: "blackout" },
  KB403: { name: "Maize",         usdPerSqm: 45.88, type: "blackout" },
  KB404: { name: "Bisque",        usdPerSqm: 45.88, type: "blackout" },
  KB405: { name: "Pottery Red",   usdPerSqm: 45.88, type: "blackout" },
  KB406: { name: "Indigo",        usdPerSqm: 45.88, type: "blackout" },
  KB420: { name: "White",         usdPerSqm: 45.88, type: "blackout" },
  KB422: { name: "Buckskin",      usdPerSqm: 45.88, type: "blackout" },
  KB426: { name: "Dove Grey",     usdPerSqm: 45.88, type: "blackout" },
  KB428: { name: "Linen",         usdPerSqm: 45.88, type: "blackout" },
  KB431: { name: "White",         usdPerSqm: 45.88, type: "blackout" },
  KB432: { name: "Light Apricot", usdPerSqm: 45.88, type: "blackout" },
  KB433: { name: "Camel",         usdPerSqm: 45.88, type: "blackout" },
  KB434: { name: "Black",         usdPerSqm: 45.88, type: "blackout" },
  KB435: { name: "Grey Blue",     usdPerSqm: 45.88, type: "blackout" },
};

const tdbuItemSchema = z.object({
  type: z.literal("tdbu"),
  qty: z.number().int().min(1).max(99),
  width: z.number().min(800).max(2750),
  height: z.number().min(500).max(3000),
  fabricCode: z.string().min(1).max(20).refine((c) => c in TDBU_FABRICS, {
    message: "Unknown TDBU fabric code",
  }),
  operation: z.enum(["manual", "motor"]),
  sideTrack: z.boolean().optional().default(false),
  railColor: railColorSchema,
});

// 45 mm Vertical (lóðrétt) — supplier "Vertical" sheet × 2.5.
// Slats hang vertically; sheer/dual-deck not offered. No side track.
const VERTICAL_FABRICS: Record<string, { name: string; usdPerSqm: number; type: "translucent" | "blackout" }> = {
  KT401: { name: "Simply White",  usdPerSqm: 91.02, type: "translucent" },
  KT402: { name: "Buckskin",      usdPerSqm: 91.02, type: "translucent" },
  KT403: { name: "Impatiens",     usdPerSqm: 91.02, type: "translucent" },
  KT404: { name: "Lavender Lily", usdPerSqm: 91.02, type: "translucent" },
  KT405: { name: "Spring Green",  usdPerSqm: 91.02, type: "translucent" },
  KT406: { name: "Lime Light",    usdPerSqm: 91.02, type: "translucent" },
  KT407: { name: "Papyrus",       usdPerSqm: 91.02, type: "translucent" },
  KT408: { name: "Café",          usdPerSqm: 91.02, type: "translucent" },
  KT409: { name: "Indigo",        usdPerSqm: 91.02, type: "translucent" },
  KT410: { name: "Chocolate",     usdPerSqm: 91.02, type: "translucent" },
  KT411: { name: "Water Edge",    usdPerSqm: 91.02, type: "translucent" },
  KT412: { name: "Pottery Red",   usdPerSqm: 91.02, type: "translucent" },
  KT413: { name: "Cloud White",   usdPerSqm: 91.02, type: "translucent" },
  KT414: { name: "Palegoldenrod", usdPerSqm: 91.02, type: "translucent" },
  KT415: { name: "Sage",          usdPerSqm: 91.02, type: "translucent" },
  KB401: { name: "Liveingston",   usdPerSqm: 106.19, type: "blackout" },
  KB402: { name: "Tan",           usdPerSqm: 106.19, type: "blackout" },
  KB403: { name: "Maize",         usdPerSqm: 106.19, type: "blackout" },
  KB404: { name: "Bisque",        usdPerSqm: 106.19, type: "blackout" },
  KB405: { name: "Pottery Red",   usdPerSqm: 106.19, type: "blackout" },
  KB406: { name: "Indigo",        usdPerSqm: 106.19, type: "blackout" },
  KB420: { name: "White",         usdPerSqm: 106.19, type: "blackout" },
  KB422: { name: "Buckskin",      usdPerSqm: 106.19, type: "blackout" },
  KB426: { name: "Dove Grey",     usdPerSqm: 106.19, type: "blackout" },
  KB428: { name: "Linen",         usdPerSqm: 106.19, type: "blackout" },
  KB431: { name: "White",         usdPerSqm: 106.19, type: "blackout" },
  KB432: { name: "Light Apricot", usdPerSqm: 106.19, type: "blackout" },
  KB433: { name: "Camel",         usdPerSqm: 106.19, type: "blackout" },
  KB434: { name: "Black",         usdPerSqm: 106.19, type: "blackout" },
  KB435: { name: "Grey Blue",     usdPerSqm: 106.19, type: "blackout" },
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

const cartItemSchema = z.discriminatedUnion("type", [
  rollerItemSchema,
  daynightItemSchema,
  dualrollerItemSchema,
  honeycombItemSchema,
  honeycomb25ItemSchema,
  tdbuItemSchema,
  verticalItemSchema,
  zebraItemSchema,
]);

export const checkoutRequestSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(50),
});

type RollerItem = z.infer<typeof rollerItemSchema>;
type DaynightItem = z.infer<typeof daynightItemSchema>;
type DualRollerItem = z.infer<typeof dualrollerItemSchema>;
type HoneycombItem = z.infer<typeof honeycombItemSchema>;
type Honeycomb25Item = z.infer<typeof honeycomb25ItemSchema>;
type TdbuItem = z.infer<typeof tdbuItemSchema>;
type VerticalItem = z.infer<typeof verticalItemSchema>;
type ZebraItem = z.infer<typeof zebraItemSchema>;
type CartItem = z.infer<typeof cartItemSchema>;

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
  const unitUsd = fabric + (cordless + motor + sideTrack + holder) * ACCESSORY_FACTOR;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "keðja";
  const description = `${item.cassette} · ${item.bottomRailType} · ${item.bottomRailColor} · ${item.mountType} · ${fabricEntry.name} (${item.fabricCode}) · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
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
  if (!(item.frontCode in STANDARD_HONEYCOMB_FABRICS) || !(item.backCode in STANDARD_HONEYCOMB_FABRICS)) {
    throw new Error(`Unknown Dual Roller fabric codes: ${item.frontCode}+${item.backCode}`);
  }
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
  const unitUsd = fabric + (cordless + motor + sideTrack) * ACCESSORY_FACTOR;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Tvöfalt rúll · ${combo.label} · ${item.frontCode}+${item.backCode} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}`;
  return { unitUsd, description };
}

function priceDaynightUsd(item: DaynightItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > DN_MAX_SQM) {
    throw new Error(`Day & Night area ${rawArea.toFixed(2)} m² exceeds ${DN_MAX_SQM} m² maximum`);
  }
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
  // Fabric at full retail (×461 applied in checkout); accessories ×276 (pre-scaled by 276/461)
  const fabric = billedArea * combo.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM * ACCESSORY_FACTOR : 0;
  const motor = item.operation === "motor" ? (DN_MOTOR_USD + DN_REMOTE_USD) * ACCESSORY_FACTOR : 0;
  const sideTrack = item.sideTrack ? w * DN_SIDETRACK_USD_PER_M * ACCESSORY_FACTOR : 0;
  const unitUsd = fabric + cordless + motor + sideTrack;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Day & Night 45mm · ${combo.label} · ${item.frontCode}+${item.backCode} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}`;
  return { unitUsd, description };
}

function priceHoneycombUsd(item: HoneycombItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > DN_MAX_SQM) {
    throw new Error(`Honeycomb area ${rawArea.toFixed(2)} m² exceeds ${DN_MAX_SQM} m² maximum`);
  }
  const fabricEntry = STANDARD_HONEYCOMB_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown honeycomb fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const motor = item.operation === "motor" ? DN_MOTOR_USD + DN_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? w * DN_SIDETRACK_USD_PER_M : 0;
  const holder = item.holder ? HOLDER_USD : 0;
  const unitUsd = fabric + (cordless + motor + sideTrack + holder) * ACCESSORY_FACTOR;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Hunangskamb 45mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
  return { unitUsd, description };
}

function priceHoneycomb25Usd(item: Honeycomb25Item): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > DN_MAX_SQM) {
    throw new Error(`Honeycomb 25mm area ${rawArea.toFixed(2)} m² exceeds ${DN_MAX_SQM} m² maximum`);
  }
  const fabricEntry = STANDARD_HONEYCOMB_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown honeycomb-25 fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const cordless = item.operation === "cordless" ? billedArea * DN_CORDLESS_USD_PER_SQM : 0;
  const motor = item.operation === "motor" ? DN_MOTOR_USD + DN_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? w * DN_SIDETRACK_USD_PER_M : 0;
  const holder = item.holder ? HOLDER_USD : 0;
  const unitUsd = fabric + (cordless + motor + sideTrack + holder) * ACCESSORY_FACTOR;
  const opLabel =
    item.operation === "motor"
      ? "mótor+fjarstýring"
      : item.operation === "cordless"
        ? "snærislaust"
        : "handvirkt";
  const description = `Hunangskamb 25mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}${item.holder ? ` · lásahaldari-${item.holder}` : ""}`;
  return { unitUsd, description };
}

function priceTdbuUsd(item: TdbuItem): { unitUsd: number; description: string } {
  const w = item.width / 1000;
  const h = item.height / 1000;
  const rawArea = w * h;
  if (rawArea > DN_MAX_SQM) {
    throw new Error(`TDBU area ${rawArea.toFixed(2)} m² exceeds ${DN_MAX_SQM} m² maximum`);
  }
  const fabricEntry = TDBU_FABRICS[item.fabricCode];
  if (!fabricEntry) {
    throw new Error(`Unknown TDBU fabric code: ${item.fabricCode}`);
  }
  const billedArea = Math.max(DN_MIN_SQM, rawArea);
  const fabric = billedArea * fabricEntry.usdPerSqm;
  const motor = item.operation === "motor" ? DN_MOTOR_USD + DN_REMOTE_USD : 0;
  const sideTrack = item.sideTrack ? w * DN_SIDETRACK_USD_PER_M : 0;
  const unitUsd = fabric + (motor + sideTrack) * ACCESSORY_FACTOR;
  const opLabel = item.operation === "motor" ? "mótor+fjarstýring" : "handvirkt";
  const description = `TDBU 45mm · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}`;
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
  const motor = item.operation === "motor" ? DN_MOTOR_USD + DN_REMOTE_USD : 0;
  const unitUsd = fabric + motor * ACCESSORY_FACTOR;
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
  const unitUsd = fabric + motor * ACCESSORY_FACTOR;
  const operation = item.operation === "motor" ? "rafknúið" : item.operation === "cordless" ? "snærislaust" : "keðja";
  return {
    unitUsd,
    description: `Sebragardína · ${fabricEntry.name} (${item.fabricCode}) · ${fabricEntry.type} · ${item.width}×${item.height}mm · ${operation} · ${item.railColor}`,
  };
}

function priceItem(item: CartItem): { unitUsd: number; description: string; name: string } {
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

function productHandle(item: CartItem): string {
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
    comboKey: "Efnasamsetning",
    frontCode: "Fremra efni",
    backCode: "Aftara efni",
    operation: "Stýring",
    sideTrack: "Hliðarspor",
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
    const unitPriceIsk = Math.ceil((unitUsd * USD_TO_ISK_RETAIL) / 100) * 100;
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
