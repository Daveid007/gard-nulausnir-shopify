/**
 * Server-local implementation of the Roller Blinds workbook calculator.
 * Keep this in lockstep with the browser calculator; it intentionally has no
 * cross-artifact imports so the API package remains deployable on its own.
 */
import { rollerWorkbookFabrics, rollerWorkbookFamilies, type RollerWorkbookFabric, type RollerWorkbookFamily } from "./rollerWorkbookFabrics.ts";

export { rollerWorkbookFabrics, rollerWorkbookFamilies };
export type { RollerWorkbookFabric, RollerWorkbookFamily };
export type RollerWorkbookOperation = "manual" | "cordless" | "motor";
export type ManualControl = "cord" | "plastic-chain" | "steel-chain";
export type MotorType = "battery-standard" | "battery-wifi" | "battery-zigbee" | "wired" | "wired-wifi";
export type MountPosition = "inside" | "outside";
export type SideTrack = "none" | "u-white" | "u-grey" | "l-white" | "l-black";
export const ROLLER_WORKBOOK_CASSETTES = ["Square with fabric inserted", "Arc with fabric inserted"] as const;
export type RollerWorkbookCassette = (typeof ROLLER_WORKBOOK_CASSETTES)[number];
export type RollerWorkbookSizeLimits = { minWidthMm: number; maxWidthMm: number; minHeightMm: number; maxHeightMm: number; maxAreaSqm: number };
export type RollerWorkbookQuoteInput = {
  family: RollerWorkbookFamily; fabricCode: string; widthCm: number; heightCm: number; quantity: number;
  operation: RollerWorkbookOperation; manualControl?: ManualControl; motorType?: MotorType; remote?: boolean;
  hub?: boolean; noDrill?: boolean; mountPosition: MountPosition; track?: SideTrack; cassette: string;
};
export type RollerWorkbookQuoteFailure = { ok: false; errors: readonly string[] };
export type RollerWorkbookQuoteSuccess = {
  ok: true; fabric: RollerWorkbookFabric; operation: RollerWorkbookOperation; manualControl?: ManualControl; motorType?: MotorType;
  mountPosition: MountPosition; cassette: RollerWorkbookCassette; track: SideTrack; remote: boolean; hub: boolean; noDrill: boolean; quantity: number;
  enteredWidthMm: number; effectiveWidthMm: number; heightMm: number; actualAreaSqm: number; billedAreaSqm: number; limits: RollerWorkbookSizeLimits;
  supplier: { fabricUsd: number; areaOptionsUsd: number; motorUsd: number; remoteUsd: number; hubUsd: number; trackUsd: number; cassetteUsd: 0; unitUsd: number; totalUsd: number };
  retail: { unitIsk: number; totalIsk: number }; notes: readonly string[];
};
export type RollerWorkbookQuoteResult = RollerWorkbookQuoteSuccess | RollerWorkbookQuoteFailure;

const RETAIL_FACTOR = 2 * (1 / 0.6) * 121.16 * 1.24;
export const ROLLER_WORKBOOK_SUPPLIER_PRICES = {
  motor: { "battery-standard": 38, "battery-wifi": 38, "battery-zigbee": 44, wired: 30, "wired-wifi": 38 } satisfies Record<MotorType, number>,
  remote: 7, hub: 22, cordlessPerSqm: 3, noDrillPerSqm: 3, steelChainPerSqm: 0.5, trackPerMetre: { u: 10, l: 5 },
} as const;
const fabricByCode = new Map(rollerWorkbookFabrics.map((fabric) => [fabric.code, fabric]));
const families = new Set<string>(rollerWorkbookFamilies);
const operations = new Set<string>(["manual", "cordless", "motor"]);
const motors = ROLLER_WORKBOOK_SUPPLIER_PRICES.motor;
const tracks: Record<RollerWorkbookFamily, readonly SideTrack[]> = {
  roller: ["none", "u-white", "u-grey", "l-white", "l-black"], zebra: ["none", "l-white", "l-black"],
  sheer: ["none", "u-white", "l-white"], butterfly: ["none"],
};
const controls: Record<RollerWorkbookFamily, readonly ManualControl[]> = {
  roller: ["cord", "plastic-chain", "steel-chain"], zebra: ["cord", "plastic-chain", "steel-chain"],
  sheer: ["cord"], butterfly: ["cord", "plastic-chain", "steel-chain"],
};
export const ROLLER_WORKBOOK_SIZE_LIMITS: Readonly<Record<RollerWorkbookFamily, Partial<Record<RollerWorkbookOperation, RollerWorkbookSizeLimits>>>> = {
  roller: { manual: { minWidthMm: 300, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 5 }, cordless: { minWidthMm: 300, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2000, maxAreaSqm: 4 }, motor: { minWidthMm: 520, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 5 } },
  zebra: { manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2600, maxAreaSqm: 5.5 }, cordless: { minWidthMm: 500, maxWidthMm: 1800, minHeightMm: 500, maxHeightMm: 2000, maxAreaSqm: 3.5 }, motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2600, maxAreaSqm: 5.5 } },
  sheer: { manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 }, motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 } },
  butterfly: { manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 }, motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 } },
};
export function getRollerWorkbookSizeLimits(family: RollerWorkbookFamily, operation: RollerWorkbookOperation, fabricCode?: string): RollerWorkbookSizeLimits | undefined {
  const limit = ROLLER_WORKBOOK_SIZE_LIMITS[family]?.[operation];
  const fabric = fabricCode?.trim() ? fabricByCode.get(fabricCode.trim()) : undefined;
  return limit && fabric?.family === "sheer" && operation === "motor" && fabric.size === "100mm" ? { ...limit, minWidthMm: 800 } : limit;
}
const positive = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value) && value > 0;
export function validateRollerWorkbookQuote(input: RollerWorkbookQuoteInput): readonly string[] {
  const errors: string[] = [], fabric = typeof input.fabricCode === "string" ? fabricByCode.get(input.fabricCode.trim()) : undefined;
  if (!families.has(input.family)) errors.push(`Unknown family "${String(input.family)}".`);
  if (typeof input.fabricCode !== "string" || !input.fabricCode.trim()) errors.push("fabricCode is required.");
  else if (!fabric) errors.push(`Unknown fabric code "${input.fabricCode}".`);
  if (fabric && fabric.family !== input.family) errors.push(`Fabric code "${fabric.code}" belongs to ${fabric.family}, not ${input.family}.`);
  if (!positive(input.widthCm)) errors.push("widthCm must be a finite number greater than zero.");
  if (!positive(input.heightCm)) errors.push("heightCm must be a finite number greater than zero.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) errors.push("quantity must be a positive integer no greater than 99.");
  if (!operations.has(input.operation)) errors.push(`Unknown operation "${String(input.operation)}".`);
  if (input.mountPosition !== "inside" && input.mountPosition !== "outside") errors.push(`mountPosition must be "inside" or "outside", received "${String(input.mountPosition)}".`);
  if (!ROLLER_WORKBOOK_CASSETTES.includes(input.cassette as RollerWorkbookCassette)) errors.push(`Unsupported cassette "${String(input.cassette)}". Select one of: ${ROLLER_WORKBOOK_CASSETTES.join(", ")}.`);
  if (input.remote !== undefined && typeof input.remote !== "boolean") errors.push("remote must be boolean when supplied.");
  if (input.hub !== undefined && typeof input.hub !== "boolean") errors.push("hub must be boolean when supplied.");
  if (input.noDrill !== undefined && typeof input.noDrill !== "boolean") errors.push("noDrill must be boolean when supplied.");
  if (input.remote === true && input.operation !== "motor") errors.push("remote is only available when operation is motor.");
  if (input.hub === true && input.operation !== "motor") errors.push("hub is only available when operation is motor.");
  const track = input.track ?? "none";
  if (!["none", "u-white", "u-grey", "l-white", "l-black"].includes(track)) errors.push(`Unknown track "${String(track)}".`);
  else if (families.has(input.family) && !tracks[input.family].includes(track)) errors.push(`${input.family} does not support track "${track}".`);
  if (input.family === "butterfly" && input.noDrill === true) errors.push("butterfly does not support noDrill.");
  if (input.operation === "manual") {
    if (!input.manualControl) errors.push("manualControl is required when operation is manual.");
    else if (families.has(input.family) && !controls[input.family].includes(input.manualControl)) errors.push(`${input.family} does not support manualControl "${input.manualControl}".`);
    if (input.motorType !== undefined) errors.push("motorType must be omitted when operation is manual.");
  } else if (input.operation === "motor") {
    if (input.manualControl !== undefined) errors.push("manualControl must be omitted when operation is motor.");
    if (!input.motorType) errors.push("motorType is required when operation is motor.");
    else if (!(input.motorType in motors)) errors.push(`Unknown motorType "${String(input.motorType)}".`);
  } else {
    if (input.manualControl !== undefined) errors.push("manualControl must be omitted when operation is cordless.");
    if (input.motorType !== undefined) errors.push("motorType must be omitted when operation is cordless.");
  }
  const limit = families.has(input.family) && operations.has(input.operation) ? getRollerWorkbookSizeLimits(input.family, input.operation, input.fabricCode) : undefined;
  if (families.has(input.family) && operations.has(input.operation) && !limit) errors.push(`${input.family} does not support ${input.operation} operation.`);
  if (limit && positive(input.widthCm) && positive(input.heightCm) && (input.mountPosition === "inside" || input.mountPosition === "outside")) {
    const width = input.widthCm * 10 - (input.mountPosition === "inside" ? 5 : 0), height = input.heightCm * 10, area = (width / 1000) * (height / 1000);
    if (width < limit.minWidthMm || width > limit.maxWidthMm || height < limit.minHeightMm || height > limit.maxHeightMm || area > limit.maxAreaSqm) errors.push(`${input.family} ${input.operation} effective size ${width}×${height}mm (${area.toFixed(4)}m²) is outside workbook limits ${limit.minWidthMm}–${limit.maxWidthMm}×${limit.minHeightMm}–${limit.maxHeightMm}mm, ${limit.maxAreaSqm}m².`);
  }
  return errors;
}
export function quoteRollerWorkbookBlind(input: RollerWorkbookQuoteInput): RollerWorkbookQuoteResult {
  const errors = validateRollerWorkbookQuote(input); if (errors.length) return { ok: false, errors };
  const fabric = fabricByCode.get(input.fabricCode.trim())!, limits = getRollerWorkbookSizeLimits(input.family, input.operation, input.fabricCode)!;
  const enteredWidthMm = input.widthCm * 10, effectiveWidthMm = enteredWidthMm - (input.mountPosition === "inside" ? 5 : 0), heightMm = input.heightCm * 10, actualAreaSqm = (effectiveWidthMm / 1000) * (heightMm / 1000), billedAreaSqm = Math.max(1, actualAreaSqm);
  const track = input.track ?? "none", remote = input.remote ?? false, hub = input.hub ?? false, noDrill = input.noDrill ?? false;
  const fabricUsd = fabric.supplierUsdPerSqm * billedAreaSqm, areaOptionsUsd = ((input.operation === "cordless" ? 3 : 0) + (noDrill ? 3 : 0) + (input.operation === "manual" && input.manualControl === "steel-chain" ? .5 : 0)) * billedAreaSqm;
  const motorUsd = input.operation === "motor" ? motors[input.motorType!] : 0, remoteUsd = remote ? 7 : 0, hubUsd = hub ? 22 : 0, trackUsd = track === "none" ? 0 : heightMm / 1000 * (track.startsWith("u-") ? 10 : 5), unitUsd = fabricUsd + areaOptionsUsd + motorUsd + remoteUsd + hubUsd + trackUsd, unitIsk = Math.round(unitUsd * RETAIL_FACTOR);
  return { ok: true, fabric, operation: input.operation, ...(input.manualControl ? { manualControl: input.manualControl } : {}), ...(input.motorType ? { motorType: input.motorType } : {}), mountPosition: input.mountPosition, cassette: input.cassette as RollerWorkbookCassette, track, remote, hub, noDrill, quantity: input.quantity, enteredWidthMm, effectiveWidthMm, heightMm, actualAreaSqm, billedAreaSqm, limits, supplier: { fabricUsd, areaOptionsUsd, motorUsd, remoteUsd, hubUsd, trackUsd, cassetteUsd: 0, unitUsd, totalUsd: unitUsd * input.quantity }, retail: { unitIsk, totalIsk: unitIsk * input.quantity }, notes: [input.mountPosition === "inside" ? "Inside mount deducts 5 mm from entered width before size and area calculation." : "Outside mount uses the entered width without deduction.", "Fabric and area-priced options have a 1 m² minimum billing area.", "U track is USD 10/m and L track USD 5/m, each once for both sides; cassette has no workbook price.", "Hub is an optional USD 22 motor accessory; the workbook does not state when it is required.", "Retail ISK is rounded once per blind before quantity is applied."] };
}