import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculateDualRollerCartTotal,
  calculateDualRollerPrice,
} from "./dualRollerPricing";
import {
  blindSupplierUsd,
  dayNightSupplierRate,
  assertHoneycombSize,
  honeycombSupplierRate,
  retailPriceFromSupplierUsd,
  tdbuSupplierRate,
  type MountPosition,
} from "./pricing";
import { normalizeQuantity } from "./quantity";
import {
  calculateWindourQuote,
  isWindourProductId,
  WINDOUR_QUOTE_VALID_DAYS,
  type WindourMaterial,
  type WindourProductId,
} from "./windourPricing";
import {
  calculateVerticalSheerQuote,
  verticalSheerFabricRate,
  type VerticalSheerFabricType,
  type VerticalSheerInstallation,
  type VerticalSheerOperation,
} from "./verticalSheerPricing";
import {
  quoteRollerWorkbookBlind,
  type RollerWorkbookQuoteInput,
} from "./rollerWorkbookPricing";

export const HOLDER_USD = 5.0;

export type HolderColor = "white" | "navy" | "black";

export type RollerCartItem = {
  id: string;
  type: "roller";
  qty: number;
  width: number;
  height: number;
  cassette: string;
  rail: string;
  fabricCode: string;
  fabricName: string;
  fabricUsdPerSqm: number;
  operation: "chain" | "cordless" | "motor";
  sideTrack: boolean;
  holder?: HolderColor | null;
};

export type DaynightComboKey = "KS+KB" | "KT+KB" | "KS+KT";

export type DaynightCartItem = {
  id: string;
  type: "daynight";
  qty: number;
  width: number;
  height: number;
  comboKey: DaynightComboKey;
  frontCode: string;
  backCode: string;
  frontName: string;
  backName: string;
  comboUsdPerSqm: number;
  operation: "manual" | "cordless" | "motor";
  sideTrack: boolean;
  sideTrackType?: "u" | "l";
  mountPosition?: MountPosition;
  noDrill?: boolean;
  railColor: string;
};

export type VerticalFabricType = "translucent" | "blackout";

export type VerticalCartItem = {
  id: string;
  type: "vertical";
  qty: number;
  width: number;
  height: number;
  fabricCode: string;
  fabricName: string;
  fabricType: VerticalFabricType;
  fabricUsdPerSqm: number;
  operation: "manual" | "motor";
  openingType: "centre" | "left" | "right";
  railColor: string;
};

export type VerticalSheerCartItem = {
  id: string;
  type: "vertical-sheer";
  qty: number;
  widthCm: number;
  heightCm: number;
  fabricCode: string;
  fabricName: string;
  fabricType: VerticalSheerFabricType;
  operation: VerticalSheerOperation;
  installation: VerticalSheerInstallation;
  remoteController: boolean;
  railColor: string;
  supplierUsdPerSqm: number;
  productionWidthMm: number;
  productionHeightMm: number;
  billedAreaSqm: number;
  supplierCostUsd: number;
  unitIsk: number;
};

export type TdbuFabricType = "translucent" | "blackout";

export type TdbuCartItem = {
  id: string;
  type: "tdbu";
  qty: number;
  width: number;
  height: number;
  fabricCode: string;
  fabricName: string;
  fabricType: TdbuFabricType;
  fabricUsdPerSqm: number;
  operation: "manual" | "cordless";
  sideTrack: boolean;
  sideTrackType?: "u" | "l";
  mountPosition?: MountPosition;
  noDrill?: boolean;
  railColor: string;
};

export type HoneycombFabricType = "sheer" | "translucent" | "blackout" | "dualdeck";

export type HoneycombCartItem = {
  id: string;
  type: "honeycomb";
  qty: number;
  width: number;
  height: number;
  fabricCode: string;
  fabricName: string;
  fabricType: HoneycombFabricType;
  fabricUsdPerSqm: number;
  operation: "manual" | "cordless" | "motor";
  sideTrack: boolean;
  sideTrackType?: "u" | "l";
  mountPosition?: MountPosition;
  noDrill?: boolean;
  railColor: string;
  bottomRail?: string;
  holder?: HolderColor | null;
};

export type Honeycomb25CartItem = {
  id: string;
  type: "honeycomb-25";
  qty: number;
  width: number;
  height: number;
  fabricCode: string;
  fabricName: string;
  fabricType: HoneycombFabricType;
  fabricUsdPerSqm: number;
  operation: "manual" | "cordless";
  sideTrack: boolean;
  sideTrackType?: "u" | "l";
  mountPosition?: MountPosition;
  noDrill?: boolean;
  railColor: string;
  bottomRail?: string;
  holder?: HolderColor | null;
};

export type DualRollerComboKey = "KS+KB" | "KT+KB" | "KS+KT";

export type DualRollerCartItem = {
  id: string;
  type: "dualroller";
  qty: number;
  width: number;
  height: number;
  comboKey: DualRollerComboKey;
  frontCode: string;
  backCode: string;
  frontName: string;
  backName: string;
  comboUsdPerSqm: number;
  operation: "manual" | "cordless" | "motor";
  sideTrack: boolean;
  railColor: string;
};

export type ZebraFabricType = "translucent" | "room-darkening" | "blackout";

export type ZebraCartItem = {
  id: string;
  type: "zebra";
  qty: number;
  width: number;
  height: number;
  fabricCode: string;
  fabricName: string;
  fabricType: ZebraFabricType;
  fabricUsdPerSqm: number;
  operation: "chain" | "cordless" | "motor";
  railColor: string;
};

export type WindourCartItem = {
  id: string;
  type: "windour";
  qty: number;
  productId: WindourProductId;
  widthCm: number;
  heightCm: number;
  material: WindourMaterial;
  materialLabel: string;
  supplierUsdPerSqm: number;
  chargeableSqm: number;
  unitIsk: number;
  quoteStatus: "provisional";
  supplierConfirmationPending: true;
  quoteExpiresInDays: number;
  quoteExpiryLabel: string;
};

/**
 * This is deliberately separate from the legacy roller pricing version.  The
 * Roller Blinds workbook has a different fabric catalogue and option model.
 */
export const ROLLER_WORKBOOK_REVISION = 1;
export type RollerWorkbookProductId =
  | "square-cassette"
  | "arc-cassette"
  | "zebra-blind"
  | "sheer-shades"
  | "butterfly-blinds";

export type RollerWorkbookCartItem = {
  id: string;
  type: "roller-workbook";
  qty: number;
  productId: RollerWorkbookProductId;
  configuration: Omit<RollerWorkbookQuoteInput, "quantity">;
  fabricName: string;
  workbookRevision: typeof ROLLER_WORKBOOK_REVISION;
};

type CartPricingMetadata = {
  pricingVersion?: 2;
  needsReconfigure?: boolean;
};

export type CartItem = (
  | RollerCartItem
  | DaynightCartItem
  | HoneycombCartItem
  | Honeycomb25CartItem
  | TdbuCartItem
  | VerticalCartItem
  | VerticalSheerCartItem
  | DualRollerCartItem
  | ZebraCartItem
  | WindourCartItem
  | RollerWorkbookCartItem
) & CartPricingMetadata;

export type NewCartItem =
  | Omit<RollerCartItem, "id">
  | Omit<DaynightCartItem, "id">
  | Omit<HoneycombCartItem, "id">
  | Omit<Honeycomb25CartItem, "id">
  | Omit<TdbuCartItem, "id">
  | Omit<VerticalCartItem, "id">
  | Omit<VerticalSheerCartItem, "id">
  | Omit<DualRollerCartItem, "id">
  | Omit<ZebraCartItem, "id">
  | Omit<WindourCartItem, "id">
  | {
    type: "roller-workbook";
    qty: number;
    productId: RollerWorkbookProductId;
    configuration: Omit<RollerWorkbookQuoteInput, "quantity">;
    fabricName: string;
  };

type CartContextValue = {
  items: CartItem[];
  addItem: (item: NewCartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
  totalUsd: number;
  totalIsk: number;
  itemCount: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "solmyrkvun.cart.v2";
const LEGACY_STORAGE_KEY = "solmyrkvun.cart.v1";

// Blind lines and WINdoûr estimates both use whole-ISK per-unit rounding
// before multiplying quantity.
export function priceLineIsk(item: CartItem): number {
  if (item.needsReconfigure) return 0;
  if (item.type === "roller-workbook") {
    const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: item.qty });
    return quote.ok ? quote.retail.totalIsk : 0;
  }
  if (item.type === "windour") {
    const quote = calculateWindourQuote({
      productId: item.productId,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      quantity: item.qty,
      material: item.material,
    });
    return quote ? quote.unitIsk * item.qty : 0;
  }
  if (item.type === "dualroller") {
    return calculateDualRollerCartTotal({
      width: item.width,
      height: item.height,
      quantity: item.qty,
      comboUsdPerSqm: item.comboUsdPerSqm,
      operation: item.operation,
      sideTrack: item.sideTrack,
    });
  }
  if (item.type === "vertical-sheer") {
    return calculateVerticalSheerQuote({
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      fabricCode: item.fabricCode,
      operation: item.operation,
      installation: item.installation,
      remoteController: item.remoteController,
      quantity: item.qty,
    }).totalIsk;
  }
  return retailPriceFromSupplierUsd(priceCartItem(item)) * item.qty;
}

export function priceCartItem(item: CartItem): number {
  if (item.needsReconfigure) return 0;
  if (item.type === "roller-workbook") {
    const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: item.qty });
    return quote.ok ? quote.supplier.unitUsd : 0;
  }
  if (item.type === "windour") {
    const quote = calculateWindourQuote({
      productId: item.productId,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      quantity: 1,
      material: item.material,
    });
    return quote?.totalUsd ?? 0;
  }
  if (item.type === "roller") {
    const area = (item.width / 1000) * (item.height / 1000);
    const fabric = area * item.fabricUsdPerSqm;
    const cordless = item.operation === "cordless" ? 6.25 * area : 0;
    const motor = item.operation === "motor" ? 100 + 17.5 : 0;
    const sideTrack = item.sideTrack ? 21.25 * (item.height / 1000) : 0;
    const holder = item.holder ? HOLDER_USD : 0;
    return fabric + cordless + motor + sideTrack + holder;
  }
  if (item.type === "vertical") {
    const area = Math.max(1, (item.width / 1000) * (item.height / 1000));
    const fabric = area * item.fabricUsdPerSqm;
    const motor = item.operation === "motor" ? 142.26 + 14 : 0;
    return fabric + motor;
  }
  if (item.type === "vertical-sheer") {
    return calculateVerticalSheerQuote({
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      fabricCode: item.fabricCode,
      operation: item.operation,
      installation: item.installation,
      remoteController: item.remoteController,
      quantity: 1,
    }).supplierCostUsd;
  }
  if (item.type === "dualroller") {
    return calculateDualRollerPrice({
      width: item.width,
      height: item.height,
      quantity: 1,
      comboUsdPerSqm: item.comboUsdPerSqm,
      operation: item.operation,
      sideTrack: item.sideTrack,
    }).perPieceUSD;
  }
  if (item.type === "zebra") {
    const area = (item.width / 1000) * (item.height / 1000);
    const fabric = area * item.fabricUsdPerSqm;
    const motor = item.operation === "motor" ? 142.26 + 14 : 0;
    return fabric + motor;
  }
  if (item.type === "daynight") {
    const perSqm = dayNightSupplierRate(item.frontCode, item.backCode);
    if (perSqm === undefined || honeycombSupplierRate(item.frontCode, 45) === undefined) {
      throw new Error(`No workbook rate for Day & Night fabric pair ${item.frontCode}+${item.backCode}`);
    }
    assertHoneycombSize({
      product: "daynight",
      operation: item.operation,
      widthMm: item.width,
      heightMm: item.height,
      mountPosition: item.mountPosition,
    });
    return blindSupplierUsd(item.width, item.height, perSqm, {
      operation: item.operation,
      sideTrack: item.sideTrack,
      sideTrackType: item.sideTrackType,
      mountPosition: item.mountPosition,
      noDrill: item.noDrill,
    });
  }
  // honeycomb, honeycomb-25 & tdbu use their distinct workbook tables.
  const perSqm = item.type === "tdbu"
    ? tdbuSupplierRate(item.fabricCode)
    : honeycombSupplierRate(item.fabricCode, item.type === "honeycomb-25" ? 25 : 45);
  if (perSqm === undefined) {
    throw new Error(`No workbook rate for ${item.type} fabric ${item.fabricCode}`);
  }
  assertHoneycombSize({
    product: item.type === "tdbu" ? "tdbu" : item.type === "honeycomb-25" ? "honeycomb-25" : "honeycomb-45",
    operation: item.operation,
    widthMm: item.width,
    heightMm: item.height,
    mountPosition: item.mountPosition,
  });
  return blindSupplierUsd(item.width, item.height, perSqm, {
    operation: item.operation,
    sideTrack: item.sideTrack,
    sideTrackType: item.type === "honeycomb-25" ? "l" : item.sideTrackType ?? "u",
    mountPosition: item.mountPosition,
    noDrill: item.noDrill,
    holder: (item.type === "honeycomb" || item.type === "honeycomb-25") && Boolean(item.holder),
  });
}

export function describeCartItem(item: CartItem): { title: string; sub: string } {
  const HOLDER_LABEL: Record<string, string> = { white: "Hvítur", navy: "Marínublár", black: "Svartur" };
  const mountingSuffix = "mountPosition" in item
    ? ` · ${item.mountPosition === "inside" ? "innfelld" : "utanáliggjandi"}${"noDrill" in item && item.noDrill ? " · án borunar" : ""}`
    : "";
  if (item.type === "windour") {
    const tier = item.productId.endsWith("-999") ? "999" : "2000";
    const kind = item.productId.includes("-duo-") ? "Tvískiptar Rúllugardínur (Duo)" : "Einfaldar Rúllugardínur";
    return {
      title: `${kind} ${tier} · ÁÆTLUN`,
      sub: `${item.widthCm}×${item.heightCm} cm · ${item.materialLabel} · ${item.chargeableSqm.toFixed(2)} m² · ${item.quoteExpiresInDays} daga provisional quote (${item.quoteExpiryLabel}) · staðfesting birgis vantar`,
    };
  }
  if (item.type === "roller-workbook") {
    const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: item.qty });
    if (!quote.ok) {
      return {
        title: "Rúllugardína úr verðbók · þarfnast endurstillingar",
        sub: "Ógildar stillingar úr verðbók.",
      };
    }
    const manual = quote.manualControl ? ` · handstýring: ${quote.manualControl}` : "";
    const motor = quote.motorType ? ` · mótor: ${quote.motorType}` : "";
    return {
      title: `${quote.fabric.family} · ${quote.fabric.name}`,
      sub: `${quote.enteredWidthMm / 10}×${quote.heightMm / 10} cm · litur: ${quote.fabric.color} · ${quote.operation}${manual}${motor} · fjarstýring: ${quote.remote ? "já" : "nei"} · miðstöð: ${quote.hub ? "já" : "nei"} · ${quote.mountPosition === "inside" ? "innfelld" : "utanáliggjandi"} · án borunar: ${quote.noDrill ? "já" : "nei"} · spor: ${quote.track} · kassetta: ${quote.cassette}`,
    };
  }
  if (item.type === "roller") {
    const opLabel =
      item.operation === "motor"
        ? "mótor"
        : item.operation === "cordless"
          ? "snærislaust"
          : "keðja";
    const holderSuffix = item.holder ? ` · Lásahaldari · ${HOLDER_LABEL[item.holder]}` : "";
    const sub = `${item.width}×${item.height}mm · ${item.cassette} · ${item.rail} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""}${holderSuffix}`;
    return {
      title: `Rúllugardína · ${item.fabricName}`,
      sub,
    };
  }
  const opLabel =
    item.operation === "motor" ? "mótor" : item.operation === "cordless" ? "snærislaust" : "handvirkt";
  if (item.type === "honeycomb") {
    const holderSuffix = item.holder ? ` · Lásahaldari · ${HOLDER_LABEL[item.holder]}` : "";
    return {
      title: `Myrkvunargardína 45 mm · ${item.fabricName}`,
       sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}${holderSuffix}${mountingSuffix}`,
    };
  }
  if (item.type === "honeycomb-25") {
    const holderSuffix = item.holder ? ` · Lásahaldari · ${HOLDER_LABEL[item.holder]}` : "";
    return {
      title: `Myrkvunargardína 25 mm · ${item.fabricName}`,
       sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}${holderSuffix}${mountingSuffix}`,
    };
  }
  if (item.type === "tdbu") {
    return {
      title: `TDBU · ${item.fabricName}`,
       sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}${mountingSuffix}`,
    };
  }
  if (item.type === "vertical") {
    const openLabel =
      item.openingType === "centre" ? "miðopnun" : item.openingType === "left" ? "vinstri" : "hægri";
    return {
      title: `Lóðrétt · ${item.fabricName}`,
       sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel} · ${openLabel} · ${item.railColor}`,
    };
  }
  if (item.type === "vertical-sheer") {
    const operationLabel =
      item.operation === "motor"
        ? "rafknúið"
        : item.operation === "manual-wand"
          ? "handstýrt · WAND"
          : "handstýrt · keðja";
    const remoteSuffix = item.remoteController ? " · fjarstýring" : "";
    const confirmationSuffix = item.needsReconfigure ? " · þarfnast staðfestingar" : "";
    return {
      title: `Lóðréttar vefgardínur · ${item.fabricName}`,
      sub: `${item.widthCm}×${item.heightCm}cm · ${item.fabricCode} · ${operationLabel}${remoteSuffix} · ${item.installation === "inmount" ? "innfelld" : "utanáliggjandi"} · ${item.railColor}${confirmationSuffix}`,
    };
  }
  if (item.type === "dualroller") {
    return {
      title: `Tvöfalt rúll · ${item.frontName} + ${item.backName}`,
       sub: `${item.width}×${item.height}mm · ${item.frontCode}+${item.backCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}`,
    };
  }
  if (item.type === "zebra") {
    const zebraOpLabel = item.operation === "motor" ? "rafknúið" : item.operation === "cordless" ? "snærislaust" : "keðja";
    return {
      title: `Sebragardína · ${item.fabricName}`,
       sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${zebraOpLabel} · ${item.railColor}`,
    };
  }
  return {
    title: `Day & Night · ${item.frontName} + ${item.backName}`,
    sub: `${item.width}×${item.height}mm · ${item.frontCode}+${item.backCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}`,
  };
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function hasAuthoritativeRate(item: CartItem): boolean {
  if (item.type === "honeycomb") {
    return honeycombSupplierRate(item.fabricCode, 45) === item.fabricUsdPerSqm;
  }
  if (item.type === "honeycomb-25") {
    return honeycombSupplierRate(item.fabricCode, 25) === item.fabricUsdPerSqm;
  }
  if (item.type === "tdbu") return tdbuSupplierRate(item.fabricCode) === item.fabricUsdPerSqm;
  if (item.type === "vertical-sheer") {
    return verticalSheerFabricRate(item.fabricCode) === item.supplierUsdPerSqm;
  }
  if (item.type === "daynight") {
    return dayNightSupplierRate(item.frontCode, item.backCode) === item.comboUsdPerSqm;
  }
  return true;
}

function finalizeMigratedItem<T extends CartItem>(item: T, raw: Record<string, unknown>): T {
  const wasCurrentPricingVersion = raw.pricingVersion === 2;
  item.pricingVersion = 2;
  if (!wasCurrentPricingVersion || !hasAuthoritativeRate(item)) item.needsReconfigure = true;
  return item;
}

function isRollerWorkbookProductFamily(
  productId: unknown,
  configuration: Pick<RollerWorkbookQuoteInput, "family" | "cassette">,
): productId is RollerWorkbookProductId {
  return (productId === "square-cassette" &&
      configuration.family === "roller" &&
      configuration.cassette === "Square with fabric inserted") ||
    (productId === "arc-cassette" &&
      configuration.family === "roller" &&
      configuration.cassette === "Arc with fabric inserted") ||
    (productId === "zebra-blind" && configuration.family === "zebra") ||
    (productId === "sheer-shades" && configuration.family === "sheer") ||
    (productId === "butterfly-blinds" && configuration.family === "butterfly");
}

function isRollerWorkbookConfiguration(
  value: unknown,
): value is Omit<RollerWorkbookQuoteInput, "quantity"> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const configuration = value as Record<string, unknown>;
  const allowed = new Set([
    "family", "fabricCode", "widthCm", "heightCm", "operation", "manualControl",
    "motorType", "remote", "hub", "noDrill", "mountPosition", "track", "cassette",
  ]);
  if (Object.keys(configuration).some((key) => !allowed.has(key))) return false;
  return typeof configuration.family === "string" &&
    typeof configuration.fabricCode === "string" &&
    isFiniteNumber(configuration.widthCm) &&
    isFiniteNumber(configuration.heightCm) &&
    typeof configuration.operation === "string" &&
    typeof configuration.mountPosition === "string" &&
    typeof configuration.cassette === "string" &&
    (configuration.manualControl === undefined || typeof configuration.manualControl === "string") &&
    (configuration.motorType === undefined || typeof configuration.motorType === "string") &&
    (configuration.remote === undefined || typeof configuration.remote === "boolean") &&
    (configuration.hub === undefined || typeof configuration.hub === "boolean") &&
    (configuration.noDrill === undefined || typeof configuration.noDrill === "boolean") &&
    (configuration.track === undefined || typeof configuration.track === "string");
}

function migrateCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  if (item.type === "roller-workbook") {
    if (
      typeof item.id !== "string" ||
      !isFiniteNumber(item.qty) || !Number.isInteger(item.qty) || item.qty < 1 || item.qty > 99 ||
      !isRollerWorkbookConfiguration(item.configuration) ||
      !isRollerWorkbookProductFamily(item.productId, item.configuration) ||
      typeof item.fabricName !== "string" ||
      item.workbookRevision !== ROLLER_WORKBOOK_REVISION
    ) return null;
    const qty = normalizeQuantity(item.qty);
    const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: qty });
    if (!quote.ok || quote.fabric.name !== item.fabricName) return null;
    return {
      id: item.id,
      type: "roller-workbook",
      qty,
      productId: item.productId,
      configuration: item.configuration,
      fabricName: quote.fabric.name,
      workbookRevision: ROLLER_WORKBOOK_REVISION,
      pricingVersion: 2,
    };
  }
  if (item.type === "windour") {
    if (
      typeof item.id !== "string" ||
      !isFiniteNumber(item.qty) || item.qty < 1 ||
      typeof item.productId !== "string" || !isWindourProductId(item.productId) ||
      !isFiniteNumber(item.widthCm) || item.widthCm <= 0 ||
      !isFiniteNumber(item.heightCm) || item.heightCm <= 0 ||
      (item.material !== "honeycomb" && item.material !== "polyester-net" && item.material !== "taiwan-pet-net") ||
      typeof item.materialLabel !== "string" ||
      !isFiniteNumber(item.supplierUsdPerSqm) ||
      !isFiniteNumber(item.chargeableSqm) ||
      !isFiniteNumber(item.unitIsk) ||
      item.quoteStatus !== "provisional" ||
      item.supplierConfirmationPending !== true ||
      item.quoteExpiresInDays !== WINDOUR_QUOTE_VALID_DAYS ||
      typeof item.quoteExpiryLabel !== "string"
    ) return null;
    const quote = calculateWindourQuote({
      productId: item.productId,
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      quantity: normalizeQuantity(item.qty as number),
      material: item.material,
    });
    if (!quote || quote.unitIsk !== item.unitIsk) return null;
    item.qty = normalizeQuantity(item.qty as number);
    return finalizeMigratedItem(item as unknown as WindourCartItem & CartPricingMetadata, item);
  }
  if (item.type === "vertical-sheer") {
    if (
      typeof item.id !== "string" ||
      !isFiniteNumber(item.qty) || item.qty < 1 ||
      !isFiniteNumber(item.widthCm) || item.widthCm <= 0 ||
      !isFiniteNumber(item.heightCm) || item.heightCm <= 0 ||
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      (item.fabricType !== "translucent" && item.fabricType !== "room-darkening") ||
      (item.operation !== "manual-chain" && item.operation !== "manual-wand" && item.operation !== "motor") ||
      (item.installation !== "inmount" && item.installation !== "outmount") ||
      typeof item.remoteController !== "boolean" ||
      (item.operation !== "motor" && item.remoteController) ||
      typeof item.railColor !== "string" ||
      !isFiniteNumber(item.supplierUsdPerSqm) ||
      !isFiniteNumber(item.productionWidthMm) ||
      !isFiniteNumber(item.productionHeightMm) ||
      !isFiniteNumber(item.billedAreaSqm) ||
      !isFiniteNumber(item.supplierCostUsd) ||
      !isFiniteNumber(item.unitIsk)
    ) return null;
    const quote = calculateVerticalSheerQuote({
      widthCm: item.widthCm,
      heightCm: item.heightCm,
      fabricCode: item.fabricCode,
      operation: item.operation,
      installation: item.installation,
      remoteController: item.remoteController,
      quantity: normalizeQuantity(item.qty as number),
    });
    if (
      quote.fabricType !== item.fabricType ||
      quote.fabricSupplierUsd / quote.billedAreaSqm !== item.supplierUsdPerSqm ||
      quote.productionWidthMm !== item.productionWidthMm ||
      quote.productionHeightMm !== item.productionHeightMm ||
      quote.billedAreaSqm !== item.billedAreaSqm ||
      quote.supplierCostUsd !== item.supplierCostUsd ||
      quote.unitIsk !== item.unitIsk
    ) return null;
    item.qty = normalizeQuantity(item.qty as number);
    const migrated = finalizeMigratedItem(item as unknown as VerticalSheerCartItem & CartPricingMetadata, item);
    if (item.installation === "outmount") migrated.needsReconfigure = true;
    return migrated;
  }
  // Common shape: id + qty + width + height must be sane numbers/strings.
  if (
    typeof item.id !== "string" ||
    !isFiniteNumber(item.qty) || item.qty < 1 ||
    !isFiniteNumber(item.width) || item.width < 100 ||
    !isFiniteNumber(item.height) || item.height < 100
  ) return null;
  item.qty = normalizeQuantity(item.qty);

  if (item.type === "roller") {
    if (
      typeof item.cassette !== "string" ||
      typeof item.rail !== "string" ||
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.operation !== "chain" && item.operation !== "cordless" && item.operation !== "motor")
    ) return null;
    return {
      ...finalizeMigratedItem(item as unknown as RollerCartItem & CartPricingMetadata, item),
      // Legacy roller rates are not derived from the Roller Blinds workbook.
      needsReconfigure: true,
    };
  }
  if (item.type === "honeycomb") {
    // Legacy 38mm items had no fabricCode; drop them.
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "sheer" && item.fabricType !== "translucent" && item.fabricType !== "blackout" && item.fabricType !== "dualdeck") ||
      (item.operation !== "manual" && item.operation !== "cordless" && item.operation !== "motor")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return finalizeMigratedItem(item as unknown as HoneycombCartItem & CartPricingMetadata, item);
  }
  if (item.type === "honeycomb-25") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "sheer" && item.fabricType !== "translucent" && item.fabricType !== "blackout" && item.fabricType !== "dualdeck") ||
       (item.operation !== "manual" && item.operation !== "cordless")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return finalizeMigratedItem(item as unknown as Honeycomb25CartItem & CartPricingMetadata, item);
  }
  if (item.type === "tdbu") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "translucent" && item.fabricType !== "blackout") ||
       (item.operation !== "manual" && item.operation !== "cordless") ||
      typeof item.sideTrack !== "boolean"
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return finalizeMigratedItem(item as unknown as TdbuCartItem & CartPricingMetadata, item);
  }
  if (item.type === "vertical") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "translucent" && item.fabricType !== "blackout") ||
      (item.operation !== "manual" && item.operation !== "motor") ||
      (item.openingType !== "centre" && item.openingType !== "left" && item.openingType !== "right")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return finalizeMigratedItem(item as unknown as VerticalCartItem & CartPricingMetadata, item);
  }
  if (item.type === "daynight") {
    // Legacy daynight items (color-swatch schema, pre-45mm) had no comboKey; drop them.
    if (
      (item.comboKey !== "KS+KB" && item.comboKey !== "KT+KB" && item.comboKey !== "KS+KT") ||
      typeof item.frontCode !== "string" ||
      typeof item.backCode !== "string" ||
      typeof item.frontName !== "string" ||
      typeof item.backName !== "string" ||
      !isFiniteNumber(item.comboUsdPerSqm) ||
      (item.operation !== "manual" && item.operation !== "cordless" && item.operation !== "motor")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return finalizeMigratedItem(item as unknown as DaynightCartItem & CartPricingMetadata, item);
  }
  if (item.type === "dualroller") {
    if (
      (item.comboKey !== "KS+KB" && item.comboKey !== "KT+KB" && item.comboKey !== "KS+KT") ||
      typeof item.frontCode !== "string" ||
      typeof item.backCode !== "string" ||
      typeof item.frontName !== "string" ||
      typeof item.backName !== "string" ||
      !isFiniteNumber(item.comboUsdPerSqm) ||
      (item.operation !== "manual" && item.operation !== "cordless" && item.operation !== "motor") ||
      typeof item.sideTrack !== "boolean"
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítur";
    return finalizeMigratedItem(item as unknown as DualRollerCartItem & CartPricingMetadata, item);
  }
  if (item.type === "zebra") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "translucent" && item.fabricType !== "room-darkening" && item.fabricType !== "blackout") ||
      (item.operation !== "chain" && item.operation !== "cordless" && item.operation !== "motor")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítur";
    return {
      ...finalizeMigratedItem(item as unknown as ZebraCartItem & CartPricingMetadata, item),
      // Legacy zebra rates are not derived from the Roller Blinds workbook.
      needsReconfigure: true,
    };
  }
  return null;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(migrateCartItem).filter((i): i is CartItem => i !== null);
  } catch {
    return [];
  }
}

function saveToStorage(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadFromStorage());
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  const addItem = useCallback((item: NewCartItem) => {
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const qty = normalizeQuantity(item.qty);
    if (item.type === "roller-workbook") {
      const quote = quoteRollerWorkbookBlind({ ...item.configuration, quantity: qty });
      if (!quote.ok || !isRollerWorkbookProductFamily(item.productId, item.configuration)) {
        throw new Error(`Invalid Roller Blinds workbook configuration: ${quote.ok ? "product family mismatch" : quote.errors.join(" ")}`);
      }
      setItems((prev) => [...prev, {
        type: "roller-workbook",
        qty,
        productId: item.productId,
        configuration: item.configuration,
        // Never persist a display name supplied by the client as a price source.
        fabricName: quote.fabric.name,
        workbookRevision: ROLLER_WORKBOOK_REVISION,
        pricingVersion: 2,
        id,
      }]);
    } else {
      setItems((prev) => [...prev, {
        ...item,
        qty,
        pricingVersion: 2,
        id,
      } as CartItem]);
    }
    setOpen(true);
  }, []);

  const removeItem = useCallback(
    (id: string) => setItems((prev) => prev.filter((i) => i.id !== id)),
    [],
  );
  const updateQty = useCallback(
    (id: string, qty: number) =>
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: normalizeQuantity(qty) } : i))),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const { totalUsd, totalIsk, itemCount } = useMemo(() => {
    let usd = 0;
    let isk = 0;
    let count = 0;
    for (const item of items) {
      usd += priceCartItem(item) * item.qty;
      isk += priceLineIsk(item);
      count += item.qty;
    }
    return { totalUsd: usd, totalIsk: isk, itemCount: count };
  }, [items]);

  const value: CartContextValue = {
    items,
    addItem,
    removeItem,
    updateQty,
    clear,
    totalUsd,
    totalIsk,
    itemCount,
    isOpen,
    setOpen,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function formatIsk(value: number): string {
  return new Intl.NumberFormat("is-IS").format(Math.round(value)) + " kr";
}
