export const OPEN_ROLL_EXAMPLE_LIMITS = {
  widthCm: { min: 30, max: 300 },
  heightCm: { min: 40, max: 350 },
  quantity: { min: 1, max: 99 },
} as const;

export const OPEN_ROLL_EXAMPLE_BASE_ISK = 12_500;
export const OPEN_ROLL_EXAMPLE_AREA_RATE_ISK = 4_500;

export const OPEN_ROLL_EXAMPLE_COLORS = [
  { id: "c-white", label: "Hvítur (Light Filtering)", hex: "#FFFFFF", modifierIsk: 0 },
  { id: "c-grey-blackout", label: "Grár Myrkva (Blackout)", hex: "#555555", modifierIsk: 2_500 },
] as const;

export const OPEN_ROLL_EXAMPLE_RAILS = [
  { id: "br-sewn", label: "Innsaumuð þyngstik (Falin)", modifierIsk: 0 },
  { id: "br-aluminum", label: "Sýnileg ál-neðristika", modifierIsk: 1_800 },
  { id: "br-black-oval", label: "Svört oval tengistik", modifierIsk: 2_200 },
] as const;

export const OPEN_ROLL_EXAMPLE_HOLDERS = [
  { id: "h-std-white", label: "Staðlaðar hvítar plasthaldarar", modifierIsk: 0 },
  { id: "h-metal-chrome", label: "Málmfestingar (Króm finish)", modifierIsk: 3_500 },
  { id: "h-black-caps", label: "Svartar festingar með hlífðarhettum", modifierIsk: 1_200 },
] as const;

export type OpenRollExampleColorId = typeof OPEN_ROLL_EXAMPLE_COLORS[number]["id"];
export type OpenRollExampleRailId = typeof OPEN_ROLL_EXAMPLE_RAILS[number]["id"];
export type OpenRollExampleHolderId = typeof OPEN_ROLL_EXAMPLE_HOLDERS[number]["id"];

export type OpenRollExampleInput = {
  widthCm: number;
  heightCm: number;
  quantity: number;
  colorId: OpenRollExampleColorId;
  railId: OpenRollExampleRailId;
  holderId: OpenRollExampleHolderId;
};

export type OpenRollExampleQuote =
  | { ok: false; errors: string[] }
  | {
      ok: true;
      baseIsk: number;
      areaIsk: number;
      modifiersIsk: number;
      unroundedUnitIsk: number;
      unitIsk: number;
      totalIsk: number;
    };

function selectedModifier<T extends { id: string; modifierIsk: number }>(
  options: readonly T[],
  id: string,
): number | undefined {
  return options.find((option) => option.id === id)?.modifierIsk;
}

export function quoteOpenRollExample(input: OpenRollExampleInput): OpenRollExampleQuote {
  const errors: string[] = [];
  if (!Number.isFinite(input.widthCm) || input.widthCm < OPEN_ROLL_EXAMPLE_LIMITS.widthCm.min || input.widthCm > OPEN_ROLL_EXAMPLE_LIMITS.widthCm.max) {
    errors.push("Breidd þarf að vera frá 30 til 300 cm.");
  }
  if (!Number.isFinite(input.heightCm) || input.heightCm < OPEN_ROLL_EXAMPLE_LIMITS.heightCm.min || input.heightCm > OPEN_ROLL_EXAMPLE_LIMITS.heightCm.max) {
    errors.push("Hæð þarf að vera frá 40 til 350 cm.");
  }
  if (!Number.isFinite(input.quantity) || !Number.isInteger(input.quantity) || input.quantity < OPEN_ROLL_EXAMPLE_LIMITS.quantity.min || input.quantity > OPEN_ROLL_EXAMPLE_LIMITS.quantity.max) {
    errors.push("Magn þarf að vera heil tala frá 1 til 99.");
  }

  const colorModifier = selectedModifier(OPEN_ROLL_EXAMPLE_COLORS, input.colorId);
  const railModifier = selectedModifier(OPEN_ROLL_EXAMPLE_RAILS, input.railId);
  const holderModifier = selectedModifier(OPEN_ROLL_EXAMPLE_HOLDERS, input.holderId);
  if (colorModifier === undefined) errors.push("Veldu gildan dæmalit.");
  if (railModifier === undefined) errors.push("Veldu gilda dæmaneðristiku.");
  if (holderModifier === undefined) errors.push("Veldu gilda dæmafestingu.");
  if (errors.length) return { ok: false, errors };

  const areaIsk = OPEN_ROLL_EXAMPLE_AREA_RATE_ISK * input.widthCm * input.heightCm / 10_000;
  const modifiersIsk = colorModifier! + railModifier! + holderModifier!;
  const unroundedUnitIsk = OPEN_ROLL_EXAMPLE_BASE_ISK + areaIsk + modifiersIsk;
  const unitIsk = Math.round(unroundedUnitIsk);
  return {
    ok: true,
    baseIsk: OPEN_ROLL_EXAMPLE_BASE_ISK,
    areaIsk,
    modifiersIsk,
    unroundedUnitIsk,
    unitIsk,
    totalIsk: unitIsk * input.quantity,
  };
}