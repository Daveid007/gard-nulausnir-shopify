import { ReactNode, useEffect, useRef, useState } from "react";
import { ChevronDown, Minus, Plus, ShoppingBag, ZoomIn, X } from "lucide-react";
import { normalizeQuantity } from "@/lib/quantity";

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
    <div data-testid="product-box" className="grid gap-8 md:grid-cols-[minmax(0,1.12fr)_minmax(370px,.88fr)] md:gap-14">
      {/* LEFT COLUMN */}
      <div data-testid="gallery" className="grid grid-cols-[.27fr_.73fr] gap-3 md:gap-5">
        <div className="flex flex-col gap-3 md:gap-5">
          <button type="button" onClick={() => setImageView("primary")} className={`relative aspect-[.72] overflow-hidden border-2 ${imageView === "primary" ? "border-[#24313b]" : "border-transparent opacity-65"}`} aria-label="Skoða aðalmynd">
            <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
          </button>
          <button type="button" onClick={() => setImageView("secondary")} className={`relative aspect-[.72] overflow-hidden border-2 transition hover:opacity-100 ${imageView === "secondary" ? "border-[#24313b]" : "border-transparent opacity-65"}`} aria-label="Skoða aðra mynd">
            <img src={product.secondary} alt={`${product.title}, önnur sýn`} className="h-full w-full object-cover" />
          </button>
          {activeFabric.image && (
            <button type="button" data-testid="swatch-zoom" onClick={() => setZoom({ src: activeFabric.image!, alt: `${activeFabric.name}, nærmynd` })} className="relative aspect-square overflow-hidden border-2 border-transparent opacity-80 hover:opacity-100 transition group bg-white" aria-label={`Stækka sýnishorn ${activeFabric.name}`}>
              <img src={activeFabric.image} alt="Nærmynd" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition" aria-hidden="true">
                <ZoomIn className="text-white" />
              </div>
            </button>
          )}
        </div>
        <div className="relative overflow-hidden bg-[#c8d6dc] min-h-[550px] md:min-h-[760px]">
          <img src={activeImage} alt={product.title} className="h-full w-full object-cover object-center transition-opacity duration-300" />
          
          {activeFabric.pattern ? (
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-300" style={{ backgroundImage: `url(${activeFabric.pattern})`, backgroundSize: '150px' }} />
          ) : activeFabric.image ? (
            <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-multiply transition-opacity duration-300" style={{ backgroundImage: `url(${activeFabric.image})`, backgroundSize: '150px' }} />
          ) : activeFabric.tone ? (
            <div className="pointer-events-none absolute inset-0 mix-blend-color opacity-30 transition-colors duration-300" style={{ backgroundColor: activeFabric.tone }} />
          ) : null}

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
          {["Efni & ljós", "Mæling & uppsetning", "Sendingar & skil"].map((detail) => (
            <div key={detail} className="border-b border-[#ccd9df]">
              <button onClick={() => setOpenDetail(openDetail === detail ? null : detail)} className="flex w-full items-center justify-between py-5 text-left text-[10px] uppercase tracking-[.18em]">
                {detail}<ChevronDown size={16} className={`transition ${openDetail === detail ? "rotate-180" : ""}`} />
              </button>
              {openDetail === detail && (
                <p className="max-w-md pb-5 text-sm leading-6 text-[#5a6b74]">
                  {detail === "Efni & ljós" ? `${product.title} er sérsmíðað kerfi frá THEdoûr. Veldu lit og uppsetningu sem hentar birtu, næði og loftflæði rýmisins.` : detail === "Mæling & uppsetning" ? "Sláðu inn breidd og hæð hér að ofan til að senda inn rétta grunnstillingu fyrir tilboðið." : "Upplýsingar um afhendingu og skilmála eru staðfestar áður en pöntun er samþykkt."}
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
            <img src={zoom.src} alt={zoom.alt} className="max-h-[90vh] max-w-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
