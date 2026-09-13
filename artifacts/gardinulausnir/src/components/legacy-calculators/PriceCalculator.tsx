import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
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
import { BOTTOM_RAIL_COLORS, HOLDER_COLORS } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
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

const easeOut = "easeOut" as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOut } },
};

function formatISK(value: number): string {
  const rounded = Math.round(value / 500) * 500;
  return new Intl.NumberFormat("is-IS").format(rounded) + " kr";
}

export function PriceCalculator({ productIdentity = "square-cassette" }: { productIdentity?: RollerProductIdentity }) {
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
      const arr = map.get(f.category) ?? [];
      arr.push(f);
      map.set(f.category, arr);
    }
    return Array.from(map.entries());
  }, []);

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
    <section id="calculator" className="py-32 bg-secondary/40 border-y border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-4">
            Verðreiknivél · Price calculator
          </p>
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-4">Reiknaðu verðið</h2>
          <p className="text-xl text-muted-foreground mb-3">Estimate your price</p>
          <p className="text-foreground/75 leading-relaxed">
            Sláðu inn stærð, veldu efni og stýringu — fáðu áætlað verð á einu augabragði. Endanlegt tilboð er staðfest með mælingu á staðnum.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8"
        >
          {/* INPUTS */}
          <div className="bg-background rounded-2xl border border-border/60 p-8 space-y-7">
            {/* Size */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">
                Stærð glugga <span className="text-muted-foreground font-normal">(mm)</span>
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width" className="text-xs text-muted-foreground mb-1.5 block">Breidd / Width</Label>
                  <Input
                    id="width"
                    type="number"
                    min={300}
                    max={3000}
                    step={10}
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-xs text-muted-foreground mb-1.5 block">Hæð / Height</Label>
                  <Input
                    id="height"
                    type="number"
                    min={300}
                    max={3500}
                    step={10}
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value) || 0)}
                  />
                </div>
              </div>
              {!validSize && (
                <p className="text-xs text-destructive mt-2">
                  Stærð verður að vera 300–3000 mm breidd og 300–3500 mm hæð.
                </p>
              )}
            </div>

            {/* Operation */}
            <div>
              <Label className="text-sm font-semibold mb-3 block">Stýring / Operation</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: "chain",    is: "Keðja",     en: "Chain" },
                  { v: "cordless", is: "Þráðlaus",  en: "Cordless" },
                  { v: "motor",    is: "Mótor",     en: "Motorized" },
                ] as const).map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => setOperation(o.v)}
                    className={`px-3 py-3 rounded-lg border-2 text-center transition-colors ${
                      operation === o.v
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/40"
                    }`}
                  >
                    <div className="font-semibold text-sm">{o.is}</div>
                    <div className="text-xs text-muted-foreground">{o.en}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div>
              <Label htmlFor="fabric" className="text-sm font-semibold mb-3 block">
                Efni / Fabric
              </Label>
              <Select value={fabricCode} onValueChange={setFabricCode}>
                <SelectTrigger id="fabric" className="w-full">
                  <SelectValue placeholder="Veldu efni" />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {grouped.map(([cat, items]) => (
                    <SelectGroup key={cat}>
                      <SelectLabel>{cat}</SelectLabel>
                      {items.map((f) => (
                        <SelectItem key={f.code} value={f.code}>
                          <span className="font-medium">{f.series}</span>
                          <span className="text-muted-foreground"> — {f.code} {f.shade}</span>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">
                Valið: <span className="font-medium text-foreground">{fabric.series}</span> · {fabric.code} · {fabric.shade}
              </p>
            </div>

            {/* Cassette & Bottom rail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Kassetta / Cassette
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {cassetteOptions.map((c) => {
                    const selected = c.code === cassetteCode;
                    return (
                      <button
                        key={c.code}
                        type="button"
                        onClick={() => setCassetteCode(c.code)}
                        className={`group text-left rounded-lg border overflow-hidden transition-all ${
                          selected
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                            : "border-border/60 hover:border-primary/50 bg-background"
                        }`}
                        aria-pressed={selected}
                      >
                        <div className="aspect-[4/3] bg-stone-50 overflow-hidden">
                          <img
                            src={c.image}
                            alt={`${c.is} — ${c.en}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2">
                          <p className="text-xs font-semibold leading-tight truncate">{c.is}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight truncate">
                            {c.en} · {c.dims}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Valið: <span className="font-medium text-foreground">{cassette.is}</span> · {cassette.en} · {cassette.dims}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold mb-3 block">
                    Botnstöng / Bottom rail
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {BOTTOM_RAILS.map((b) => {
                      const selected = b.code === bottomRailCode;
                      return (
                        <button
                          key={b.code}
                          type="button"
                          onClick={() => setBottomRailCode(b.code)}
                          className={`group text-left rounded-lg border overflow-hidden transition-all ${
                            selected
                              ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                              : "border-border/60 hover:border-primary/50 bg-background"
                          }`}
                          aria-pressed={selected}
                        >
                          <div className="aspect-[4/3] bg-stone-50 overflow-hidden">
                            <img
                              src={b.image}
                              alt={`${b.is} — ${b.en}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-semibold leading-tight truncate">{b.is}</p>
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">
                              {b.en} · {b.dims}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Valið: <span className="font-medium text-foreground">{bottomRail.is}</span> · {bottomRail.en} · {bottomRail.dims}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-semibold mb-2 block">
                    Litur á botnstöng <span className="text-muted-foreground font-normal text-xs">/ Bottom rail colour</span>
                  </Label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BOTTOM_RAIL_COLORS.map((rc) => {
                      const selected = bottomRailColor === rc.value;
                      return (
                        <button key={rc.value} type="button" onClick={() => setBottomRailColor(rc.value)}
                          className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                          aria-pressed={selected}>
                          <div className="w-full aspect-square rounded-md overflow-hidden">
                            <img src={rc.image} alt={rc.value} className="w-full h-full object-cover" loading="lazy" />
                          </div>
                          <span className="text-[10px] font-medium text-center leading-tight">{rc.value}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Extras */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sidetrack" className="text-sm font-semibold block">
                    Hliðarspor / Side track
                  </Label>
                  <p className="text-xs text-muted-foreground">Algjör myrkvun, lokar fyrir ljósleka frá hliðum.</p>
                </div>
                <Switch id="sidetrack" checked={sideTrack} onCheckedChange={setSideTrack} />
              </div>

              {/* Pull holder */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">
                  Lásahaldari / Pull holder <span className="text-muted-foreground font-normal text-xs">(+{(HOLDER_USD * USD_TO_ISK_ACCESSORY).toLocaleString("is-IS", { maximumFractionDigits: 0 })} kr stk)</span>
                </Label>
                <div className="grid grid-cols-4 gap-2">
                  <button type="button" onClick={() => setHolder(null)}
                    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${holder === null ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
                    aria-pressed={holder === null}>
                    <div className="w-full aspect-square rounded-md overflow-hidden bg-secondary/40 flex items-center justify-center">
                      <span className="text-xl text-muted-foreground font-light">–</span>
                    </div>
                    <span className="text-xs font-medium">Enginn</span>
                  </button>
                  {HOLDER_COLORS.map((hc) => {
                    const selected = holder === hc.value;
                    return (
                      <button key={hc.value} type="button" onClick={() => setHolder(hc.value)}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-colors ${selected ? "border-primary bg-primary/5" : "border-border/60 hover:border-primary/40"}`}
                        aria-pressed={selected}>
                        <div className="w-full aspect-square rounded-md overflow-hidden">
                          <img src={hc.image} alt={hc.en} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <span className="text-xs font-medium">{hc.is}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label htmlFor="qty" className="text-sm font-semibold block">Fjöldi / Quantity</Label>
                  <p className="text-xs text-muted-foreground">Hversu margar gardínur með þessari uppsetningu.</p>
                </div>
                <Input
                  id="qty"
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))}
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {/* OUTPUT */}
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5" />
              <span className="text-xs uppercase tracking-wider opacity-80">Áætlað verð</span>
            </div>

            <div className="space-y-4 text-sm opacity-90 mb-6">
              <div className="flex justify-between">
                <span>Stærð</span>
                <span className="font-medium tabular-nums">{(width/1000).toFixed(2)} × {(height/1000).toFixed(2)} m</span>
              </div>
              <div className="flex justify-between">
                <span>Flatarmál</span>
                <span className="font-medium tabular-nums">{validSize ? `${calc.sqm.toFixed(2)} m²` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span>Stýring</span>
                <span className="font-medium">{operation === "chain" ? "Keðja" : operation === "cordless" ? "Þráðlaus" : "Mótor"}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Kassetta</span>
                <span className="font-medium text-right">{cassette.is} <span className="opacity-70">({cassette.dims})</span></span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Botnstöng</span>
                <span className="font-medium text-right">{bottomRail.is} <span className="opacity-70">({bottomRail.dims})</span></span>
              </div>
              <div className="flex justify-between">
                <span>Litur á botnstöng</span>
                <span className="font-medium">{bottomRailColor}</span>
              </div>
              <div className="flex justify-between">
                <span>Hliðarspor</span>
                <span className="font-medium">{sideTrack ? "Já" : "Nei"}</span>
              </div>
              {holder && (
                <div className="flex justify-between">
                  <span>Lásahaldari</span>
                  <span className="font-medium">{holder === "white" ? "Hvítur" : holder === "navy" ? "Marínublár" : "Svartur"} +{(HOLDER_USD * USD_TO_ISK_ACCESSORY).toLocaleString("is-IS", { maximumFractionDigits: 0 })} kr</span>
                </div>
              )}
            </div>

            <div className="border-t border-primary-foreground/20 pt-6 mb-6">
              {quantity > 1 && (
                <div className="flex justify-between text-sm opacity-90 mb-3">
                  <span>Per stk.</span>
                  <span className="font-semibold tabular-nums">{validSize ? formatISK(calc.perPieceISK) : "—"}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline">
                <span className="text-sm uppercase tracking-wider opacity-80">
                  {quantity > 1 ? `Samtals (${quantity} stk)` : "Samtals"}
                </span>
                <span className="font-serif text-4xl font-bold tabular-nums">
                  {validSize ? formatISK(calc.totalISK) : "—"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs opacity-75 mb-6 leading-relaxed">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <p>
                Áætlað verð m.v. núverandi gengi og innifelur efni og stýribúnað. Uppsetning (15.000 kr) og endanlegt tilboð gefið eftir mælingu á staðnum.
              </p>
            </div>

            <div className="mt-auto space-y-2">
              <Button
                type="button"
                size="lg"
                variant="secondary"
                className="w-full"
                disabled={!validSize}
                onClick={() =>
                  addItem({
                    type: "roller",
                    qty: quantity,
                    width,
                    height,
                    cassette: `${cassette.code} — ${cassette.is}`,
                    rail: `${bottomRail.is} (${bottomRail.dims}) · ${bottomRailColor}`,
                    fabricCode: fabric.code,
                    fabricName: `${fabric.series} · ${fabric.code} ${fabric.shade}`,
                    fabricUsdPerSqm: fabric.pricePerSqmUSD,
                    operation,
                    sideTrack,
                    holder,
                  })
                }
                data-testid="add-roller-to-cart"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Bæta í körfu <span className="ml-2 opacity-70 font-normal">| Add to cart</span>
              </Button>
              <Button asChild variant="ghost" className="w-full text-primary-foreground hover:bg-primary-foreground/10">
                <a href="#contact">Eða biðja um tilboð / Or request quote</a>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
