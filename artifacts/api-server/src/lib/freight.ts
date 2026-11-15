/** REV 5 air freight estimates; counts are per tariff group, area is actual m². */
export type FreightGroup = "roller" | "cellular" | "daynight";
export const FREIGHT_RATES = {
  roller: [37, 34, 31, 27, 25, 22],
  cellular: [34.5, 31.5, 28.5, 24.5, 22.5, 19.5],
  daynight: [36.5, 33.5, 30.5, 26.5, 24.5, 21.5],
} as const;
export function freightUsd(area: number, quantity: number, group: FreightGroup): number {
  if (!Number.isFinite(area) || area <= 0 || !Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid freight area or quantity");
  }
  const tier = quantity <= 3 ? 0 : quantity <= 7 ? 1 : quantity <= 10 ? 2 : quantity <= 14 ? 3 : quantity <= 18 ? 4 : 5;
  return area * FREIGHT_RATES[group][tier];
}
type FreightItem = {
  type: string; qty: number; width?: number; height?: number; mountPosition?: string;
  needsReconfigure?: boolean;
  configuration?: { family: string; widthCm: number; heightCm: number; mountPosition: string };
};
export function freightGroup(item: FreightItem): FreightGroup | undefined {
  const family = item.type === "roller-workbook" ? item.configuration?.family : item.type;
  if (family === "roller") return "roller";
  if (["zebra", "honeycomb", "honeycomb-25", "tdbu"].includes(family ?? "")) return "cellular";
  if (family === "daynight") return "daynight";
  return undefined;
}
export function orderFreightUsd(item: FreightItem, items: readonly FreightItem[]): number | undefined {
  const group = freightGroup(item);
  if (!group) return undefined;
  const quantity = items.filter(other => !other.needsReconfigure && freightGroup(other) === group)
    .reduce((total, other) => total + other.qty, 0);
  const config = item.configuration;
  const width = config ? config.widthCm * 10 : item.width!;
  const height = config ? config.heightCm * 10 : item.height!;
  const mount = config ? config.mountPosition : item.mountPosition;
  const deduction = group !== "roller" && mount === "inside" ? 5 : 0;
  return freightUsd((width - deduction) * height / 1e6, quantity, group);
}
