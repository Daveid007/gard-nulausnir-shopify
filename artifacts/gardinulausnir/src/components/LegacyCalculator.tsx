import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { CartProvider, describeCartItem, formatIsk, priceLineIsk, useCart } from "@/lib/cart";
import { checkoutLine, createCheckout, quoteOrder } from "@/lib/shopifyCheckout";
import { RailColorProvider } from "@/lib/railColor";
import { PriceCalculator, type RollerProductIdentity } from "@/components/legacy-calculators/PriceCalculator";
import HoneycombCalculator from "@/components/legacy-calculators/HoneycombCalculator";
import Honeycomb25Calculator from "@/components/legacy-calculators/Honeycomb25Calculator";
import DayNightCalculator from "@/components/legacy-calculators/DayNightCalculator";
import TDBUCalculator from "@/components/legacy-calculators/TDBUCalculator";
import VerticalCalculator from "@/components/legacy-calculators/VerticalCalculator";
import DualRollerCalculator from "@/components/legacy-calculators/DualRollerCalculator";
import ZebraBlindCalculator from "@/components/legacy-calculators/ZebraBlindCalculator";
import RollerWorkbookCalculator, { type RollerWorkbookProductIdentity } from "@/components/legacy-calculators/RollerWorkbookCalculator";
import OpenRollExampleCalculator from "@/components/OpenRollExampleCalculator";

export type LegacyCalculatorKind =
  | "roller"
  | "honeycomb-45"
  | "honeycomb-25"
  | "day-night"
  | "tdbu"
  | "vertical"
  | "dual-roller"
  | "zebra"
  | "roller-workbook"
  | "open-roll-example";

export const LEGACY_CART_OPEN_EVENT = "gardinulausnir:open-cart";

function CalculatorCartStatus() {
  const { items, itemCount, totalIsk, isOpen, setOpen, removeItem, clear } = useCart();
  const [checkoutBusy, setCheckoutBusy] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const canCheckout = items.length > 0 && items.length <= 50 && items.every((item) => checkoutLine(item) !== null);

  async function handleCheckout() {
    if (!canCheckout || checkoutBusy) return;
    setCheckoutError("");
    setCheckoutBusy(true);
    try {
      const lines = items.map(checkoutLine).filter((line): line is NonNullable<typeof line> => line !== null);
      const quote = await quoteOrder(lines);
      const breakdown = quote.lines.map((line) => line.title + " · " + line.quantity + " × " + formatIsk(line.unitPriceIsk)).join("\n");
      const approved = window.confirm("Staðfest verð frá pöntunarþjónustu:\n" + breakdown + "\n\nSamtals: " + formatIsk(quote.totalIsk) + "\n\nHalda áfram í Shopify-greiðslu?");
      if (!approved) return;
      const url = await createCheckout(lines);
      window.location.assign(url);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : "Ekki tókst að opna Shopify-greiðslu.");
    } finally {
      setCheckoutBusy(false);
    }
  }

  useEffect(() => {
    const openCart = () => setOpen(true);
    window.addEventListener(LEGACY_CART_OPEN_EVENT, openCart);
    return () => window.removeEventListener(LEGACY_CART_OPEN_EVENT, openCart);
  }, [setOpen]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-[#24313b]/35" role="dialog" aria-label="Staðbundin karfa">
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
                        {item.needsReconfigure ? (
                          <p className="mt-2 text-xs font-medium text-amber-700">Þessi eldri lína þarf að vera endurstillt áður en verð er notað.</p>
                        ) : (
                          <p className="mt-2 text-xs">{"Áætlun: " + formatIsk(priceLineIsk(item))}</p>
                        )}
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
                <span>{"Áætlun: " + formatIsk(totalIsk)}</span>
              </div>
              <button type="button" onClick={handleCheckout} disabled={!canCheckout || checkoutBusy} className="w-full bg-[#a2c2e2] py-4 text-[10px] uppercase tracking-[.18em] disabled:cursor-not-allowed disabled:opacity-50">
                {checkoutBusy ? "Staðfesti verð…" : "Staðfesta verð og greiða í Shopify"}
              </button>
              {!canCheckout && items.length > 0 && <p className="mt-3 text-xs leading-5 text-[#667984]">Þessi uppsetning þarfnast staðfestingar áður en hægt er að greiða. <a className="underline" href="mailto:hallo@gardinulausnir.is">Hafðu samband</a>.</p>}
              {checkoutError && <p role="alert" className="mt-3 text-xs text-red-700">{checkoutError}</p>}
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

function CalculatorBody({ kind, rollerProduct, workbookProduct, product }: { kind: LegacyCalculatorKind; rollerProduct?: RollerProductIdentity; workbookProduct?: RollerWorkbookProductIdentity; product: any }) {
  switch (kind) {
    case "roller":
      return <PriceCalculator productIdentity={rollerProduct} product={product} />;
    case "honeycomb-45":
      return <HoneycombCalculator product={product} />;
    case "honeycomb-25":
      return <Honeycomb25Calculator product={product} />;
    case "day-night":
      return <DayNightCalculator product={product} />;
    case "tdbu":
      return <TDBUCalculator product={product} />;
    case "vertical":
      return <VerticalCalculator product={product} />;
    case "dual-roller":
      return <DualRollerCalculator product={product} />;
    case "zebra":
      return <ZebraBlindCalculator product={product} />;
    case "roller-workbook":
      return workbookProduct ? <RollerWorkbookCalculator product={product} productIdentity={workbookProduct} /> : null;
    case "open-roll-example":
      return <OpenRollExampleCalculator product={product} />;
  }
}

export function LegacyCalculator({ kind, rollerProduct, workbookProduct, product }: { kind: LegacyCalculatorKind; rollerProduct?: RollerProductIdentity; workbookProduct?: RollerWorkbookProductIdentity; product: any }) {
  return (
    <CartProvider>
      <RailColorProvider>
        <div id="legacy-calculator" className="text-[#24313b]">
          <CalculatorCartStatus />
          <CalculatorBody kind={kind} rollerProduct={rollerProduct} workbookProduct={workbookProduct} product={product} />
        </div>
      </RailColorProvider>
    </CartProvider>
  );
}
