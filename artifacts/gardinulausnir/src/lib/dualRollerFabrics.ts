import { rollerWorkbookFabrics } from "../data/rollerWorkbookFabrics.ts";
import { fabricColorLabel } from "./fabricLabels";

// Legacy combination IDs are retained for saved configurations only.
// They classify light transmission here, never Honeycomb product codes.
export type FabricFamily = "KS" | "KT" | "KB" | "KN" | "SB";
export type FabricInfo = {
  code: string;
  name: string;
  is: string;
  family: FabricFamily;
};

export const DUAL_ROLLER_FABRICS: FabricInfo[] = rollerWorkbookFabrics
  .filter((fabric) => fabric.family === "roller")
  .flatMap((fabric): FabricInfo[] => {
    const light = fabric.light.toLowerCase();
    const family = /^(blackout|blockout)$/.test(light) ? "KB"
      : /^suns?creen/.test(light) ? "KS"
      : light === "translucent" ? "KT" : null;
    return family ? [{
      code: fabric.code, name: fabric.color,
      is: fabricColorLabel(fabric.color), family,
    }] : [];
  });

export const FABRICS = Object.fromEntries(DUAL_ROLLER_FABRICS.map((fabric) => [fabric.code, fabric]));
export function fabricsByFamily(family: FabricFamily) {
  return DUAL_ROLLER_FABRICS.filter((fabric) => fabric.family === family);
}
