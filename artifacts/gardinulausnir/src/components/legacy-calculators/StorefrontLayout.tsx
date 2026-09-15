import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, ShoppingBag, ZoomIn, X } from "lucide-react";
import { normalizeQuantity } from "@/lib/quantity";
import { ResponsiveImage } from "@/components/ResponsiveImage";

export function StorefrontLayout({
  product,
  priceISK,
  activeFabric,
  controls,
  onAddToCart,
  quantity,
  setQuantity,
  canAddToCart = true,
  roundPricePerUnit = true,
}: {
  product: any;
  priceISK: number;
  activeFabric: { name: string; image?: string; tone?: string; pattern?: string };
  controls: ReactNode;
  onAddToCart: () => void;
  quantity: number;
  setQuantity: (q: number) => void;
  canAddToCart?: boolean;
  roundPricePerUnit?: boolean;
}) {
  const [imageView, setImageView] = useState<"primary" | "secondary">("primary");
  const [openDetail, setOpenDetail] = useState<string | null>("Efni & ljós");
  const activeImage = imageView === "secondary" ? product.secondary : product.image;
  const [zoom, setZoom] = useState<{ src: string; alt: string } | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!zoom) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoom(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [zoom]);

  const safeQuantity = normalizeQuantity(quantity);
  const changeQuantity = (next: number) => setQuantity(normalizeQuantity(next));
  // Cart totals are charged in whole hundreds of ISK. All calculators except
  // dual roller round each unit before multiplying; dual roller's existing
  // cart helper rounds its complete line total.
  const displayPriceISK = roundPricePerUnit
    ? Math.ceil((priceISK / safeQuantity) / 100) * 100 * safeQuantity
    : Math.ceil(priceISK / 100) * 100;

  return (
    <div data-testid="product-box" className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] md:gap-14">
      {/* LEFT COLUMN */}
      <div data-testid="gallery" className="grid min-w-0 grid-cols-[minmax(0,.27fr)_minmax(0,.73fr)] gap-3 md:gap-5">
        <div className="flex min-w-0 flex-col gap-3 md:gap-5">
          <button type="button" onClick={() => setImageView("primary")} className={`relative flex aspect-[4/3] max-h-[160px] items-center justify-center overflow-hidden border-2 bg-[#e8eef1] ${imageView === "primary" ? "border-[#24313b]" : "border-transparent opacity-65"}`} aria-label="Skoða aðalmynd">
            <ResponsiveImage src={product.image} alt={product.title} sizes="120px" className="max-h-full max-w-full object-contain p-2" />
          </button>
          <button type="button" onClick={() => setImageView("secondary")} className={`relative flex aspect-[4/3] max-h-[160px] items-center justify-center overflow-hidden border-2 bg-[#e8eef1] transition hover:opacity-100 ${imageView === "secondary" ? "border-[#24313b]" : "border-transparent opacity-65"}`} aria-label="Skoða aðra mynd">
            <ResponsiveImage src={product.secondary} alt={`${product.title}, önnur sýn`} sizes="120px" className="max-h-full max-w-full object-contain p-2" />
          </button>
          {activeFabric.image && (
            <button type="button" data-testid="swatch-zoom" onClick={() => setZoom({ src: activeFabric.image!, alt: `${activeFabric.name}, nærmynd` })} className="relative flex aspect-square items-center justify-center overflow-hidden border-2 border-transparent bg-white opacity-80 transition hover:opacity-100 group" aria-label={`Stækka sýnishorn ${activeFabric.name}`}>
              <ResponsiveImage src={activeFabric.image} alt="Nærmynd" sizes="120px" className="max-h-full max-w-full object-contain p-1" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" aria-hidden="true">
                <ZoomIn className="text-white" />
              </div>
            </button>
          )}
          {activeFabric.pattern && (
            <button type="button" onClick={() => setZoom({ src: activeFabric.pattern!, alt: `${activeFabric.name}, seinna lag` })} className="relative flex aspect-square items-center justify-center overflow-hidden border-2 border-transparent bg-white opacity-80 transition hover:opacity-100 group" aria-label={`Stækka seinna lag ${activeFabric.name}`}>
              <ResponsiveImage src={activeFabric.pattern} alt="Seinna lag" sizes="120px" className="max-h-full max-w-full object-contain p-1" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" aria-hidden="true">
                <ZoomIn className="text-white" />
              </div>
            </button>
          )}
        </div>
        <div className="min-w-0">
          <div className="relative flex w-full aspect-[4/3] max-h-[500px] items-center justify-center overflow-hidden bg-[#c8d6dc] p-4">
            <ResponsiveImage src={activeImage} alt={product.title} sizes="(min-width: 768px) 55vw, 100vw" className="max-h-full max-w-full object-contain transition-opacity duration-300" />

            <div className="absolute left-4 top-4 bg-[#f7f9fa]/90 px-3 py-2 text-[9px] uppercase tracking-[.18em]">{product.note}</div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#24313b]/60 to-transparent px-6 pb-6 pt-20 text-[10px] uppercase tracking-[.18em] text-[#f7f9fa]">Sérsmíðað eftir máli</div>
            <button
              type="button"
              data-testid="gallery-zoom"
              onClick={() => setZoom({ src: activeImage, alt: `${product.title}, stækkuð mynd` })}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center bg-[#f7f9fa]/90 text-[#24313b] transition hover:bg-white"
              aria-label="Stækka mynd"
            >
              <ZoomIn size={17} />
            </button>
          </div>
          {activeFabric.image ? (
            <button
              type="button"
              onClick={() => setZoom({ src: activeFabric.image!, alt: `${activeFabric.name}, nærmynd` })}
              className="mt-3 flex w-full items-center gap-3 border border-[#ccd9df] bg-[#f7f9fa] p-3 text-left transition hover:border-[#90a5ae]"
              aria-label={`Stækka valið efni ${activeFabric.name}`}
            >
              <span className={`flex h-16 shrink-0 items-center justify-center gap-1 overflow-hidden border border-[#ccd9df] bg-white ${activeFabric.pattern ? "w-28" : "w-16"}`}>
                <ResponsiveImage src={activeFabric.image} alt="" sizes={activeFabric.pattern ? "56px" : "64px"} className="max-h-full min-w-0 max-w-full object-contain p-1" />
                {activeFabric.pattern && <ResponsiveImage src={activeFabric.pattern} alt="" sizes="56px" className="max-h-full min-w-0 max-w-full object-contain p-1" />}
              </span>
              <span>
                <span className="block text-[9px] uppercase tracking-[.16em] text-[#667984]">Valið efni</span>
                <span className="mt-1 block text-sm text-[#24313b]">{activeFabric.name}</span>
              </span>
              <ZoomIn size={15} className="ml-auto text-[#667984]" aria-hidden="true" />
            </button>
          ) : activeFabric.tone ? (
            <div className="mt-3 flex items-center gap-3 border border-[#ccd9df] bg-[#f7f9fa] p-3">
              <span className="h-16 w-16 shrink-0 border border-[#ccd9df]" style={{ backgroundColor: activeFabric.tone }} />
              <span>
                <span className="block text-[9px] uppercase tracking-[.16em] text-[#667984]">Valið efni</span>
                <span className="mt-1 block text-sm text-[#24313b]">{activeFabric.name}</span>
              </span>
            </div>
          ) : (
            <div className="mt-3 flex items-center gap-3 border border-[#ccd9df] bg-[#f7f9fa] p-3">
              <span>
                <span className="block text-[9px] uppercase tracking-[.16em] text-[#667984]">Valið efni</span>
                <span className="mt-1 block text-sm text-[#24313b]">{activeFabric.name}</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="pt-2 md:sticky md:top-5 md:h-[calc(100vh-40px)] md:overflow-y-auto pr-2 custom-scrollbar pb-10">
        <p className="mb-4 text-[10px] uppercase tracking-[.26em] text-[#6892b8]">{product.category} / THEdoûr</p>
        <h1 className="font-serif text-[clamp(2.7rem,4.8vw,5.2rem)] leading-[.9] tracking-[-.06em]">{product.title}</h1>
        <div className="mt-7 flex items-end justify-between gap-5 border-b border-[#ccd9df] pb-5">
          <p className="text-sm text-[#5a6b74]">{product.subtitle}</p>
          <p data-testid="live-price" aria-live="polite" className="whitespace-nowrap font-serif text-2xl tracking-tight">{displayPriceISK.toLocaleString("is-IS")} kr.</p>
        </div>

        <div data-testid="config-card">{controls}</div>

        <div className="flex items-center gap-3 py-6 border-b border-[#ccd9df]">
          <div className="flex h-[51px] items-center border border-[#ccd9df]">
            <button type="button" onClick={() => changeQuantity(safeQuantity - 1)} className="grid h-full w-10 place-items-center" aria-label="Fækka fjölda" disabled={safeQuantity <= 1}><Minus size={14} /></button>
            <span className="w-7 text-center text-sm" aria-live="polite">{safeQuantity}</span>
            <button type="button" onClick={() => changeQuantity(safeQuantity + 1)} className="grid h-full w-10 place-items-center" aria-label="Auka fjölda" disabled={safeQuantity >= 99}><Plus size={14} /></button>
          </div>
          <button type="button" onClick={onAddToCart} disabled={!canAddToCart} data-testid="add-to-cart" className="flex h-[51px] flex-1 items-center justify-center gap-3 bg-[#a2c2e2] text-[10px] uppercase tracking-[.2em] transition hover:bg-[#89b0d5] text-[#24313b] font-medium disabled:cursor-not-allowed disabled:opacity-45">Bæta í körfu <ShoppingBag size={15} /></button>
        </div>
        
        <div id="upplýsingar" className="mt-4">
          {["Efni & ljós", "Mæling & uppsetning"].map((detail) => (
            <div key={detail} className="border-b border-[#ccd9df]">
              <button onClick={() => setOpenDetail(openDetail === detail ? null : detail)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[.18em]">
                {detail}<ChevronDown size={16} className={`transition ${openDetail === detail ? "rotate-180" : ""}`} />
              </button>
              {openDetail === detail && (
                <p className="max-w-md pb-5 text-sm leading-6 text-[#5a6b74]">
                  {detail === "Efni & ljós" ? `${product.title} er sérsmíðað kerfi frá THEdoûr. Veldu lit og uppsetningu sem hentar birtu, næði og loftflæði rýmisins.` : "Sláðu inn breidd og hæð hér að ofan til að senda inn rétta grunnstillingu fyrir tilboðið."}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {zoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 sm:p-10" role="dialog" aria-modal="true" aria-label="Stækkuð mynd" onMouseDown={(event) => { if (event.target === event.currentTarget) setZoom(null); }}>
          <div className="relative max-h-full max-w-full">
            <button ref={closeButtonRef} type="button" onClick={() => setZoom(null)} className="absolute right-2 top-2 z-10 grid h-10 w-10 place-items-center bg-[#f7f9fa] text-[#24313b]" aria-label="Loka stækkaðri mynd"><X size={18} /></button>
            <ResponsiveImage src={zoom.src} alt={zoom.alt} sizes="90vw" className="max-h-[90vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
