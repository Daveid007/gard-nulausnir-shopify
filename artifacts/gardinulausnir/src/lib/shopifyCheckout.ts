import type { CartItem } from "./cart";

type CheckoutLine = Record<string, unknown>;

/** Block purchases whenever an option cannot be represented by the server's pricing contract. */
export function checkoutLine(item: CartItem): CheckoutLine | null {
  if (item.needsReconfigure) return null;
  switch (item.type) {
    case "roller-workbook":
      return { type: item.type, qty: item.qty, productId: item.productId,
        configuration: item.configuration, fabricName: item.fabricName };
    case "honeycomb":
      if (!item.bottomRail || (item.sideTrack && item.sideTrackType === "l")) return null;
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        fabricCode: item.fabricCode, operation: item.operation, sideTrack: item.sideTrack,
        sideTrackType: "u", sideTrackColor: item.sideTrack ? item.sideTrackColor : undefined,
        noDrill: item.noDrill, mountPosition: item.mountPosition,
        railColor: item.railColor, bottomRail: item.bottomRail, holder: item.holder ?? null };
    case "honeycomb-25":
      if (item.noDrill || item.sideTrackType || item.mountPosition || !item.bottomRail) return null;
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        fabricCode: item.fabricCode, operation: item.operation, sideTrack: item.sideTrack,
        railColor: item.railColor, bottomRail: item.bottomRail, holder: item.holder ?? null };
    case "daynight":
      if (item.noDrill || item.sideTrackType || item.mountPosition) return null;
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        comboKey: item.comboKey, frontCode: item.frontCode, backCode: item.backCode,
        operation: item.operation, sideTrack: item.sideTrack, railColor: item.railColor };
    case "dualroller":
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        comboKey: item.comboKey, frontCode: item.frontCode, backCode: item.backCode,
        operation: item.operation, sideTrack: item.sideTrack, railColor: item.railColor };
    case "tdbu":
      if (item.operation === "cordless" || item.noDrill || item.sideTrackType || item.mountPosition) return null;
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        fabricCode: item.fabricCode, operation: item.operation, sideTrack: item.sideTrack, railColor: item.railColor };
    case "vertical":
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        fabricCode: item.fabricCode, operation: item.operation, openingType: item.openingType,
        railColor: item.railColor };
    case "zebra":
      return null; // Legacy fabric identifiers are not accepted by current server pricing.
    default:
      // Unsupported products must not silently lose configuration at checkout.
      return null;
  }
}

async function postOrder(path: string, items: CheckoutLine[], installation: boolean, expectedTotalIsk?: number) {
  const origin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "");
  if (!origin) throw new Error("Tenging við pöntunarþjónustu vantar á þessari vefsíðu.");
  const response = await fetch(origin + "/api/sol/" + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, installation, ...(expectedTotalIsk === undefined ? {} : { expectedTotalIsk }) }),
    signal: AbortSignal.timeout(90_000),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Pöntunarþjónustan svaraði ekki.");
  return data;
}

export async function quoteOrder(items: CheckoutLine[], installation = false): Promise<{ totalIsk: number; lines: Array<{ title: string; quantity: number; unitPriceIsk: number }> }> {
  const quote = await postOrder("quote", items, installation);
  if (quote.currency !== "ISK" || !Number.isSafeInteger(quote.totalIsk) || quote.totalIsk <= 0 ||
      quote.installationIsk !== 0 ||
      quote.totalIsk !== quote.subtotalIsk + quote.installationIsk || !Array.isArray(quote.lines))
    throw new Error("Ógilt verð barst frá pöntunarþjónustu.");
  return quote;
}

export async function createCheckout(items: CheckoutLine[], expectedTotalIsk: number, installation = false): Promise<string> {
  if (!Number.isSafeInteger(expectedTotalIsk) || expectedTotalIsk <= 0)
    throw new Error("Staðfestu verð áður en haldið er áfram.");
  const data = await postOrder("checkout", items, installation, expectedTotalIsk);
  if (typeof data.url !== "string" || new URL(data.url).protocol !== "https:")
    throw new Error("Ógildur greiðsluhlekkur barst.");
  return data.url;
}
