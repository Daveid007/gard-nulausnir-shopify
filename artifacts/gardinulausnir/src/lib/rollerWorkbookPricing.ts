/**
 * Authoritative calculator for the four non-honeycomb families in the supplied
 * Roller Blinds workbook.  This module deliberately has no cart, UI, or API
 * dependencies so that browser and server callers receive the same quote.
 */
import {
  rollerWorkbookFabrics,
  rollerWorkbookFamilies,
  type RollerWorkbookFabric,
  type RollerWorkbookFamily,
} from "../data/rollerWorkbookFabrics.ts";
import { retailPriceFromSupplierUsd } from "./pricing.ts";

export { rollerWorkbookFabrics, rollerWorkbookFamilies };
export type { RollerWorkbookFabric, RollerWorkbookFamily };

export type RollerWorkbookOperation = "manual" | "cordless" | "motor";
export type ManualControl = "cord" | "plastic-chain" | "steel-chain";
export type MotorType =
  | "battery-standard"
  | "battery-wifi"
  | "battery-zigbee"
  | "wired"
  | "wired-wifi";
export type MountPosition = "inside" | "outside";
export type SideTrack = "none" | "u-white" | "u-grey" | "l-white" | "l-black";

/**
 * These are the exact English cassette values offered by the visible Quote
 * sheet's data validation.  Neither is separately priced in the workbook.
 */
export const ROLLER_WORKBOOK_CASSETTES = [
  "Square with fabric inserted",
  "Arc with fabric inserted",
] as const;
export type RollerWorkbookCassette = (typeof ROLLER_WORKBOOK_CASSETTES)[number];

export interface RollerWorkbookSizeLimits {
  minWidthMm: number;
  maxWidthMm: number;
  minHeightMm: number;
  maxHeightMm: number;
  maxAreaSqm: number;
}

export interface RollerWorkbookQuoteInput {
  family: RollerWorkbookFamily;
  fabricCode: string;
  widthCm: number;
  heightCm: number;
  quantity: number;
  operation: RollerWorkbookOperation;
  /**
   * Required for a manual blind; must be omitted for cordless or motor.
   * Sheer manual blinds only support cord.
   */
  manualControl?: ManualControl;
  /** Required for a motor blind; must be omitted for manual or cordless. */
  motorType?: MotorType;
  /** Defaults to false. The workbook prices this as a separate USD 7 item. */
  remote?: boolean;
  /**
   * Defaults to false. The Quote sheet lists Hub separately at USD 22; source
   * material does not establish when one is required.
   */
  hub?: boolean;
  /** Defaults to false. Butterfly blinds cannot use it. */
  noDrill?: boolean;
  mountPosition: MountPosition;
  /** Defaults to none. Track choices vary by family. */
  track?: SideTrack;
  /** Required because the source workbook makes a cassette selection. */
  cassette: string;
}

export interface RollerWorkbookQuoteFailure {
  ok: false;
  errors: readonly string[];
}

export interface RollerWorkbookQuoteSuccess {
  ok: true;
  fabric: RollerWorkbookFabric;
  operation: RollerWorkbookOperation;
  manualControl?: ManualControl;
  motorType?: MotorType;
  mountPosition: MountPosition;
  cassette: RollerWorkbookCassette;
  track: SideTrack;
  remote: boolean;
  hub: boolean;
  noDrill: boolean;
  quantity: number;
  enteredWidthMm: number;
  effectiveWidthMm: number;
  heightMm: number;
  actualAreaSqm: number;
  billedAreaSqm: number;
  limits: RollerWorkbookSizeLimits;
  supplier: {
    fabricUsd: number;
    areaOptionsUsd: number;
    motorUsd: number;
    remoteUsd: number;
    hubUsd: number;
    trackUsd: number;
    cassetteUsd: 0;
    unitUsd: number;
    totalUsd: number;
  };
  retail: {
    unitIsk: number;
    totalIsk: number;
  };
  notes: readonly string[];
}

export type RollerWorkbookQuoteResult = RollerWorkbookQuoteSuccess | RollerWorkbookQuoteFailure;

const INSIDE_WIDTH_DEDUCTION_MM = 5;
const MINIMUM_BILLED_SQM = 1;

/** The accessory values are the visible rows 341–345 in the price sheet. */
export const ROLLER_WORKBOOK_SUPPLIER_PRICES = {
  motor: {
    "battery-standard": 38,
    "battery-wifi": 38,
    "battery-zigbee": 44,
    wired: 30,
    "wired-wifi": 38,
  } satisfies Record<MotorType, number>,
  remote: 7,
  hub: 22,
  cordlessPerSqm: 3,
  noDrillPerSqm: 3,
  steelChainPerSqm: 0.5,
  trackPerMetre: { u: 10, l: 5 },
} as const;

/**
 * The limits are the first applicable (38 mm) entries in visible Size limit
 * columns J:N.  The wider processing suggestions in P:T are intentionally
 * not used as sale limits.
 */
export const ROLLER_WORKBOOK_SIZE_LIMITS: Readonly<
  Record<RollerWorkbookFamily, Partial<Record<RollerWorkbookOperation, RollerWorkbookSizeLimits>>>
> = {
  roller: {
    manual: { minWidthMm: 300, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 5 },
    cordless: { minWidthMm: 300, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2000, maxAreaSqm: 4 },
    motor: { minWidthMm: 520, maxWidthMm: 2000, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 5 },
  },
  zebra: {
    manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2600, maxAreaSqm: 5.5 },
    cordless: { minWidthMm: 500, maxWidthMm: 1800, minHeightMm: 500, maxHeightMm: 2000, maxAreaSqm: 3.5 },
    motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2600, maxAreaSqm: 5.5 },
  },
  sheer: {
    manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
    motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
  },
  butterfly: {
    manual: { minWidthMm: 300, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
    motor: { minWidthMm: 520, maxWidthMm: 2300, minHeightMm: 500, maxHeightMm: 2500, maxAreaSqm: 4 },
  },
};

/**
 * Return the Size limit envelope for a selected fabric. Sheet 6 has a
 * separate 100 mm sheer motor row with an 800 mm minimum width; the other
 * source selections use the family/operation base entry above.
 *
 * Omitting fabricCode intentionally returns the generic family/operation
 * envelope so a configurator can render before a fabric has been selected.
 */
export function getRollerWorkbookSizeLimits(
  family: RollerWorkbookFamily,
  operation: RollerWorkbookOperation,
  fabricCode?: string,
): RollerWorkbookSizeLimits | undefined {
  const base = ROLLER_WORKBOOK_SIZE_LIMITS[family]?.[operation];
  if (!base) return undefined;
  const fabric = fabricCode?.trim() ? fabricByCode.get(fabricCode.trim()) : undefined;
  if (fabric?.family === "sheer" && operation === "motor" && fabric.size === "100mm") {
    return { ...base, minWidthMm: 800 };
  }
  return base;
}

const FAMILY_TRACKS: Readonly<Record<RollerWorkbookFamily, readonly SideTrack[]>> = {
  roller: ["none", "u-white", "u-grey", "l-white", "l-black"],
  zebra: ["none", "l-white", "l-black"],
  sheer: ["none", "u-white", "l-white"],
  butterfly: ["none"],
};

const MANUAL_CONTROLS: Readonly<Record<RollerWorkbookFamily, readonly ManualControl[]>> = {
  roller: ["cord", "plastic-chain", "steel-chain"],
  zebra: ["cord", "plastic-chain", "steel-chain"],
  sheer: ["cord"],
  butterfly: ["cord", "plastic-chain", "steel-chain"],
};

const fabricByCode = new Map(rollerWorkbookFabrics.map((fabric) => [fabric.code, fabric]));
const families = new Set<string>(rollerWorkbookFamilies);
const operations = new Set<string>(["manual", "cordless", "motor"]);
const motorTypes = new Set<string>(Object.keys(ROLLER_WORKBOOK_SUPPLIER_PRICES.motor));
const validTracks = new Set<string>(["none", "u-white", "u-grey", "l-white", "l-black"]);

function isFinitePositive(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

/**
 * Performs all family, option, fabric, size, and quantity checks.  It returns
 * all actionable errors instead of silently substituting a supplier choice.
 */
export function validateRollerWorkbookQuote(input: RollerWorkbookQuoteInput): readonly string[] {
  const errors: string[] = [];
  if (!families.has(input.family)) errors.push(`Unknown family "${String(input.family)}".`);
  if (typeof input.fabricCode !== "string" || !input.fabricCode.trim()) {
    errors.push("fabricCode is required.");
  }
  const fabric = typeof input.fabricCode === "string" ? fabricByCode.get(input.fabricCode.trim()) : undefined;
  if (input.fabricCode && !fabric) errors.push(`Unknown fabric code "${input.fabricCode}".`);
  if (fabric && fabric.family !== input.family) {
    errors.push(`Fabric code "${fabric.code}" belongs to ${fabric.family}, not ${input.family}.`);
  }
  if (!isFinitePositive(input.widthCm)) errors.push("widthCm must be a finite number greater than zero.");
  if (!isFinitePositive(input.heightCm)) errors.push("heightCm must be a finite number greater than zero.");
  if (!Number.isInteger(input.quantity) || input.quantity < 1 || input.quantity > 99) {
    errors.push("quantity must be a positive integer no greater than 99.");
  }
  if (!operations.has(input.operation)) errors.push(`Unknown operation "${String(input.operation)}".`);
  if (input.mountPosition !== "inside" && input.mountPosition !== "outside") {
    errors.push(`mountPosition must be "inside" or "outside", received "${String(input.mountPosition)}".`);
  }
  if (!ROLLER_WORKBOOK_CASSETTES.includes(input.cassette as RollerWorkbookCassette)) {
    errors.push(`Unsupported cassette "${String(input.cassette)}". Select one of: ${ROLLER_WORKBOOK_CASSETTES.join(", ")}.`);
  }
  if (input.remote !== undefined && typeof input.remote !== "boolean") errors.push("remote must be boolean when supplied.");
  if (input.hub !== undefined && typeof input.hub !== "boolean") errors.push("hub must be boolean when supplied.");
  if (input.noDrill !== undefined && typeof input.noDrill !== "boolean") errors.push("noDrill must be boolean when supplied.");
  if (input.remote === true && input.operation !== "motor") {
    errors.push("remote is only available when operation is motor.");
  }
  if (input.hub === true && input.operation !== "motor") {
    errors.push("hub is only available when operation is motor.");
  }

  const track = input.track ?? "none";
  if (!validTracks.has(track)) {
    errors.push(`Unknown track "${String(track)}".`);
  } else if (families.has(input.family) && !FAMILY_TRACKS[input.family].includes(track)) {
    errors.push(`${input.family} does not support track "${track}".`);
  }
  if (input.family === "butterfly" && input.noDrill === true) {
    errors.push("butterfly does not support noDrill.");
  }

  if (input.operation === "manual") {
    if (!input.manualControl) {
      errors.push("manualControl is required when operation is manual.");
    } else if (
      families.has(input.family) &&
      !MANUAL_CONTROLS[input.family].includes(input.manualControl)
    ) {
      errors.push(`${input.family} does not support manualControl "${input.manualControl}".`);
    }
    if (input.motorType !== undefined) errors.push("motorType must be omitted when operation is manual.");
  } else if (input.operation === "motor") {
    if (input.manualControl !== undefined) errors.push("manualControl must be omitted when operation is motor.");
    if (!input.motorType) {
      errors.push("motorType is required when operation is motor.");
    } else if (!motorTypes.has(input.motorType)) {
      errors.push(`Unknown motorType "${String(input.motorType)}".`);
    }
  } else if (input.operation === "cordless") {
    if (input.manualControl !== undefined) errors.push("manualControl must be omitted when operation is cordless.");
    if (input.motorType !== undefined) errors.push("motorType must be omitted when operation is cordless.");
  }

  if (families.has(input.family) && operations.has(input.operation)) {
    const limits = getRollerWorkbookSizeLimits(input.family, input.operation, input.fabricCode);
    if (!limits) errors.push(`${input.family} does not support ${input.operation} operation.`);
    if (limits && isFinitePositive(input.widthCm) && isFinitePositive(input.heightCm) &&
      (input.mountPosition === "inside" || input.mountPosition === "outside")) {
      const effectiveWidthMm = input.widthCm * 10 - (input.mountPosition === "inside" ? INSIDE_WIDTH_DEDUCTION_MM : 0);
      const heightMm = input.heightCm * 10;
      const areaSqm = (effectiveWidthMm / 1000) * (heightMm / 1000);
      if (
        effectiveWidthMm < limits.minWidthMm || effectiveWidthMm > limits.maxWidthMm ||
        heightMm < limits.minHeightMm || heightMm > limits.maxHeightMm || areaSqm > limits.maxAreaSqm
      ) {
        errors.push(
          `${input.family} ${input.operation} effective size ${effectiveWidthMm}×${heightMm}mm (${areaSqm.toFixed(4)}m²) ` +
          `is outside workbook limits ${limits.minWidthMm}–${limits.maxWidthMm}×${limits.minHeightMm}–${limits.maxHeightMm}mm, ${limits.maxAreaSqm}m².`,
        );
      }
    }
  }
  return errors;
}

/**
 * Returns an authoritative supplier/retail quote.  Area-priced accessories
 * use the same one-square-metre minimum as the fabric; track is once for both
 * sides, never doubled.  Retail is rounded once per unit then multiplied.
 */
export function quoteRollerWorkbookBlind(input: RollerWorkbookQuoteInput): RollerWorkbookQuoteResult {
  const errors = validateRollerWorkbookQuote(input);
  if (errors.length) return { ok: false, errors };

  const fabric = fabricByCode.get(input.fabricCode.trim())!;
  const limits = getRollerWorkbookSizeLimits(input.family, input.operation, input.fabricCode)!;
  const enteredWidthMm = input.widthCm * 10;
  const effectiveWidthMm = enteredWidthMm - (input.mountPosition === "inside" ? INSIDE_WIDTH_DEDUCTION_MM : 0);
  const heightMm = input.heightCm * 10;
  const actualAreaSqm = (effectiveWidthMm / 1000) * (heightMm / 1000);
  const billedAreaSqm = Math.max(MINIMUM_BILLED_SQM, actualAreaSqm);
  const track = input.track ?? "none";
  const remote = input.remote ?? false;
  const hub = input.hub ?? false;
  const noDrill = input.noDrill ?? false;
  const areaOptionRate =
    (input.operation === "cordless" ? ROLLER_WORKBOOK_SUPPLIER_PRICES.cordlessPerSqm : 0) +
    (noDrill ? ROLLER_WORKBOOK_SUPPLIER_PRICES.noDrillPerSqm : 0) +
    (input.operation === "manual" && input.manualControl === "steel-chain"
      ? ROLLER_WORKBOOK_SUPPLIER_PRICES.steelChainPerSqm
      : 0);
  const trackUsd = track === "none"
    ? 0
    : heightMm / 1000 * (track.startsWith("u-")
      ? ROLLER_WORKBOOK_SUPPLIER_PRICES.trackPerMetre.u
      : ROLLER_WORKBOOK_SUPPLIER_PRICES.trackPerMetre.l);
  const fabricUsd = fabric.supplierUsdPerSqm * billedAreaSqm;
  const areaOptionsUsd = areaOptionRate * billedAreaSqm;
  const motorUsd = input.operation === "motor"
    ? ROLLER_WORKBOOK_SUPPLIER_PRICES.motor[input.motorType!]
    : 0;
  const remoteUsd = remote ? ROLLER_WORKBOOK_SUPPLIER_PRICES.remote : 0;
  const hubUsd = hub ? ROLLER_WORKBOOK_SUPPLIER_PRICES.hub : 0;
  const unitUsd = fabricUsd + areaOptionsUsd + motorUsd + remoteUsd + hubUsd + trackUsd;
  const unitIsk = retailPriceFromSupplierUsd(unitUsd);

  return {
    ok: true,
    fabric,
    operation: input.operation,
    ...(input.manualControl ? { manualControl: input.manualControl } : {}),
    ...(input.motorType ? { motorType: input.motorType } : {}),
    mountPosition: input.mountPosition,
    cassette: input.cassette as RollerWorkbookCassette,
    track,
    remote,
    hub,
    noDrill,
    quantity: input.quantity,
    enteredWidthMm,
    effectiveWidthMm,
    heightMm,
    actualAreaSqm,
    billedAreaSqm,
    limits,
    supplier: {
      fabricUsd,
      areaOptionsUsd,
      motorUsd,
      remoteUsd,
      hubUsd,
      trackUsd,
      cassetteUsd: 0,
      unitUsd,
      totalUsd: unitUsd * input.quantity,
    },
    retail: {
      unitIsk,
      totalIsk: unitIsk * input.quantity,
    },
    notes: [
      input.mountPosition === "inside"
        ? "Inside mount deducts 5 mm from entered width before size and area calculation."
        : "Outside mount uses the entered width without deduction.",
      "Fabric and area-priced options have a 1 m² minimum billing area.",
      "U track is USD 10/m and L track USD 5/m, each once for both sides; cassette has no workbook price.",
      "Hub is an optional USD 22 motor accessory; the workbook does not state when it is required.",
      "Retail ISK is rounded once per blind before quantity is applied.",
    ],
  };
}