import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronDown, Menu, Minus, Plus, ShoppingBag, X, ZoomIn } from "lucide-react";
import { Link, useParams } from "wouter";
import { products as fallbackProducts } from "./_shared/data";
import { useStorefrontCatalog } from "./_shared/catalog";
import { BrandLogo } from "./_shared/BrandLogo";
import { LEGACY_CART_OPEN_EVENT, LegacyCalculator, type LegacyCalculatorKind } from "@/components/LegacyCalculator";
import { ProductInfoFooter } from "@/components/ProductInfoFooter";
import { MeasurementGuideTrigger } from "@/components/MeasurementGuide";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import WindourCalculator, { WINDOUR_CART_OPEN_EVENT } from "@/components/WindourCalculator";
import VerticalSheerCalculator, { VERTICAL_SHEER_CART_OPEN_EVENT } from "@/components/VerticalSheerCalculator";
import type { RollerProductIdentity } from "@/components/legacy-calculators/PriceCalculator";
import type { RollerWorkbookProductIdentity } from "@/components/legacy-calculators/RollerWorkbookCalculator";
import { isWindourProductId } from "@/lib/windourPricing";
import NotFound from "@/pages/not-found";
import CurtainsProductDetail from "./CurtainsProductDetail";
import { isCurtainProductId } from "./_shared/curtains";

import {
  accessories,
  finishes,
  cassetteFinishImages,
  motorFinishImages,
  rollerBottomFinishImages,
  honeycombBottomFinishImages,
  bottomRailTypeImages,
  holderImages,
  mounts,
  mechanisms,
  holders,
  FinishId,
} from "./_shared/accessories";

import { getRollerFabrics, getHoneycombFabrics } from "./_shared/fabrics";
import { normalizeQuantity } from "@/lib/quantity";

const fallbackFabrics = [
  { name: "Pure White", tone: "#f2f1eb", image: "" },
  { name: "Warm Chalk", tone: "#d9d1c2", image: "" },
  { name: "Soft Grey", tone: "#9aa2a2", image: "" },
  { name: "Charcoal", tone: "#40484b", image: "" },
  { name: "Slate Blue", tone: "#8da5b2", image: "" },
];

export function ProductDetail() {
  const params = useParams<{ id: string }>();
  const { products } = useStorefrontCatalog();
  const product = products.find((item) => item.id === params.id) ?? fallbackProducts.find((item) => item.id === params.id);
  if (!product) return <NotFound />;
  if (isCurtainProductId(product.id)) {
    return <CurtainsProductDetail key={product.id} productId={product.id} />;
  }
  const isRoller = product.category === "Rúllugardínur";
  const isHoneycomb = product.category === "Myrkvunargardínur";
  const isWindour = isWindourProductId(product.id);
  const isVerticalSheer = product.id === "vertical-sheer-shades";
  const isCustomizer = isRoller || isHoneycomb;
  const rollerProduct: RollerProductIdentity | undefined =
    product.id === "square-cassette" || product.id === "arc-cassette" || product.id === "open-roll"
      ? product.id
      : undefined;
  const workbookProduct: RollerWorkbookProductIdentity | undefined =
    product.id === "square-cassette" || product.id === "arc-cassette" || product.id === "open-roll" ||
    product.id === "zebra-blind" || product.id === "sheer-shades" || product.id === "butterfly-blinds"
      ? product.id
      : undefined;
  const legacyCalculator: LegacyCalculatorKind | null =
    product.id === "honeycomb-45mm" ? "honeycomb-45"
      : product.id === "honeycomb-25mm" ? "honeycomb-25"
        : product.id === "day-night" ? "day-night"
          : product.id === "top-down-bottom-up" ? "tdbu"
            : product.id === "vertical-45mm" ? "vertical"
              : product.id === "dual-roller" ? "dual-roller"
                 : workbookProduct ? "roller-workbook"
                   : rollerProduct ? "roller"
                    : null;

  const [opacity, setOpacity] = useState<"blackout" | "light-filtering">("blackout");

  const customizerFabrics = useMemo(() => {
    if (isHoneycomb) return getHoneycombFabrics(opacity);
    if (isRoller) return getRollerFabrics(opacity);
    return [];
  }, [isHoneycomb, isRoller, opacity]);

  const colorNames = ["Sandur", "Steinn", "Grafít", "Ljósgrár", "Mosi"];
  const nonCustomizerFabrics = product.colors.length
    ? product.colors.map((tone, index) => ({ name: colorNames[index] ?? `Litur ${index + 1}`, tone, image: "" }))
    : fallbackFabrics;

  const fabrics = isCustomizer ? customizerFabrics : nonCustomizerFabrics;

  const [fabricIndex, setFabricIndex] = useState(0);
  const currentFabricIndex = Math.min(fabricIndex, Math.max(0, fabrics.length - 1));
  const currentFabric = fabrics[currentFabricIndex];

  const [finishIndex, setFinishIndex] = useState(0);
  const [mount, setMount] = useState(0);
  const [mechanism, setMechanism] = useState(0);
  const [bottomRail, setBottomRail] = useState<"Hulinn botnlisti" | "Álbotnlisti">("Hulinn botnlisti");
  const [sideRails, setSideRails] = useState(false);
  const [holder, setHolder] = useState(0);
  const [imageView, setImageView] = useState<"primary" | "secondary">("primary");
  const [zoom, setZoom] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [width, setWidth] = useState("80");
  const [height, setHeight] = useState("160");
  const [accessory, setAccessory] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [openDetail, setOpenDetail] = useState<string | null>("Efni & ljós");

  const widthValue = Math.max(0, Number(width) || 0);
  const heightValue = Math.max(0, Number(height) || 0);
  const area = (widthValue * heightValue) / 10000;
  const parsedLivePrice = Number(product.price.replace(/[^\d]/g, ""));
  const hasLivePrice = /^\s*[\d.,]+\s*(?:kr|ISK)?\s*$/i.test(product.price) && Number.isFinite(parsedLivePrice) && parsedLivePrice > 0;
  const price = hasLivePrice ? parsedLivePrice : 0;
  const validDimensions = widthValue >= 30 && widthValue <= 400 && heightValue >= 30 && heightValue <= 400;
  const dimensions = `${width || "—"} × ${height || "—"} cm`;
  const activeImage = imageView === "secondary" ? product.secondary : product.image;

  useEffect(() => {
    if (!zoom) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [zoom]);

  const activeFinishImages = mechanism === 2
    ? motorFinishImages
    : isHoneycomb
      ? honeycombBottomFinishImages
      : cassetteFinishImages;

  const addToCart = () => {
    if (!hasLivePrice || !validDimensions) return;
    setCart((current) => current + quantity);
    setCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f9fa] text-[#24313b]">
      <div className="bg-[#a2c2e2] px-5 py-2 text-center text-[9px] uppercase tracking-[.22em] text-[#24313b]">Ókeypis ráðgjöf · Sérsniðið á Íslandi</div>
      <header className="border-b border-[#d8e1e5] px-5 md:px-10">
        <div className="flex h-[74px] items-center justify-between">
        <BrandLogo className="h-9 w-[182px] sm:h-10 sm:w-[202px]" />
          <nav className="hidden gap-8 text-[10px] uppercase tracking-[.18em] md:flex"><a href="#vörulýsing">{product.category}</a><a href="#upplýsingar">Leiðbeiningar</a><Link href="/maelingar">Mælingar</Link></nav>
          <div className="flex items-center gap-4">
              <button
               aria-label={legacyCalculator ? "Opna reiknivélarkörfu" : isWindour ? "Opna áætlunarkörfu" : isVerticalSheer ? "Opna körfu lóðréttra vefgardína" : "Opna körfu"}
              onClick={() => {
                if (legacyCalculator) window.dispatchEvent(new Event(LEGACY_CART_OPEN_EVENT));
                 else if (isWindour) window.dispatchEvent(new Event(WINDOUR_CART_OPEN_EVENT));
                 else if (isVerticalSheer) window.dispatchEvent(new Event(VERTICAL_SHEER_CART_OPEN_EVENT));
                else setCartOpen(true);
              }}
              className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em]"
            >
              <ShoppingBag size={16} /> <span className="hidden sm:inline">{isWindour ? "Áætlun" : "Karfa"}</span> {!legacyCalculator && !isWindour && !isVerticalSheer && <span className="grid h-5 w-5 place-items-center rounded-full bg-[#24313b] text-[9px] text-[#f7f9fa]">{cart}</span>}
            </button>
            <button type="button" onClick={() => setMobileNavOpen((open) => !open)} className="grid h-9 w-9 place-items-center md:hidden" aria-label={mobileNavOpen ? "Loka valmynd" : "Opna valmynd"}>
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileNavOpen && <nav className="border-t border-[#d8e1e5] py-4 md:hidden" aria-label="Farsímaleiðsögn">
          <a href="#vörulýsing" onClick={() => setMobileNavOpen(false)} className="block py-2 text-[10px] uppercase tracking-[.18em]">{product.category}</a>
          <a href="#upplýsingar" onClick={() => setMobileNavOpen(false)} className="block py-2 text-[10px] uppercase tracking-[.18em]">Leiðbeiningar</a>
          <Link href="/maelingar" onClick={() => setMobileNavOpen(false)} className="block py-2 text-[10px] uppercase tracking-[.18em]">Mælingar</Link>
        </nav>}
      </header>

      <main id="top">
        <div className="mx-auto flex max-w-[1510px] items-center justify-between gap-4 px-5 pt-5 md:px-10 md:pt-8 mb-5">
          <Link href="/collection" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-[#667984]"><ArrowLeft size={14} /> Allar gardínur</Link>
        </div>
        <section id="vörulýsing" className="mx-auto max-w-[1510px] px-5 pb-16 md:px-10 md:pb-28">
          {legacyCalculator ? (
            <LegacyCalculator key={product.id} kind={legacyCalculator} rollerProduct={rollerProduct} workbookProduct={workbookProduct} product={product} />
           ) : isWindour ? (
            <WindourCalculator key={product.id} product={product} />
           ) : isVerticalSheer ? (
             <VerticalSheerCalculator key={product.id} product={product} />
          ) : (
             <div data-testid="product-box" className="grid min-w-0 md:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] gap-8 md:gap-14">
               <div data-testid="gallery" className="grid min-w-0 grid-cols-[minmax(0,.27fr)_minmax(0,.73fr)] gap-3 md:gap-5 h-fit">
                <div className="flex min-w-0 flex-col gap-3 md:gap-5">
                  <button onClick={() => setImageView("primary")} className={`relative flex aspect-[4/3] max-h-[160px] items-center justify-center overflow-hidden border-2 bg-[#e8eef1] ${imageView === "primary" ? "border-[#24313b]" : "border-transparent opacity-65"}`}><ResponsiveImage src={product.image} alt={product.title} sizes="120px" className="max-h-full max-w-full object-contain p-2" /></button>
                  <button onClick={() => setImageView("secondary")} className={`relative flex aspect-[4/3] max-h-[160px] items-center justify-center overflow-hidden border-2 bg-[#e8eef1] transition hover:opacity-100 ${imageView === "secondary" ? "border-[#24313b]" : "border-transparent opacity-65"}`}><ResponsiveImage src={product.secondary} alt={`${product.title}, önnur sýn`} sizes="120px" className="max-h-full max-w-full object-contain p-2" /></button>
                </div>
                  <div className="min-w-0">
                    <div className="relative flex w-full aspect-[4/3] max-h-[500px] items-center justify-center overflow-hidden bg-[#c8d6dc] p-4">
                      <ResponsiveImage src={activeImage} alt={product.title} sizes="(min-width: 768px) 55vw, 100vw" className="max-h-full max-w-full object-contain transition-opacity duration-300" />
                      <div className="absolute left-4 top-4 bg-[#f7f9fa]/90 px-3 py-2 text-[9px] uppercase tracking-[.18em]">{product.note}</div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#24313b]/60 to-transparent px-6 pb-6 pt-20 text-[10px] uppercase tracking-[.18em] text-[#f7f9fa]">Sérsmíðað eftir máli</div>
                      <button type="button" data-testid="gallery-zoom" onClick={() => setZoom(true)} className="absolute right-4 top-4 grid h-10 w-10 place-items-center bg-[#f7f9fa]/90 text-[#24313b]" aria-label="Stækka mynd"><ZoomIn size={17} /></button>
                    </div>
                    {isCustomizer && currentFabric && (
                      <div className="mt-3 flex items-center gap-3 border border-[#ccd9df] bg-[#f7f9fa] p-3">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden border border-[#ccd9df] bg-white" style={!currentFabric.image && "tone" in currentFabric && currentFabric.tone ? { backgroundColor: currentFabric.tone } : undefined}>
                          {currentFabric.image && <ResponsiveImage src={currentFabric.image} alt="" sizes="64px" className="max-h-full max-w-full object-contain p-1" />}
                        </span>
                        <span>
                          <span className="block text-[9px] uppercase tracking-[.16em] text-[#667984]">Valið efni</span>
                          <span className="mt-1 block text-sm text-[#24313b]">{currentFabric.name}</span>
                        </span>
                      </div>
                    )}
                  </div>
              </div>

               <div data-testid="config-card" className="pt-2 md:sticky md:top-5 md:h-[calc(100vh-40px)] md:overflow-y-auto pr-2 custom-scrollbar pb-10">
                <p className="mb-4 text-[10px] uppercase tracking-[.26em] text-[#6892b8]">{product.category}</p>
                <h1 className="font-serif text-[clamp(2.7rem,4.8vw,5.2rem)] leading-[.9] tracking-[-.06em]">{product.title}</h1>
                <div className="mt-7 flex items-end justify-between gap-5 border-b border-[#ccd9df] pb-5"><p className="text-sm text-[#5a6b74]">{product.subtitle}</p><p data-testid="live-price" aria-live="polite" className="whitespace-nowrap font-serif text-2xl tracking-tight">{product.price}</p></div>

                <div className="border-b border-[#ccd9df] py-6">
                  <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]"><span>Veldu lit</span><span className="text-[#667984]">{currentFabric?.name}</span></div>
                   <div className="flex flex-wrap gap-3">
                     {fabrics.map((item, index) => (
                       <button 
                         key={'code' in item ? item.code : item.name} 
                         onClick={() => { setFabricIndex(index); setImageView(index % 2 ? "secondary" : "primary"); }} 
                         aria-label={`Velja ${item.name}`} 
                           className={`relative h-10 w-10 overflow-hidden rounded-full border transition ${currentFabricIndex === index ? "border-[#24313b]" : "border-transparent hover:border-[#90a5ae]"}`}
                         style={'tone' in item && item.tone ? { backgroundColor: item.tone } : undefined}
                       >
                         {item.image && <ResponsiveImage src={item.image} alt="" loading="lazy" decoding="async" sizes="40px" className="absolute inset-0 h-full w-full object-contain p-0.5" />}
                         {currentFabricIndex === index && <Check size={14} className="absolute inset-0 m-auto text-[#24313b] z-10" style={item.image ? { filter: 'drop-shadow(0px 0px 2px rgba(255,255,255,0.8))' } : {}} />}
                       </button>
                     ))}
                   </div>
                </div>

                {isCustomizer && <div className="border-b border-[#ccd9df] py-6">
                  <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]"><span>Dúkagerð</span><span className="text-[#667984]">{opacity === "blackout" ? "Myrkvun / Blackout" : "Ljós síað / Light filtering"}</span></div>
                  <div className="grid grid-cols-2 gap-2">
                    <button data-testid="opacity-blackout" onClick={() => { setOpacity("blackout"); setFabricIndex(0); setImageView("primary"); }} className={`border px-3 py-3 text-left text-[11px] ${opacity === "blackout" ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>Myrkvun<span className="mt-1 block text-[9px] text-[#667984]">Blackout · 100%</span></button>
                    <button data-testid="opacity-light-filtering" onClick={() => { setOpacity("light-filtering"); setFabricIndex(0); setImageView("secondary"); }} className={`border px-3 py-3 text-left text-[11px] ${opacity === "light-filtering" ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>Ljós síað<span className="mt-1 block text-[9px] text-[#667984]">Light filtering</span></button>
                  </div>
                </div>}

                {!isCustomizer && <div className="border-b border-[#ccd9df] py-6">
                   <div className="mb-4 flex items-center justify-between gap-3 text-[10px] uppercase tracking-[.18em]"><span>Mælingareiknivél</span><MeasurementGuideTrigger /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block"><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span><input aria-label="Breidd í sentímetrum" type="number" inputMode="decimal" min="30" max="400" value={width} onChange={(event) => setWidth(event.target.value)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none transition focus:border-[#24313b]" /></label>
                    <label className="block"><span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span><input aria-label="Hæð í sentímetrum" type="number" inputMode="decimal" min="30" max="400" value={height} onChange={(event) => setHeight(event.target.value)} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none transition focus:border-[#24313b]" /></label>
                  </div>
                  <div className="mt-4 flex items-center justify-between bg-[#e2edf1] px-3 py-3 text-xs"><span>Reiknað flatarmál</span><strong>{area.toFixed(2).replace(".", ",")} m²</strong></div>
                  <p className="mt-3 text-xs leading-5 text-[#667984]">Sláðu inn nákvæm mál gluggaopsins. Lágmark 30 cm, hámark 400 cm.</p>
                </div>}

                {isCustomizer && <>
                  <div className="border-b border-[#ccd9df] py-6">
                    <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]"><span>{isRoller ? "Kassetta & listar" : "Efri braut & botnprófíll"}</span><span className="text-[#667984]">{finishes[finishIndex]?.name}</span></div>
                    <div className="grid grid-cols-3 gap-2">
                      {finishes.map((item, index) => (
                        <button key={item.id} onClick={() => setFinishIndex(index)} className={`overflow-hidden border p-2 text-left ${finishIndex === index ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                          <img src={activeFinishImages[item.id]} alt={`${item.name} prófíll`} className="mb-2 h-16 w-full bg-white object-contain" />
                          <span className="text-[9px]">{item.name}</span>
                        </button>
                      ))}
                    </div>
                    {isRoller && <div className="mt-3 grid grid-cols-2 gap-2">
                      {(["Hulinn botnlisti", "Álbotnlisti"] as const).map((item) => (
                        <button key={item} onClick={() => setBottomRail(item)} className={`overflow-hidden border p-2 text-left text-[10px] ${bottomRail === item ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>
                          <img src={bottomRailTypeImages[item]} alt={item} className="mb-2 h-20 w-full bg-white object-contain" />
                          <span>{item}</span>
                        </button>
                      ))}
                    </div>}
                  </div>

                  <div className="border-b border-[#ccd9df] py-6">
                    <div className="mb-4 text-[10px] uppercase tracking-[.18em]">Festingar</div>
                    <div className="grid grid-cols-2 gap-2">{mounts.map((item, index) => <button key={item} onClick={() => setMount(index)} className={`border px-3 py-3 text-left text-[10px] ${mount === index ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{item}</button>)}</div>
                  </div>

                  <div className="border-b border-[#ccd9df] py-6">
                    <div className="mb-4 text-[10px] uppercase tracking-[.18em]">Stýring & aukahlutir</div>
                    <div className="space-y-2">{mechanisms.map((item, index) => <button key={item} onClick={() => setMechanism(index)} className={`flex w-full justify-between border px-3 py-3 text-left text-[10px] ${mechanism === index ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}><span>{item}</span><span>{index === 1 ? "+4.500 kr." : index === 2 ? "+24.900 kr." : "Innifalið"}</span></button>)}</div>
                    <label className="mt-3 flex cursor-pointer items-center justify-between border border-[#ccd9df] px-3 py-3 text-[10px]"><span>Hliðarspor</span><input type="checkbox" checked={sideRails} onChange={(event) => setSideRails(event.target.checked)} /></label>
                    <div className="mt-3"><p className="mb-2 text-[9px] uppercase tracking-[.14em] text-[#667984]">Lásahaldari</p><div className="grid grid-cols-4 gap-2">{holders.map((item, index) => <button key={item} onClick={() => setHolder(index)} className={`overflow-hidden border p-2 text-[9px] ${holder === index ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}>{holderImages[index] ? <img src={holderImages[index] ?? undefined} alt={`${item} lásahaldari`} className="mb-2 h-14 w-full bg-white object-contain" /> : <span className="mb-2 grid h-14 place-items-center bg-[#eef3f5] text-[8px] uppercase tracking-[.12em] text-[#667984]">Án</span>}<span>{item}</span></button>)}</div></div>
                  </div>
                </>}

                <div className="border-b border-[#ccd9df] py-6">
                  <div className="mb-4 flex justify-between text-[10px] uppercase tracking-[.18em]"><span>Aukahlutir</span><span className="text-[#667984]">{accessories[accessory].name}</span></div>
                  <div className="space-y-2">{accessories.map((item, index) => <button key={item.name} onClick={() => setAccessory(index)} className={`flex w-full items-center justify-between border px-3 py-3 text-left transition ${accessory === index ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df] hover:border-[#7e9bab]"}`}><span><span className="block text-[11px]">{item.name}</span><span className="mt-1 block text-[10px] text-[#667984]">{item.detail}</span></span><span className="whitespace-nowrap pl-3 text-[10px] text-[#5a6b74]">{item.price ? `+${item.price.toLocaleString("is-IS")} kr.` : "Innifalið"}</span></button>)}</div>
                </div>

                <div className="flex items-center gap-3 py-6 border-b border-[#ccd9df]">
                   <div className="flex h-[51px] items-center border border-[#ccd9df]"><button onClick={() => setQuantity(normalizeQuantity(quantity - 1))} disabled={quantity <= 1} aria-label="Fækka fjölda" className="grid h-full w-10 place-items-center disabled:opacity-40"><Minus size={14} /></button><span className="w-7 text-center text-sm" aria-live="polite">{normalizeQuantity(quantity)}</span><button onClick={() => setQuantity(normalizeQuantity(quantity + 1))} disabled={quantity >= 99} aria-label="Auka fjölda" className="grid h-full w-10 place-items-center disabled:opacity-40"><Plus size={14} /></button></div>
                   <button onClick={addToCart} disabled={!hasLivePrice || !validDimensions} className="flex h-[51px] flex-1 items-center justify-center gap-3 bg-[#a2c2e2] text-[10px] uppercase tracking-[.2em] transition hover:bg-[#89b0d5] disabled:cursor-not-allowed disabled:opacity-45">Bæta í körfu <Plus size={15} /></button>
                </div>
                
                 <div id="upplýsingar" className="mt-4">{["Efni & ljós", "Mæling & uppsetning"].map((detail) => <div key={detail} className="border-b border-[#ccd9df]"><button onClick={() => setOpenDetail(openDetail === detail ? null : detail)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[.18em]">{detail}<ChevronDown size={16} className={`transition ${openDetail === detail ? "rotate-180" : ""}`} /></button>{openDetail === detail && <p className="max-w-md pb-5 text-sm leading-6 text-[#5a6b74]">{detail === "Efni & ljós" ? `${product.title} er sérsmíðað kerfi. Veldu lit og uppsetningu sem hentar birtu, næði og loftflæði rýmisins.` : "Sláðu inn breidd og hæð hér að ofan til að senda inn rétta grunnstillingu fyrir tilboðið."}</p>}</div>)}</div>
              </div>
            </div>
          )}
        </section>

        <ProductInfoFooter />
      </main>

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-10" role="dialog" aria-modal="true" aria-label="Stækkuð mynd" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoom(false); }}>
          <div className="relative max-h-full max-w-full">
            <button type="button" onClick={() => setZoom(false)} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center bg-[#f7f9fa] text-[#24313b]" aria-label="Loka stækkaðri mynd"><X size={18} /></button>
            <ResponsiveImage src={activeImage} alt={`${product.title}, stækkuð mynd`} sizes="90vw" className="max-h-[90vh] max-w-full object-contain" />
          </div>
        </div>
      )}

      {cartOpen && <div className="fixed inset-0 z-50 bg-[#24313b]/35"><aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[#f7f9fa] p-6 shadow-2xl"><div className="flex items-center justify-between border-b border-[#ccd9df] pb-5"><p className="text-[10px] uppercase tracking-[.2em]">Karfa / {cart} vörur</p><button onClick={() => setCartOpen(false)} aria-label="Loka körfu"><X size={20} /></button></div>{cart ? <><div className="flex gap-4 py-6"><ResponsiveImage src={activeImage} alt="" sizes="80px" className="h-28 w-20 object-contain bg-[#e8eef1] p-1" /><div className="flex-1"><h3 className="font-serif text-2xl">{product.title}</h3><p className="mt-2 text-xs text-[#667984]">{currentFabric?.name} · {dimensions}</p><p className="mt-4 text-sm">{product.price} / stk.</p></div></div><div className="mt-auto border-t border-[#ccd9df] pt-5"><div className="mb-5 flex justify-between font-serif text-2xl"><span>Samtals</span><span>{(price * cart).toLocaleString("is-IS")} kr.</span></div><button className="w-full bg-[#a2c2e2] py-4 text-[10px] uppercase tracking-[.18em]">Halda áfram í greiðslu</button></div></> : <div className="grid flex-1 place-items-center text-center"><p className="text-sm text-[#667984]">Karfan bíður eftir rétta birtunni.</p></div>}</aside></div>}
    </div>
  );
}

export default ProductDetail;
