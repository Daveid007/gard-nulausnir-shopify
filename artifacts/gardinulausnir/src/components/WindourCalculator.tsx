import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, X } from "lucide-react";
import { StorefrontLayout } from "@/components/legacy-calculators/StorefrontLayout";
import {
  CartProvider,
  describeCartItem,
  formatIsk,
  priceLineIsk,
  useCart,
  type NewCartItem,
} from "@/lib/cart";
import { normalizeQuantity } from "@/lib/quantity";
import {
  calculateWindourQuote,
  getWindourProductConfig,
  isWindourProductId,
  validateWindourInput,
  WINDOUR_MATERIAL_OPTIONS,
  WINDOUR_QUOTE_EXPIRY_LABEL,
  WINDOUR_QUOTE_VALID_DAYS,
  WINDOUR_USD_TO_ISK,
  type WindourMaterial,
  type WindourProductId,
} from "@/lib/windourPricing";

type WindourProduct = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  secondary: string;
  note?: string;
  category: string;
};

export const WINDOUR_CART_OPEN_EVENT = "gardinulausnir:open-windour-cart";

function formatIskQuote(value: number) {
  return `${Math.round(value).toLocaleString("is-IS")} kr`;
}

function WindourCartStatus() {
  const { items, itemCount, totalIsk, isOpen, setOpen, removeItem, clear } = useCart();

  useEffect(() => {
    const openCart = () => setOpen(true);
    window.addEventListener(WINDOUR_CART_OPEN_EVENT, openCart);
    return () => window.removeEventListener(WINDOUR_CART_OPEN_EVENT, openCart);
  }, [setOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#24313b]/35" role="dialog" aria-label="Áætlunarkarfa">
          <aside className="ml-auto flex h-full w-full max-w-md flex-col bg-[#f7f9fa] p-6 text-[#24313b] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#ccd9df] pb-5">
              <div>
                <p className="text-[10px] uppercase tracking-[.2em]">Áætlunarkarfa / {itemCount} vörur</p>
                <p className="mt-2 text-xs text-[#667984]">Provisional estimate · ekki bindandi verð</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Loka áætlunarkörfu">
                <X size={18} />
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
                        <p className="mt-2 text-xs">{formatIsk(priceLineIsk(item))}</p>
                      </div>
                      <button type="button" onClick={() => removeItem(item.id)} className="text-[10px] uppercase tracking-[.14em] text-[#667984]">
                        Fjarlægja
                      </button>
                    </div>
                  </div>
                );
              }) : (
                <p className="py-10 text-center text-sm text-[#667984]">Áætlunarkarfan er tóm.</p>
              )}
            </div>
            <div className="border-t border-[#ccd9df] pt-5">
              <div className="mb-5 flex justify-between font-serif text-2xl">
                <span>Áætlað samtals</span>
                <span>{formatIsk(totalIsk)}</span>
              </div>
              <p className="mb-4 text-xs leading-5 text-[#667984]">
                Áætlað verð með flutningi og VSK. Efni, gerð og framboð þarf að staðfesta við birgi.
              </p>
              <button type="button" disabled className="w-full cursor-not-allowed bg-[#dbe9ee] py-4 text-[10px] uppercase tracking-[.18em] text-[#526772]">
                Greiðsla óvirk — staðfesting vantar
              </button>
              {items.length > 0 && (
                <button type="button" onClick={clear} className="mt-3 w-full py-2 text-[10px] uppercase tracking-[.16em] text-[#667984]">
                  Tæma áætlunarkörfu
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function WindourCalculatorBody({ product }: { product: WindourProduct; }) {
  const productId = product.id as WindourProductId;
  const config = getWindourProductConfig(productId);
  const [widthCm, setWidthCm] = useState(config.maxDimensionCm > 100 ? 100 : 80);
  const [heightCm, setHeightCm] = useState(config.maxDimensionCm > 100 ? 150 : 80);
  const [material, setMaterial] = useState<WindourMaterial>("honeycomb");
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const input = useMemo(
    () => ({ productId, widthCm, heightCm, quantity, material }),
    [productId, widthCm, heightCm, quantity, material],
  );
  const errors = useMemo(() => validateWindourInput(input), [input]);
  const quote = useMemo(() => calculateWindourQuote(input), [input]);
  const canAddToCart = quote !== null;

  // A product route can be reused by the router.  Reset dimensions to the
  // correct tier when its id changes instead of carrying an old estimate over.
  useEffect(() => {
    setWidthCm(config.maxDimensionCm > 100 ? 100 : 80);
    setHeightCm(config.maxDimensionCm > 100 ? 150 : 80);
    setMaterial("honeycomb");
    setQuantity(1);
  }, [config.maxDimensionCm, productId]);

  const selectedMaterial = WINDOUR_MATERIAL_OPTIONS.find((option) => option.value === material) ?? WINDOUR_MATERIAL_OPTIONS[0];
  const addToCart = () => {
    if (!quote) return;
    const item: NewCartItem = {
      type: "windour",
      qty: quantity,
      productId,
      widthCm,
      heightCm,
      material: quote.material,
      materialLabel: quote.materialLabel,
      supplierUsdPerSqm: quote.supplierUsdPerSqm,
      chargeableSqm: quote.chargeableSqm,
      unitIsk: quote.unitIsk,
      quoteStatus: "provisional",
      supplierConfirmationPending: true,
      quoteExpiresInDays: WINDOUR_QUOTE_VALID_DAYS,
      quoteExpiryLabel: WINDOUR_QUOTE_EXPIRY_LABEL,
    };
    addItem(item);
  };

  return (
    <>
      <WindourCartStatus />
      <StorefrontLayout
        product={product}
        priceISK={quote?.totalIsk ?? 0}
        priceText={quote ? formatIskQuote(quote.totalIsk) : "—"}
        priceLabel="ÁÆTLAÐ VERÐ"
        activeFabric={{ name: quote?.materialLabel ?? selectedMaterial.label }}
        quantity={quantity}
        setQuantity={(next) => setQuantity(normalizeQuantity(next))}
        canAddToCart={canAddToCart}
        onAddToCart={addToCart}
        roundPricePerUnit={false}
        priceRounding="exact"
        controls={
          <div className="space-y-6 border-b border-[#ccd9df] py-6">
            <div className="border border-[#e4c9a8] bg-[#fff8ef] p-4 text-xs leading-5 text-[#5b4634]">
              <div className="flex items-start gap-2">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                <p>
                  <strong>Bráðabirgðaáætlun, ekki fast verð.</strong> C2B-fjölskylda,
                  módel og efnisval eru óstaðfest hjá birgi. Staðfesting birgis er
                  nauðsynleg áður en pöntun eða greiðsla getur farið fram.
                </p>
              </div>
              <p className="mt-2">
                Tilboð birgis frá 4. júlí 2026 gilti í 30 daga og er útrunnið.
                Endanlegt verð og gildistími bíða staðfestingar birgis.
              </p>
            </div>

            {config.kind === "single" && (
              <div>
                <span className="mb-3 block text-[10px] uppercase tracking-[.18em]">Efni · val fyrir Single</span>
                <div className="space-y-2">
                  {WINDOUR_MATERIAL_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => setMaterial(option.value)}
                      aria-pressed={material === option.value}
                      className={`flex w-full items-center justify-between border px-3 py-3 text-left text-[11px] ${material === option.value ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
                    >
                      <span className="flex items-center gap-2">
                        {material === option.value && <Check size={14} />}
                        {option.label}
                      </span>
                      <span className="text-[#667984]">{option.supplierUsdPerSqm} USD/m²</span>
                    </button>
                  ))}
                </div>
                {errors.material && <p className="mt-2 text-xs text-red-700">{errors.material}</p>}
              </div>
            )}

            {config.kind === "duo" && (
              <div className="border border-[#ccd9df] bg-[#f4f7f8] p-3 text-xs leading-5 text-[#526772]">
                <strong>Integrated Duo · 37 USD/m².</strong> Þetta er eitt samþætt
                kerfi (myrkvun + net). Viðbótargjald fyrir tvöfalda opnun er
                ekki innifalið; sú útfærsla er ekki valin hér.
              </div>
            )}

            <div>
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[.18em]">Mál · sentímetrar</span>
                <span className="text-[10px] text-[#667984]">Tier {config.tier} · max {config.maxDimensionCm} cm</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Breidd · cm</span>
                  <input aria-label="Breidd í sentímetrum" data-testid="windour-width" type="number" min="0.1" max={config.maxDimensionCm} step="0.1" value={widthCm} onChange={(event) => setWidthCm(Number(event.target.value))} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#24313b]" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-[9px] uppercase tracking-[.14em] text-[#667984]">Hæð · cm</span>
                  <input aria-label="Hæð í sentímetrum" data-testid="windour-height" type="number" min="0.1" max={config.maxDimensionCm} step="0.1" value={heightCm} onChange={(event) => setHeightCm(Number(event.target.value))} className="w-full border border-[#ccd9df] bg-transparent px-3 py-3 text-sm outline-none focus:border-[#24313b]" />
                </label>
              </div>
              {(errors.width || errors.height) && (
                <p className="mt-2 text-xs text-red-700">{errors.width ?? errors.height}</p>
              )}
              <p className="mt-3 text-xs leading-5 text-[#667984]">
                Raunflatarmál er {quote?.rawSqm.toFixed(2) ?? "—"} m². Lágmarks
                gjaldflötur er aðeins bráðabirgðaforsenda: {config.minimumChargeableSqm} m²
                fyrir {config.kind === "single" ? "Single" : "Duo"}.
              </p>
            </div>

            {quote && (
              <div className="border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <span className="text-[10px] uppercase tracking-[.18em]">Áætlað verð · með sendingu og VSK</span>
                  <strong className="font-serif text-2xl">{formatIskQuote(quote.totalIsk)}</strong>
                </div>
                <div className="space-y-1 text-xs text-[#526772]">
                  <div className="flex justify-between"><span>Birgjakostnaður</span><span>{quote.supplierProductUsd.toFixed(2)} USD · {formatIskQuote(quote.supplierProductUsd * WINDOUR_USD_TO_ISK)}</span></div>
                  <div className="flex justify-between"><span>Áætluð sending (100%)</span><span>{quote.estimatedShippingUsd.toFixed(2)} USD · {formatIskQuote(quote.estimatedShippingUsd * WINDOUR_USD_TO_ISK)}</span></div>
                  <div className="flex justify-between"><span>VSK (24%)</span><span>{quote.estimatedVatUsd.toFixed(2)} USD · {formatIskQuote(quote.estimatedVatUsd * WINDOUR_USD_TO_ISK)}</span></div>
                  <div className="flex justify-between border-t border-[#b9d0dd] pt-2 font-medium text-[#24313b]"><span>Per stk. · námundað einu sinni</span><span>{formatIskQuote(quote.unitIsk)}</span></div>
                  {quantity > 1 && <div className="flex justify-between font-medium text-[#24313b]"><span>× {quantity} stk.</span><span>{formatIskQuote(quote.totalIsk)}</span></div>}
                </div>
              </div>
            )}
            {!quote && <p className="text-xs text-[#667984]">Sláðu inn gild mál til að sjá áætlað verð.</p>}
          </div>
        }
      />
    </>
  );
}

export default function WindourCalculator({ product }: { product: WindourProduct }) {
  if (!isWindourProductId(product.id)) return null;
  return (
    <CartProvider>
      <WindourCalculatorBody product={product} />
    </CartProvider>
  );
}