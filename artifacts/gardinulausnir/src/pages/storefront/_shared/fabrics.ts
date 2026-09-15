import { COLLECTIONS } from "./fabric-collections";
import { fabricsByFamily } from "./honeycomb-fabrics";
import { swatchUrl } from "./swatches";

export function getRollerFabrics(opacity: "blackout" | "light-filtering") {
  const allowedCategories = opacity === "blackout"
    ? new Set(["blackout"])
    : new Set(["roller", "screen"]);
  return COLLECTIONS.filter(c => allowedCategories.has(c.category)).flatMap(c => c.swatches.map(s => ({
    name: `${c.nameIs} · ${s.nameIs}`,
    code: s.code,
    image: swatchUrl(s.img),
    category: c.category,
    collection: c.id,
    collectionName: c.nameIs,
  })));
}

export function getHoneycombFabrics(opacity: "blackout" | "light-filtering") {
  const family = opacity === "blackout" ? "KB" : "KT";
  return fabricsByFamily(family).map(f => ({
    name: `${family === "KB" ? "Myrkvun" : "Ljós síað"} · ${f.is}`,
    code: f.code,
    image: f.image,
    family: f.family,
  }));
}
