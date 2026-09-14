import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { StorefrontLayout } from "./StorefrontLayout";
import { Calculator, Info } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCart, HOLDER_USD } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";
import { BOTTOM_RAIL_COLORS, HOLDER_COLORS } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
import { COLLECTIONS } from "@/pages/storefront/_shared/fabric-collections";
import { swatchUrl } from "@/pages/storefront/_shared/swatches";
import railWrapped from "@/assets/accessory-thumbs/Fabric_wrapped_1779913347334.png";
import railSquare from "@/assets/accessory-thumbs/Square_1779913347335.png";
import railSilent from "@/assets/accessory-thumbs/Square_1779913347335.png";
import railHeavy from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(1)_1780327800245.jpg";
import railCurved from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(2)_1780327800246.jpg";
import railRound from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(3)_1780327800246.jpg";
import casC1 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(1)_1780327800245.jpg";
import casC2 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(2)_1780327800246.jpg";
import casC3 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(3)_1780327800246.jpg";
import casC4 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(4)_1780327800247.jpg";
import casC5 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(5)_1780327800247.jpg";
import casC6 from "@/assets/accessory-thumbs/for_45mm_motorized_(1)_1780327800247.jpg";
import casC7 from "@/assets/accessory-thumbs/for_45mm_motorized_(2)_1780327800247.jpg";
import casDC2 from "@/assets/accessory-thumbs/for_45mm_motorized_(3)_1780327800247.jpg";

const USD_TO_ISK_RETAIL = 461;
// Aukahlutir (motor, hliðarspor o.fl.): frakt 20% í stað 100% → $1 × 1.2 × 124 × 1.5 × 1.24 ≈ 276
const USD_TO_ISK_ACCESSORY = 276;

type Operation = "chain" | "cordless" | "motor";
export type RollerProductIdentity = "square-cassette" | "arc-cassette" | "open-roll";

type CassetteOption = {
  code: string;
  is: string;
  en: string;
  dims: string;
  image: string;
};

const CASSETTES: CassetteOption[] = [
  { code: "C1",  is: "Bogakassetti — spring",       en: "Arc cassette — spring",       dims: "72 × 80 mm",   image: casC1 },
  { code: "C2",  is: "Ferningskassetti — klassík",  en: "Square cassette — classic",   dims: "47 × 65 mm",   image: casC2 },
  { code: "C3",  is: "Kassetti — hornskorin",       en: "Angled-end cassette",         dims: "50 × 85 mm",   image: casC3 },
  { code: "C4",  is: "Hreinn ferningskassetti",     en: "Plain square cassette",       dims: "45.8 × 88 mm", image: casC4 },
  { code: "C5",  is: "Opin rúlla með yfirhlíf",     en: "Open roll with top cover",    dims: "L-prófíll",    image: casC5 },
  { code: "C6",  is: "Mjúkur bogakassetti",         en: "Soft arc cassette",           dims: "78 × 72 mm",   image: casC6 },
  { code: "C7",  is: "Hálf-bogakassetti",           en: "Half-arc cassette",           dims: "75 × 80 mm",   image: casC7 },
  { code: "DC2", is: "Day & Night kassetti",        en: "Dual-layer cassette",         dims: "125 × 135 mm", image: casDC2 },
];

const CASSETTE_FAMILY_CODES: Record<RollerProductIdentity, string[]> = {
  "square-cassette": ["C2", "C3", "C4"],
  "arc-cassette": ["C1", "C6", "C7"],
  "open-roll": ["C5"],
};

const CASSETTE_DEFAULTS: Record<RollerProductIdentity, string> = {
  "square-cassette": "C2",
  "arc-cassette": "C1",
  "open-roll": "C5",
};

type BottomRailOption = { code: string; is: string; en: string; dims: string; image: string };

const BOTTOM_RAILS: BottomRailOption[] = [
  { code: "wrapped", is: "Efnisvafið",     en: "Fabric-wrapped", dims: "29.7 mm",    image: railWrapped },
  { code: "square",  is: "Ferningsstöng",  en: "Square rail",    dims: "32 mm",      image: railSquare },
  { code: "silent",  is: "Hljóðlát stöng", en: "Silent rail",    dims: "33 mm",      image: railSilent },
  { code: "heavy",   is: "Þung stöng",     en: "Heavy-duty",     dims: "35 mm",      image: railHeavy },
  { code: "curved",  is: "Boginn brún",    en: "Curved edge",    dims: "32 / 38 mm", image: railCurved },
  { code: "round",   is: "Rúnnuð stöng",   en: "Round rail",     dims: "15 mm",      image: railRound },
];

type Fabric = {
  code: string;
  shade: string;
  series: string;
  category: string;
  pricePerSqmUSD: number;
};

const FABRICS: Fabric[] = [
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2261", code: "TSD2261-1", shade: "Ivory",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2261", code: "TSD2261-2", shade: "Shell",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2261", code: "TSD2261-4", shade: "Smoke",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2262", code: "TSD2262-2", shade: "Oyster",     pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2262", code: "TSD2262-4", shade: "Chrome",     pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2262", code: "TSD2262-5", shade: "Sail",       pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2265", code: "TSD2265-1", shade: "Cotton",     pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2265", code: "TSD2265-2", shade: "Linen",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2265", code: "TSD2265-3", shade: "Parchment",  pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2265", code: "TSD2265-4", shade: "Pebble",     pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2265", code: "TSD2265-5", shade: "Mica",       pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2266", code: "TSD2266-1", shade: "Chalk",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2266", code: "TSD2266-3", shade: "Cream",      pricePerSqmUSD: 33.48 },
  { category: "Hálfgegnsætt / Translucent", series: "DECO 2266", code: "TSD2266-4", shade: "Concrete",   pricePerSqmUSD: 33.48 },

  { category: "Screen", series: "Private Nature 1%",        code: "MA0-551",  shade: "White / White",   pricePerSqmUSD: 39.78 },
  { category: "Screen", series: "Private Nature 1%",        code: "MA0-552",  shade: "White / Sand",    pricePerSqmUSD: 39.78 },
  { category: "Screen", series: "Private Nature 1%",        code: "MA0-553",  shade: "White / Grey",    pricePerSqmUSD: 39.78 },
  { category: "Screen", series: "Clear Vision 3%",          code: "CV3-0101", shade: "White / White",   pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 3%",          code: "CV3-0104", shade: "White / Black",   pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 3%",          code: "CV3-0105", shade: "White / Grey",    pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 3%",          code: "CV3-0107", shade: "White / Sand",    pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 10%",         code: "CV10-0101", shade: "White / White",  pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 10%",         code: "CV10-0105", shade: "White / Grey",   pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Clear Vision 10%",         code: "CV10-0107", shade: "White / Sand",   pricePerSqmUSD: 36.8 },
  { category: "Screen", series: "Mario 1%",                 code: "MA0-M01", shade: "White / White",    pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 1%",                 code: "MA0-M02", shade: "White / Sand",     pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 1%",                 code: "MA0-M16", shade: "White / Linen",    pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 1%",                 code: "MA0-M17", shade: "White / Dark Grey", pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 5%",                 code: "MA5-M01", shade: "White / White",    pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 5%",                 code: "MA5-M02", shade: "White / Sand",     pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 5%",                 code: "MA5-M16", shade: "White / Linen",    pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Mario 5%",                 code: "MA5-M17", shade: "White / Dark Grey", pricePerSqmUSD: 31.15 },
  { category: "Screen", series: "Horizontal Basket 3%",     code: "HB3-0101", shade: "White / White",   pricePerSqmUSD: 33.48 },
  { category: "Screen", series: "Horizontal Basket 3%",     code: "HB3-0105", shade: "White / Grey",    pricePerSqmUSD: 33.48 },
  { category: "Screen", series: "Horizontal Basket 3%",     code: "HB3-0107", shade: "White / Sand",    pricePerSqmUSD: 33.48 },
  { category: "Screen", series: "Horizontal Basket 3%",     code: "HB3-0403", shade: "Black / Pearl",   pricePerSqmUSD: 33.48 },
  { category: "Screen", series: "Horizontal Basket 3%",     code: "HB3-0404", shade: "Black / Black",   pricePerSqmUSD: 33.48 },
  { category: "Screen", series: "Horizontal Basket 5%",     code: "HB5-0101", shade: "White / White",   pricePerSqmUSD: 32.83 },
  { category: "Screen", series: "Horizontal Basket 5%",     code: "HB5-0105", shade: "White / Grey",    pricePerSqmUSD: 32.83 },
  { category: "Screen", series: "Horizontal Basket 5%",     code: "HB5-0107", shade: "White / Sand",    pricePerSqmUSD: 32.83 },
  { category: "Screen", series: "Horizontal Basket 5%",     code: "HB5-0403", shade: "Black / Pearl",   pricePerSqmUSD: 32.83 },
  { category: "Screen", series: "Horizontal Basket 5%",     code: "HB5-0404", shade: "Black / Black",   pricePerSqmUSD: 32.83 },
  { category: "Screen", series: "D Series 1%",              code: "D1-0103", shade: "White / Pearl",    pricePerSqmUSD: 32.63 },
  { category: "Screen", series: "D Series 1%",              code: "D1-0104", shade: "White / Black",    pricePerSqmUSD: 32.63 },
  { category: "Screen", series: "D Series 1%",              code: "D1-0105", shade: "White / Grey",     pricePerSqmUSD: 32.63 },
  { category: "Screen", series: "D Series 1%",              code: "D1-0107", shade: "White / Sand",     pricePerSqmUSD: 32.63 },
  { category: "Screen", series: "D Series 3%",              code: "D3-0103", shade: "White / Pearl",    pricePerSqmUSD: 32.28 },
  { category: "Screen", series: "D Series 3%",              code: "D3-0104", shade: "White / Black",    pricePerSqmUSD: 32.28 },

  { category: "Myrkvun / Blackout", series: "Scala Blockout",       code: "BO-0101", shade: "White",  pricePerSqmUSD: 36.28 },
  { category: "Myrkvun / Blackout", series: "Scala Blockout",       code: "BO-0102", shade: "Linen",  pricePerSqmUSD: 36.28 },
  { category: "Myrkvun / Blackout", series: "Scala Blockout",       code: "BO-0103", shade: "Grey",   pricePerSqmUSD: 36.28 },
  { category: "Myrkvun / Blackout", series: "Scala Blockout",       code: "BO-0105", shade: "Pewter", pricePerSqmUSD: 36.28 },
  { category: "Myrkvun / Blackout", series: "Scala Blockout",       code: "BO-0107", shade: "Pearl",  pricePerSqmUSD: 36.28 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0101", shade: "White / White",      pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0105", shade: "White / Grey",       pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0107", shade: "White / Sand",       pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0404", shade: "Black",              pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0405", shade: "Black / Grey",       pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0406", shade: "Black / Bronze",     pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0505", shade: "Grey",               pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "Solar Blockout 0%",    code: "SK00-0540", shade: "Grey / Dark Grey",   pricePerSqmUSD: 36.8 },
  { category: "Myrkvun / Blackout", series: "NPG Blockout",         code: "NPG-0101", shade: "White",  pricePerSqmUSD: 37.53 },
  { category: "Myrkvun / Blackout", series: "NPG Blockout",         code: "NPG-0102", shade: "Linen",  pricePerSqmUSD: 37.53 },
  { category: "Myrkvun / Blackout", series: "NPG Blockout",         code: "NPG-0103", shade: "Grey",   pricePerSqmUSD: 37.53 },
  { category: "Myrkvun / Blackout", series: "NPG Blockout",         code: "NPG-0104", shade: "Black",  pricePerSqmUSD: 37.53 },
  { category: "Myrkvun / Blackout", series: "DECO 2261 Blockout",   code: "NPDS2261-1", shade: "Ivory", pricePerSqmUSD: 41.15 },
  { category: "Myrkvun / Blackout", series: "DECO 2261 Blockout",   code: "NPDS2261-2", shade: "Shell", pricePerSqmUSD: 41.15 },
  { category: "Myrkvun / Blackout", series: "DECO 2261 Blockout",   code: "NPDS2261-4", shade: "Smoke", pricePerSqmUSD: 41.15 },
  { category: "Myrkvun / Blackout", series: "DECO 2262 Blockout",   code: "NPDS2262-2", shade: "Oyster", pricePerSqmUSD: 42.4 },
  { category: "Myrkvun / Blackout", series: "DECO 2262 Blockout",   code: "NPDS2262-4", shade: "Chrome", pricePerSqmUSD: 42.4 },
  { category: "Myrkvun / Blackout", series: "DECO 2262 Blockout",   code: "NPDS2262-5", shade: "Sail",   pricePerSqmUSD: 42.4 },
  { category: "Myrkvun / Blackout", series: "DECO 2265 Blockout",   code: "NPDS2265-1", shade: "Cotton",    pricePerSqmUSD: 43.65 },
  { category: "Myrkvun / Blackout", series: "DECO 2265 Blockout",   code: "NPDS2265-2", shade: "Linen",     pricePerSqmUSD: 43.65 },
  { category: "Myrkvun / Blackout", series: "DECO 2265 Blockout",   code: "NPDS2265-3", shade: "Parchment", pricePerSqmUSD: 43.65 },
  { category: "Myrkvun / Blackout", series: "DECO 2265 Blockout",   code: "NPDS2265-4", shade: "Pebble",    pricePerSqmUSD: 43.65 },
  { category: "Myrkvun / Blackout", series: "DECO 2265 Blockout",   code: "NPDS2265-5", shade: "Mica",      pricePerSqmUSD: 43.65 },
  { category: "Myrkvun / Blackout", series: "DECO 2266 Blockout",   code: "NPDS2266-1", shade: "Chalk",     pricePerSqmUSD: 44.9 },
  { category: "Myrkvun / Blackout", series: "DECO 2266 Blockout",   code: "NPDS2266-3", shade: "Cream",     pricePerSqmUSD: 44.9 },
  { category: "Myrkvun / Blackout", series: "DECO 2266 Blockout",   code: "NPDS2266-4", shade: "Concrete",  pricePerSqmUSD: 44.9 },
  { category: "Myrkvun / Blackout", series: "BR17071 Blockout",     code: "BR170710001", shade: "White", pricePerSqmUSD: 52.13 },
  { category: "Myrkvun / Blackout", series: "BR17071 Blockout",     code: "BR170710002", shade: "Cream", pricePerSqmUSD: 52.13 },
  { category: "Myrkvun / Blackout", series: "BR17071 Blockout",     code: "BR170710006", shade: "Taupe", pricePerSqmUSD: 52.13 },
  { category: "Myrkvun / Blackout", series: "BR17071 Blockout",     code: "BR170710008", shade: "Black", pricePerSqmUSD: 52.13 },
  { category: "Myrkvun / Blackout", series: "BR20049 Blockout",     code: "BR200493404", shade: "Ivory",       pricePerSqmUSD: 49.68 },
  { category: "Myrkvun / Blackout", series: "BR20049 Blockout",     code: "BR200493504", shade: "Light Grey",  pricePerSqmUSD: 49.68 },
  { category: "Myrkvun / Blackout", series: "BR20049 Blockout",     code: "BR200494304", shade: "White",       pricePerSqmUSD: 49.68 },
  { category: "Myrkvun / Blackout", series: "BR20049 Blockout",     code: "BR200490804", shade: "Dark Grey",   pricePerSqmUSD: 49.68 },
  { category: "Myrkvun / Blackout", series: "BR20049 Blockout",     code: "BR200498608", shade: "Cobalt Blue", pricePerSqmUSD: 49.68 },
  { category: "Myrkvun / Blackout", series: "BR13021 Blockout",     code: "BR130210001", shade: "Linen",            pricePerSqmUSD: 52.43 },
  { category: "Myrkvun / Blackout", series: "BR13021 Blockout",     code: "BR130210002", shade: "Tortilla",         pricePerSqmUSD: 52.43 },
  { category: "Myrkvun / Blackout", series: "BR13021 Blockout",     code: "BR130210003", shade: "Ash-gray Brown",   pricePerSqmUSD: 52.43 },
  { category: "Myrkvun / Blackout", series: "BR13021 Blockout",     code: "BR130210004", shade: "Light Brown",      pricePerSqmUSD: 52.43 },
  { category: "Myrkvun / Blackout", series: "BR13021 Blockout",     code: "BR130210006", shade: "Black Brown",      pricePerSqmUSD: 52.43 },
  { category: "Myrkvun / Blackout", series: "EBR12022 Blockout",    code: "EBR120220001", shade: "Grey Brown", pricePerSqmUSD: 53.2 },
  { category: "Myrkvun / Blackout", series: "EBR12022 Blockout",    code: "EBR120220002", shade: "Black",      pricePerSqmUSD: 53.2 },
  { category: "Myrkvun / Blackout", series: "EBR12022 Blockout",    code: "EBR120220003", shade: "Taupe",      pricePerSqmUSD: 53.2 },
];

type FabricFilter = "all" | "light-filtering" | "screen" | "blackout";
const ROLLER_SWATCH_IMAGES = new Map(
  COLLECTIONS.flatMap((collection) => collection.swatches.map((swatch) => [swatch.code, swatchUrl(swatch.img)] as const)),
);

const easeOut = "easeOut" as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

function formatISK(value: number): string {
  const rounded = Math.round(value / 500) * 500;
  return new Intl.NumberFormat("is-IS").format(rounded) + " kr";
}

export function PriceCalculator({ productIdentity = "square-cassette", product }: { productIdentity?: RollerProductIdentity; product?: any }) {
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1600);
  const [operation, setOperation] = useState<Operation>("chain");
  const [fabricCode, setFabricCode] = useState<string>("TSD2262-4");
  const [sideTrack, setSideTrack] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [cassetteCode, setCassetteCode] = useState<string>(CASSETTE_DEFAULTS[productIdentity]);
  const [bottomRailCode, setBottomRailCode] = useState<string>("wrapped");
  const [bottomRailColor, setBottomRailColor] = useState<string>("Hvítur");
  const [holder, setHolder] = useState<"white" | "navy" | "black" | null>(null);
  const [fabricFilter, setFabricFilter] = useState<FabricFilter>("all");
  const { addItem } = useCart();

  const cassetteOptions = useMemo(
    () => CASSETTES.filter((option) => CASSETTE_FAMILY_CODES[productIdentity].includes(option.code)),
    [productIdentity],
  );

  useEffect(() => {
    setCassetteCode(CASSETTE_DEFAULTS[productIdentity]);
  }, [productIdentity]);

  const cassette = useMemo(
    () => cassetteOptions.find((c) => c.code === cassetteCode) ?? cassetteOptions[0],
    [cassetteCode, cassetteOptions],
  );
  const bottomRail = useMemo(
    () => BOTTOM_RAILS.find((b) => b.code === bottomRailCode) ?? BOTTOM_RAILS[0],
    [bottomRailCode],
  );

  const fabric = useMemo(
    () => FABRICS.find((f) => f.code === fabricCode) ?? FABRICS[0],
    [fabricCode],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Fabric[]>();
    for (const f of FABRICS) {
      const matchesFilter =
        fabricFilter === "all" ||
        (fabricFilter === "light-filtering" && f.category === "Hálfgegnsætt / Translucent") ||
        (fabricFilter === "screen" && f.category === "Screen") ||
        (fabricFilter === "blackout" && f.category === "Myrkvun / Blackout");
      if (!matchesFilter) continue;
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    }
    return Array.from(map.entries());
  }, [fabricFilter]);

  const calc = useMemo(() => {
    const w = width / 1000;
    const h = height / 1000;
    const sqm = w * h;

    const fabricCost = fabric.pricePerSqmUSD * sqm;
    const cordlessCost = operation === "cordless" ? 6.25 * sqm : 0;
    const motorCost = operation === "motor" ? 100 : 0;
    const remoteCost = operation === "motor" ? 17.5 : 0;
    const sideTrackCost = sideTrack ? 21.25 * h : 0;
    const holderCost = holder ? HOLDER_USD : 0;

    const perPieceUSD = fabricCost + cordlessCost + motorCost + remoteCost + sideTrackCost + holderCost;
    const totalUSD = perPieceUSD * quantity;
    const accessoriesUSD = cordlessCost + motorCost + remoteCost + sideTrackCost + holderCost;
    const perPieceISK = fabricCost * USD_TO_ISK_RETAIL + accessoriesUSD * USD_TO_ISK_ACCESSORY;
    const totalISK = perPieceISK * normalizeQuantity(quantity);

    return { sqm, perPieceUSD, totalUSD, perPieceISK, totalISK, holderCost };
  }, [width, height, operation, fabric, sideTrack, quantity, holder]);



  const validSize = width >= 300 && width <= 3000 && height >= 300 && height <= 3500;

  return (
    <StorefrontLayout
      product={product}
      priceISK={calc.totalISK}
      activeFabric={{ name: `${fabric.series} - ${fabric.shade}`, image: ROLLER_SWATCH_IMAGES.get(fabric.code) || undefined }}
      quantity={quantity}
      setQuantity={(next) => setQuantity(normalizeQuantity(next))}
      canAddToCart={validSize}
      onAddToCart={() => {
        addItem({
          type: "roller",
          qty: quantity,
          width,
          height,
          cassette: `${cassette.code} — ${cassette.is}`,
          rail: `${bottomRail.is} (${bottomRail.dims}) · ${bottomRailColor}`,
          fabricCode: fabric.code,
          fabricName: `${fabric.series} — ${fabric.shade}`,
          fabricUsdPerSqm: fabric.pricePerSqmUSD,
          operation,
          sideTrack,
          holder,
        });
      }}
      controls={
        <div className="space-y-6 py-6 border-b border-[#ccd9df]">
          {/* Dimensions */}
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[.18em]">Mál</span>
            <MeasurementGuideTrigger />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span>
              <input aria-label="Breidd í sentímetrum" data-testid="roller-width" type="number" min="30" max="300" step="0.1" value={width / 10} onChange={(e) => setWidth((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none transition focus:border-[#24313b]" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span>
              <input aria-label="Hæð í sentímetrum" data-testid="roller-height" type="number" min="30" max="350" step="0.1" value={height / 10} onChange={(e) => setHeight((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none transition focus:border-[#24313b]" />
            </label>
          </div>
          {!validSize && <p className="text-xs text-red-600 mt-2">Stærð verður að vera 30–300 cm breidd og 30–350 cm hæð.</p>}

          {/* Operation */}
          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Stýring</span>
            <div className="grid grid-cols-3 gap-2">
              {([
                { v: "chain", is: "Keðja" },
                { v: "cordless", is: "Þráðlaus" },
                { v: "motor", is: "Mótor" },
              ] as const).map((o) => (
                <button
                  key={o.v}
                  type="button"
                  onClick={() => setOperation(o.v)}
                  className={`border px-2 py-3 text-center text-[10px] uppercase tracking-[.1em] transition ${operation === o.v ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                >
                  {o.is}
                </button>
              ))}
            </div>
          </div>

          {/* Fabric */}
          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Efni</span>
            <div data-testid="fabric-filters" className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Sía eftir ljósstýringu">
              {([
                ["all", "Allt"],
                ["light-filtering", "Ljós síað"],
                ["screen", "Skjáefni"],
                ["blackout", "Myrkvun"],
              ] as const).map(([value, label]) => (
                <button type="button" key={value} onClick={() => setFabricFilter(value)} aria-pressed={fabricFilter === value} className={`border px-3 py-2 text-[10px] uppercase tracking-[.08em] ${fabricFilter === value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{label}</button>
              ))}
            </div>
            <div data-testid="fabric-swatches" className="mb-4 grid max-h-64 grid-cols-5 gap-2 overflow-y-auto pr-1 sm:grid-cols-7">
              {grouped.flatMap(([, items]) => items).map((item) => {
                const image = ROLLER_SWATCH_IMAGES.get(item.code);
                return (
                  <button type="button" key={item.code} onClick={() => setFabricCode(item.code)} aria-label={`Velja ${item.series} ${item.shade}`} aria-pressed={fabric.code === item.code} className={`group relative aspect-square overflow-hidden border bg-[#eef3f5] ${fabric.code === item.code ? "border-2 border-[#24313b]" : "border-[#ccd9df]"}`}>
                    {image ? <img src={image} alt="" className="h-full w-full object-contain" /> : <span className="grid h-full place-items-center p-1 text-center text-[8px] leading-tight text-[#43515a]">{item.shade}</span>}
                    <span className="absolute inset-x-0 bottom-0 truncate bg-[#24313b]/75 px-1 py-1 text-[8px] text-white">{item.code}</span>
                  </button>
                );
              })}
            </div>
            <Select value={fabricCode} onValueChange={setFabricCode}>
              <SelectTrigger className="w-full rounded-none border-[#ccd9df] h-12 text-sm focus:ring-0 focus:border-[#24313b]">
                <SelectValue placeholder="Veldu efni" />
              </SelectTrigger>
              <SelectContent className="max-h-80 rounded-none border-[#ccd9df]">
                {grouped.map(([cat, items]) => (
                  <SelectGroup key={cat}>
                    <SelectLabel className="text-[10px] uppercase tracking-[.1em] text-[#667984]">{cat}</SelectLabel>
                    {items.map((f) => (
                      <SelectItem key={f.code} value={f.code} className="text-sm">
                        <span className="font-medium">{f.series}</span> — {f.code} {f.shade}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cassette */}
          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Kassetta / finish</span>
            <div className="grid grid-cols-2 gap-2">
              {cassetteOptions.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCassetteCode(c.code)}
                  aria-pressed={c.code === cassetteCode}
                  aria-label={`Velja ${c.is}, ${c.dims}`}
                  className={`border p-2 text-left transition ${c.code === cassetteCode ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                >
                  <img src={c.image} alt={c.is} className="mb-2 h-16 w-full object-contain bg-white mix-blend-multiply" />
                  <div className="text-[10px] font-medium truncate">{c.is}</div>
                  <div className="text-[9px] text-[#667984] truncate">{c.dims}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom rail */}
          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Botnlisti · Hulinn / Ál</span>
            <div className="grid grid-cols-2 gap-2">
              {BOTTOM_RAILS.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  onClick={() => setBottomRailCode(b.code)}
                  className={`border p-2 text-left transition ${b.code === bottomRailCode ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                >
                  <img src={b.image} alt={b.is} className="mb-2 h-16 w-full object-contain bg-white mix-blend-multiply" />
                  <div className="text-[10px] font-medium truncate">{b.is}</div>
                  <div className="text-[9px] text-[#667984] truncate">{b.dims}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Litur á botnlista · Hulinn / Ál</span>
            <div className="grid grid-cols-5 gap-2">
              {BOTTOM_RAIL_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setBottomRailColor(color.value)}
                  aria-pressed={bottomRailColor === color.value}
                  aria-label={`Velja lit á botnlista: ${color.value}`}
                  className={`border p-1 transition ${bottomRailColor === color.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                >
                  <img src={color.image} alt={color.value} className="aspect-square w-full object-contain" loading="lazy" />
                  <span className="mt-1 block truncate text-[8px]">{color.value}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Side track */}
          <label className="flex cursor-pointer items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase tracking-[.1em]">
            <span>Hliðarspor (Myrkvun)</span>
            <input type="checkbox" checked={sideTrack} onChange={(e) => setSideTrack(e.target.checked)} className="accent-[#24313b]" />
          </label>
          <div>
            <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Lásahaldari</span>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setHolder(null)} className={`border px-3 py-2 text-[10px] ${holder === null ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>Enginn</button>
              {HOLDER_COLORS.map((item) => <button type="button" key={item.value} onClick={() => setHolder(item.value)} className={`border px-3 py-2 text-[10px] ${holder === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.is}</button>)}
            </div>
          </div>
          <label className="flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase tracking-[.1em]">
            <span>Fjöldi</span>
            <input aria-label="Fjöldi" data-testid="roller-quantity" type="number" min="1" max="99" step="1" value={quantity} onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))} className="w-20 border border-[#ccd9df] bg-transparent px-2 py-2 text-center" />
          </label>
        </div>
      }
    />
  );
}
