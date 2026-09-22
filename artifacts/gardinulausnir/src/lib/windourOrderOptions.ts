export type WindourMeasurementMode = "opening" | "outer-frame";

export const WINDOUR_PLEATED_NET = "Pleated flugnanet";

export type WindourSizeBand = {
  id: string;
  minMm: number;
  maxMm: number;
  label: string;
};

export const WINDOUR_SIZE_BANDS: readonly WindourSizeBand[] = [
  { id: "up-to-1099", minMm: 0, maxMm: 1099, label: "Allt að 1099 mm" },
  ...Array.from({ length: 9 }, (_, index) => {
    const minMm = 1100 + index * 100;
    const maxMm = index === 8 ? 2000 : minMm + 99;
    return { id: `${minMm}-${maxMm}`, minMm, maxMm, label: `${minMm}–${maxMm} mm` };
  }),
];

export function getWindourSizeBand(mm: number): WindourSizeBand | null {
  if (!Number.isFinite(mm) || mm <= 0 || mm > 2000) return null;
  return WINDOUR_SIZE_BANDS.find((band) => mm >= band.minMm && mm <= band.maxMm) ?? null;
}

export function isValidWindourBandForMeasurement(bandId: string, mm: number): boolean {
  return getWindourSizeBand(mm)?.id === bandId;
}

export function isWindourMeasurementMode(value: unknown): value is WindourMeasurementMode {
  return value === "opening" || value === "outer-frame";
}

export function isValidWindourNotes(value: unknown): value is string {
  return typeof value === "string" && value.length <= 2000;
}

export function isValidDuoPanelChoices(value: unknown, validFabrics: readonly string[]): value is [string, string] {
  return Array.isArray(value) &&
    value.length === 2 &&
    value[0] !== value[1] &&
    value.every((choice) => typeof choice === "string" && validFabrics.includes(choice));
}

export function isStandardWindourDuoChoice(choices: readonly string[]): boolean {
  return choices.length === 2 &&
    choices.includes(WINDOUR_PLEATED_NET) &&
    choices.filter((choice) => choice !== WINDOUR_PLEATED_NET).length === 1;
}