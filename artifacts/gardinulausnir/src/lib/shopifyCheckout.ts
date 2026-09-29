import type { CartItem } from "./cart";

type CheckoutLine = Record<string, unknown>;

/** Block purchases whenever an option cannot be represented by the server's pricing contract. */
export function checkoutLine(item: CartItem): CheckoutLine | null {
  if (item.needsReconfigure) return null;
  switch (item.type) {
    case "honeycomb":
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
      return { type: item.type, qty: item.qty, width: item.width, height: item.height,
        fabricCode: item.fabricCode, operation: item.operation, railColor: item.railColor };
    default:
      // Workbook rollers, doors and other special products need supplier confirmation.
      return null;
  }
}

async function postOrder(path: string, items: CheckoutLine[]) {
  const origin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "");
  if (!origin) throw new Error("Tenging við pöntunarþjónustu vantar á þessari vefsíðu.");
  const response = await fetch(origin + "/api/sol/" + path, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Pöntunarþjónustan svaraði ekki.");
  return data;
}

export async function quoteOrder(items: CheckoutLine[]): Promise<{ totalIsk: number; lines: Array<{ title: string; quantity: number; unitPriceIsk: number }> }> {
  const quote = await postOrder("quote", items);
  if (!Number.isFinite(quote.totalIsk) || quote.totalIsk <= 0 || !Array.isArray(quote.lines))
    throw new Error("Ógilt verð barst frá pöntunarþjónustu.");
  return quote;
}

export async function createCheckout(items: CheckoutLine[]): Promise<string> {
  const data = await postOrder("checkout", items);
  if (typeof data.url !== "string" || new URL(data.url).protocol !== "https:")
    throw new Error("Ógildur greiðsluhlekkur barst.");
  return data.url;
}
