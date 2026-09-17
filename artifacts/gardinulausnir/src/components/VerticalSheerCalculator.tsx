import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/pages/storefront/_shared/data";
import {
  CartProvider,
  describeCartItem,
  formatIsk,
  priceLineIsk,
  useCart,
} from "@/lib/cart";
import { normalizeQuantity } from "@/lib/quantity";
import {
  calculateVerticalSheerQuote,
  validateVerticalSheerDimensions,
  VERTICAL_SHEER_CHAIN_SIDE,
  VERTICAL_SHEER_LIMITS,
  VERTICAL_SHEER_RETAIL_FORMULA,
  type VerticalSheerOperation,
  type VerticalSheerInstallation,
} from "@/lib/verticalSheerPricing";
import {
  VERTICAL_SHEER_CASE_IMAGES,
  VERTICAL_SHEER_FABRICS,
  type VerticalSheerFabricAsset,
} from "@/pages/storefront/_shared/vertical-sheer-assets";
import { ResponsiveImage } from "./ResponsiveImage";

export const VERTICAL_SHEER_CART_OPEN_EVENT = "gardinulausnir:open-vertical-sheer-cart";

const operationLabels: Record<VerticalSheerOperation, { title: string; detail: string }> = {
  "manual-chain": {
    title: "Handvirkt · plastkeðja",
    detail: "Supplier sheet: Manual / Plastic chain",
  },
  "manual-wand": {
    title: "Handvirkt · WAND",
    detail: "Supplier sheet: Manual / WAND",
  },
  motor: {
    title: "Rafknúið",
    detail: "Supplier sheet: motor sheet · motor $88",
  },
};

function VerticalSheerCartStatus() {
  const { items, itemCount, totalIsk, isOpen, setOpen, removeItem, clear } = useCart();

  useEffect(() => {
    const openCart = () => setOpen(true);
    window.addEventListener(VERTICAL_SHEER_CART_OPEN_EVENT, openCart);
    return () => window.removeEventListener(VERTICAL_SHEER_CART_OPEN_EVENT, openCart);
  }, [setOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#24313b]/35" role="dialog" aria-label="Karfa lóðréttra vefgardína">
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[#f7f9fa] p-6 text-[#24313b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ccd9df] pb-5">
              <p className="text-[10px] uppercase tracking-[.2em]">Karfa / {itemCount} vörur</p>
              <button type="button" onClick={() => setOpen(false)} className="text-[10px] uppercase tracking-[.14em]">
                Loka
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {items.length ? items.map((item) => {
                const description = describeCartItem(item);
                return (
                  <div key={item.id} className="border-b border-[#ccd9df] py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-serif text-xl">{description.title}</p>
                        <p className="mt-2 text-xs leading-5 text-[#667984]">{description.sub}</p>
                        <p className="mt-2 text-xs">
                          {formatIsk(priceLineIsk(item))} · {item.qty} stk.
                        </p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-[10px] uppercase tracking-[.14em] text-[#667984]">
                        Fjarlægja
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <p className="py-10 text-center text-sm text-[#667984]">Karfan er tóm.</p>
              )}
            </div>
            <div className="border-t border-[#ccd9df] pt-5">
              <div className="mb-5 flex justify-between font-serif text-2xl">
                <span>Samtals</span>
                <span>{formatIsk(totalIsk)}</span>
              </div>
              <button type="button" disabled className="w-full cursor-not-allowed bg-[#dbe9ee] py-4 text-[10px] uppercase tracking-[.18em] text-[#526772]">
                Greiðsla verður tengd síðar
              </button>
              {items.length > 0 && (
                <button type="button" onClick={clear} className="mt-3 w-full py-2 text-[10px] uppercase tracking-[.16em] text-[#667984]">
                  Tæma körfu
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function fabricTypeLabel(type: VerticalSheerFabricAsset["type"]): string {
  return type === "room-darkening" ? "Room-darkening" : "Translucent";
}

function VerticalSheerCalculatorBody({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [fabricCode, setFabricCode] = useState(VERTICAL_SHEER_FABRICS[0].code);
  const [operation, setOperation] = useState<VerticalSheerOperation>("manual-chain");
  const [installation, setInstallation] = useState<VerticalSheerInstallation>("inmount");
  const [remoteController, setRemoteController] = useState(false);
  const [width, setWidth] = useState("80");
  const [height, setHeight] = useState("160");
  const [quantity, setQuantity] = useState(1);
  const [measurementConfirmed, setMeasurementConfirmed] = useState(false);
  const [activeType, setActiveType] = useState<VerticalSheerFabricAsset["type"]>("translucent");
  const [openDetail, setOpenDetail] = useState<string | null>("Verð og mæling");

  const selectedFabric = VERTICAL_SHEER_FABRICS.find((fabric) => fabric.code === fabricCode) ?? VERTICAL_SHEER_FABRICS[0];
  const widthCm = Number(width);
  const heightCm = Number(height);
  const dimensions = useMemo(
    () => validateVerticalSheerDimensions({ widthCm, heightCm, operation, installation }),
    [heightCm, installation, operation, widthCm],
  );
  const quote = useMemo(() => {
    if (!dimensions.ok) return null;
    try {
      return calculateVerticalSheerQuote({
        widthCm,
        heightCm,
        operation,
        installation,
        fabricCode,
        remoteController,
        quantity,
      });
    } catch {
      return null;
    }
  }, [dimensions.ok, fabricCode, heightCm, installation, operation, quantity, remoteController, widthCm]);

  const limits = VERTICAL_SHEER_LIMITS[operation];
  const validationMessage = !Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm <= 0 || heightCm <= 0
    ? "Sláðu inn jákvæðar tölur í bæði mál."
    : !dimensions.ok && dimensions.reason === "outside-limits"
      ? `Mál utan birgjatakmarka: framleiðslubreidd ${limits.minWidthMm}–${limits.maxWidthMm} mm, hæð ${limits.minHeightMm}–${limits.maxHeightMm} mm og flatarmál að hámarki ${limits.maxAreaSqm} m².`
      : null;

  const addToCart = () => {
    if (!quote) return;
    addItem({
      type: "vertical-sheer",
      qty: quantity,
      widthCm,
      heightCm,
      fabricCode: selectedFabric.code,
      fabricName: selectedFabric.name,
      fabricType: selectedFabric.type,
      operation,
      installation,
      remoteController: quote.remoteController,
      railColor: "Hvít braut",
      supplierUsdPerSqm: quote.fabricSupplierUsd / quote.billedAreaSqm,
      productionWidthMm: quote.productionWidthMm,
      productionHeightMm: quote.productionHeightMm,
      billedAreaSqm: quote.billedAreaSqm,
      supplierCostUsd: quote.supplierCostUsd,
      unitIsk: quote.unitIsk,
    });
  };

  const typeFabrics = VERTICAL_SHEER_FABRICS.filter((fabric) => fabric.type === activeType);

  return (
    <div id="vertical-sheer-calculator" className="text-[#24313b]">
      <VerticalSheerCartStatus />
      <div className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] md:gap-14">
        <div className="min-w-0">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eef1]">
              <ResponsiveImage src={VERTICAL_SHEER_CASE_IMAGES.primary} alt="Lóðréttar vefgardínur í raunverulegu rými" sizes="(min-width: 768px) 55vw, 100vw" className="h-full w-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 bg-[#24313b]/70 px-4 py-3 text-[9px] uppercase tracking-[.18em] text-white">Raunverulegt verkefni</span>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eef1]">
              <ResponsiveImage src={VERTICAL_SHEER_CASE_IMAGES.secondary} alt="Lóðréttar vefgardínur, önnur raunveruleg sýn" sizes="(min-width: 768px) 55vw, 100vw" className="h-full w-full object-cover" />
              <span className="absolute bottom-0 left-0 right-0 bg-[#24313b]/70 px-4 py-3 text-[9px] uppercase tracking-[.18em] text-white">Dream Shades</span>
            </div>
          </div>
          <div className="mt-5 border border-[#ccd9df] bg-[#eaf1f5] p-5">
            <p className="text-[9px] uppercase tracking-[.22em] text-[#6892b8]">Vertical Sheer Shades / Dream Shades</p>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#596872]">
              Lóðréttar vefgardínur sem leyfa mjúku dagsljósi að síast inn. Veldu úr 17 birgjaskráðum efnum og fáðu verð eftir málum.
            </p>
          </div>
        </div>

        <div className="min-w-0 md:sticky md:top-5 md:max-h-[calc(100vh-40px)] md:overflow-y-auto md:pr-2 custom-scrollbar">
          <p className="mb-4 text-[10px] uppercase tracking-[.26em] text-[#6892b8]">{product.category}</p>
          <h1 className="font-serif text-[clamp(2.7rem,4.8vw,5.2rem)] leading-[.9] tracking-[-.06em]">Lóðréttar vefgardínur</h1>
          <div className="mt-7 border-b border-[#ccd9df] pb-5">
            <div className="flex items-end justify-between gap-5">
              <p className="text-sm text-[#5a6b74]">Vertical Sheer Shades · Dream Shades</p>
              <p data-testid="vertical-sheer-price" aria-live="polite" className="whitespace-nowrap font-serif text-2xl tracking-tight">
                {quote ? formatIsk(quote.unitIsk) : "—"}
              </p>
            </div>
            <div role="note" className="mt-4 border border-[#e3c99f] bg-[#fff8ec] px-3 py-3 text-[10px] leading-5 text-[#79572f]">
              <strong>Áætlað verð — mæling þarf staðfestingu.</strong> Birgjablaðið nefnir 20 mm innfellda frádrátt í leiðbeiningatexta, en vistuð verðformúla notar J×25,4−5 mm fyrir breidd og óbreytta hæð. Hér er aðeins vistuð formúla notuð; staðfestu mál við ráðgjafa áður en pöntun er lögð.
            </div>
          </div>

          <section className="border-b border-[#ccd9df] py-6" aria-labelledby="vertical-sheer-fabric-heading">
            <div className="mb-4 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[.18em]">
              <span id="vertical-sheer-fabric-heading">Veldu efni</span>
              <span className="text-[#667984]">{selectedFabric.name}</span>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(["translucent", "room-darkening"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setActiveType(type);
                    const first = VERTICAL_SHEER_FABRICS.find((fabric) => fabric.type === type);
                    if (first) setFabricCode(first.code);
                  }}
                  className={`border px-3 py-3 text-left text-[10px] ${activeType === type ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                >
                  {fabricTypeLabel(type)}
                  <span className="mt-1 block text-[9px] text-[#667984]">{type === "room-darkening" ? "3 supplier swatches" : "14 supplier swatches"}</span>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
              {typeFabrics.map((fabric) => (
                <button
                  key={fabric.code}
                  type="button"
                  onClick={() => setFabricCode(fabric.code)}
                  aria-label={`Velja ${fabric.name} ${fabric.code}`}
                  className={`group overflow-hidden border text-left ${fabric.code === fabricCode ? "border-[#24313b]" : "border-[#ccd9df]"}`}
                >
                  <span className="relative block aspect-square bg-white">
                    <ResponsiveImage src={fabric.image} alt="" sizes="64px" className="h-full w-full object-cover p-1" />
                    {fabric.code === fabricCode && <Check size={15} className="absolute inset-0 m-auto rounded-full bg-[#f7f9fa]/90 p-0.5 text-[#24313b]" />}
                  </span>
                  <span className="block truncate px-1.5 py-1 text-[9px] text-[#596872]">{fabric.name}</span>
                  <span className="block truncate px-1.5 pb-1.5 text-[8px] text-[#71808a]">{fabric.code}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="border-b border-[#ccd9df] py-6" aria-labelledby="vertical-sheer-measurements-heading">
            <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]">
              <span id="vertical-sheer-measurements-heading">Mál · sentímetrar</span>
              <span className="text-[#667984]">{dimensions.ok ? `${dimensions.billedAreaSqm.toFixed(2).replace(".", ",")} m²` : "Athuga þarf mál"}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span>
                <input data-testid="vertical-sheer-width" aria-label="Breidd lóðréttra vefgardína í sentímetrum" type="number" inputMode="decimal" min="50" max={operation === "motor" ? "600.5" : "400.5"} step="0.1" value={width} onChange={(event) => { setWidth(event.target.value); setMeasurementConfirmed(false); }} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#24313b]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span>
                <input data-testid="vertical-sheer-height" aria-label="Hæð lóðréttra vefgardína í sentímetrum" type="number" min="50" max="400" step="0.1" value={height} onChange={(event) => { setHeight(event.target.value); setMeasurementConfirmed(false); }} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#24313b]" />
              </label>
            </div>
            <p className="mt-3 text-xs leading-5 text-[#667984]">Framleiðslumál eru reiknuð samkvæmt birgjablaði. Lágmarksverð er 1 m² á stykki.</p>
            {validationMessage && <p role="alert" className="mt-3 bg-[#fff3e5] px-3 py-3 text-xs leading-5 text-[#8b4d1f]">{validationMessage}</p>}
            <label className="mt-4 flex cursor-pointer gap-3 border border-[#ccd9df] bg-white/40 px-3 py-3 text-[10px] leading-5 text-[#596872]">
              <input type="checkbox" checked={measurementConfirmed} onChange={(event) => setMeasurementConfirmed(event.target.checked)} className="mt-1" />
              <span>Ég staðfesti að mál séu yfirfarin og skil að verðið er áætlun sem þarf endanlega mælingastaðfestingu áður en pöntun er lögð.</span>
            </label>
          </section>

          <section className="border-b border-[#ccd9df] py-6" aria-labelledby="vertical-sheer-operation-heading">
            <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]">
              <span id="vertical-sheer-operation-heading">Stýring</span>
              <span className="text-[#667984]">{operationLabels[operation].title}</span>
            </div>
            <div className="space-y-2">
              {(Object.keys(operationLabels) as VerticalSheerOperation[]).map((option) => (
                <button key={option} type="button" onClick={() => { setOperation(option); if (option !== "motor") setRemoteController(false); }} className={`flex w-full justify-between gap-3 border px-3 py-3 text-left text-[10px] ${operation === option ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                  <span>{operationLabels[option].title}<span className="mt-1 block text-[9px] text-[#667984]">{operationLabels[option].detail}</span></span>
                  {option === "motor" && <span className="whitespace-nowrap">+$88</span>}
                </button>
              ))}
            </div>
            {operation === "motor" && (
              <label className="mt-3 flex cursor-pointer items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px]">
                <span>Fjarstýring <span className="mt-1 block text-[9px] text-[#667984]">Supplier sheet remote · +$7</span></span>
                <input type="checkbox" checked={remoteController} onChange={(event) => setRemoteController(event.target.checked)} />
              </label>
            )}
          </section>

          <section className="border-b border-[#ccd9df] py-6">
            <div className="mb-4 text-[10px] uppercase tracking-[.18em]">Uppsetning & braut</div>
            <div className="grid grid-cols-2 gap-2">
              {(["inmount", "outmount"] as const).map((option) => (
                <button key={option} type="button" disabled={option === "outmount"} onClick={() => { setInstallation(option); setMeasurementConfirmed(false); }} className={`border px-3 py-3 text-left text-[10px] ${installation === option ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"} ${option === "outmount" ? "cursor-not-allowed opacity-55" : ""}`}>
                  {option === "inmount" ? "Innfelld uppsetning" : "Utanáliggjandi uppsetning"}
                  <span className="mt-1 block text-[9px] text-[#667984]">{option === "outmount" ? "Óvirkt · bíður staðfestingar birgis" : "Supplier sheet option"}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 text-[10px] leading-5 text-[#667984]">Hvít braut · keðjuhlið {VERTICAL_SHEER_CHAIN_SIDE}. Innfelld uppsetning er eina verðlagða leiðin núna; utanáliggjandi uppsetning er óvirk þar til birgir staðfestir frádrátt og formúlu.</p>
          </section>

          <div className="flex items-center gap-3 border-b border-[#ccd9df] py-6">
            <div className="flex h-[51px] items-center border border-[#ccd9df]">
              <button type="button" onClick={() => setQuantity(normalizeQuantity(quantity - 1))} disabled={quantity <= 1} aria-label="Fækka fjölda" className="grid h-full w-10 place-items-center disabled:opacity-40"><Minus size={14} /></button>
              <span className="w-7 text-center text-sm" aria-live="polite">{quantity}</span>
              <button type="button" onClick={() => setQuantity(normalizeQuantity(quantity + 1))} disabled={quantity >= 99} aria-label="Auka fjölda" className="grid h-full w-10 place-items-center disabled:opacity-40"><Plus size={14} /></button>
            </div>
            <button type="button" onClick={addToCart} disabled={!quote || !measurementConfirmed} className="flex h-[51px] flex-1 items-center justify-center gap-3 bg-[#a2c2e2] text-[10px] uppercase tracking-[.2em] transition hover:bg-[#89b0d5] disabled:cursor-not-allowed disabled:opacity-45">
              Bæta í körfu <ShoppingBag size={15} />
            </button>
          </div>
          {quote && <p className="mt-3 text-right text-xs text-[#667984]">{quantity} × {formatIsk(quote.unitIsk)} = <strong className="text-[#24313b]">{formatIsk(quote.totalIsk)}</strong></p>}

          <div className="mt-4">
            {["Verð og mæling", "Um efni og uppruna"].map((detail) => (
              <div key={detail} className="border-b border-[#ccd9df]">
                <button type="button" onClick={() => setOpenDetail(openDetail === detail ? null : detail)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[.18em]">{detail}<ChevronDown size={16} className={`transition ${openDetail === detail ? "rotate-180" : ""}`} /></button>
                {openDetail === detail && (
                  <p className="max-w-md pb-5 text-sm leading-6 text-[#5a6b74]">
                    {detail === "Verð og mæling"
                      ? `${VERTICAL_SHEER_RETAIL_FORMULA}. Birgjablaðið notar J×25,4−5 mm fyrir framleiðslubreidd og K×25,4 fyrir hæð; því er sú formúla notuð hér. Flutningur og uppsetning eru ekki inni í birgjaverðinu.`
                      : "17 efni úr afhentu birgjapakka: 14 Translucent og 3 Room-darkening. Raunverulegar verkefnamyndir eru sýndar til viðmiðunar; þær breyta ekki verði."}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function VerticalSheerCalculator({ product }: { product: Product }) {
  return (
    <CartProvider>
      <VerticalSheerCalculatorBody product={product} />
    </CartProvider>
  );
}

export default VerticalSheerCalculator;