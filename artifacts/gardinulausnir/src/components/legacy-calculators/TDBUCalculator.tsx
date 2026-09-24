import { useEffect, useMemo, useState } from "react";
import { useRailColor } from "@/lib/railColor";
import { AnimatePresence, motion } from "framer-motion";
import { Calculator, Info, ShoppingBag } from "lucide-react";
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
import { FABRICS, type FabricInfo } from "@/lib/fabrics";
import { CASSETTE_RAIL_COLORS } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";
import { StorefrontLayout } from "./StorefrontLayout";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";
import { retailPriceFromSupplierUsd, SUPPLIER_TO_RETAIL_ISK, TDBU_45_LIMITS, validateHoneycombSize, type MountPosition } from "@/lib/pricing";
import { HoneycombOptions } from "./HoneycombOptions";

const USD_TO_ISK_RETAIL = SUPPLIER_TO_RETAIL_ISK;
const USD_TO_ISK_ACCESSORY = SUPPLIER_TO_RETAIL_ISK;
const SIDETRACK_USD_PER_M = 10;
const MIN_SQM_PER_PIECE = 1;


type Operation = "manual" | "cordless";
type FabricType = "translucent" | "blackout";

type TdbuFabric = FabricInfo & { type: FabricType; usdPerSqm: number };

// Raw supplier USD/m² from the distinct workbook TDBU sheet.
const TDBU_PRICING: Record<string, { type: FabricType; usdPerSqm: number }> = {
  KT401: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT402: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT403: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT404: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT405: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT406: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT407: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT408: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT409: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT410: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT411: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT412: { type: "translucent", usdPerSqm: 16.0010700873129 },
  KT413: { type: "translucent", usdPerSqm: 28.6931231792052 },
  KT414: { type: "translucent", usdPerSqm: 28.6931231792052 },
  KT415: { type: "translucent", usdPerSqm: 28.6931231792052 },
  KB401: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB402: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB403: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB404: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB405: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB406: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB420: { type: "blackout",    usdPerSqm: 28.26 },
  KB422: { type: "blackout",    usdPerSqm: 28.26 },
  KB426: { type: "blackout",    usdPerSqm: 28.26 },
  KB428: { type: "blackout",    usdPerSqm: 28.26 },
  KB431: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB432: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB433: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB434: { type: "blackout",    usdPerSqm: 18.3514502895152 },
  KB435: { type: "blackout",    usdPerSqm: 18.3514502895152 },
};

const TDBU_FABRICS: TdbuFabric[] = Object.keys(TDBU_PRICING).map((code) => {
  const info = FABRICS[code];
  if (!info) throw new Error(`Fabric ${code} missing from shared FABRICS catalog`);
  return { ...info, ...TDBU_PRICING[code] };
});

const TYPE_LABELS: Record<FabricType, { is: string; en: string }> = {
  translucent: { is: "Ljós síað / Light filtering", en: "Translucent" },
  blackout:    { is: "Myrkvun / Blackout",          en: "Blackout" },
};

function fmtISK(v: number) {
  return v.toLocaleString("is-IS", { maximumFractionDigits: 0 }) + " kr.";
}


export default function TDBUCalculator({ product }: { product?: any }) {
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1500);
  const [quantity, setQuantity] = useState<number>(1);
  const [fabricCode, setFabricCode] = useState<string>("KT401");
  const [fabricType, setFabricType] = useState<FabricType>("translucent");
  const [operation, setOperation] = useState<Operation>("manual");
  const [sideTrack, setSideTrack] = useState<boolean>(false);
  const [sideTrackType, setSideTrackType] = useState<"u" | "l">("u");
  const [mountPosition, setMountPosition] = useState<MountPosition>("outside");
  const [noDrill, setNoDrill] = useState<boolean>(false);
  const { railColor, setRailColor } = useRailColor();
  const { addItem } = useCart();

  function handleOperationChange(next: Operation) {
    setOperation(next);
  }

  const grouped = useMemo(() => {
    const groups: Record<FabricType, TdbuFabric[]> = { translucent: [], blackout: [] };
    for (const f of TDBU_FABRICS) groups[f.type].push(f);
    return groups;
  }, []);

  const fabric = useMemo(
    () => grouped[fabricType].find((f) => f.code === fabricCode) ?? grouped[fabricType][0] ?? TDBU_FABRICS[0],
    [fabricCode, fabricType, grouped],
  );

  useEffect(() => {
    if (!grouped[fabricType].some((f) => f.code === fabricCode)) {
      setFabricCode(grouped[fabricType][0]?.code ?? TDBU_FABRICS[0].code);
    }
  }, [fabricCode, fabricType, grouped]);

  const calc = useMemo(() => {
    const w = Math.max(0.3, (mountPosition === "inside" ? width - 5 : width) / 1000);
    const h = Math.max(0.3, height / 1000);
    const rawArea = w * h;
    const billedArea = Math.max(MIN_SQM_PER_PIECE, rawArea);

    const fabricUSD = billedArea * fabric.usdPerSqm;
    const cordlessUSD = operation === "cordless" ? billedArea * 3 : 0;
    const noDrillUSD = noDrill ? billedArea * 3 : 0;
    const sidetrackUSD = sideTrack ? h * (sideTrackType === "l" ? 5 : SIDETRACK_USD_PER_M) : 0;

    const perPieceUSD = fabricUSD + cordlessUSD + noDrillUSD + sidetrackUSD;
    const totalUSD = perPieceUSD * quantity;
    const perPieceISK = retailPriceFromSupplierUsd(perPieceUSD);
    const totalISK = perPieceISK * quantity;

    const size = validateHoneycombSize({
      product: "tdbu",
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

    return {
      rawArea, billedArea, perPieceUSD, totalUSD, totalISK, perPieceISK,
      fabricUSD, cordlessUSD, noDrillUSD, sidetrackUSD,
      widthOK, heightOK, areaOK, w, h,
    };
  }, [width, height, quantity, operation, sideTrack, sideTrackType, mountPosition, noDrill, fabric]);

  const validSize = calc.widthOK && calc.heightOK && calc.areaOK;
  const addToCart = () => addItem({
    type: "tdbu",
    qty: normalizeQuantity(quantity),
    width,
    height,
    fabricCode: fabric.code,
    fabricName: `${fabric.is} (${fabric.name})`,
    fabricType: fabric.type,
    fabricUsdPerSqm: fabric.usdPerSqm,
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
             <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input data-testid="tdbu-width" aria-label="Breidd í sentímetrum" type="number" min="50" max="275" step="0.1" value={width / 10} onChange={(e) => setWidth((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
             <label><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input data-testid="tdbu-height" aria-label="Hæð í sentímetrum" type="number" min="50" max="300" step="0.1" value={height / 10} onChange={(e) => setHeight((Number(e.target.value) || 0) * 10)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm" /></label>
          </div>
           {!validSize && <p className="text-xs text-red-600">Stærð er utan marka fyrir valda stýringu ({TDBU_45_LIMITS[operation].minWidthMm}–{TDBU_45_LIMITS[operation].maxWidthMm} × {TDBU_45_LIMITS[operation].minHeightMm}–{TDBU_45_LIMITS[operation].maxHeightMm} mm, hám. {TDBU_45_LIMITS[operation].maxAreaSqm} m²).</p>}
          <div>
            <span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Efni</span>
            <div className="mb-3 grid grid-cols-2 gap-2" data-testid="tdbu-fabric-types">
              {(["translucent", "blackout"] as FabricType[]).map((type) => (
                <button type="button" key={type} onClick={() => setFabricType(type)} aria-pressed={fabricType === type} data-testid={`tdbu-fabric-type-${type}`} className={`border px-2 py-2 text-[10px] uppercase tracking-[.06em] ${fabricType === type ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                  {TYPE_LABELS[type].is}
                </button>
              ))}
            </div>
            <div data-testid="tdbu-fabrics" className="flex flex-wrap gap-2">
              {grouped[fabricType].map((item) => (
                <button type="button" key={item.code} onClick={() => setFabricCode(item.code)} className={`relative h-11 w-11 overflow-hidden rounded-full border ${fabric.code === item.code ? "border-[#24313b]" : "border-transparent"}`} aria-label={`Velja ${item.is} · ${item.name} (${item.code})`} aria-pressed={fabric.code === item.code}>
                  <img src={item.image} alt={item.is} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </div>
           <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Stýring</span><div className="grid grid-cols-2 gap-2">{(["manual", "cordless"] as Operation[]).map((item) => <button type="button" key={item} onClick={() => handleOperationChange(item)} className={`border px-2 py-3 text-[10px] uppercase ${operation === item ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item === "manual" ? "Handvirk" : "Þráðlaus"}</button>)}</div></div>
          <label className="flex items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px] uppercase"><span>Hliðarlisti</span><input type="checkbox" checked={sideTrack} onChange={(e) => setSideTrack(e.target.checked)} /></label>
           <HoneycombOptions idPrefix="tdbu" sideTrack={sideTrack} sideTrackType={sideTrackType} setSideTrackType={setSideTrackType} mountPosition={mountPosition} setMountPosition={setMountPosition} noDrill={noDrill} setNoDrill={setNoDrill} />
          <div><span className="mb-2 block text-[10px] uppercase tracking-[.18em]">Finish · litur á brautum</span><div className="flex flex-wrap gap-2">{CASSETTE_RAIL_COLORS.map((item) => <button type="button" key={item.value} onClick={() => setRailColor(item.value)} className={`border px-3 py-2 text-[10px] ${railColor === item.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item.value}</button>)}</div></div>
        </div>
      }
    />
  );

  return (
    <section id="tdbu-calculator" className="py-32 bg-white border-t border-border/30">
      <div className="container mx-auto px-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" as const }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary/70 font-semibold mb-3">Verðreikningur · Pricing</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-2">Reiknivél — TDBU 45 mm</h2>
           <p className="text-lg text-muted-foreground">Top-Down / Bottom-Up myrkvunargardína</p>
          <p className="text-sm text-foreground/70 mt-3">
            Tvær brautir — lækkaðu að ofan eða lyftu að neðan. Persónuvernd án þess að loka fyrir ljósið að ofan.
          </p>
          <p className="text-xs text-muted-foreground/80 mt-1">
            Two rails — lower from the top or raise from the bottom. Privacy without losing daylight up top.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" as const }}
          className="bg-secondary/20 rounded-2xl border border-border/40 overflow-hidden grid grid-cols-1 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* CONFIG */}
          <div className="p-6 md:p-10 space-y-8">
            <div>
              <Label className="text-sm font-semibold mb-3 block">Stærð / Dimensions (mm)</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="tdbu-width" className="text-xs text-muted-foreground">Breidd / Width</Label>
                  <Input id="tdbu-width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} min={TDBU_45_LIMITS[operation].minWidthMm} max={TDBU_45_LIMITS[operation].maxWidthMm} step={10} className={!calc.widthOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="tdbu-height" className="text-xs text-muted-foreground">Hæð / Height</Label>
                  <Input id="tdbu-height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} min={TDBU_45_LIMITS[operation].minHeightMm} max={TDBU_45_LIMITS[operation].maxHeightMm} step={10} className={!calc.heightOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="tdbu-qty" className="text-xs text-muted-foreground">Fjöldi / Qty</Label>
                  <Input id="tdbu-qty" type="number" value={quantity} onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))} min={1} max={99} step={1} />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                 <span>Breidd: {TDBU_45_LIMITS[operation].minWidthMm}–{TDBU_45_LIMITS[operation].maxWidthMm} mm</span>
                 <span>Hæð: {TDBU_45_LIMITS[operation].minHeightMm}–{TDBU_45_LIMITS[operation].maxHeightMm} mm</span>
                 <span>Hámark: {TDBU_45_LIMITS[operation].maxAreaSqm} m² á stk</span>
                <span>45 mm sella · tvær brautir</span>
              </div>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-destructive mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                   Stærð er utan marka fyrir valda stýringu ({TDBU_45_LIMITS[operation].minWidthMm}–{TDBU_45_LIMITS[operation].maxWidthMm} × {TDBU_45_LIMITS[operation].minHeightMm}–{TDBU_45_LIMITS[operation].maxHeightMm} mm, hám. {TDBU_45_LIMITS[operation].maxAreaSqm} m²).
                </p>
              )}
            </div>

            <div>
              <Label className="text-sm font-semibold mb-3 block">Efni / Fabric</Label>
              <div className="space-y-5">
                {(["translucent", "blackout"] as FabricType[]).map((t) => (
                  <div key={t}>
                    <div className="flex items-baseline justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                        {TYPE_LABELS[t].is}
                        <span className="ml-1.5 text-muted-foreground font-normal normal-case tracking-normal">/ {TYPE_LABELS[t].en}</span>
                      </p>
                      <p className="text-[11px] text-muted-foreground">frá {fmtISK((grouped[t][0]?.usdPerSqm ?? 0) * USD_TO_ISK_RETAIL)}/m²</p>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {grouped[t].map((f) => {
                        const selected = f.code === fabricCode;
                        return (
                          <button key={f.code} type="button" onClick={() => setFabricCode(f.code)}
                            className={`group flex flex-col items-center p-1.5 rounded-lg border transition-all ${selected ? "border-primary ring-2 ring-primary/30 bg-primary/5" : "border-border/50 hover:border-primary/40 bg-background"}`}
                            aria-pressed={selected} title={`${f.is} · ${f.name} · ${f.code} · $${f.usdPerSqm}/m²`}>
                            <div className="w-full aspect-square rounded-md overflow-hidden border border-border/60 shadow-sm bg-muted">
                              <img src={f.image} alt={`${f.is} (${f.name})`} className="w-full h-full object-contain" loading="lazy" />
                            </div>
                            <span className="text-[10px] font-semibold mt-1 leading-tight text-center truncate w-full">{f.is}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Valið: <span className="font-medium text-foreground">{fabric.is}</span> · {fabric.name} · kóði {fabric.code} · {fmtISK(fabric.usdPerSqm * USD_TO_ISK_RETAIL)}/m²
              </p>
            </div>

            <div>
              <Label className="text-sm font-semibold mb-3 block">Stjórnun / Operation</Label>
              <Select value={operation} onValueChange={(v) => handleOperationChange(v as Operation)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Handvirk með snæri / Manual cord</SelectItem>
                   <SelectItem value="cordless">Þráðlaus / Cordless (+{Math.round(3 * USD_TO_ISK_ACCESSORY).toLocaleString("is-IS")} kr./m²)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                 TDBU notar tvær brautir — mótor er aðeins í boði fyrir 38 mm kerfi.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div>
                <Label htmlFor="tdbu-sidetrack" className="text-sm font-semibold block">Hliðarlisti / Side track</Label>
                <p className="text-xs text-muted-foreground">Lokar fyrir ljósleka frá hliðum. +{Math.round((sideTrackType === "l" ? 5 : SIDETRACK_USD_PER_M) * USD_TO_ISK_ACCESSORY).toLocaleString("is-IS")} kr./m</p>
              </div>
              <Switch id="tdbu-sidetrack" checked={sideTrack} onCheckedChange={setSideTrack} />
            </div>
            <div>
              <Label htmlFor="tdbu-track-type" className="text-sm font-semibold mb-1.5 block">Gerð hliðarlista / Track</Label>
              <Select value={sideTrackType} onValueChange={(v) => setSideTrackType(v as "u" | "l")}>
                <SelectTrigger id="tdbu-track-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="u">U-spor</SelectItem>
                  <SelectItem value="l">L-spor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tdbu-mount-position" className="text-sm font-semibold mb-1.5 block">Festing / Mount</Label>
              <Select value={mountPosition} onValueChange={(v) => setMountPosition(v as MountPosition)}>
                <SelectTrigger id="tdbu-mount-position"><SelectValue /></SelectTrigger>
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

            <div>
              <Label className="text-sm font-semibold mb-2 block">Litur á brautum <span className="text-muted-foreground font-normal text-xs">/ Rail colour</span></Label>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                   key="cassette"
                  className="grid grid-cols-5 gap-1.5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                   {CASSETTE_RAIL_COLORS.map((rc) => {
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

          {/* RESULT */}
          <div className="bg-primary text-primary-foreground p-6 md:p-10 flex flex-col">
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
              <div className="flex justify-between"><span>Litur á brautum</span><span className="font-medium">{railColor}</span></div>
              <div className="flex justify-between pt-3 border-t border-primary-foreground/20">
                <span>Efni · {TYPE_LABELS[fabric.type].is}</span>
                <span>{fmtISK(calc.fabricUSD * USD_TO_ISK_RETAIL)}</span>
              </div>
               {calc.cordlessUSD > 0 && <div className="flex justify-between"><span>Þráðlaus</span><span>{fmtISK(calc.cordlessUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
              {calc.sidetrackUSD > 0 && <div className="flex justify-between"><span>Hliðarlisti</span><span>{fmtISK(calc.sidetrackUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
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
                    type: "tdbu",
                    qty: quantity,
                    width,
                    height,
                    fabricCode: fabric.code,
                    fabricName: `${fabric.is} (${fabric.name})`,
                    fabricType: fabric.type,
                    fabricUsdPerSqm: fabric.usdPerSqm,
                    operation,
                    sideTrack,
                    sideTrackType,
                    mountPosition,
                    noDrill,
                    railColor,
                  })
                }
                data-testid="add-tdbu-to-cart"
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
    </section>
  );
}
