import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { CASSETTE_RAIL_COLORS } from "@/assets/railImages";

const DEFAULT_RAIL_COLOR = "Hvítur";
const STORAGE_KEY = "solmyrkvun.railColor.v1";

const VALID_COLORS = new Set(CASSETTE_RAIL_COLORS.map((c) => c.value));

function loadFromStorage(): string {
  if (typeof window === "undefined") return DEFAULT_RAIL_COLOR;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && VALID_COLORS.has(raw)) return raw;
  } catch {
    // ignore
  }
  return DEFAULT_RAIL_COLOR;
}

function saveToStorage(color: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, color);
  } catch {
    // ignore quota errors
  }
}

type RailColorContextValue = {
  railColor: string;
  setRailColor: (color: string) => void;
};

const RailColorContext = createContext<RailColorContextValue | null>(null);

export function RailColorProvider({ children }: { children: ReactNode }) {
  const [railColor, setRailColorState] = useState<string>(() => loadFromStorage());

  const setRailColor = useCallback((color: string) => {
    setRailColorState(color);
  }, []);

  useEffect(() => {
    saveToStorage(railColor);
  }, [railColor]);

  return (
    <RailColorContext.Provider value={{ railColor, setRailColor }}>
      {children}
    </RailColorContext.Provider>
  );
}

export function useRailColor(): RailColorContextValue {
  const ctx = useContext(RailColorContext);
  if (!ctx) throw new Error("useRailColor must be used inside <RailColorProvider>");
  return ctx;
}
