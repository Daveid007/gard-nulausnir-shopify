import { categoryLabel, resolveProductCategory } from "./collectionCategories.ts";
import { CURTAIN_PRODUCT_DEFINITIONS } from "./curtains.ts";

// Keep the curated catalogue data importable by the Node regression scripts;
// Vite turns these literal URLs into hashed local assets in the browser build.
const verticalSheerCasePrimary = new URL("../../../assets/vertical-sheer-shades/cases/Vertical sheer shades (2).jpg", import.meta.url).href;
const verticalSheerCaseSecondary = new URL("../../../assets/vertical-sheer-shades/cases/Vertical sheer shades (1).jpg", import.meta.url).href;

export type Product = {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  productType?: string;
  tags?: string[];
  collectionHandles?: string[];
  collectionTitles?: string[];
  price: string;
  image: string;
  secondary: string;
  colors: string[];
  swatches?: readonly { code: string; fileName: string }[];
  note?: string;
  sizes: string[];
  shopifyHandle?: string;
  fallbackImage?: string;
  fallbackSecondary?: string;
  description?: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

const curtainCatalogProducts: Product[] = CURTAIN_PRODUCT_DEFINITIONS.map((definition) => ({
  id: definition.id,
  title: definition.title,
  subtitle: `${definition.swatches.length} litakóðar${definition.lightControl ? ` · ${definition.lightControl}` : ""} · sýnishorn til skoðunar`,
  category: "Gluggatjöld",
  price: "Verð eftir fyrirspurn",
  image: "",
  secondary: "",
  colors: [],
  swatches: definition.swatches,
  note: definition.lightControl ?? definition.productCode,
  sizes: [],
}));

const catalogProducts: Product[] = [
  { id: "honeycomb-45mm", title: "Myrkvunargardína 45 mm", subtitle: "Álfilma · algjör myrkvun", category: "Myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-honeycomb-45mm-detail.png?v=1787921252", colors: [], note: "100% myrkvun", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "honeycomb-25mm", title: "Myrkvunargardína 25 mm", subtitle: "Mjór kassi · mjúk birta", category: "Myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-25mm.png?v=1787921264", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-honeycomb-25mm-detail.png?v=1787921266", colors: [], note: "Cellular", sizes: ["60–120 cm", "121–180 cm"] },
  { id: "day-night", title: "Dagur & Nótt", subtitle: "Tvö lög · dagsbirta og myrkvun", category: "Myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-day-and-night.jpg?v=1787921276", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-day-and-night-detail.jpg?v=1787921278", colors: [], note: "Dagur & nótt", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "top-down-bottom-up", title: "Top-Down Bottom-Up", subtitle: "Brautalaus ljósstýring", category: "Myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-top-down-bottom-up.jpg?v=1787921285", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-top-down-bottom-up.jpg?v=1787921285", colors: [], note: "TDBU", sizes: ["60–120 cm", "121–180 cm"] },
  { id: "vertical-45mm", title: "Lóðrétt 45 mm", subtitle: "Lóðrétt myrkvunarkerfi", category: "Myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-vertical-45mm.png?v=1787921294", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-vertical-45mm-detail.png?v=1787921297", colors: [], note: "Lóðrétt", sizes: ["121–180 cm", "181–240 cm"] },
  { id: "vertical-sheer-shades", title: "Lóðréttar vefgardínur", subtitle: "Vertical Sheer Shades · Dream Shades · 17 supplier swatches", category: "Lóðréttar vefgardínur", price: "Reiknast eftir máli", image: verticalSheerCasePrimary, secondary: verticalSheerCaseSecondary, colors: [], note: "17 efni", sizes: ["50–400 cm", "50–600 cm"] },

  { id: "square-cassette", title: "Ferningskassetta", subtitle: "Hrein lína · lokað kerfi", category: "Rúllugardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-square-cassette.png?v=1787921305", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-square-cassette-detail.png?v=1787921309", colors: [], note: "Blackout", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "arc-cassette", title: "Bogakassetta", subtitle: "Mjúk lína · ljósdreifing", category: "Rúllugardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-arc-cassette-primary.png?v=1787921322", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-arc-cassette-detail.png?v=1787921324", colors: [], note: "Ljósdreifing", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "open-roll", title: "Opið rúll", subtitle: "Klassískt opið rúllukerfi", category: "Rúllugardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-open-roll.png?v=1787921348", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-open-roll-detail.png?v=1787921351", colors: [], note: "Rúllugardína", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "dual-roller", title: "Tvöfalt rúll", subtitle: "Dagljós og myrkvun í tveimur lögum", category: "Rúllugardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-dual-roller.jpg?v=1787921365", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/02-dual-roller-detail.jpg?v=1787921367", colors: [], note: "Tvö lög", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },
  { id: "zebra-blind", title: "Sebragardína", subtitle: "Stillanleg dagsbirta og næði", category: "Rúllugardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-zebra-blind.png?v=1787921376", secondary: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-zebra-blind.png?v=1787921376", colors: [], note: "Ljósdreifing", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"] },

  // These two workbook products intentionally have no guessed photography. The
  // workbook supplies SS/BFHLA pricing and options; until matching catalogue
  // photography is available, the storefront presents a neutral image panel.
  { id: "sheer-shades", title: "Sheer Shades", subtitle: "Láréttar Sheer Shades · stillanleg dagsbirta og næði", category: "Sheer Shades", productType: "Sheer Shades", tags: ["sheer-shades", "SS"], collectionHandles: ["sheer-shades"], collectionTitles: ["Sheer Shades"], price: "Reiknast eftir máli", image: "", secondary: "", colors: [], note: "SS", sizes: ["50–300 cm", "50–400 cm"] },
  { id: "butterfly-blinds", title: "Fiðrildagardína", subtitle: "Láréttar Butterfly Blinds · mjúk ljósstýring og næði", category: "Fiðrildagardínur", productType: "Butterfly Blinds", tags: ["butterfly", "BFHLA"], collectionHandles: ["butterfly"], collectionTitles: ["Fiðrildagardínur"], price: "Reiknast eftir máli", image: "", secondary: "", colors: [], note: "BFHLA", sizes: ["50–300 cm", "50–400 cm"] },

  ...curtainCatalogProducts,

  { id: "windour-single-999", shopifyHandle: "windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-mosquito-fly-net", title: "Rammagardínur 999", subtitle: "Meira en gardína — eins og húsgagn í rýminu.", category: "Rammagardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_pg9wzppg9wzppg9w.png?v=1768448444", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_6hn5b56hn5b56hn5.png?v=1768448393", colors: [], note: "100% myrkvun · hliðarlistar", sizes: ["60–120 cm"], description: "Sérsmíðað álrammakerfi með segullokun. Velja má álfilmu-einangraða honeycomb-myrkvun eða fellt flugnanet.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-mosquito-fly-net" },
  { id: "windour-single-2000", shopifyHandle: "windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-net-up-to-2000mm-tall-x-up-to-2000mm-wide", title: "Rammagardínur 2000", subtitle: "Meira en gardína — eins og húsgagn í rýminu.", category: "Rammagardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_l5vqvel5vqvel5vq.png?v=1768839861", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_2290dj2290dj2290.png?v=1768839853", colors: [], note: "100% myrkvun · hliðarlistar", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"], description: "Sérsmíðað álrammakerfi fyrir stærri glugga, með segullokun og vali um einangraða honeycomb-myrkvun eða flugnanet.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-net-up-to-2000mm-tall-x-up-to-2000mm-wide" },
  { id: "windour-duo-2000", shopifyHandle: "windour-duo-custom-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net", title: "Ramma flugnanet og myrkvunargardínur 2000", subtitle: "Einangruð myrkvun og flugnanet", category: "Ramma flugnanet og myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/7953253b-19aa-4e2d-8210-5909e63fb0f0.jpg?v=1768840303", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/1000114055.jpg?v=1772120087", colors: [], note: "100% myrkvun · hliðarlistar", sizes: ["121–180 cm", "181–240 cm"], description: "Sérsmíðað DUO-rammakerfi sem sameinar álfilmu-einangraða honeycomb-myrkvun og fellt flugnanet í einni lausn.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/windour-duo-custom-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net" },
  { id: "windour-duo-999", shopifyHandle: "windour-duo-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net", title: "Ramma flugnanet og myrkvunargardínur 999", subtitle: "Tvöföld gluggalausn fyrir smærri op", category: "Ramma flugnanet og myrkvunargardínur", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/WINdour-DUO-Made-to-Measure-Honeycomb-Insulation-C-3819.jpg?v=1772120087", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/IMG_1548.png?v=1768842110", colors: [], note: "100% myrkvun · hliðarlistar", sizes: ["60–120 cm"], description: "Sérsmíðað DUO-rammakerfi fyrir smærri op sem sameinar einangraða honeycomb-myrkvun og flugnanet.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/windour-duo-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net" },

  { id: "blinddour-trackless-door", shopifyHandle: "netdour-trackless-blind-or-net-door-screen-up-to-2000mm-tall-x-up-to-2000mm-wide-copy", title: "BLINDdoûr Trackless Door", subtitle: "Brautalaus einangruð myrkvunarhurð", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_l5vqvel5vqvel5vq.png?v=1768839861", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_ylb05dylb05dylb0.png?v=1768452851", colors: [], note: "100% myrkvun · hliðarlistar", sizes: ["121–180 cm", "181–240 cm"], description: "Sérsmíðuð inndraganleg myrkvunarhurð með einangrandi honeycomb-efni, segullokun og lágum gólfleiðara í stað fyrirferðarmikillar botnbrautar.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/netdour-trackless-blind-or-net-door-screen-up-to-2000mm-tall-x-up-to-2000mm-wide-copy" },
  { id: "netdour-trackless-door", shopifyHandle: "netdour-bespoke-made-measure-retractable", title: "NETdoûr Trackless", subtitle: "Brautalaust hurðarnet gegn mýi og skordýrum", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/unnamed.jpg?v=1769688545", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_2n7mus2n7mus2n7m.png?v=1769688546", colors: [], note: "Flugnanet", sizes: ["60–120 cm", "121–180 cm", "181–240 cm"], description: "Sérsmíðað inndraganlegt 20×20 PE-flugnanet í álramma. Lágt gólfleiðarakerfi, segullokun og frjálst loftflæði án þess að hleypa skordýrum inn.", sourceLabel: "Vöruupplýsingar og litir: Thedoûr", sourceUrl: "https://www.thedour.com/products/netdour-bespoke-made-measure-retractable" },
  { id: "roldour-duo-horizontal", title: "ROLdoûr Duo Horizontal", subtitle: "Lárétt myrkvun og flugnanet", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_y9o0pcy9o0pcy9o0.png?v=1769688460", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/985496fb-8f02-4808-9833-3a7e656ff98b.jpg?v=1769688462", colors: [], note: "Myrkvun + net", sizes: ["60–120 cm"] },
  { id: "roldour-slimline-horizontal", title: "ROLdoûr Slimline Horizontal", subtitle: "Þunnt lárétt myrkvunar- eða netkerfi", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_s77zfis77zfis77z.png?v=1768449422", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_n0knppn0knppn0kn.png?v=1768449489", colors: [], note: "Slimline", sizes: ["60–120 cm", "121–180 cm"] },
  { id: "roldour-single-vertical", title: "ROLdoûr Single Vertical", subtitle: "Lóðrétt myrkvunar- eða netkerfi", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_gcgfz4gcgfz4gcgf.png?v=1768445913", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_4gphw94gphw94gph.png?v=1768445913", colors: [], note: "Lóðrétt", sizes: ["121–180 cm", "181–240 cm"] },
  { id: "roldour-slimline-duo-vertical", title: "ROLdoûr Slimline Duo Vertical", subtitle: "Myrkvun og flugnanet í tvöföldu kerfi", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/99fc39ff-f495-4788-9711-24e4fe83697a.jpg?v=1769688238", colors: [], note: "Myrkvun + net", sizes: ["60–120 cm", "121–180 cm"] },
  { id: "roldour-duo-vertical-small", title: "ROLdoûr Duo Vertical 999", subtitle: "Tvöfalt lóðrétt kerfi fyrir smærri op", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/2689ee8c-4978-42b3-a6db-34f5895778c3.jpg?v=1769688240", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238", colors: [], note: "Myrkvun + net", sizes: ["60–120 cm"] },
  { id: "roldour-duo-vertical-large", title: "ROLdoûr Duo Vertical 2000", subtitle: "Tvöfalt lóðrétt kerfi fyrir stærri op", category: "Flugnanet og rammar", price: "Reiknast eftir máli", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/99fc39ff-f495-4788-9711-24e4fe83697a.jpg?v=1769688238", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238", colors: [], note: "Myrkvun + net", sizes: ["121–180 cm", "181–240 cm"] },

  { id: "flexdour-three-side", shopifyHandle: "flexdour-3-side-folding-shower-enclosure-doors-with-central-opening-1850mm-height-x-reducible-width-made-in-italy", title: "FLEXdoûr Þriggja hliða", subtitle: "Samanbrjótanleg PVC sturtulausn · miðopnun", category: "Thedoûr - Baðlausnir", price: "Verð eftir staðfestingu", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/image.jpg?v=1769688343", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/FLEXdour-3-Side-Folding-PVC-Shower-Enclosure-Doors-0.png?v=1769688343", colors: [], note: "Vatnshelt · 100% næði", sizes: ["Sérsmíði"] },
  { id: "flexdour-central-opening", shopifyHandle: "flexdour-round-folding-shower-enclosure-door-with-central-opening-1850mm-height-x-reducible-width-made-in-italy", title: "FLEXdoûr Miðopnun", subtitle: "Zero-Glass PVC sturtuhurð · 1850 mm", category: "Thedoûr - Baðlausnir", price: "Verð eftir staðfestingu", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_mmwlkommwlkommwl.png?v=1769688287", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/FLEXdour-PVC-Shower-Door-with-Central-Opening-1850.jpg?v=1769688288", colors: [], note: "Rakaþolið · 100% næði", sizes: ["Sérsmíði"] },
  { id: "flexdour-side-opening", shopifyHandle: "copy-flexdour-round-folding-shower-enclosure-door-with-side-opening-1850mm-height-x-reducible-width-made-in-italy-2", title: "FLEXdoûr Hliðaropnun", subtitle: "Samanbrjótanleg PVC sturtuhurð · 1850 mm", category: "Thedoûr - Baðlausnir", price: "Verð eftir staðfestingu", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/generated-image-2026-01-22.png?v=1769688329", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/FLEXdour-PVC-Folding-Shower-Door-with-Side-Opening-0.jpg?v=1769688326", colors: [], note: "Vatnshelt · 100% næði", sizes: ["Sérsmíði"] },
  { id: "flexdour-corner", shopifyHandle: "flexdour-corner-corner-shower-cabin-with-wide-band-central-folding-1850mm-height-x-opening-reducible-width-made-in-italy", title: "FLEXdoûr Hornlausn", subtitle: "Tveggja hliða PVC sturtulausn · miðopnun", category: "Thedoûr - Baðlausnir", price: "Verð eftir staðfestingu", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_n8k8f9n8k8f9n8k8.png?v=1769688393", secondary: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/FLEXdour-Corner-PVC-Shower-Door-with-central-Openi-0.jpg?v=1769688391", colors: [], note: "Rakaþolið · 100% næði", sizes: ["Sérsmíði"] },
];

export const products = catalogProducts
  .filter(product => product.category !== "Thedoûr - Baðlausnir")
  .map(product => {
    const resolvedCategory = resolveProductCategory(product);
    return {
      ...product,
      category: resolvedCategory ? categoryLabel(resolvedCategory) : product.category,
    };
  });

export const categories = ["Allt", "Myrkvunargardínur", "Rúllugardínur", "Lóðréttar vefgardínur", "Sheer Shades", "Fiðrildagardínur", "Rammagardínur", "Ramma flugnanet og myrkvunargardínur", "Flugnanet og rammar"];