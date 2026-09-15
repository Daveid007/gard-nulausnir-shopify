import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Check, Info, Layers, Moon, ShoppingBag, Sun, SunMedium } from "lucide-react";
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
import { useCart, HOLDER_USD } from "@/lib/cart";
import { FABRICS, type FabricInfo } from "@/lib/fabrics";
import { CASSETTE_RAIL_COLORS, MOTORIZED_RAIL_COLORS, HONEYCOMB_BOTTOM_RAIL_COLORS, HOLDER_COLORS, resolveRailColor } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
import { StorefrontLayout } from "./StorefrontLayout";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";

const USD_TO_ISK_RETAIL = 461;
// Aukahlutir (motor, hliðarspor o.fl.): frakt 20% í stað 100% → $1 × 1.2 × 124 × 1.5 × 1.24 ≈ 276
const USD_TO_ISK_ACCESSORY = 276;
const CORDLESS_USD_PER_SQM = 20;
const MOTOR_USD = 142.26;
const REMOTE_USD = 14;
const SIDETRACK_USD_PER_M = 20;
const MIN_SQM_PER_PIECE = 1;
const MAX_SQM_PER_PIECE = 5.6;

const CORDLESS_ISK_PER_SQM = Math.round(CORDLESS_USD_PER_SQM * USD_TO_ISK_ACCESSORY);
const MOTOR_ISK = Math.round((MOTOR_USD + REMOTE_USD) * USD_TO_ISK_ACCESSORY);
const SIDETRACK_ISK_PER_M = Math.round(SIDETRACK_USD_PER_M * USD_TO_ISK_ACCESSORY);

// 25mm size limits — tighter than 45mm, suited to smaller windows
const MIN_WIDTH = 400;
const MAX_WIDTH = 2000;
const MIN_HEIGHT = 300;
const MAX_HEIGHT = 2500;

type Operation = "manual" | "cordless" | "motor";
type FabricType = "sheer" | "translucent" | "blackout" | "dualdeck";

type StandardFabric = FabricInfo & { type: FabricType; usdPerSqm: number };

// Shared fabric catalog with 45mm — same USD/m² rates (cell geometry differs, not fabric)
const STANDARD_PRICING: Record<string, { type: FabricType; usdPerSqm: number }> = {
  KS401: { type: "sheer", usdPerSqm: 18.02 },
  KS402: { type: "sheer", usdPerSqm: 18.02 },
  KS404: { type: "sheer", usdPerSqm: 18.02 },
  KS406: { type: "sheer", usdPerSqm: 18.02 },
  KS407: { type: "sheer", usdPerSqm: 18.02 },
  KS408: { type: "sheer", usdPerSqm: 18.02 },
  KS414: { type: "sheer", usdPerSqm: 18.02 },
  KT401: { type: "translucent", usdPerSqm: 12.50 },
  KT402: { type: "translucent", usdPerSqm: 12.50 },
  KT403: { type: "translucent", usdPerSqm: 12.50 },
  KT404: { type: "translucent", usdPerSqm: 12.50 },
  KT405: { type: "translucent", usdPerSqm: 12.50 },
  KT406: { type: "translucent", usdPerSqm: 12.50 },
  KT407: { type: "translucent", usdPerSqm: 12.50 },
  KT408: { type: "translucent", usdPerSqm: 12.50 },
  KT409: { type: "translucent", usdPerSqm: 12.50 },
  KT410: { type: "translucent", usdPerSqm: 12.50 },
  KT411: { type: "translucent", usdPerSqm: 12.50 },
  KT412: { type: "translucent", usdPerSqm: 12.50 },
  KT413: { type: "translucent", usdPerSqm: 24.60 },
  KT414: { type: "translucent", usdPerSqm: 24.60 },
  KT415: { type: "translucent", usdPerSqm: 24.60 },
  KT428: { type: "translucent", usdPerSqm: 12.50 },
  KT431: { type: "translucent", usdPerSqm: 12.50 },
  KT432: { type: "translucent", usdPerSqm: 12.50 },
  KT433: { type: "translucent", usdPerSqm: 12.50 },
  KT434: { type: "translucent", usdPerSqm: 12.50 },
  KT435: { type: "translucent", usdPerSqm: 12.50 },
  KB401: { type: "blackout", usdPerSqm: 14.26 },
  KB402: { type: "blackout", usdPerSqm: 14.26 },
  KB403: { type: "blackout", usdPerSqm: 14.26 },
  KB404: { type: "blackout", usdPerSqm: 14.26 },
  KB405: { type: "blackout", usdPerSqm: 14.26 },
  KB406: { type: "blackout", usdPerSqm: 14.26 },
  KB420: { type: "blackout", usdPerSqm: 14.26 },
  KB422: { type: "blackout", usdPerSqm: 14.26 },
  KB426: { type: "blackout", usdPerSqm: 14.26 },
  KB428: { type: "blackout", usdPerSqm: 14.26 },
  KB431: { type: "blackout", usdPerSqm: 14.26 },
  KB432: { type: "blackout", usdPerSqm: 14.26 },
  KB433: { type: "blackout", usdPerSqm: 14.26 },
  KB434: { type: "blackout", usdPerSqm: 14.26 },
  KB435: { type: "blackout", usdPerSqm: 14.26 },
  KN405: { type: "dualdeck", usdPerSqm: 40.01 },
  KN406: { type: "dualdeck", usdPerSqm: 40.01 },
  KN407: { type: "dualdeck", usdPerSqm: 40.01 },
};

const STANDARD_FABRICS: StandardFabric[] = Object.keys(STANDARD_PRICING).map((code) => {
  const info = FABRICS[code];
  if (!info) throw new Error(`Fabric ${code} missing from shared FABRICS catalog`);
  return { ...info, ...STANDARD_PRICING[code] };
});

const TYPE_LABELS: Record<FabricType, { is: string; en: string }> = {
  sheer:       { is: "Gegnsætt / Sheer",             en: "Sheer" },
  translucent: { is: "Ljós síað / Light filtering",   en: "Translucent" },
  blackout:    { is: "Myrkvun / Blackout",           en: "Blackout" },
  dualdeck:    { is: "Tvöföld myrkvun / Dual",       en: "Dual-Deck Blackout" },
};

type TypeTheme = {
  Icon: typeof Sun;
  panelClass: string;
  headerTextClass: string;
  selectedRingClass: string;
  unselectedRingClass: string;
  selectedOverlayClass: string;
  checkColorClass: string;
  imgFilterClass: string;
  imgOverlayClass: string;
  blurb?: string;
};

const TYPE_THEME: Record<FabricType, TypeTheme> = {
  sheer: {
    Icon: Sun,
    panelClass: "border-amber-200 bg-amber-50/60",
    headerTextClass: "text-amber-900",
    selectedRingClass: "ring-amber-600 ring-offset-amber-50",
    unselectedRingClass: "ring-border hover:ring-amber-400",
    selectedOverlayClass: "bg-amber-900/30",
    checkColorClass: "text-white",
    imgFilterClass: "",
    imgOverlayClass: "",
  },
  translucent: {
    Icon: SunMedium,
    panelClass: "border-stone-300 bg-stone-100/70",
    headerTextClass: "text-stone-800",
    selectedRingClass: "ring-stone-600 ring-offset-stone-100",
    unselectedRingClass: "ring-border hover:ring-stone-400",
    selectedOverlayClass: "bg-stone-900/30",
    checkColorClass: "text-white",
    imgFilterClass: "",
    imgOverlayClass: "",
  },
  blackout: {
    Icon: Moon,
    panelClass: "border-slate-700 bg-slate-900",
    headerTextClass: "text-slate-100",
    selectedRingClass: "ring-amber-400 ring-offset-slate-900",
    unselectedRingClass: "ring-slate-600 hover:ring-amber-300",
    selectedOverlayClass: "bg-slate-950/60",
    checkColorClass: "text-amber-300",
    imgFilterClass: "brightness-75 contrast-110",
    imgOverlayClass: "bg-slate-950/30",
    blurb: "Allir litir = 100% myrkur",
  },
  dualdeck: {
    Icon: Layers,
    panelClass: "border-slate-800 bg-slate-950",
    headerTextClass: "text-slate-100",
    selectedRingClass: "ring-amber-400 ring-offset-slate-950",
    unselectedRingClass: "ring-slate-700 hover:ring-amber-300",
    selectedOverlayClass: "bg-black/70",
    checkColorClass: "text-amber-300",
    imgFilterClass: "brightness-75 contrast-110",
    imgOverlayClass: "bg-black/40",
    blurb: "Tvöfalt lag · þykkari einangrun",
  },
};

function fmtISK(v: number) {
  return v.toLocaleString("is-IS", { maximumFractionDigits: 0 }) + " kr";
}

export default function Honeycomb25Calculator({ product }: { product?: any }) {
  const [width, setWidth] = useState<number>(900);
  const [height, setHeight] = useState<number>(1200);
  const [quantity, setQuantity] = useState<number>(1);
  const [fabricCode, setFabricCode] = useState<string>("KT401");
  const [fabricType, setFabricType] = useState<FabricType>("translucent");
  const [operation, setOperation] = useState<Operation>("manual");
  const [sideTrack, setSideTrack] = useState<boolean>(false);
  const [railColor, setRailColor] = useState<string>("Hvítur");
  const [lastCassetteColor, setLastCassetteColor] = useState<string>("Hvítur");
  const [bottomRailColor, setBottomRailColor] = useState<string>("Hvítur");
  const [holder, setHolder] = useState<"white" | "navy" | "black" | null>(null);
  const { addItem } = useCart();

  function handleOperationChange(next: Operation) {
    const wasMotor = operation === "motor";
    const willBeMotor = next === "motor";
    if (!wasMotor && willBeMotor) {
      setLastCassetteColor(railColor);
      setRailColor(resolveRailColor(railColor, MOTORIZED_RAIL_COLORS));
    } else if (wasMotor && !willBeMotor) {
      setRailColor(resolveRailColor(lastCassetteColor, CASSETTE_RAIL_COLORS));
    } else {
      setRailColor(resolveRailColor(railColor, willBeMotor ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS));
    }
    setOperation(next);
  }

  const grouped = useMemo(() => {
    const groups: Record<FabricType, StandardFabric[]> = { sheer: [], translucent: [], blackout: [], dualdeck: [] };
    for (const f of STANDARD_FABRICS) groups[f.type].push(f);
    return groups;
  }, []);

  const fabric = useMemo(
    () => grouped[fabricType].find((f) => f.code === fabricCode) ?? grouped[fabricType][0] ?? STANDARD_FABRICS[0],
    [fabricCode, fabricType, grouped],
  );

  useEffect(() => {
    if (!grouped[fabricType].some((f) => f.code === fabricCode)) {
      setFabricCode(grouped[fabricType][0]?.code ?? STANDARD_FABRICS[0].code);
    }
  }, [fabricCode, fabricType, grouped]);

  const calc = useMemo(() => {
    const w = Math.max(0.3, width / 1000);
    const h = Math.max(0.3, height / 1000);
    const rawArea = w * h;
    const billedArea = Math.max(MIN_SQM_PER_PIECE, rawArea);

    const fabricUSD = billedArea * fabric.usdPerSqm;
    const cordlessUSD = operation === "cordless" ? billedArea * CORDLESS_USD_PER_SQM : 0;
    const motorUSD = operation === "motor" ? MOTOR_USD : 0;
    const remoteUSD = operation === "motor" ? REMOTE_USD : 0;
    const sidetrackUSD = sideTrack ? w * SIDETRACK_USD_PER_M : 0;
    const holderUSD = holder ? HOLDER_USD : 0;

    const perPieceUSD = fabricUSD + cordlessUSD + motorUSD + remoteUSD + sidetrackUSD + holderUSD;
    const totalUSD = perPieceUSD * quantity;
    const accessoriesUSD = cordlessUSD + motorUSD + remoteUSD + sidetrackUSD + holderUSD;
    const perPieceISK = fabricUSD * USD_TO_ISK_RETAIL + accessoriesUSD * USD_TO_ISK_ACCESSORY;
    const totalISK = perPieceISK * quantity;

    const widthOK = width >= MIN_WIDTH && width <= MAX_WIDTH;
    const heightOK = height >= MIN_HEIGHT && height <= MAX_HEIGHT;
    const areaOK = rawArea <= MAX_SQM_PER_PIECE;

    return {
      rawArea, billedArea, perPieceUSD, totalUSD, totalISK,
      perPieceISK,
      fabricUSD, cordlessUSD, motorUSD, remoteUSD, sidetrackUSD, holderUSD,
      widthOK, heightOK, areaOK, w, h,
    };
  }, [width, height, quantity, operation, sideTrack, fabric, holder]);

  const validSize = calc.widthOK && calc.heightOK && calc.areaOK;
  const addToCart = () => addItem({
    type: "honeycomb-25",
    qty: normalizeQuantity(quantity),
    width,
    height,
    fabricCode: fabric.code,
    fabricName: `${fabric.is} (${fabric.name})`,
    fabricType: fabric.type,
    fabricUsdPerSqm: fabric.usdPerSqm,
    operation,
    sideTrack,
    railColor,
    bottomRail: bottomRailColor,
    holder,
  });

  return (
    <StorefrontLayout
      product={product}
      priceISK={calc.totalISK}
      activeFabric={{ name: `${fabric.is} — ${fabric.name}`, image: fabric.image }}
      quantity={quantity}
      setQuantity={(next) => setQuantity(normalizeQuantity(next))}
      canAddToCart={validSize}
      onAddToCart={addToCart}
      controls={
        <div className="space-y-5 border-b border-[#ccd9df] py-6">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[10px] uppercase tracking-[.18em]">Mál</span>
            <MeasurementGuideTrigger />
          </div>
          <div className="grid grid-cols-2 gap-3" data-testid="dimensions">
            <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input data-testid="hc25-width" aria-label="Breidd í sentímetrum" type="number" min={MIN_WIDTH / 10} max={MAX_WIDTH / 10} step="0.1" value={width / 10} onChange={(e) => setWidth((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
            <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input data-testid="hc25-height" aria-label="Hæð í sentímetrum" type="number" min={MIN_HEIGHT / 10} max={MAX_HEIGHT / 10} step="0.1" value={height / 10} onChange={(e) => setHeight((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
          </div>
          {!validSize && <p className="text-xs text-red-600">Stærð er utan framleiðslumarka (40–200 × 30–250 cm, hámark 5,6 m²).</p>}
           <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Stýring</span><div className="grid grid-cols-3 gap-2">{(["manual", "cordless", "motor"] as Operation[]).map((item) => <button type="button" key={item} onClick={() => handleOperationChange(item)} aria-pressed={operation === item} aria-label={`Velja ${item === "manual" ? "handvirka" : item === "cordless" ? "þráðlausa" : "mótor"} stýringu`} className={`border px-2 py-3 text-[10px] uppercase ${operation === item ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item === "manual" ? "Handvirk" : item === "cordless" ? "Þráðlaus" : "Mótor"}</button>)}</div></div>
          <div>
            <span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Ljós og efni</span>
            <div className="mb-3 grid grid-cols-2 gap-2" data-testid="honeycomb25-fabric-types">
              {(["sheer", "translucent", "blackout", "dualdeck"] as FabricType[]).map((type) => (
                <button type="button" key={type} onClick={() => setFabricType(type)} aria-pressed={fabricType === type} data-testid={`honeycomb25-fabric-type-${type}`} className={`border px-2 py-2 text-[10px] uppercase tracking-[.06em] ${fabricType === type ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                  {TYPE_LABELS[type].is}
                </button>
              ))}
            </div>
            <div data-testid="honeycomb25-fabrics" className="flex flex-wrap gap-2">
              {grouped[fabricType].map((item) => (
                <button type="button" key={item.code} onClick={() => setFabricCode(item.code)} className={`relative h-11 w-11 overflow-hidden rounded-full border ${fabric.code === item.code ? "border-[#24313b]" : "border-transparent"}`} aria-label={`Velja ${item.is} · ${item.name} (${item.code})`} aria-pressed={fabric.code === item.code}>
                  <img src={item.image} alt={item.is} className="h-full w-full object-contain" />
                  {fabric.code === item.code && <Check size={13} className="absolute inset-0 m-auto" />}
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase"><span>Hliðarspor</span><input type="checkbox" checked={sideTrack} onChange={(e) => setSideTrack(e.target.checked)} /></label>
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Litur á botnlistum</span><div className="flex flex-wrap gap-2">{HONEYCOMB_BOTTOM_RAIL_COLORS.map((item) => <button type="button" key={item.value} onClick={() => setBottomRailColor(item.value)} className={`border px-3 py-2 text-[10px] ${bottomRailColor === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.value}</button>)}</div></div>
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Finish · litur á braut</span><div className="flex flex-wrap gap-2">{(operation === "motor" ? MOTORIZED_RAIL_COLORS : CASSETTE_RAIL_COLORS).map((item) => <button type="button" key={item.value} onClick={() => setRailColor(item.value)} aria-pressed={railColor === item.value} aria-label={`Velja finish lit ${item.value}`} className={`border px-3 py-2 text-[10px] ${railColor === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.value}</button>)}</div></div>
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Lásahaldari</span><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setHolder(null)} className={`border px-3 py-2 text-[10px] ${holder === null ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>Enginn</button>{HOLDER_COLORS.map((item) => <button type="button" key={item.value} onClick={() => setHolder(item.value)} className={`border px-3 py-2 text-[10px] ${holder === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.is}</button>)}</div></div>
        </div>
      }
    />
  );

  return (
    <section id="honeycomb-25-calculator" className="py-16 md:py-24 bg-secondary/10 border-t border-border/30 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" as const }}
          className="text-center mb-6 md:mb-10 max-w-2xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-2">Verðreikningur · Pricing</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-2">Reiknivél — Hunangskamb 25 mm</h2>
          <p className="text-sm md:text-base text-muted-foreground">Þéttara grid — hentugur fyrir minni glugga og innrými · Veldu efni, stærð og stjórnun</p>
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
            {/* STEP 1 — Fabric, grouped by category */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">1</span>
                <Label className="text-sm font-semibold">Veldu efnistegund og lit</Label>
              </div>
              <div className="space-y-3">
                {(["sheer", "translucent", "blackout", "dualdeck"] as FabricType[]).map((t) => {
                  const theme = TYPE_THEME[t];
                  const Icon = theme.Icon;
                  return (
                    <div key={t} className={`rounded-lg border-2 p-2.5 ${theme.panelClass}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon className={`w-3.5 h-3.5 ${theme.headerTextClass}`} />
                        <p className={`text-[11px] font-bold uppercase tracking-wide ${theme.headerTextClass}`}>
                          {TYPE_LABELS[t].is}
                        </p>
                        <span className={`text-[10px] ml-auto opacity-75 ${theme.headerTextClass}`}>
                          {fmtISK((grouped[t][0]?.usdPerSqm ?? 0) * USD_TO_ISK_RETAIL)}/m²
                        </span>
                      </div>
                      <div className="grid grid-cols-6 gap-1.5">
                        {grouped[t].map((f) => {
                          const selected = f.code === fabricCode;
                          return (
                            <button key={f.code} type="button" onClick={() => setFabricCode(f.code)}
                              className={`relative aspect-square rounded-md overflow-hidden transition-all ${
                                selected ? `ring-4 ${theme.selectedRingClass} ring-offset-1` : `ring-1 ${theme.unselectedRingClass}`
                              }`}
                              aria-pressed={selected}
                              title={`${f.is} · ${f.name} · ${f.code}`}
                              data-testid={`hc25-fabric-${f.code}`}
                            >
                              <img src={f.image} alt={f.is} className={`w-full h-full object-contain ${theme.imgFilterClass}`} loading="lazy" />
                              {theme.imgOverlayClass && (
                                <div className={`absolute inset-0 pointer-events-none ${theme.imgOverlayClass}`} />
                              )}
                              {selected && (
                                <div className={`absolute inset-0 flex items-center justify-center ${theme.selectedOverlayClass}`}>
                                  <Check className={`w-4 h-4 ${theme.checkColorClass} drop-shadow`} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                      {theme.blurb && (
                        <p className={`text-[9px] mt-1.5 opacity-70 ${theme.headerTextClass}`}>{theme.blurb}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-muted-foreground bg-secondary/40 rounded-md py-1.5 px-3">
                <Check className="w-3 h-3 text-primary" strokeWidth={3} />
                <span>Valið: <strong className="text-foreground">{fabric.is}</strong> · {TYPE_LABELS[fabric.type].is} · {fmtISK(fabric.usdPerSqm * USD_TO_ISK_RETAIL)}/m²</span>
              </div>
            </div>

            {/* STEP 2 — Size + qty */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">2</span>
                <Label className="text-sm font-semibold">Stærð og fjöldi (mm)</Label>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="hc25-width" className="text-[10px] text-muted-foreground">Breidd</Label>
                  <Input id="hc25-width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} min={MIN_WIDTH} max={MAX_WIDTH} step={10} className={!calc.widthOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="hc25-height" className="text-[10px] text-muted-foreground">Hæð</Label>
                  <Input id="hc25-height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} min={MIN_HEIGHT} max={MAX_HEIGHT} step={10} className={!calc.heightOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="hc25-qty" className="text-[10px] text-muted-foreground">Fjöldi</Label>
                  <Input id="hc25-qty" type="number" value={quantity} onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))} min={1} max={99} step={1} />
                </div>
              </div>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-destructive mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Stærð er utan marka ({MIN_WIDTH}–{MAX_WIDTH} × {MIN_HEIGHT}–{MAX_HEIGHT} mm, hám. {MAX_SQM_PER_PIECE} m²).
                </p>
              )}
            </div>

            {/* STEP 3 — Operation + side track */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold mb-1.5 block">Stjórnun</Label>
                <Select value={operation} onValueChange={(v) => setOperation(v as Operation)}>
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
                  <Label htmlFor="hc25-sidetrack" className="text-xs font-semibold block">Hliðarspor</Label>
                  <p className="text-[10px] text-muted-foreground">+{SIDETRACK_ISK_PER_M.toLocaleString("is-IS")} kr/m</p>
                </div>
                <Switch id="hc25-sidetrack" checked={sideTrack} onCheckedChange={setSideTrack} />
              </div>
            </div>

            {/* STEP 4 — Head rail colour */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">4</span>
                <Label className="text-sm font-semibold">Litur á efri braut <span className="text-muted-foreground font-normal text-xs">/ Head rail colour</span></Label>
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

            {/* STEP 5 — Bottom rail colour */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">5</span>
                <Label className="text-sm font-semibold">Litur á botnstöng <span className="text-muted-foreground font-normal text-xs">/ Bottom rail colour</span></Label>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {HONEYCOMB_BOTTOM_RAIL_COLORS.map((rc) => {
                  const selected = bottomRailColor === rc.value;
                  return (
                    <button key={rc.value} type="button" onClick={() => setBottomRailColor(rc.value)}
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                      aria-pressed={selected}>
                      <div className="w-full aspect-square rounded-md overflow-hidden">
                        <img src={rc.image} alt={rc.value} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">{rc.value}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* STEP 6 — Pull holder */}
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[11px] font-bold">6</span>
                <Label className="text-sm font-semibold">Lásahaldari <span className="text-muted-foreground font-normal text-xs">/ Pull holder (+{fmtISK(HOLDER_USD * USD_TO_ISK_ACCESSORY)} stk)</span></Label>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button type="button" onClick={() => setHolder(null)}
                  className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${holder === null ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                  aria-pressed={holder === null}>
                  <div className="w-full aspect-square rounded-md overflow-hidden bg-secondary/40 flex items-center justify-center">
                    <span className="text-lg text-muted-foreground font-light">–</span>
                  </div>
                  <span className="text-[10px] font-medium text-center leading-tight">Enginn</span>
                </button>
                {HOLDER_COLORS.map((hc) => {
                  const selected = holder === hc.value;
                  return (
                    <button key={hc.value} type="button" onClick={() => setHolder(hc.value)}
                      className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                      aria-pressed={selected}>
                      <div className="w-full aspect-square rounded-md overflow-hidden">
                        <img src={hc.image} alt={hc.en} className="w-full h-full object-contain" loading="lazy" />
                      </div>
                      <span className="text-[10px] font-medium text-center leading-tight">{hc.is}</span>
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
                <span className="font-medium">
                  {calc.rawArea.toFixed(2)} m²
                  {calc.billedArea > calc.rawArea && <span className="opacity-70"> (rukkað {calc.billedArea.toFixed(2)})</span>}
                </span>
              </div>
              <div className="flex justify-between"><span>Efni</span><span className="font-medium">{fabric.is}</span></div>
              <div className="flex justify-between"><span>Litur á efri braut</span><span className="font-medium">{railColor}</span></div>
              <div className="flex justify-between"><span>Litur á botnstöng</span><span className="font-medium">{bottomRailColor}</span></div>
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20">
                <span>Efni · {TYPE_LABELS[fabric.type].is}</span>
                <span>{fmtISK(calc.fabricUSD * USD_TO_ISK_RETAIL)}</span>
              </div>
              {calc.cordlessUSD > 0 && <div className="flex justify-between"><span>Snærislaust</span><span>{fmtISK(calc.cordlessUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
              {calc.motorUSD > 0 && <div className="flex justify-between"><span>Mótor + fjarstýring</span><span>{fmtISK((calc.motorUSD + calc.remoteUSD) * USD_TO_ISK_ACCESSORY)}</span></div>}
              {calc.sidetrackUSD > 0 && <div className="flex justify-between"><span>Hliðarspor</span><span>{fmtISK(calc.sidetrackUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
              {calc.holderUSD > 0 && <div className="flex justify-between"><span>Lásahaldari</span><span>{fmtISK(calc.holderUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
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
                    type: "honeycomb-25",
                    qty: quantity,
                    width,
                    height,
                    fabricCode: fabric.code,
                    fabricName: `${fabric.is} (${fabric.name})`,
                    fabricType: fabric.type,
                    fabricUsdPerSqm: fabric.usdPerSqm,
                    operation,
                    sideTrack,
                    railColor,
                    bottomRail: bottomRailColor,
                    holder,
                  })
                }
                data-testid="add-honeycomb25-to-cart"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Setja í körfu · Add to cart
              </Button>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-primary-foreground/60 mt-2 text-center">Leiðréttu stærð til að geta bætt í körfu</p>
              )}
            </div>
          </div>

          {/* RESULT — mobile sticky bar */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-2xl">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] opacity-70 leading-none mb-0.5">Áætlað verð · {fabric.is}</p>
              <p className="font-serif text-xl font-bold leading-none">{fmtISK(calc.totalISK)}</p>
            </div>
            <Button type="button" size="sm" variant="secondary" className="rounded-full shrink-0"
              disabled={!calc.widthOK || !calc.heightOK || !calc.areaOK}
              onClick={() =>
                addItem({
                  type: "honeycomb-25",
                  qty: quantity,
                  width,
                  height,
                  fabricCode: fabric.code,
                  fabricName: `${fabric.is} (${fabric.name})`,
                  fabricType: fabric.type,
                  fabricUsdPerSqm: fabric.usdPerSqm,
                  operation,
                  sideTrack,
                  railColor,
                  bottomRail: bottomRailColor,
                  holder,
                })
              }
              data-testid="add-honeycomb25-to-cart-mobile"
            >
              <ShoppingBag className="w-3.5 h-3.5 mr-1.5" />
              Bæta í körfu
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
