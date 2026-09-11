import { COLLECTIONS } from "./fabric-collections";
import { fabricsByFamily } from "./honeycomb-fabrics";
import { swatchUrl } from "./swatches";

export function getRollerFabrics(opacity: "blackout" | "light-filtering") {
  const allowedCategories = opacity === "blackout" ? ["blackout"] : ["roller", "screen"];
  return COLLECTIONS.filter(c => allowedCategories.includes(c.category)).flatMap(c => c.swatches.map(s => ({
    name: s.nameIs,
    code: s.code,
    image: swatchUrl(s.img)
  })));
}

export function getHoneycombFabrics(opacity: "blackout" | "light-filtering") {
  const family = opacity === "blackout" ? "KB" : "KT";
  return fabricsByFamily(family).map(f => ({
    name: f.is,
    code: f.code,
    image: f.image
  }));
}
