/** Display grouping only; supplier codes, prices and material properties are untouched. */
const FAMILIES = [
  { label: "Hvítir og rjómalitir", colors: ["White", "Cream", "Off-White", "Frost White", "Ivory", "Chalk", "Cotton", "Sail", "Pearl"] },
  { label: "Beige, sand- og línlitir", colors: ["Beige", "Sand", "Linen", "Oyster", "Parchment", "Shell", "Tortilla"] },
  { label: "Gráir litir", colors: ["Grey", "Gray", "Dark Grey", "Light Grey", "Light Gray", "Steel Grey", "Charcoal Grey", "Chrome", "Concrete", "Mica", "Pebble", "Pewter", "Smoke"] },
  { label: "Brúnir og bronslitir", colors: ["Brown", "Light Brown", "Black Brown", "Grey Brown", "Ash-Gray Brown", "Bronze", "Camel", "Coffee", "Taupe"] },
  { label: "Svartir litir", colors: ["Black"] },
  { label: "Bláir litir", colors: ["Light Blue", "Lake Blue", "Cobalt Blue"] },
  { label: "Grænir litir", colors: ["Mint"] },
  { label: "Hlýir litir", colors: ["Apricot", "Coral"] },
  { label: "Blandaðir litir", colors: [] },
  { label: "Aðrir / ótilgreindir litir", colors: [] },
] as const;

export function fabricColorFamily(color: string): string {
  const parts = color.split(/[/*]/).map((part) => part.trim()).filter(Boolean);
  const groups = parts.map((part) => FAMILIES.find((family) =>
    (family.colors as readonly string[]).includes(part))?.label ?? FAMILIES[9].label);
  if (!groups.length) return FAMILIES[9].label;
  return new Set(groups).size > 1 ? FAMILIES[8].label : groups[0];
}

export function groupFabricsByColor<T extends { colorFamily: string; code: string }>(fabrics: readonly T[]) {
  return FAMILIES.map(({ label }) => ({
    label,
    fabrics: fabrics.filter((fabric) => fabric.colorFamily === label)
      .sort((a, b) => a.code.localeCompare(b.code, "is", { numeric: true })),
  })).filter((group) => group.fabrics.length > 0);
}

/** Editorial ordering, not a claim about measured sales popularity. */
export function groupFabricsByColorAndLight<T extends { color: string; light: string; code: string }>(fabrics: readonly T[]) {
  const groups = new Map<string, { label: string; color: string; fabrics: T[] }>();
  for (const fabric of fabrics) {
    const label = `${fabric.color} · ${fabric.light}`;
    const group = groups.get(label) ?? { label, color: fabric.color, fabrics: [] };
    group.fabrics.push(fabric);
    groups.set(label, group);
  }
  const priority = (color: string) => {
    const preferred = ["Hvítur", "Rjómi", "Rjómahvítur", "Brothvítur", "Grár", "Ljósgrár", "Dökkgrár", "Sandlitur", "Línlitur", "Svartur"];
    const index = preferred.indexOf(color);
    return index < 0 ? preferred.length : index;
  };
  return [...groups.values()].sort((a, b) =>
    priority(a.color) - priority(b.color) || a.label.localeCompare(b.label, "is", { numeric: true }),
  ).map(group => ({
    ...group,
    fabrics: [...group.fabrics].sort((a, b) => a.code.localeCompare(b.code, "is", { numeric: true })),
  }));
}
