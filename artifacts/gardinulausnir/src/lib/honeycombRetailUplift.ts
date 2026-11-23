import { increasedRetailPriceIsk } from "./pricing.ts";

/** Apply U-track uplift first, then the global increase, each to rounded unit prices. */
export function honeycombRetailUplift(
  unitIsk: number,
  item: { type: string; sideTrack?: boolean; sideTrackType?: "u" | "l" },
): number {
  const current = item.type === "honeycomb" && item.sideTrack && (item.sideTrackType ?? "u") === "u"
    ? Math.round(unitIsk * 1.25)
    : unitIsk;
  return increasedRetailPriceIsk(current);
}
