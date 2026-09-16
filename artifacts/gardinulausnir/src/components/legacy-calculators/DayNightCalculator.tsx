import { useMemo, useState } from "react";
import { useRailColor } from "@/lib/railColor";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Check, Info, ShoppingBag, Sun, Moon } from "lucide-react";
import DualRollerDemo from "./DualRollerDemo";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { FABRICS, fabricsByFamily, type FabricFamily, type FabricInfo } from "@/lib/fabrics";
import { CASSETTE_RAIL_COLORS, MOTORIZED_RAIL_COLORS, resolveRailColor } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
import { StorefrontLayout } from "./StorefrontLayout";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";
import { DAYNIGHT_45_LIMITS, dayNightSupplierRate, retailPriceFromSupplierUsd, SUPPLIER_TO_RETAIL_ISK, validateHoneycombSize, type MountPosition } from "@/lib/pricing";
import { HoneycombOptions } from "./HoneycombOptions";

// Supplier cost, equal shipping, margin, FX and VAT are applied in pricing.ts.
const USD_TO_ISK_RETAIL = SUPPLIER_TO_RETAIL_ISK;
const USD_TO_ISK_COST = SUPPLIER_TO_RETAIL_ISK;
const CORDLESS_USD_PER_SQM = 3;
const MOTOR_USD = 34.5573219076603;
const REMOTE_USD = 0;
const SIDETRACK_USD_PER_M = 10;
const MIN_SQM_PER_PIECE = 1;

const CORDLESS_ISK_PER_SQM = Math.round(CORDLESS_USD_PER_SQM * USD_TO_ISK_COST);
const MOTOR_ISK = Math.round((MOTOR_USD + REMOTE_USD) * USD_TO_ISK_COST);
const SIDETRACK_ISK_PER_M = Math.round(SIDETRACK_USD_PER_M * USD_TO_ISK_COST);

type Operation = "manual" | "cordless" | "motor";

// Raw supplier USD/m² from the workbook's separate Day & Night combination sheet.
export const DAYNIGHT_COMBO_KEYS = ["KS+KB", "KT+KB", "KS+KT"] as const;
export type DayNightComboKey = (typeof DAYNIGHT_COMBO_KEYS)[number];

export const DAYNIGHT_COMBOS: Record<DayNightComboKey, {
  is: string;
  en: string;
  description: string;
  front: FabricFamily;
  back: FabricFamily;
  usdPerSqm: number;
}> = {
  "KS+KB": {
    is: "Gegnsætt + Myrkvun",
    en: "Sheer + Blackout",
    description: "Hámarks andstaða — sjá út á daginn, fullkomið myrkur á nóttunni.",
    front: "KS", back: "KB", usdPerSqm: 28.6931231792052,
  },
  "KT+KB": {
    is: "Ljós síað + Myrkvun",
    en: "Translucent + Blackout",
    description: "Mjúkt ljós á daginn, fullkomið myrkur á nóttunni.",
    front: "KT", back: "KB", usdPerSqm: 28.6931231792052,
  },
  "KS+KT": {
    is: "Gegnsætt + Ljós síað",
    en: "Sheer + Translucent",
    description: "Tvö lög af mjúku ljósi — fyrir björt rými.",
    front: "KS", back: "KT", usdPerSqm: 26.3427429770029,
  },
};

function fmtISK(v: number) {
  return v.toLocaleString("is-IS", { maximumFractionDigits: 0 }) + " kr";
}


export default function DayNightCalculator({ product }: { product?: any }) {
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1500);
  const [quantity, setQuantity] = useState<number>(1);
  const [comboKey, setComboKey] = useState<DayNightComboKey>("KS+KB");
  const [frontCode, setFrontCode] = useState<string>("KS401");
  const [backCode, setBackCode] = useState<string>("KB401");
  const [operation, setOperation] = useState<Operation>("manual");
  const [sideTrack, setSideTrack] = useState<boolean>(false);
  const [sideTrackType, setSideTrackType] = useState<"u" | "l">("u");
  const [mountPosition, setMountPosition] = useState<MountPosition>("outside");
  const [noDrill, setNoDrill] = useState<boolean>(false);
  const { railColor, setRailColor } = useRailColor();
  const [lastCassetteColor, setLastCassetteColor] = useState<string>(railColor);
  const { addItem } = useCart();

  function handleOperationChange(next: Operation) {
    const wasMotor = operation === "motor";
    const willBeMotor = next === "motor";
    if (!wasMotor && willBeMotor) {
      setLastCassetteColor(railColor);
      const resolved = resolveRailColor(railColor, MOTORIZED_RAIL_COLORS);
      if (resolved !== railColor) setRailColor(resolved);
    } else if (wasMotor && !willBeMotor) {
      const restored = resolveRailColor(lastCassetteColor, CASSETTE_RAIL_COLORS);
      setRailColor(restored);
    }
    setOperation(next);
  }

  const combo = DAYNIGHT_COMBOS[comboKey];
  const frontFabrics = useMemo(() => fabricsByFamily(combo.front), [combo.front]);
  const backFabrics = useMemo(() => fabricsByFamily(combo.back), [combo.back]);

  // When combo changes, snap fabrics into the new families.
  const front: FabricInfo = FABRICS[frontCode] && FABRICS[frontCode].family === combo.front
    ? FABRICS[frontCode]
    : frontFabrics[0];
  const back: FabricInfo = FABRICS[backCode] && FABRICS[backCode].family === combo.back
    ? FABRICS[backCode]
    : backFabrics[0];

  function selectCombo(k: DayNightComboKey) {
    setComboKey(k);
    const next = DAYNIGHT_COMBOS[k];
    // Preserve current colour picks if the fabric family stays the same.
    setFrontCode((prev) =>
      FABRICS[prev]?.family === next.front
        ? prev
        : fabricsByFamily(next.front)[0]?.code ?? "",
    );
    setBackCode((prev) =>
      FABRICS[prev]?.family === next.back
        ? prev
        : fabricsByFamily(next.back)[0]?.code ?? "",
    );
  }

  const calc = useMemo(() => {
    const w = Math.max(0.3, (mountPosition === "inside" ? width - 5 : width) / 1000);
    const h = Math.max(0.3, height / 1000);
    const rawArea = w * h;
    const billedArea = Math.max(MIN_SQM_PER_PIECE, rawArea);

    const selectedComboRate = dayNightSupplierRate(front.code, back.code) ?? combo.usdPerSqm;
    const fabricUSD = billedArea * selectedComboRate;
    const cordlessUSD = operation === "cordless" ? billedArea * CORDLESS_USD_PER_SQM : 0;
    const noDrillUSD = noDrill ? billedArea * 3 : 0;
    const motorUSD = operation === "motor" ? (billedArea > 4 ? 71.1311073101807 : MOTOR_USD) : 0;
    const remoteUSD = operation === "motor" ? REMOTE_USD : 0;
    const sidetrackUSD = sideTrack ? h * (sideTrackType === "l" ? 5 : SIDETRACK_USD_PER_M) : 0;

    const perPieceUSD = fabricUSD + cordlessUSD + noDrillUSD + motorUSD + remoteUSD + sidetrackUSD;
    const totalUSD = perPieceUSD * quantity;

    const perPieceISK = retailPriceFromSupplierUsd(perPieceUSD);
    const totalISK = perPieceISK * quantity;

    const size = validateHoneycombSize({
      product: "daynight",
      operation,
      widthMm: width,
      heightMm: height,
      mountPosition,
    });
    const widthOK = size.ok
      || (Boolean(size.limits) &&
        size.effectiveWidthMm >= size.limits!.minWidthMm &&
        size.effectiveWidthMm <= size.limits!.maxWidthMm);
    const heightOK = size.ok
      || (Boolean(size.limits) &&
        height >= size.limits!.minHeightMm &&
        height <= size.limits!.maxHeightMm);
    const areaOK = size.ok || (Boolean(size.limits) && rawArea <= size.limits!.maxAreaSqm);

    return { rawArea, billedArea, perPieceUSD, totalUSD, totalISK, perPieceISK, fabricUSD, cordlessUSD, motorUSD, remoteUSD, sidetrackUSD, widthOK, heightOK, areaOK, w, h };
  }, [width, height, quantity, operation, sideTrack, sideTrackType, mountPosition, noDrill, combo, front.code, back.code]);

  const validSize = calc.widthOK && calc.heightOK && calc.areaOK;
  const addToCart = () => addItem({
    type: "daynight",
    qty: normalizeQuantity(quantity),
    width,
    height,
    comboKey,
    frontCode: front.code,
    backCode: back.code,
    frontName: `${front.is} (${front.name})`,
    backName: `${back.is} (${back.name})`,
    comboUsdPerSqm: dayNightSupplierRate(front.code, back.code) ?? combo.usdPerSqm,
    operation,
    sideTrack,
    sideTrackType,
    mountPosition,
    noDrill,
    railColor,
  });

  return (
    <StorefrontLayout
      product={product}
      priceISK={calc.totalISK}
      activeFabric={{ name: `${front.is} + ${back.is}`, image: front.image, pattern: back.image }}
      quantity={quantity}
      setQuantity={(next) => setQuantity(normalizeQuantity(next))}
      canAddToCart={validSize}
      onAddToCart={addToCart}
      controls={
        <div className="space-y-5 border-b border-[#ccd9df] py-6">
           <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Samsetning tveggja laga</span><div className="grid grid-cols-3 gap-2">{DAYNIGHT_COMBO_KEYS.map((key) => <button type="button" key={key} data-testid={`daynight-combo-${key}`} onClick={() => selectCombo(key)} aria-pressed={comboKey === key} className={`border px-2 py-3 text-left text-[10px] ${comboKey === key ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{DAYNIGHT_COMBOS[key].is}</button>)}</div></div>
             <div className="grid grid-cols-2 gap-3">
             <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Daglag · {front.is}</span><div data-testid="daynight-front-fabrics" className="flex flex-wrap gap-2">{frontFabrics.map((item) => <button type="button" key={item.code} data-testid={`daynight-front-${item.code}`} onClick={() => setFrontCode(item.code)} className={`h-11 w-11 overflow-hidden rounded-full border ${front.code === item.code ? "border-[#24313b]" : "border-transparent"}`} aria-label={`Velja ${item.is} · ${item.name} (${item.code})`} aria-pressed={front.code === item.code}><img src={item.image} alt={item.is} className="h-full w-full object-contain" /></button>)}</div></div>
             <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Næturlag · {back.is}</span><div data-testid="daynight-back-fabrics" className="flex flex-wrap gap-2">{backFabrics.map((item) => <button type="button" key={item.code} data-testid={`daynight-back-${item.code}`} onClick={() => setBackCode(item.code)} className={`h-11 w-11 overflow-hidden rounded-full border ${back.code === item.code ? "border-[#24313b]" : "border-transparent"}`} aria-label={`Velja ${item.is} · ${item.name} (${item.code})`} aria-pressed={back.code === item.code}><img src={item.image} alt={item.is} className="h-full w-full object-contain" /></button>)}</div></div>
          </div>
           <div className="mb-2 flex items-center justify-between gap-3">
             <span className="text-[10px] uppercase tracking-[.18em]">Mál</span>
             <MeasurementGuideTrigger />
           </div>
              <div className="grid grid-cols-2 gap-3">
              <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input data-testid="dn-width" aria-label="Breidd í sentímetrum" type="number" min={DAYNIGHT_45_LIMITS[operation].minWidthMm / 10} max={DAYNIGHT_45_LIMITS[operation].maxWidthMm / 10} step="0.1" value={width / 10} onChange={(e) => setWidth((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
             <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input data-testid="dn-height" aria-label="Hæð í sentímetrum" type="number" min={DAYNIGHT_45_LIMITS[operation].minHeightMm / 10} max={DAYNIGHT_45_LIMITS[operation].maxHeightMm / 10} step="0.1" value={height / 10} onChange={(e) => setHeight((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
              </div>
            {!validSize && <p className="text-xs text-red-600">Stærð er utan marka fyrir valda stýringu ({DAYNIGHT_45_LIMITS[operation].minWidthMm}–{DAYNIGHT_45_LIMITS[operation].maxWidthMm} × {DAYNIGHT_45_LIMITS[operation].minHeightMm}–{DAYNIGHT_45_LIMITS[operation].maxHeightMm} mm, hám. {DAYNIGHT_45_LIMITS[operation].maxAreaSqm} m²).</p>}
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Stýring</span><div className="grid grid-cols-3 gap-2">{(["manual", "cordless", "motor"] as Operation[]).map((item) => <button type="button" key={item} onClick={() => handleOperationChange(item)} className={`border px-2 py-3 text-[10px] uppercase ${operation === item ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item === "manual" ? "Handvirk" : item === "cordless" ? "Þráðlaus" : "Mótor"}</button>)}</div></div>
          <label className="flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase"><span>Hliðarspor</span><input type="checkbox" checked={sideTrack} onChange={(e) => setSideTrack(e.target.checked)} /></label>
          <HoneycombOptions idPrefix="dn" sideTrack={sideTrack} sideTrackType={sideTrackType} setSideTrackType={setSideTrackType} mountPosition={mountPosition} setMountPosition={setMountPosition} noDrill={noDrill} setNoDrill={setNoDrill} />
           <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Finish · litur á brautum</span><div className="flex flex-wrap gap-2">{(operation === "motor" ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS).map((item) => <button type="button" key={item.value} onClick={() => setRailColor(item.value)} className={`border px-3 py-2 text-[10px] ${railColor === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.value}</button>)}</div></div>
        </div>
      }
    />
  );

  const familyColor: Record<FabricFamily, string> = {
    KS: "bg-amber-50 border-amber-200",
    KT: "bg-stone-200 border-stone-300",
    KB: "bg-slate-800 border-slate-900",
    KN: "bg-slate-900 border-slate-950",
    SB: "bg-slate-700 border-slate-800",
  };
  const familyLabel: Record<FabricFamily, string> = {
    KS: "Slæðu", KT: "Hálfgegnsætt", KB: "Myrkrið", KN: "Tvöfalt myrkrið", SB: "90% Myrkvun",
  };

  return (
    <section id="daynight-calculator" className="py-16 md:py-24 bg-white border-t border-border/30 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.6, ease: "easeOut" as const }} className="text-center mb-6 md:mb-10 max-w-2xl mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-2">Verðreikningur · Pricing</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-2">Reiknivél — Day &amp; Night 45 mm</h2>
          <p className="text-sm md:text-base text-muted-foreground">Veldu samsetningu og lit á hvort lag fyrir sig</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" as const }}>
          <DualRollerDemo />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, ease: "easeOut" as const }} className="bg-secondary/20 rounded-2xl border border-border/40 overflow-hidden grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]">
          {/* CONFIG */}
          <div className="p-4 md:p-8 space-y-5 md:space-y-6 pb-32 lg:pb-8">
            {/* Combo type — STEP 1 */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">1</span>
                <Label className="text-sm font-semibold">Samsetning tveggja laga</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {DAYNIGHT_COMBO_KEYS.map((k) => {
                  const c = DAYNIGHT_COMBOS[k];
                  const selected = k === comboKey;
                  return (
                    <button key={k} type="button" onClick={() => selectCombo(k)}
                      className={`text-left rounded-lg border p-2.5 transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                      aria-pressed={selected} data-testid={`dn-combo-${k}`}>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <div className={`w-5 h-5 rounded border ${familyColor[c.front]}`} title={familyLabel[c.front]} />
                        <span className="text-muted-foreground text-[10px]">+</span>
                        <div className={`w-5 h-5 rounded border ${familyColor[c.back]}`} title={familyLabel[c.back]} />
                        <span className="text-[11px] text-muted-foreground ml-auto">{fmtISK(c.usdPerSqm * USD_TO_ISK_RETAIL)}/m²</span>
                      </div>
                      <p className="text-xs font-semibold leading-tight">{c.is}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 2 — Two color pickers side-by-side */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">2</span>
                <Label className="text-sm font-semibold">Veldu lit á bæði lögin (tvö aðskild val)</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {/* FRONT — light "day" panel */}
                <div className="rounded-lg border-2 border-amber-200 bg-amber-50/60 p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sun className="w-3.5 h-3.5 text-amber-700" />
                    <p className="text-[11px] font-bold uppercase tracking-wide text-amber-900">Dagur — Framhlið</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {frontFabrics.map((f) => {
                      const selected = f.code === front.code;
                      return (
                        <button key={f.code} type="button" onClick={() => setFrontCode(f.code)}
                          className={`relative aspect-square rounded-md overflow-hidden transition-all ${selected ? "ring-4 ring-amber-600 ring-offset-1 ring-offset-amber-50" : "ring-1 ring-border hover:ring-amber-400"}`}
                          aria-pressed={selected} title={`${f.is} · ${f.name} · ${f.code}`}
                          data-testid={`dn-front-${f.code}`}>
                          <img src={f.image} alt={f.is} className="w-full h-full object-contain" loading="lazy" />
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-amber-900/30">
                              <Check className="w-4 h-4 text-white drop-shadow" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-semibold text-amber-900 mt-2 truncate">✓ {front.is}</p>
                </div>
                {/* BACK — dark "night" panel */}
                <div className="rounded-lg border-2 border-slate-700 bg-slate-900 p-2.5">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Moon className="w-3.5 h-3.5 text-slate-300" />
                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-100">Nótt — Bakhlið</p>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {backFabrics.map((f) => {
                      const selected = f.code === back.code;
                      return (
                        <button key={f.code} type="button" onClick={() => setBackCode(f.code)}
                          className={`relative aspect-square rounded-md overflow-hidden transition-all ${selected ? "ring-4 ring-amber-400 ring-offset-1 ring-offset-slate-900" : "ring-1 ring-slate-600 hover:ring-amber-300"}`}
                          aria-pressed={selected} title={`${f.is} · ${f.name} · ${f.code} — 100% myrkur`}
                          data-testid={`dn-back-${f.code}`}>
                          <img src={f.image} alt={f.is} className="w-full h-full object-contain brightness-75 contrast-110" loading="lazy" />
                          <div className="absolute inset-0 bg-slate-950/30 pointer-events-none" />
                          {selected && (
                            <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60">
                              <Check className="w-4 h-4 text-amber-300 drop-shadow" strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] font-semibold text-amber-300 mt-2 truncate">✓ {back.is}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Allir litir = 100% myrkur</p>
                </div>
              </div>
              {/* Both-selected confirmation strip */}
              <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground bg-secondary/40 rounded-md py-1.5 px-3">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                <span>Dagur: <strong className="text-foreground">{front.is}</strong></span>
                <span className="opacity-50">+</span>
                <span>Nótt: <strong className="text-foreground">{back.is}</strong></span>
              </div>
            </div>

            {/* STEP 3 — Size + qty */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">3</span>
                <Label className="text-sm font-semibold">Stærð og fjöldi (mm)</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="dn-width" className="text-[10px] text-muted-foreground">Breidd</Label>
                   <Input id="dn-width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} min={DAYNIGHT_45_LIMITS[operation].minWidthMm} max={DAYNIGHT_45_LIMITS[operation].maxWidthMm} step={10} className={!calc.widthOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="dn-height" className="text-[10px] text-muted-foreground">Hæð</Label>
                   <Input id="dn-height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} min={DAYNIGHT_45_LIMITS[operation].minHeightMm} max={DAYNIGHT_45_LIMITS[operation].maxHeightMm} step={10} className={!calc.heightOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="dn-qty" className="text-[10px] text-muted-foreground">Fjöldi</Label>
                  <Input id="dn-qty" type="number" value={quantity} onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))} min={1} max={99} step={1} />
                </div>
              </div>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-destructive mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                   Stærð er utan marka fyrir valda stýringu ({DAYNIGHT_45_LIMITS[operation].minWidthMm}–{DAYNIGHT_45_LIMITS[operation].maxWidthMm} × {DAYNIGHT_45_LIMITS[operation].minHeightMm}–{DAYNIGHT_45_LIMITS[operation].maxHeightMm} mm, hám. {DAYNIGHT_45_LIMITS[operation].maxAreaSqm} m²).
                </p>
              )}
            </div>

            {/* STEP 4 — Operation + side track */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Stjórnun</Label>
                <Select value={operation} onValueChange={(v) => handleOperationChange(v as Operation)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Handvirk með snæri</SelectItem>
                    <SelectItem value="cordless">Snærislaust (+{CORDLESS_ISK_PER_SQM.toLocaleString("is-IS")} kr/m²)</SelectItem>
                    <SelectItem value="motor">Mótor + fjarstýring (+{MOTOR_ISK.toLocaleString("is-IS")} kr)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2">
                <div>
                  <Label htmlFor="dn-sidetrack" className="text-xs font-semibold block">Hliðarspor</Label>
                  <p className="text-[10px] text-muted-foreground">+{SIDETRACK_ISK_PER_M.toLocaleString("is-IS")} kr/m</p>
                </div>
                <Switch id="dn-sidetrack" checked={sideTrack} onCheckedChange={setSideTrack} />
              </div>
              <div>
                <Label htmlFor="dn-track-type" className="text-xs font-semibold mb-1.5 block">Hliðarspor / Track</Label>
                <Select value={sideTrackType} onValueChange={(v) => setSideTrackType(v as "u" | "l")}>
                  <SelectTrigger id="dn-track-type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="u">U-spor (+10 USD/m)</SelectItem>
                    <SelectItem value="l">L-spor (+5 USD/m)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="dn-mount-position" className="text-xs font-semibold mb-1.5 block">Festing / Mount</Label>
                <Select value={mountPosition} onValueChange={(v) => setMountPosition(v as MountPosition)}>
                  <SelectTrigger id="dn-mount-position"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outside">Utanáliggjandi / Outside</SelectItem>
                    <SelectItem value="inside">Innfelld / Inside (−5 mm breidd)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-border/40 px-3 py-2 text-xs">
                <span>Án borunar / No-drill (+3 USD/m²)</span>
                <Switch checked={noDrill} onCheckedChange={setNoDrill} />
              </label>
            </div>

            {/* STEP 5 — Rail colour */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">5</span>
                <Label className="text-sm font-semibold">Litur á brautum <span className="text-muted-foreground font-normal text-xs">/ Rail colour</span></Label>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={operation === "motor" ? "motorized" : "cassette"}
                  className="grid grid-cols-5 gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {(operation === "motor" ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS).map((rc) => {
                    const selected = railColor === rc.value;
                    return (
                      <button key={rc.value} type="button" onClick={() => setRailColor(rc.value)}
                        className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                        aria-pressed={selected}>
                        <div className="w-full aspect-square rounded-md overflow-hidden">
                          <img src={rc.image} alt={rc.value} className="w-full h-full object-contain" loading="lazy" />
                        </div>
                        <span className="text-[10px] font-medium text-center leading-tight">{rc.value}</span>
                      </button>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
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
                <span className="font-medium">
                  {calc.rawArea.toFixed(2)} m²
                  {calc.billedArea > calc.rawArea && <span className="opacity-70"> (rukkað {calc.billedArea.toFixed(2)})</span>}
                </span>
              </div>
              <div className="flex justify-between"><span>Samsetning</span><span className="font-medium">{combo.is}</span></div>
              <div className="flex justify-between"><span>Framhlið</span><span className="font-medium">{front.is}</span></div>
              <div className="flex justify-between"><span>Bakhlið</span><span className="font-medium">{back.is}</span></div>
              <div className="flex justify-between"><span>Litur á brautum</span><span className="font-medium">{railColor}</span></div>
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20">
                <span>Efni · {combo.is}</span>
                <span>{fmtISK(calc.fabricUSD * USD_TO_ISK_RETAIL)}</span>
              </div>
              {calc.cordlessUSD > 0 && <div className="flex justify-between"><span>Snærislaust</span><span>{fmtISK(calc.cordlessUSD * USD_TO_ISK_COST)}</span></div>}
              {calc.motorUSD > 0 && <div className="flex justify-between"><span>Mótor + fjarstýring</span><span>{fmtISK((calc.motorUSD + calc.remoteUSD) * USD_TO_ISK_COST)}</span></div>}
              {calc.sidetrackUSD > 0 && <div className="flex justify-between"><span>Hliðarspor</span><span>{fmtISK(calc.sidetrackUSD * USD_TO_ISK_COST)}</span></div>}
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20"><span>Verð per stk</span><span className="font-medium">{fmtISK(calc.perPieceISK)}</span></div>
              {quantity > 1 && <div className="flex justify-between"><span>× {quantity} stk</span><span className="font-medium">{fmtISK(calc.totalISK)}</span></div>}
            </div>

            <div className="mt-auto pt-6 border-t border-primary-foreground/20">
              <p className="text-xs opacity-70 mb-1">Áætlað smásöluverð</p>
              <p className="font-serif text-4xl md:text-5xl font-bold leading-none">{fmtISK(calc.totalISK)}</p>

              <Button type="button" size="lg" variant="secondary" className="w-full mt-6 rounded-full"
                disabled={!calc.widthOK || !calc.heightOK || !calc.areaOK}
                onClick={() =>
                  addItem({
                    type: "daynight",
                    qty: quantity,
                    width,
                    height,
                    comboKey,
                    frontCode: front.code,
                    backCode: back.code,
                    frontName: `${front.is} (${front.name})`,
                    backName: `${back.is} (${back.name})`,
                    comboUsdPerSqm: dayNightSupplierRate(front.code, back.code) ?? combo.usdPerSqm,
                    operation,
                    sideTrack,
                    sideTrackType,
                    mountPosition,
                    noDrill,
                    railColor,
                  })
                }
                data-testid="add-daynight-to-cart"
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
      {/* MOBILE — sticky order bar (only while calculator section is in view) */}
      <div className="lg:hidden sticky bottom-0 left-0 right-0 z-40 bg-primary text-primary-foreground border-t border-primary-foreground/20 shadow-2xl">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3 max-w-6xl">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] opacity-70 leading-none mb-0.5">Áætlað verð</p>
              <p className="font-serif text-xl font-bold leading-tight truncate">{fmtISK(calc.totalISK)}</p>
              <p className="text-[10px] opacity-70 truncate">{combo.is} · {front.is} + {back.is}</p>
            </div>
            <Button type="button" variant="secondary" className="rounded-full shrink-0"
              disabled={!calc.widthOK || !calc.heightOK || !calc.areaOK}
              onClick={() =>
                addItem({
                  type: "daynight",
                  qty: quantity,
                  width,
                  height,
                  comboKey,
                  frontCode: front.code,
                  backCode: back.code,
                  frontName: `${front.is} (${front.name})`,
                  backName: `${back.is} (${back.name})`,
                  comboUsdPerSqm: dayNightSupplierRate(front.code, back.code) ?? combo.usdPerSqm,
                  operation,
                  sideTrack,
                  sideTrackType,
                  mountPosition,
                  noDrill,
                  railColor,
                })
              }
              data-testid="add-daynight-to-cart-mobile"
            >
              <ShoppingBag className="w-4 h-4 mr-1.5" />
              Í körfu
            </Button>
        </div>
      </div>
    </section>
  );
}
