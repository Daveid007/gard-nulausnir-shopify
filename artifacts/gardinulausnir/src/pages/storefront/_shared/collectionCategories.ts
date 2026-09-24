/**
 * The collection page deliberately uses a small, closed set of categories.
 * Product ids are the source of truth for the products already mapped in the
 * storefront. Shopify metadata is only used for products without a canonical
 * id match, and every metadata value is matched as a complete normalized
 * token (never as a substring).
 *
 * URL precedence is deterministic: an explicit `category` query parameter,
 * then `collection`, wins over the hash. A hash is otherwise interpreted as
 * a category alias. An absent hash/query means the explicit `all` view;
 * unknown values stay unknown and must never fall back to that view.
 */

export type CollectionCategoryKey =
  | "all"
  | "honeycomb"
  | "roller"
  | "vertical-sheer"
  | "sheer-shades"
  | "butterfly"
  | "windour"
  | "roldour"
  | "curtains"
  | "thedour-doors";

export type CollectionCategorySelection = CollectionCategoryKey | "unknown";
export type FilterableProduct = {
  id?: string;
  category?: string;
  productType?: string;
  tags?: readonly string[];
  collectionHandles?: readonly string[];
  collectionTitles?: readonly string[];
};

export type CollectionCategoryDefinition = {
  key: CollectionCategoryKey;
  label: string;
  english: string;
  description: string;
  hash: string;
};

export const COLLECTION_CATEGORY_DEFINITIONS: readonly CollectionCategoryDefinition[] = [
  {
    key: "all",
    label: "Allt safnið",
    english: "GARDÍNULAUSNIR / ALLT",
    description: "Skoðaðu öll kerfin í vörulistanum.",
    hash: "all-products",
  },
  {
    key: "honeycomb",
    label: "Myrkvunargardínur",
    english: "HANDE / CELLULAR",
    description: "Gardínur eftir máli sem loka birtuna úti.",
    hash: "honeycomb",
  },
  {
    key: "roller",
    label: "Rúllugardínur",
    english: "HANDE / ROLLER",
    description: "Rúllugardínur eftir máli — hægt að velja með hliðarlistum eða án. Hliðarlistar hjálpa til við að draga úr birtu meðfram hliðum gardínunnar.",
    hash: "roller",
  },
  {
    key: "vertical-sheer",
    label: "Lóðréttar vefgardínur",
    english: "VERTICAL SHEER SHADES / DREAM SHADES",
    description: "Lóðréttar vefgardínur eftir máli með 17 birgjaskráðum efnum.",
    hash: "vertical-sheer-shades",
  },
  {
    key: "sheer-shades",
    label: "Sheer Shades",
    english: "SHEER SHADES / HORIZONTAL",
    description: "Láréttar Sheer Shades eftir máli með stillanlegri dagsbirtu og næði.",
    hash: "sheer-shades",
  },
  {
    key: "butterfly",
    label: "Fiðrildagardínur",
    english: "BUTTERFLY BLINDS / HORIZONTAL",
    description: "Lárétt Butterfly-kerfi eftir máli fyrir mjúka ljósstýringu og næði.",
    hash: "butterfly",
  },
  {
    key: "windour",
    label: "WINdoûr — Rammagardínur",
    english: "WINDOÛR / RAMMAGARDÍNUR",
    description: "Meira en gardína — eins og húsgagn í rýminu. Öll WINdoûr single- og duo-rammakerfi á einum stað.",
    hash: "windour",
  },
  {
    key: "roldour",
    label: "ROLdoûr — Rúllukerfi í ramma",
    english: "ROLDOÛR / RÚLLUKERFI Í RAMMA",
    description: "Sérsmíðuð ROLdoûr rúllukerfi í ramma fyrir glugga og hurðir.",
    hash: "roldour",
  },
  {
    key: "curtains",
    label: "Gluggatjöld",
    english: "GARDÍNUR / CURTAINS",
    description: "Gluggatjöld — 1000, 2828 og 2883 með litasýnishornum til skoðunar.",
    hash: "curtains",
  },
  {
    key: "thedour-doors",
    label: "Hurðagardínur og flugnanet",
    english: "HURÐAGARDÍNUR OG FLUGNANET",
    description: "Hurðakerfi, brautalaus net og mý-/skordýravörn úr Shopify-vörulistanum.",
    hash: "thedour-doors",
  },
] as const;

const canonicalProductCategories: Readonly<Record<string, Exclude<CollectionCategoryKey, "all">>> = {
  "honeycomb-45mm": "honeycomb",
  "honeycomb-25mm": "honeycomb",
  "day-night": "honeycomb",
  "top-down-bottom-up": "honeycomb",
  "vertical-45mm": "honeycomb",
  "vertical-sheer-shades": "vertical-sheer",
  "sheer-shades": "sheer-shades",
  "butterfly-blinds": "butterfly",
  "square-cassette": "roller",
  "arc-cassette": "roller",
  "open-roll": "roller",
  "dual-roller": "roller",
  "zebra-blind": "roller",
  "windour-single-999": "windour",
  "windour-single-2000": "windour",
  "windour-duo-2000": "windour",
  "windour-duo-999": "windour",
  "curtains-1000": "curtains",
  "curtains-2828": "curtains",
  "curtains-2883": "curtains",
  "gluggatjold-1000": "curtains",
  "gluggatjöld-1000": "curtains",
  "blinddour-trackless-door": "thedour-doors",
  "netdour-trackless-door": "thedour-doors",
  "roldour-duo-horizontal": "roldour",
  "roldour-slimline-horizontal": "roldour",
  "roldour-single-vertical": "roldour",
  "roldour-slimline-duo-vertical": "roldour",
  "roldour-duo-vertical-small": "roldour",
  "roldour-duo-vertical-large": "roldour",
};

const categoryByToken = new Map<string, CollectionCategoryKey>([
  ["all", "all"],
  ["allt", "all"],
  ["all-products", "all"],
  ["all-products-view", "all"],

  ["honeycomb", "honeycomb"],
  ["category-honeycomb", "honeycomb"],
  ["collection-honeycomb", "honeycomb"],
  ["honeycomb-blind", "honeycomb"],
  ["honeycomb-blinds", "honeycomb"],
  ["cellular", "honeycomb"],
  ["category-cellular", "honeycomb"],
  ["collection-cellular", "honeycomb"],
  ["cellular-blind", "honeycomb"],
  ["cellular-blinds", "honeycomb"],
  ["myrkvun", "honeycomb"],
  ["myrkvunargardinur", "honeycomb"],
  ["myrkvunargardina", "honeycomb"],
  ["myrkvunargardina-25-mm", "honeycomb"],
  ["myrkvunargardina-45-mm", "honeycomb"],
  ["hunangskamb", "honeycomb"],
  ["hunangskambsgardinur", "honeycomb"],
  ["hunangskambsgardina", "honeycomb"],
  ["honeycomb-25-mm", "honeycomb"],
  ["honeycomb-45-mm", "honeycomb"],
  ["day-and-night", "honeycomb"],
  ["top-down-bottom-up", "honeycomb"],
  ["vertical-45-mm", "honeycomb"],

  ["vertical-sheer-shades", "vertical-sheer"],
  ["vertical-sheer", "vertical-sheer"],
  ["dream-shades", "vertical-sheer"],
  ["vertical-sheer-blinds", "vertical-sheer"],
  ["lodrettar-vefgardinur", "vertical-sheer"],

  ["sheer-shades", "sheer-shades"],
  ["sheer-shade", "sheer-shades"],
  ["horizontal-sheer-shades", "sheer-shades"],
  ["horizontal-sheer", "sheer-shades"],
  ["sheer-blinds", "sheer-shades"],

  ["butterfly", "butterfly"],
  ["butterfly-blinds", "butterfly"],
  ["fidrildagardinur", "butterfly"],
  ["fidrildagardina", "butterfly"],

  ["roller", "roller"],
  ["category-roller", "roller"],
  ["collection-roller", "roller"],
  ["roller-blind", "roller"],
  ["roller-blinds", "roller"],
  ["rull", "roller"],
  ["rullugardinur", "roller"],
  ["rullugardina", "roller"],
  ["square-cassette", "roller"],
  ["arc-cassette", "roller"],
  ["open-roll", "roller"],
  ["dual-roller", "roller"],
  ["dualroller", "roller"],
  ["zebra", "roller"],
  ["zebra-blind", "roller"],

  ["windour", "windour"],
  ["windour-rammagardinur", "windour"],
  // Legacy single/duo destinations now intentionally open the complete
  // WINdoûr family while preserving old bookmarks and Shopify handles.
  ["windour-single", "windour"],
  ["category-windour-single", "windour"],
  ["collection-windour-single", "windour"],
  ["windour-single-999", "windour"],
  ["windour-single-2000", "windour"],
  ["the-dour-single", "windour"],
  ["thedour-single", "windour"],
  ["thedour-windows", "windour"],
  ["gluggalausnir-single", "windour"],
  ["einfaldar-rullugardinur", "windour"],
  ["einfaldar-rullugardina", "windour"],
  ["einfaldar-rullugardinur-999", "windour"],
  ["einfaldar-rullugardinur-2000", "windour"],
  ["einfold-rullugardinur", "windour"],
  ["einfold-rullugardina", "windour"],
  ["ramma-rullugardina", "windour"],
  ["ramma-rullugardinur", "windour"],
  ["rammagardina", "windour"],
  ["rammagardinur", "windour"],
  ["windour-duo", "windour"],
  ["category-windour-duo", "windour"],
  ["collection-windour-duo", "windour"],
  ["windour-duo-999", "windour"],
  ["windour-duo-2000", "windour"],
  ["the-dour-duo", "windour"],
  ["thedour-duo", "windour"],
  ["gluggalausnir-duo", "windour"],
  ["tviskiptar-rullugardinur", "windour"],
  ["tviskiptar-rullugardinur-duo", "windour"],
  ["tviskiptar-rullugardina", "windour"],
  ["tviskiptar-rullugardina-duo", "windour"],
  ["tviskiptar-rullugardinur-duo-999", "windour"],
  ["tviskiptar-rullugardinur-duo-2000", "windour"],
  ["ramma-gardina-med-flugnaneti", "windour"],
  ["ramma-gardina-me-flugnaneti", "windour"],
  ["ramma-flugnanet-og-myrkvunargardinur", "windour"],

  ["roldour", "roldour"],
  ["roldour-rullukerfi-i-ramma", "roldour"],
  ["category-roldour", "roldour"],
  ["collection-roldour", "roldour"],
  ["roldour-duo-horizontal", "roldour"],
  ["roldour-slimline-horizontal", "roldour"],
  ["roldour-single-vertical", "roldour"],
  ["roldour-slimline-duo-vertical", "roldour"],
  ["roldour-duo-vertical-small", "roldour"],
  ["roldour-duo-vertical-large", "roldour"],
  ["rullukerfi-i-ramma", "roldour"],

  ["curtains", "curtains"],
  ["curtain", "curtains"],
  ["gluggatjold", "curtains"],
  ["gluggatjold-1000", "curtains"],
  ["gluggatjold-1000-litir", "curtains"],
  ["gardintjold", "curtains"],

  ["thedour-doors", "thedour-doors"],
  ["category-thedour-doors", "thedour-doors"],
  ["collection-thedour-doors", "thedour-doors"],
  ["thedour-door", "thedour-doors"],
  ["thedour-hurdir-and-net", "thedour-doors"],
  ["thedour-hurdir-og-net", "thedour-doors"],
  ["thedour-hurdir-net", "thedour-doors"],
  ["blinddour", "thedour-doors"],
  ["netdour", "thedour-doors"],
  ["flugnanet-og-rammar", "thedour-doors"],
  ["flugnanet-rammar", "thedour-doors"],
]);

const categoryLabelByKey = new Map(
  COLLECTION_CATEGORY_DEFINITIONS.map((definition) => [definition.key, definition.label]),
);

function normalizeToken(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("is-IS")
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function categoryFromExactValue(value: string | undefined): CollectionCategoryKey | null {
  if (!value) return null;
  return categoryByToken.get(normalizeToken(value)) ?? null;
}

export function categoryLabel(category: CollectionCategoryKey): string {
  return categoryLabelByKey.get(category) ?? "Allt safnið";
}

/**
 * Resolve an item using canonical id, explicitly assigned storefront
 * metadata, product type, tags, and collection handles/titles in that order.
 */
export function resolveProductCategory(metadata: FilterableProduct): Exclude<CollectionCategoryKey, "all"> | null {
  const canonical = canonicalProductCategories[metadata.id?.trim().toLocaleLowerCase("is-IS") ?? ""];
  if (canonical) return canonical;

  const assigned = categoryFromExactValue(metadata.category);
  if (assigned && assigned !== "all") return assigned;

  const productType = categoryFromExactValue(metadata.productType);
  if (productType && productType !== "all") return productType;

  for (const tag of metadata.tags ?? []) {
    const category = categoryFromExactValue(tag);
    if (category && category !== "all") return category;
  }

  for (const handle of metadata.collectionHandles ?? []) {
    const category = categoryFromExactValue(handle);
    if (category && category !== "all") return category;
  }

  for (const title of metadata.collectionTitles ?? []) {
    const category = categoryFromExactValue(title);
    if (category && category !== "all") return category;
  }

  return null;
}

export function resolveCollectionCategory(value: string | null | undefined): CollectionCategoryKey | null {
  return categoryFromExactValue(value ?? undefined);
}

export function collectionCategoryFromUrl(input: Pick<Location, "search" | "hash">): CollectionCategorySelection {
  const params = new URLSearchParams(input.search);
  const queryValue = params.get("category") ?? params.get("collection");
  if (queryValue !== null) return resolveCollectionCategory(queryValue) ?? "unknown";

  const hashValue = input.hash.replace(/^#/, "");
  if (!hashValue) return "all";
  return resolveCollectionCategory(hashValue) ?? "unknown";
}

export function collectionHref(category: CollectionCategoryKey): string {
  return category === "all" ? "/collection" : `/collection#${COLLECTION_CATEGORY_DEFINITIONS.find((item) => item.key === category)?.hash ?? category}`;
}

export function filterProductsByCategory<T extends FilterableProduct>(
  products: readonly T[],
  category: CollectionCategorySelection | string,
): T[] {
  const selectedCategory: CollectionCategorySelection = category === "unknown"
    ? "unknown"
    : resolveCollectionCategory(category) ?? "unknown";
  if (selectedCategory === "unknown") return [];
  if (selectedCategory === "all") return [...products];
  return products.filter((product) => resolveProductCategory(product) === selectedCategory);
}
