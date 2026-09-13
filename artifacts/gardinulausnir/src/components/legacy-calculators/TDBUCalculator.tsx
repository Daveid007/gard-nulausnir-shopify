import { useMemo, useState } from "react";
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
import { CASSETTE_RAIL_COLORS, MOTORIZED_RAIL_COLORS, resolveRailColor } from "@/assets/railImages";
import { normalizeQuantity } from "@/lib/quantity";

// Formula: supplier_usd × 2 (freight) × 124 (rate) × 1.5 (markup) × 1.24 (VAT) = × 461
const USD_TO_ISK_RETAIL = 461;
// Aukahlutir (motor, hliðarspor o.fl.): frakt 20% í stað 100% → $1 × 1.2 × 124 × 1.5 × 1.24 ≈ 276
const USD_TO_ISK_ACCESSORY = 276;
const MOTOR_USD = 142.26;
const REMOTE_USD = 14;
const SIDETRACK_USD_PER_M = 20;
const MIN_SQM_PER_PIECE = 1;
const MAX_SQM_PER_PIECE = 5.6;

const MOTOR_ISK = Math.round((MOTOR_USD + REMOTE_USD) * USD_TO_ISK_ACCESSORY);
const SIDETRACK_ISK_PER_M = Math.round(SIDETRACK_USD_PER_M * USD_TO_ISK_ACCESSORY);

type Operation = "manual" | "motor";
type FabricType = "translucent" | "blackout";

type TdbuFabric = FabricInfo & { type: FabricType; usdPerSqm: number };

// Raw supplier USD/m² — markup is baked into USD_TO_ISK_RETAIL (× 590).
// TDBU sheet: KT basic $16.00, KT premium $28.69, KB $18.35
const TDBU_PRICING: Record<string, { type: FabricType; usdPerSqm: number }> = {
  KT401: { type: "translucent", usdPerSqm: 16.00 },
  KT402: { type: "translucent", usdPerSqm: 16.00 },
  KT403: { type: "translucent", usdPerSqm: 16.00 },
  KT404: { type: "translucent", usdPerSqm: 16.00 },
  KT405: { type: "translucent", usdPerSqm: 16.00 },
  KT406: { type: "translucent", usdPerSqm: 16.00 },
  KT407: { type: "translucent", usdPerSqm: 16.00 },
  KT408: { type: "translucent", usdPerSqm: 16.00 },
  KT409: { type: "translucent", usdPerSqm: 16.00 },
  KT410: { type: "translucent", usdPerSqm: 16.00 },
  KT411: { type: "translucent", usdPerSqm: 16.00 },
  KT412: { type: "translucent", usdPerSqm: 16.00 },
  KT413: { type: "translucent", usdPerSqm: 28.69 },
  KT414: { type: "translucent", usdPerSqm: 28.69 },
  KT415: { type: "translucent", usdPerSqm: 28.69 },
  KB401: { type: "blackout",    usdPerSqm: 18.35 },
  KB402: { type: "blackout",    usdPerSqm: 18.35 },
  KB403: { type: "blackout",    usdPerSqm: 18.35 },
  KB404: { type: "blackout",    usdPerSqm: 18.35 },
  KB405: { type: "blackout",    usdPerSqm: 18.35 },
  KB406: { type: "blackout",    usdPerSqm: 18.35 },
  KB420: { type: "blackout",    usdPerSqm: 18.35 },
  KB422: { type: "blackout",    usdPerSqm: 18.35 },
  KB426: { type: "blackout",    usdPerSqm: 18.35 },
  KB428: { type: "blackout",    usdPerSqm: 18.35 },
  KB431: { type: "blackout",    usdPerSqm: 18.35 },
  KB432: { type: "blackout",    usdPerSqm: 18.35 },
  KB433: { type: "blackout",    usdPerSqm: 18.35 },
  KB434: { type: "blackout",    usdPerSqm: 18.35 },
  KB435: { type: "blackout",    usdPerSqm: 18.35 },
};

const TDBU_FABRICS: TdbuFabric[] = Object.keys(TDBU_PRICING).map((code) => {
  const info = FABRICS[code];
  if (!info) throw new Error(`Fabric ${code} missing from shared FABRICS catalog`);
  return { ...info, ...TDBU_PRICING[code] };
});

const TYPE_LABELS: Record<FabricType, { is: string; en: string }> = {
  translucent: { is: "Hálfgegnsætt", en: "Translucent" },
  blackout:    { is: "Myrkrið",      en: "Blackout" },
};

function fmtISK(v: number) {
  return v.toLocaleString("is-IS", { maximumFractionDigits: 0 }) + " kr";
}


export default function TDBUCalculator() {
  const [width, setWidth] = useState<number>(1200);
  const [height, setHeight] = useState<number>(1500);
  const [quantity, setQuantity] = useState<number>(1);
  const [fabricCode, setFabricCode] = useState<string>("KT401");
  const [operation, setOperation] = useState<Operation>("manual");
  const [sideTrack, setSideTrack] = useState<boolean>(false);
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

  const fabric = useMemo(
    () => TDBU_FABRICS.find((f) => f.code === fabricCode) ?? TDBU_FABRICS[0],
    [fabricCode],
  );

  const grouped = useMemo(() => {
    const groups: Record<FabricType, TdbuFabric[]> = { translucent: [], blackout: [] };
    for (const f of TDBU_FABRICS) groups[f.type].push(f);
    return groups;
  }, []);

  const calc = useMemo(() => {
    const w = Math.max(0.3, width / 1000);
    const h = Math.max(0.3, height / 1000);
    const rawArea = w * h;
    const billedArea = Math.max(MIN_SQM_PER_PIECE, rawArea);

    const fabricUSD = billedArea * fabric.usdPerSqm;
    const motorUSD = operation === "motor" ? MOTOR_USD : 0;
    const remoteUSD = operation === "motor" ? REMOTE_USD : 0;
    const sidetrackUSD = sideTrack ? w * SIDETRACK_USD_PER_M : 0;

    const perPieceUSD = fabricUSD + motorUSD + remoteUSD + sidetrackUSD;
    const totalUSD = perPieceUSD * quantity;
    const accessoriesUSD = motorUSD + remoteUSD + sidetrackUSD;
    const perPieceISK = fabricUSD * USD_TO_ISK_RETAIL + accessoriesUSD * USD_TO_ISK_ACCESSORY;
    const totalISK = perPieceISK * quantity;

    const widthOK = width >= 800 && width <= 2750;
    const heightOK = height >= 500 && height <= 3000;
    const areaOK = rawArea <= MAX_SQM_PER_PIECE;

    return {
      rawArea, billedArea, perPieceUSD, totalUSD, totalISK, perPieceISK,
      fabricUSD, motorUSD, remoteUSD, sidetrackUSD,
      widthOK, heightOK, areaOK, w, h,
    };
  }, [width, height, quantity, operation, sideTrack, fabric]);

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
          <p className="text-lg text-muted-foreground">Top-Down / Bottom-Up honeycomb shade</p>
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
                  <Input id="tdbu-width" type="number" value={width} onChange={(e) => setWidth(Number(e.target.value) || 0)} min={800} max={2750} step={10} className={!calc.widthOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="tdbu-height" className="text-xs text-muted-foreground">Hæð / Height</Label>
                  <Input id="tdbu-height" type="number" value={height} onChange={(e) => setHeight(Number(e.target.value) || 0)} min={500} max={3000} step={10} className={!calc.heightOK ? "border-destructive" : ""} />
                </div>
                <div>
                  <Label htmlFor="tdbu-qty" className="text-xs text-muted-foreground">Fjöldi / Qty</Label>
                  <Input id="tdbu-qty" type="number" value={quantity} onChange={(e) => setQuantity(normalizeQuantity(Number(e.target.value)))} min={1} max={99} step={1} />
                </div>
              </div>
              <div className="mt-2 text-xs text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                <span>Breidd: 800–2750 mm</span>
                <span>Hæð: 500–3000 mm</span>
                <span>Hámark: 5.6 m² á stk</span>
                <span>45 mm sella · tvær brautir</span>
              </div>
              {(!calc.widthOK || !calc.heightOK || !calc.areaOK) && (
                <p className="text-xs text-destructive mt-2 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  Stærð er utan framleiðslumarka — hafðu samband fyrir sérlausn.
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
                              <img src={f.image} alt={`${f.is} (${f.name})`} className="w-full h-full object-cover" loading="lazy" />
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
                  <SelectItem value="motor">Mótor + fjarstýring (+{MOTOR_ISK.toLocaleString("is-IS")} kr)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground mt-1.5">
                TDBU notar tvær brautir — snærislaus stjórnun er ekki í boði.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <div>
                <Label htmlFor="tdbu-sidetrack" className="text-sm font-semibold block">Hliðarspor / Side track</Label>
                <p className="text-xs text-muted-foreground">Lokar fyrir ljósleka frá hliðum. +{SIDETRACK_ISK_PER_M.toLocaleString("is-IS")} kr/m.</p>
              </div>
              <Switch id="tdbu-sidetrack" checked={sideTrack} onCheckedChange={setSideTrack} />
            </div>

            <div>
              <Label className="text-sm font-semibold mb-2 block">Litur á brautum <span className="text-muted-foreground font-normal text-xs">/ Rail colour</span></Label>
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
                          <img src={rc.image} alt={rc.value} className="w-full h-full object-cover" loading="lazy" />
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
              {calc.motorUSD > 0 && <div className="flex justify-between"><span>Mótor + fjarstýring</span><span>{fmtISK((calc.motorUSD + calc.remoteUSD) * USD_TO_ISK_ACCESSORY)}</span></div>}
              {calc.sidetrackUSD > 0 && <div className="flex justify-between"><span>Hliðarspor</span><span>{fmtISK(calc.sidetrackUSD * USD_TO_ISK_ACCESSORY)}</span></div>}
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
