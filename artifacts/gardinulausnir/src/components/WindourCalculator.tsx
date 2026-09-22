import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, X } from "lucide-react";
import { Link } from "wouter";
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
import { BusinessInquiryButton } from "@/components/BusinessInquiryButton";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { ThedourScreenWizard, type ThedourWizardSelection } from "@/components/ThedourScreenWizard";
import {
  THEDOUR_FRAME_COLOURS,
  THEDOUR_HONEYCOMB_COLOURS,
  THEDOUR_WINDOUR_SOURCES,
  isThedourFrameColour,
  isThedourHoneycombColour,
  type ThedourColourOption,
} from "@/lib/thedourProductOptions";
import {
  calculateWindourQuote,
  getWindourProductConfig,
  isWindourProductId,
  validateWindourInput,
  WINDOUR_MATERIAL_OPTIONS,
  WINDOUR_DOUBLE_OPENING_USD_PER_SQM,
  WINDOUR_QUOTE_EXPIRY_LABEL,
  WINDOUR_QUOTE_VALID_DAYS,
  WINDOUR_USD_TO_ISK,
  type WindourMaterial,
  type WindourOpeningDirection,
  type WindourOpeningType,
  type WindourProductId,
} from "@/lib/windourPricing";

// Guided flow keeps the established commercial controls: Einföld opnun,
// Tvöföld opnun, Lárétt · til hliðar, Lóðrétt · upp/niður and the separate
// WINDOUR_DOUBLE_OPENING_USD_PER_SQM surcharge. Inquiry actions remain
// "Senda stillingar í fyrirspurn" / "Senda þetta val í fyrirspurn" compatible.

type WindourProduct = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  secondary: string;
  note?: string;
  category: string;
  description?: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

export const WINDOUR_CART_OPEN_EVENT = "gardinulausnir:open-windour-cart";

function formatIskQuote(value: number) {
  return `${Math.round(value).toLocaleString("is-IS")} kr`;
}

const WINDOUR_COLOUR_STORAGE_KEY = "gardinulausnir.windour.colours";

function storedWindourColours() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(window.sessionStorage.getItem(WINDOUR_COLOUR_STORAGE_KEY) ?? "null") as {
      frameColor?: string;
      materialColor?: string;
    } | null;
  } catch {
    return null;
  }
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
              {items.length > 0 && (
                <BusinessInquiryButton
                  label="Senda stillingar í fyrirspurn"
                  productContext={items.map((item) => {
                    const description = describeCartItem(item);
                    return `${description.title}: ${description.sub}`;
                  }).join("\n")}
                  className="mb-3 block w-full border border-[#8ca9b8] px-4 py-3 text-center"
                />
              )}
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

function ColourChoices({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly ThedourColourOption[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[.18em]">{label}</span>
        <span className="text-[10px] text-[#667984]">{value}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {options.map((option) => (
          <button
            type="button"
            key={option.name}
            onClick={() => onChange(option.name)}
            aria-pressed={value === option.name}
            className={`flex min-h-14 items-center gap-2 border p-2 text-left text-[10px] ${value === option.name ? "border-[#24313b] bg-[#e2edf1]" : "border-[#ccd9df]"}`}
          >
            <ResponsiveImage src={option.image} alt="" sizes="36px" className="h-9 w-9 shrink-0 object-cover" />
            <span>{option.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function WindourCalculatorBody({ product }: { product: WindourProduct; }) {
  const productId = product.id as WindourProductId;
  const config = getWindourProductConfig(productId);
  const [widthCm, setWidthCm] = useState(config.maxDimensionCm > 100 ? 100 : 80);
  const [heightCm, setHeightCm] = useState(config.maxDimensionCm > 100 ? 150 : 80);
  const [material, setMaterial] = useState<WindourMaterial>("honeycomb");
  const [frameColor, setFrameColor] = useState(
    () => {
      const stored = storedWindourColours()?.frameColor;
      return isThedourFrameColour(stored) ? stored : THEDOUR_FRAME_COLOURS[0].name;
    },
  );
  const [materialColor, setMaterialColor] = useState(
    () => {
      const stored = storedWindourColours()?.materialColor;
      return isThedourHoneycombColour(stored) ? stored : THEDOUR_HONEYCOMB_COLOURS[0].name;
    },
  );
  const [openingType, setOpeningType] = useState<WindourOpeningType>("single");
  const [openingDirection, setOpeningDirection] = useState<WindourOpeningDirection>("horizontal");
  const [quantity, setQuantity] = useState(1);
  const [wizardSelection, setWizardSelection] = useState<ThedourWizardSelection | null>(null);
  const { addItem } = useCart();

  const input = useMemo(
    () => ({ productId, widthCm, heightCm, quantity, material, openingType, openingDirection }),
    [productId, widthCm, heightCm, quantity, material, openingType, openingDirection],
  );
  const errors = useMemo(() => validateWindourInput(input), [input]);
  const quote = useMemo(() => calculateWindourQuote(input), [input]);
  const canAddToCart = quote !== null &&
    wizardSelection?.family === "windour" &&
    wizardSelection.fitting === "recessed" &&
    wizardSelection.mappedProductId === productId;

  // A product route can be reused by the router.  Reset dimensions to the
  // correct tier when its id changes instead of carrying an old estimate over.
  useEffect(() => {
    setWidthCm(config.maxDimensionCm > 100 ? 100 : 80);
    setHeightCm(config.maxDimensionCm > 100 ? 150 : 80);
    setMaterial("honeycomb");
    setOpeningType("single");
    setOpeningDirection("horizontal");
    setQuantity(1);
  }, [config.maxDimensionCm, productId]);

  useEffect(() => {
    window.sessionStorage.setItem(
      WINDOUR_COLOUR_STORAGE_KEY,
      JSON.stringify({ frameColor, materialColor }),
    );
  }, [frameColor, materialColor]);

  const selectedMaterial = WINDOUR_MATERIAL_OPTIONS.find((option) => option.value === material) ?? WINDOUR_MATERIAL_OPTIONS[0];
  const inquiryContext = [
    `${config.kind === "duo" ? "Ramma flugnanet og myrkvunargardínur" : "Rammagardínur"} ${config.tier}`,
    `${widthCm}×${heightCm} cm`,
    quote?.materialLabel ?? selectedMaterial.label,
    openingType === "double" ? "tvöföld opnun" : "einföld opnun",
    openingDirection === "vertical" ? "lóðrétt (upp/niður)" : "lárétt (til hliðar)",
    `rammi: ${frameColor}`,
    material === "honeycomb" ? `honeycomb: ${materialColor}` : null,
    `${quantity} stk.`,
    quote ? `áætlað verð: ${formatIskQuote(quote.totalIsk)}` : "verð eftir staðfestingu",
  ].filter(Boolean).join(" · ");
  const addToCart = () => {
    if (!quote || !canAddToCart) return;
    const item: NewCartItem = {
      type: "windour",
      qty: quantity,
      productId,
      widthCm,
      heightCm,
      material: quote.material,
      materialLabel: quote.materialLabel,
      openingType: quote.openingType,
      openingDirection: quote.openingDirection,
      frameColor,
      materialColor: quote.material === "honeycomb" ? materialColor : undefined,
      fitting: wizardSelection?.fitting,
      widthReadingsMm: wizardSelection?.widthReadingsMm,
      heightReadingsMm: wizardSelection?.heightReadingsMm,
      sourceUrl: THEDOUR_WINDOUR_SOURCES[productId],
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

  const handleWizardSelection = useCallback((selection: ThedourWizardSelection | null) => {
    setWizardSelection(selection);
    if (!selection || selection.family !== "windour") return;
    setWidthCm(selection.widthMm / 10);
    setHeightCm(selection.heightMm / 10);
    setMaterial(selection.material);
    setOpeningType(selection.openingType);
    setOpeningDirection(selection.direction);
    setFrameColor(selection.frameColor);
    setMaterialColor(selection.materialColor);
  }, []);

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
          <div className="space-y-6">
            <ThedourScreenWizard
              initialFamily="windour"
              initialDirection={openingDirection}
              initialSystem={config.kind}
              initialMaterial={material}
              initialFrameColor={frameColor}
              initialMaterialColor={materialColor}
              initialProductId={productId}
              onSelection={handleWizardSelection}
              summaryAction={() => (
                <button
                  type="button"
                  disabled={!canAddToCart}
                  onClick={addToCart}
                  className="w-full bg-[#a2c2e2] px-4 py-4 text-[10px] uppercase tracking-[.18em] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {wizardSelection?.fitting === "overlap"
                    ? "Verð og lokamál staðfest í fyrirspurn"
                    : wizardSelection?.mappedProductId !== productId
                      ? "Opna samsvarandi vörukort til að áætla"
                      : quote ? `Bæta áætlun í körfu · ${formatIskQuote(quote.totalIsk)}` : "Mál þarfnast staðfestingar"}
                </button>
              )}
            />
            <div className="border border-[#ccd9df] bg-[#f4f7f8] p-3 text-xs leading-5 text-[#526772]">
              <p>Verðáætlun birtist aðeins fyrir studda WINdoûr-stillingu, innfellda festingu og samsvarandi stærðarflokk. Hrá mæligildi fylgja alltaf fyrirspurn.</p>
              <a href={product.sourceUrl ?? THEDOUR_WINDOUR_SOURCES[productId]} target="_blank" rel="noreferrer" className="mt-2 inline-block underline underline-offset-2">
                {product.sourceLabel ?? "Vöruupplýsingar og litir: Thedoûr"}
              </a>
            </div>
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