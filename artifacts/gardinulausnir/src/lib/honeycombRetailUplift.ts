/** Apply only to new 45 mm Honeycomb U-track retail quotes, after unit rounding. */
export function honeycombRetailUplift(
  unitIsk: number,
  item: { type: string; sideTrack?: boolean; sideTrackType?: "u" | "l" },
): number {
  return item.type === "honeycomb" && item.sideTrack && (item.sideTrackType ?? "u") === "u"
    ? Math.round(unitIsk * 1.25)
    : unitIsk;
}
