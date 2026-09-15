import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  calculateDualRollerCartTotal,
  calculateDualRollerPrice,
  DUAL_ROLLER_RETAIL_ISK,
} from "./dualRollerPricing";
import { normalizeQuantity } from "./quantity";
import {
  calculateWindourQuote,
  isWindourProductId,
  WINDOUR_QUOTE_VALID_DAYS,
  type WindourMaterial,
  type WindourProductId,
} from "./windourPricing";

const USD_TO_ISK_RETAIL = 461;
// Aukahlutir (motor, hliðarspor, snærislaust, lásahaldari): frakt 20% → $1 × 1.2 × 124 × 1.5 × 1.24 ≈ 276.
// priceCartItem returns USD that is later multiplied by USD_TO_ISK_RETAIL, so accessories are pre-scaled by 276/461.
const ACCESSORY_FACTOR = 276 / 461;

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
  operation: "manual" | "motor";
  sideTrack: boolean;
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
  operation: "manual" | "cordless" | "motor";
  sideTrack: boolean;
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

export type CartItem =
  | RollerCartItem
  | DaynightCartItem
  | HoneycombCartItem
  | Honeycomb25CartItem
  | TdbuCartItem
  | VerticalCartItem
  | DualRollerCartItem
  | ZebraCartItem
  | WindourCartItem;

export type NewCartItem =
  | Omit<RollerCartItem, "id">
  | Omit<DaynightCartItem, "id">
  | Omit<HoneycombCartItem, "id">
  | Omit<Honeycomb25CartItem, "id">
  | Omit<TdbuCartItem, "id">
  | Omit<VerticalCartItem, "id">
  | Omit<DualRollerCartItem, "id">
  | Omit<ZebraCartItem, "id">
  | Omit<WindourCartItem, "id">;

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

const STORAGE_KEY = "solmyrkvun.cart.v1";

// Legacy blind items match the server by ceiling each unit price to the
// nearest 100 ISK before quantity. WINdoûr estimates use their approved
// whole-ISK per-unit quote rounding instead.
export function priceLineIsk(item: CartItem): number {
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
  const usd = priceCartItem(item);
  const unitIsk = Math.ceil((usd * USD_TO_ISK_RETAIL) / 100) * 100;
  return unitIsk * item.qty;
}

export function priceCartItem(item: CartItem): number {
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
  const w = item.width / 1000;
  const h = item.height / 1000;
  if (item.type === "roller") {
    const area = w * h;
    const fabric = item.fabricUsdPerSqm * area;
    const cordless = item.operation === "cordless" ? 6.25 * area : 0;
    const motor = item.operation === "motor" ? 100 + 17.5 : 0;
    const sideTrack = item.sideTrack ? 21.25 * h : 0;
    const holder = item.holder ? HOLDER_USD : 0;
    return fabric + (cordless + motor + sideTrack + holder) * ACCESSORY_FACTOR;
  }
  if (item.type === "vertical") {
    const rawArea = w * h;
    const billedArea = Math.max(1, rawArea);
    const fabric = billedArea * item.fabricUsdPerSqm;
    const motor = item.operation === "motor" ? 142.26 + 14 : 0;
    return fabric + motor * ACCESSORY_FACTOR;
  }
  const rawArea = w * h;
  const billedArea = Math.max(1, rawArea);
  if (item.type === "dualroller") {
    return calculateDualRollerPrice({
      width: item.width,
      height: item.height,
      quantity: 1,
      comboUsdPerSqm: item.comboUsdPerSqm,
      operation: item.operation,
      sideTrack: item.sideTrack,
    }).perPieceISK / DUAL_ROLLER_RETAIL_ISK;
  }
  if (item.type === "zebra") {
    const area = w * h;
    const fabric = area * item.fabricUsdPerSqm;
    const motor = item.operation === "motor" ? 142.26 + 14 : 0;
    return fabric + motor * ACCESSORY_FACTOR;
  }
  // honeycomb, honeycomb-25 & tdbu: per-fabric pricing. daynight: per-combo pricing from Vertical sheet × 2.5.
  const perSqm =
    item.type === "honeycomb" || item.type === "honeycomb-25" || item.type === "tdbu" ? item.fabricUsdPerSqm : item.comboUsdPerSqm;
  const fabric = billedArea * perSqm;
  // tdbu has no cordless option (dual rails require two cord paths).
  const cordless = item.type !== "tdbu" && item.operation === "cordless" ? billedArea * 20 : 0;
  const motor = item.operation === "motor" ? 142.26 + 14 : 0;
  const sideTrack = item.sideTrack ? w * 20 : 0;
  const holder = (item.type === "honeycomb" || item.type === "honeycomb-25") && item.holder ? HOLDER_USD : 0;
  return fabric + (cordless + motor + sideTrack + holder) * ACCESSORY_FACTOR;
}

export function describeCartItem(item: CartItem): { title: string; sub: string } {
  const HOLDER_LABEL: Record<string, string> = { white: "Hvítur", navy: "Marínublár", black: "Svartur" };
  if (item.type === "windour") {
    const tier = item.productId.endsWith("-999") ? "999" : "2000";
    const kind = item.productId.includes("-duo-") ? "Duo" : "Single";
    return {
      title: `WINdoûr ${kind} ${tier} · ÁÆTLUN`,
      sub: `${item.widthCm}×${item.heightCm} cm · ${item.materialLabel} · ${item.chargeableSqm.toFixed(2)} m² · ${item.quoteExpiresInDays} daga provisional quote (${item.quoteExpiryLabel}) · staðfesting birgis vantar`,
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
      title: `Hunangskamb 45 mm · ${item.fabricName}`,
      sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}${holderSuffix}`,
    };
  }
  if (item.type === "honeycomb-25") {
    const holderSuffix = item.holder ? ` · Lásahaldari · ${HOLDER_LABEL[item.holder]}` : "";
    return {
      title: `Hunangskamb 25 mm · ${item.fabricName}`,
      sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}${holderSuffix}`,
    };
  }
  if (item.type === "tdbu") {
    return {
      title: `TDBU · ${item.fabricName}`,
      sub: `${item.width}×${item.height}mm · ${item.fabricCode} · ${opLabel}${item.sideTrack ? " · hliðarspor" : ""} · ${item.railColor}`,
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

function migrateCartItem(raw: unknown): CartItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
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
      quantity: normalizeQuantity(item.qty),
      material: item.material,
    });
    if (!quote || quote.unitIsk !== item.unitIsk) return null;
    item.qty = normalizeQuantity(item.qty);
    return item as unknown as WindourCartItem;
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
    return item as unknown as RollerCartItem;
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
    return item as unknown as HoneycombCartItem;
  }
  if (item.type === "honeycomb-25") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "sheer" && item.fabricType !== "translucent" && item.fabricType !== "blackout" && item.fabricType !== "dualdeck") ||
      (item.operation !== "manual" && item.operation !== "cordless" && item.operation !== "motor")
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return item as unknown as Honeycomb25CartItem;
  }
  if (item.type === "tdbu") {
    if (
      typeof item.fabricCode !== "string" ||
      typeof item.fabricName !== "string" ||
      !isFiniteNumber(item.fabricUsdPerSqm) ||
      (item.fabricType !== "translucent" && item.fabricType !== "blackout") ||
      (item.operation !== "manual" && item.operation !== "motor") ||
      typeof item.sideTrack !== "boolean"
    ) return null;
    if (typeof item.railColor !== "string") item.railColor = "Hvítt";
    return item as unknown as TdbuCartItem;
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
    return item as unknown as VerticalCartItem;
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
    return item as unknown as DaynightCartItem;
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
    return item as unknown as DualRollerCartItem;
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
    return item as unknown as ZebraCartItem;
  }
  return null;
}

function loadFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    setItems((prev) => [...prev, { ...item, qty: normalizeQuantity(item.qty), id } as CartItem]);
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
