import { useEffect, useMemo, useState } from "react";
import { useRailColor } from "@/lib/railColor";
import { motion } from "framer-motion";
import { Calculator, Check, Info, ShoppingBag, Sun, SunMedium, Moon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { CASSETTE_RAIL_COLORS, MOTORIZED_RAIL_COLORS, resolveRailColor } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
import { StorefrontLayout } from "./StorefrontLayout";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";
import { retailPriceFromSupplierUsd, SUPPLIER_TO_RETAIL_ISK } from "@/lib/pricing";

// Supplier cost, equal shipping, margin, FX and VAT are applied in pricing.ts.
const USD_TO_ISK_RETAIL = SUPPLIER_TO_RETAIL_ISK;
const USD_TO_ISK_ACCESSORY = SUPPLIER_TO_RETAIL_ISK;
const MOTOR_USD = 142.26;
const REMOTE_USD = 14;

const MOTOR_ISK = Math.round((MOTOR_USD + REMOTE_USD) * USD_TO_ISK_ACCESSORY);

type Operation = "chain" | "cordless" | "motor";
export type ZebraFabricType = "translucent" | "room-darkening" | "blackout";

type ZebraFabric = {
  code: string;
  series: string;
  is: string;
  en: string;
  type: ZebraFabricType;
  usdPerSqm: number;
  swatch: string; // CSS color
};

// Curated selection from supplier price sheet (Sheet 4)
const ZEBRA_FABRICS: ZebraFabric[] = [
  // Translucent — DS-TR series
  { code: "ZT-B1",   series: "B1",    is: "Slæðugardína — Budget",   en: "Sheer — Budget",   type: "translucent",    usdPerSqm: 14.22, swatch: "#f5f0e8" },
  { code: "ZT-BL52", series: "BL52",  is: "Slæðugardína — Classic",  en: "Sheer — Classic",  type: "translucent",    usdPerSqm: 16.03, swatch: "#ede8df" },
  { code: "ZT-G31",  series: "G31",   is: "Slæðugardína — Premium",  en: "Sheer — Premium",  type: "translucent",    usdPerSqm: 16.12, swatch: "#e8e0d5" },
  { code: "ZT-BL25", series: "BL25",  is: "Slæðugardína — Lux",      en: "Sheer — Lux",      type: "translucent",    usdPerSqm: 17.94, swatch: "#ddd5c8" },
  { code: "ZT-G37",  series: "G37",   is: "Slæðugardína — Ultra",    en: "Sheer — Ultra",    type: "translucent",    usdPerSqm: 17.19, swatch: "#d8d0c5" },
  // Room-darkening — DS-RD series
  { code: "ZR-G35",  series: "G35",   is: "85% Myrkvun — Grunnlína", en: "85% Blockout — Base",    type: "room-darkening", usdPerSqm: 18.12, swatch: "#c8c0b5" },
  { code: "ZR-BL200",series: "BL200", is: "90% Myrkvun — Venja",     en: "90% Blockout — Standard",type: "room-darkening", usdPerSqm: 18.59, swatch: "#b8b0a5" },
  { code: "ZR-DF57", series: "DF57",  is: "90% Myrkvun — Miðlæg",   en: "90% Blockout — Mid",     type: "room-darkening", usdPerSqm: 19.05, swatch: "#a8a098" },
  { code: "ZR-BL46", series: "BL46",  is: "95% Myrkvun — Premium",  en: "95% Blockout — Premium", type: "room-darkening", usdPerSqm: 19.52, swatch: "#989088" },
  // Blackout — DS-BO series
  { code: "ZB-BK2",  series: "BK2",   is: "100% Myrkvun — Venja",   en: "Full Blackout — Standard",type: "blackout",       usdPerSqm: 20.45, swatch: "#504840" },
  { code: "ZB-BK5",  series: "BK5",   is: "100% Myrkvun — Premium", en: "Full Blackout — Premium", type: "blackout",       usdPerSqm: 20.45, swatch: "#403830" },
  { code: "ZB-HYBZ", series: "HYBZ9", is: "100% Myrkvun — Hybrid",  en: "Full Blackout — Hybrid",  type: "blackout",       usdPerSqm: 20.45, swatch: "#302820" },
];

// Size limits per operation (from supplier Sheet 7)
const SIZE_LIMITS: Record<Operation, { minW: number; maxW: number; minH: number; maxH: number; maxArea: number }> = {
  chain:    { minW: 300,  maxW: 2300, minH: 500, maxH: 2600, maxArea: 5.5 },
  cordless: { minW: 500,  maxW: 1800, minH: 500, maxH: 2000, maxArea: 3.5 },
  motor:    { minW: 520,  maxW: 2300, minH: 500, maxH: 2600, maxArea: 5.5 },
};

const TYPE_LABELS: Record<ZebraFabricType, { is: string; en: string }> = {
  "translucent":    { is: "Slæðugardína",   en: "Translucent Sheer" },
  "room-darkening": { is: "Hlutmyrkvun",    en: "Room-Darkening" },
  "blackout":       { is: "Fullmyrkvun",    en: "Full Blackout" },
};

const TYPE_ICONS = {
  "translucent":    Sun,
  "room-darkening": SunMedium,
  "blackout":       Moon,
};

const TYPE_PANEL: Record<ZebraFabricType, string> = {
  "translucent":    "border-amber-200 bg-amber-50/60",
  "room-darkening": "border-stone-300 bg-stone-100/70",
  "blackout":       "border-slate-700 bg-slate-900",
};

const TYPE_HEADER: Record<ZebraFabricType, string> = {
  "translucent":    "text-amber-900",
  "room-darkening": "text-stone-800",
  "blackout":       "text-slate-100",
};

function fmtISK(v: number) {
  return v.toLocaleString("is-IS", { maximumFractionDigits: 0 }) + " kr";
}

export default function ZebraBlindCalculator({ product }: { product?: any }) {
  const [width, setWidth]       = useState<number>(1200);
  const [height, setHeight]     = useState<number>(1500);
  const [quantity, setQuantity] = useState<number>(1);
  const [fabricCode, setFabricCode] = useState<string>("ZT-BL52");
  const [fabricType, setFabricType] = useState<ZebraFabricType>("translucent");
  const [operation, setOperation]   = useState<Operation>("chain");
  const { railColor, setRailColor } = useRailColor();
  const [lastCassetteColor, setLastCassetteColor] = useState<string>(railColor);
  const { addItem } = useCart();

  function handleOperationChange(next: Operation) {
    const wasMotor  = operation === "motor";
    const willMotor = next === "motor";
    if (!wasMotor && willMotor) {
      setLastCassetteColor(railColor);
      const resolved = resolveRailColor(railColor, MOTORIZED_RAIL_COLORS);
      if (resolved !== railColor) setRailColor(resolved);
    } else if (wasMotor && !willMotor) {
      const restored = resolveRailColor(lastCassetteColor, CASSETTE_RAIL_COLORS);
      setRailColor(restored);
    }
    setOperation(next);
    // Snap width/height to the new operation's limits
    const lim = SIZE_LIMITS[next];
    setWidth(w  => Math.min(Math.max(w,  lim.minW), lim.maxW));
    setHeight(h => Math.min(Math.max(h,  lim.minH), lim.maxH));
  }

  const grouped = useMemo(() => {
    const g: Record<ZebraFabricType, ZebraFabric[]> = {
      "translucent": [], "room-darkening": [], "blackout": [],
    };
    for (const f of ZEBRA_FABRICS) g[f.type].push(f);
    return g;
  }, []);

  const fabric = useMemo(
    () => grouped[fabricType].find((f) => f.code === fabricCode) ?? grouped[fabricType][0] ?? ZEBRA_FABRICS[0],
    [fabricCode, fabricType, grouped],
  );

  useEffect(() => {
    if (!grouped[fabricType].some((f) => f.code === fabricCode)) {
      setFabricCode(grouped[fabricType][0]?.code ?? ZEBRA_FABRICS[0].code);
    }
  }, [fabricCode, fabricType, grouped]);

  const lim = SIZE_LIMITS[operation];

  const calc = useMemo(() => {
    const w = Math.max(0.3, width / 1000);
    const h = Math.max(0.3, height / 1000);
    const area    = w * h;
    const fabricUSD = area * fabric.usdPerSqm;
    const motorUSD  = operation === "motor" ? MOTOR_USD + REMOTE_USD : 0;
    const perPieceUSD = fabricUSD + motorUSD;
    const totalUSD    = perPieceUSD * quantity;
    const perPieceISK = retailPriceFromSupplierUsd(perPieceUSD);
    const totalISK    = perPieceISK * quantity;

    const widthOK  = width >= lim.minW && width <= lim.maxW;
    const heightOK = height >= lim.minH && height <= lim.maxH;
    const areaOK   = area   <= lim.maxArea;

    return { area, fabricUSD, motorUSD, perPieceUSD, totalUSD, totalISK, perPieceISK, widthOK, heightOK, areaOK, w, h };
  }, [width, height, quantity, operation, fabric, lim]);

  const validSize = calc.widthOK && calc.heightOK && calc.areaOK;
  const addToCart = () => addItem({
    type: "zebra",
    qty: normalizeQuantity(quantity),
    width,
    height,
    fabricCode: fabric.code,
    fabricName: `${fabric.is} (${fabric.series})`,
    fabricType: fabric.type,
    fabricUsdPerSqm: fabric.usdPerSqm,
    operation,
    railColor,
  });

  return (
    <StorefrontLayout
      product={product}
      priceISK={calc.totalISK}
      activeFabric={{ name: `${fabric.is} — ${fabric.series}`, tone: fabric.swatch }}
      quantity={quantity}
      setQuantity={(next) => setQuantity(normalizeQuantity(next))}
      canAddToCart={validSize}
      onAddToCart={addToCart}
      controls={
        <div className="space-y-5 border-b border-[#ccd9df] py-6">
          <div>
            <span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Ljós og efni</span>
            <div className="mb-3 grid grid-cols-3 gap-2" data-testid="zebra-fabric-types">
              {(["translucent", "room-darkening", "blackout"] as ZebraFabricType[]).map((type) => {
                const Icon = TYPE_ICONS[type];
                return (
                  <button type="button" key={type} onClick={() => setFabricType(type)} aria-pressed={fabricType === type} data-testid={`zebra-fabric-type-${type}`} className={`border px-2 py-2 text-[10px] uppercase tracking-[.04em] ${fabricType === type ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                    <Icon size={13} className="mx-auto mb-1" />{TYPE_LABELS[type].is}
                  </button>
                );
              })}
            </div>
            <div data-testid="zebra-fabrics" className="flex flex-wrap gap-2">
              {grouped[fabricType].map((item) => (
                <button type="button" key={item.code} onClick={() => setFabricCode(item.code)} aria-pressed={fabric.code === item.code} aria-label={`Velja ${item.is} · ${item.series}`} className={`border px-3 py-2 text-left text-[10px] ${fabric.code === item.code ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                  <span className="mr-2 inline-block h-4 w-4 align-middle rounded-sm" style={{ backgroundColor: item.swatch }} />{item.series}
                </button>
              ))}
            </div>
          </div>
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Stýring</span><div className="grid grid-cols-3 gap-2">{(["chain", "cordless", "motor"] as Operation[]).map((item) => <button type="button" key={item} onClick={() => handleOperationChange(item)} className={`border px-2 py-3 text-[10px] uppercase ${operation === item ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item === "chain" ? "Keðja" : item === "cordless" ? "Þráðlaus" : "Mótor"}</button>)}</div></div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[.18em]">Mál</span>
            <MeasurementGuideTrigger />
          </div>
          <div className="grid grid-cols-2 gap-3" data-testid="dimensions">
            <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input data-testid="zebra-width" aria-label="Breidd í sentímetrum" type="number" min={lim.minW / 10} max={lim.maxW / 10} step="0.1" value={width / 10} onChange={(e) => setWidth((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input data-testid="zebra-height" aria-label="Hæð í sentímetrum" type="number" min={lim.minH / 10} max={lim.maxH / 10} step="0.1" value={height / 10} onChange={(e) => setHeight((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
          </div>
          {!validSize && <p className="text-xs text-red-600">Stærð er utan marka: {lim.minW / 10}–{lim.maxW / 10} × {lim.minH / 10}–{lim.maxH / 10} cm, hámark {lim.maxArea} m².</p>}
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Finish · litur á kassettu</span><div className="flex flex-wrap gap-2">{(operation === "motor" ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS).map((item) => <button type="button" key={item.value} onClick={() => setRailColor(item.value)} className={`border px-3 py-2 text-[10px] ${railColor === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.value}</button>)}</div></div>
        </div>
      }
    />
  );

  return (
    <section id="zebra-calculator" className="py-16 md:py-24 bg-white border-t border-border/30 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="text-center mb-6 md:mb-10 max-w-2xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-2">Verðreikningur · Pricing</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-2">Reiknivél — Sebragardína / Zebra</h2>
          <p className="text-sm md:text-base text-muted-foreground">Skiptast á gegnsæjum og ógegnsæjum röndum</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="bg-secondary/20 rounded-2xl border border-border/40 overflow-hidden grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* CONFIG */}
          <div className="p-4 md:p-8 space-y-5 md:space-y-6 pb-32 lg:pb-8">

            {/* STEP 1 — Fabric type */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">1</span>
                <Label className="text-sm font-semibold">Veldu ljósavörn og efni</Label>
              </div>
              <div className="space-y-3">
                {(["translucent", "room-darkening", "blackout"] as ZebraFabricType[]).map(t => {
                  const Icon = TYPE_ICONS[t];
                  return (
                    <div key={t} className={`rounded-lg border-2 p-2.5 ${TYPE_PANEL[t]}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={`w-3.5 h-3.5 ${TYPE_HEADER[t]}`} />
                        <p className={`text-[11px] font-bold uppercase tracking-wide ${TYPE_HEADER[t]}`}>
                          {TYPE_LABELS[t].is}
                        </p>
                        <span className={`text-[10px] ml-auto opacity-70 ${TYPE_HEADER[t]}`}>
                          {fmtISK(Math.round((grouped[t][0]?.usdPerSqm ?? 0) * USD_TO_ISK_RETAIL))}–{fmtISK(Math.round((grouped[t][grouped[t].length - 1]?.usdPerSqm ?? 0) * USD_TO_ISK_RETAIL))}/m²
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {grouped[t].map(f => {
                          const selected = f.code === fabricCode;
                          return (
                            <button
                              key={f.code}
                              type="button"
                              onClick={() => setFabricCode(f.code)}
                              className={`relative flex items-center gap-2 px-2 py-1.5 rounded-md border transition-all text-left ${
                                selected
                                  ? "border-primary ring-2 ring-primary/30 bg-background"
                                  : "border-border/40 hover:border-primary/40 bg-background/60"
                              }`}
                              aria-pressed={selected}
                              title={`${f.is} · ${f.series} · $${f.usdPerSqm}/m²`}
                            >
                              <span
                                className="w-5 h-5 rounded-sm flex-shrink-0 border border-border/30"
                                style={{ background: f.swatch }}
                              />
                              <span className="flex flex-col min-w-0">
                                <span className="text-[10px] font-semibold truncate leading-tight">{f.series}</span>
                                <span className="text-[9px] text-muted-foreground leading-tight">{fmtISK(Math.round(f.usdPerSqm * USD_TO_ISK_RETAIL))}/m²</span>
                              </span>
                              {selected && <Check className="w-3 h-3 text-primary ml-auto flex-shrink-0" strokeWidth={3} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground bg-secondary/40 rounded-md py-1.5 px-3">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                <span>Valið: <strong className="text-foreground">{fabric.is}</strong> · {TYPE_LABELS[fabric.type].is} · {fmtISK(Math.round(fabric.usdPerSqm * USD_TO_ISK_RETAIL))}/m²</span>
              </div>
            </div>

            {/* STEP 2 — Operation */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">2</span>
                <Label className="text-sm font-semibold">Stjórnun</Label>
              </div>
              <Select value={operation} onValueChange={v => handleOperationChange(v as Operation)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="chain">Keðja / Chain — hám. 230×260 cm, 5.5 m²</SelectItem>
                  <SelectItem value="cordless">Snærislaust / Cordless — hám. 180×200 cm, 3.5 m²</SelectItem>
                  <SelectItem value="motor">Rafknúið / Motorized (+{MOTOR_ISK.toLocaleString("is-IS")} kr) — hám. 230×260 cm, 5.5 m²</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <Info className="w-3 h-3 flex-shrink-0" />
                Stærðarmörk: {lim.minW}–{lim.maxW} mm × {lim.minH}–{lim.maxH} mm · hám. {lim.maxArea} m²
              </p>
            </div>

            {/* STEP 3 — Size + qty */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">3</span>
                <Label className="text-sm font-semibold">Stærð og fjöldi (mm)</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="zb-width" className="text-[10px] text-muted-foreground">Breidd</Label>
                  <Input
                    id="zb-width" type="number" value={width}
                    onChange={e => setWidth(Number(e.target.value) || 0)}
                    min={lim.minW} max={lim.maxW} step={10}
                    className={!calc.widthOK ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="zb-height" className="text-[10px] text-muted-foreground">Hæð</Label>
                  <Input
                    id="zb-height" type="number" value={height}
                    onChange={e => setHeight(Number(e.target.value) || 0)}
                    min={lim.minH} max={lim.maxH} step={10}
                    className={!calc.heightOK ? "border-destructive" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="zb-qty" className="text-[10px] text-muted-foreground">Fjöldi</Label>
                  <Input
                    id="zb-qty" type="number" value={quantity}
                    onChange={e => setQuantity(normalizeQuantity(Number(e.target.value)))}
                    min={1} max={99} step={1}
                  />
                </div>
              </div>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-destructive mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  {!calc.widthOK  && `Breidd verður að vera ${lim.minW}–${lim.maxW} mm. `}
                  {!calc.heightOK && `Hæð verður að vera ${lim.minH}–${lim.maxH} mm. `}
                  {!calc.areaOK   && `Flatarmál er of stort (hám. ${lim.maxArea} m²).`}
                </p>
              )}
            </div>

            {/* STEP 4 — Rail colour */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">4</span>
                <Label className="text-sm font-semibold">Litur á kassetta <span className="text-muted-foreground font-normal text-xs">/ Cassette colour</span></Label>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {(operation === "motor" ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS).map(rc => {
                  const selected = railColor === rc.value;
                  return (
                    <button
                      key={rc.value} type="button" onClick={() => setRailColor(rc.value)}
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                      aria-pressed={selected}
                    >
                      <div className="w-full aspect-square rounded-md overflow-hidden">
                        <img src={rc.image} alt={rc.value} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">{rc.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RESULT — desktop side panel */}
          <div className="hidden lg:flex bg-primary text-primary-foreground p-6 md:p-10 flex-col">
            <div className="flex items-center gap-2 mb-6">
              <Calculator className="w-5 h-5 opacity-80" />
              <h3 className="font-serif text-2xl font-bold">Áætlað verð</h3>
            </div>

            <div className="space-y-3 text-sm mb-6 opacity-90">
              <div className="flex justify-between">
                <span>Flatarmál</span>
                <span className="font-medium">{calc.area.toFixed(2)} m²</span>
              </div>
              <div className="flex justify-between"><span>Efni</span><span className="font-medium">{fabric.series} — {TYPE_LABELS[fabric.type].is}</span></div>
              <div className="flex justify-between"><span>Stjórnun</span>
                <span className="font-medium">
                  {operation === "chain" ? "Keðja" : operation === "cordless" ? "Snærislaust" : "Rafknúið"}
                </span>
              </div>
              <div className="flex justify-between"><span>Kassettalitur</span><span className="font-medium">{railColor}</span></div>
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20">
                <span>Efni · {fmtISK(Math.round(fabric.usdPerSqm * USD_TO_ISK_RETAIL))}/m²</span>
                <span>{fmtISK(Math.round(calc.fabricUSD * USD_TO_ISK_RETAIL))}</span>
              </div>
              {calc.motorUSD > 0 && (
                <div className="flex justify-between">
                  <span>Mótor + fjarstýring</span>
                  <span>{fmtISK(Math.round(calc.motorUSD * USD_TO_ISK_ACCESSORY))}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20">
                <span>Verð per stk</span>
                <span className="font-medium">{fmtISK(Math.round(calc.perPieceISK))}</span>
              </div>
              {quantity > 1 && (
                <div className="flex justify-between">
                  <span>× {quantity} stk</span>
                  <span className="font-medium">{fmtISK(Math.round(calc.totalISK))}</span>
                </div>
              )}
            </div>

            <div className="mt-auto pt-6 border-t border-primary-foreground/20">
              <p className="text-xs opacity-70 mb-1">Áætlað smásöluverð</p>
              <p className="font-serif text-4xl md:text-5xl font-bold leading-none">{fmtISK(Math.round(calc.totalISK))}</p>
              <Button
                type="button" size="lg" variant="secondary" className="w-full mt-6 rounded-full"
                disabled={!calc.widthOK || !calc.heightOK || !calc.areaOK}
                onClick={() =>
                  addItem({
                    type: "zebra",
                    qty: quantity,
                    width,
                    height,
                    fabricCode: fabric.code,
                    fabricName: `${fabric.is} (${fabric.series})`,
                    fabricType: fabric.type,
                    fabricUsdPerSqm: fabric.usdPerSqm,
                    operation,
                    railColor,
                  })
                }
                data-testid="add-zebra-to-cart"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Bæta í körfu <span className="ml-2 opacity-70 font-normal">| Add to cart</span>
              </Button>
              <p className="text-[11px] opacity-60 mt-3 leading-relaxed">
                Áætlað verð — flutningur og uppsetning ekki innifalin. Lokaverð staðfest eftir mælingu.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Mobile sticky bar */}
      <div className="sticky bottom-0 z-40 lg:hidden bg-primary text-primary-foreground border-t border-primary-foreground/20 shadow-lg">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 max-w-6xl">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] opacity-70 leading-none">Áætlað verð</p>
            <p className="font-serif text-xl font-bold leading-tight truncate">{fmtISK(Math.round(calc.totalISK))}</p>
            <p className="text-[10px] opacity-70 leading-none truncate">{fabric.series} · {calc.area.toFixed(2)} m²</p>
          </div>
          <Button
            type="button" size="sm" variant="secondary" className="rounded-full flex-shrink-0"
            disabled={!calc.widthOK || !calc.heightOK || !calc.areaOK}
            onClick={() =>
              addItem({
                type: "zebra",
                qty: quantity,
                width,
                height,
                fabricCode: fabric.code,
                fabricName: `${fabric.is} (${fabric.series})`,
                fabricType: fabric.type,
                fabricUsdPerSqm: fabric.usdPerSqm,
                operation,
                railColor,
              })
            }
            data-testid="add-zebra-to-cart-mobile"
          >
            <ShoppingBag className="w-4 h-4 mr-1.5" />
            Í körfu
          </Button>
        </div>
      </div>
    </section>
  );
}
