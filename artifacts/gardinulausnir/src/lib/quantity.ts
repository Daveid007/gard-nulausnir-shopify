export function normalizeQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(99, Math.max(1, Math.trunc(value)));
}