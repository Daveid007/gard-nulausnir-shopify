import { products } from "./data";
import { collectionHref } from "./collectionCategories";

export const THEDOUR_BASE = "https://www.thedour.com/pages/";
export const thedourUrl = (suffix = "home-office") => `${THEDOUR_BASE}${suffix}`;

const img = (id: string) => products.find((p) => p.id === id)?.image ?? "";

/** Local catalog products that customers can configure and buy here. */
export const localLinks = {
  windourSingle999: "/products/windour-single-999",
  windourSingle2000: "/products/windour-single-2000",
  windourDuo999: "/products/windour-duo-999",
  windourDuo2000: "/products/windour-duo-2000",
  roldourSlimH: "/products/roldour-slimline-horizontal",
  roldourSlimDuoV: "/products/roldour-slimline-duo-vertical",
  roldourSingleV: "/products/roldour-single-vertical",
  netdour: "/products/netdour-trackless-door",
  blinddour: "/products/blinddour-trackless-door",
  squareCassette: "/products/square-cassette",
} as const;

export type HomeOfficeGroup = {
  id: string;
  index: string;
  title: string;
  lede: string;
  families: string[];
  /** "local" = configurable here; "supplier" = information + inquiry only. */
  availability: "local" | "supplier";
  image: string;
  sourceSuffix: string;
  points: string[];
  local?: { label: string; href: string }[];
  collection?: { label: string; href: string };
};

export const homeOfficeGroups: HomeOfficeGroup[] = [
  {
    id: "gluggar",
    index: "01",
    title: "Gluggagardínur í ramma",
    lede: "WINdoûr honeycomb-gardína og ROLdoûr Slimline — fyrir glugga sem þurfa myrkvun, net eða hvort tveggja í einum ramma.",
    families: ["WINdoûr", "ROLdoûr Slimline"],
    availability: "local",
    image: img("windour-single-999"),
    sourceSuffix: "home-office-blinds",
    points: [
      "WINdoûr lokast með segli og fæst með einangraðri honeycomb-myrkvun eða neti.",
      "Single er eitt lag; DUO sameinar myrkvun og net í sama ramma. DUO er ekki það sama og tvíopnun.",
      "ROLdoûr Slimline er gerður fyrir grunn gluggaop þar sem lítið pláss er fyrir ramma.",
      "Nákvæm stærðarbil og rammalitir eru valin á hverri vörusíðu.",
    ],
    local: [
      { label: "Rammagardínur 999", href: localLinks.windourSingle999 },
      { label: "Rammagardínur 2000", href: localLinks.windourSingle2000 },
      { label: "Ramma net + myrkvun 999", href: localLinks.windourDuo999 },
      { label: "Ramma net + myrkvun 2000", href: localLinks.windourDuo2000 },
      { label: "ROLdoûr Slimline Horizontal", href: localLinks.roldourSlimH },
      { label: "ROLdoûr Slimline Duo Vertical", href: localLinks.roldourSlimDuoV },
    ],
    collection: { label: "Allar WINdoûr", href: collectionHref("windour") },
  },
  {
    id: "hurdir",
    index: "02",
    title: "Hurðanet og myrkvunarhurðir",
    lede: "NETdoûr, BLINDdoûr og ROLdoûr — sérsmíðuð kerfi fyrir svalir, verandir og hurðaop.",
    families: ["NETdoûr", "BLINDdoûr", "ROLdoûr"],
    availability: "local",
    image: img("netdour-trackless-door"),
    sourceSuffix: "home-office-netdour-blinddour",
    points: [
      "NETdoûr er útdraganlegt plíserað flugnanet.",
      "BLINDdoûr er honeycomb-myrkvun með álfilmu sem einangrar.",
      "Smíðað eftir máli: hæð 1500–2000 mm, breidd 600–2000 mm. Stærra eftir fyrirspurn.",
      "Lokun til vinstri eða hægri, handfang í fullri lengd og seglalokun.",
      "Lágt gólfspor sem er límt niður — lágt, en þó til staðar.",
      "Plastkeðja neðst dregst inn í hliðarhylki þegar opnað er.",
    ],
    local: [
      { label: "NETdoûr Trackless", href: localLinks.netdour },
      { label: "BLINDdoûr Trackless Door", href: localLinks.blinddour },
      { label: "ROLdoûr Single Vertical", href: localLinks.roldourSingleV },
    ],
    collection: { label: "Hurðagardínur og flugnanet", href: collectionHref("thedour-doors") },
  },
  {
    id: "plass",
    index: "03",
    title: "Plásssparandi hurðir",
    lede: "TAMdoûr rennihurðir og ROLdoûr rúlluhurðir fyrir fataskápa og skápa — engin opnunarsveifla.",
    families: ["TAMdoûr", "ROLdoûr"],
    availability: "supplier",
    image: "",
    sourceSuffix: "home-office-space-saving-doors",
    points: [
      "Tambour-skápasett, lóðrétt eða lárétt.",
      "Stakt sett fyrir op sem er 1000 × 1000 mm; hægt að skipta í 2–3 hurðir.",
      "Skorið til eftir máli. Fæst í gljáandi svörtu eða silfri.",
      "TAMdoûr rennihurð er auðvelt að skera til og þarf ekkert opnunarpláss.",
    ],
  },
  {
    id: "sturta",
    index: "04",
    title: "Samanbrjótanlegar sturtuhurðir",
    lede: "FLEXdoûr og FOLdoûr — glerlausar lausnir fyrir sturtuop.",
    families: ["FLEXdoûr", "FOLdoûr"],
    availability: "supplier",
    image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_mmwlkommwlkommwl.png?v=1769688287",
    sourceSuffix: "home-office-shower-enclosure-doors",
    points: [
      "FLEXdoûr: PVC án glers, snúanleg, breidd má minnka.",
      "FLEXdoûr fæst með miðopnun eða hliðaropnun, 1850 mm á hæð, framleidd á Ítalíu.",
      "FOLdoûr: matt akrýl í álramma, brotnar saman til vinstri eða hægri.",
      "FOLdoûr lokast með segli og fæst í svörtu eða hvítu.",
    ],
  },
  {
    id: "bad",
    index: "05",
    title: "Samanbrjótanlegar baðskjólur",
    lede: "FLEXdoûr baðskjól úr PVC sem brotnar flatt upp að vegg.",
    families: ["FLEXdoûr"],
    availability: "supplier",
    image: "", // no verified bath-screen photo in catalog
    sourceSuffix: "home-office-bath-enclosure-doors",
    points: [
      "PVC án glers sem brotnar flatt upp að vegg.",
      "Föst hæð 1500 mm.",
      "Framleitt á Ítalíu.",
    ],
  },
];

export const comparisonRows: { label: string; values: [string, string, string, string] }[] = [
  { label: "Fyrir", values: ["Glugga", "Grunn gluggaop", "Hurðaop og svalir", "Hurðaop og svalir"] },
  { label: "Lag", values: ["Myrkvun eða net · DUO: bæði", "Myrkvun, net eða bæði", "Plíserað net", "Honeycomb-myrkvun með álfilmu"] },
  { label: "Lokun", values: ["Segull", "Sjá vörusíðu", "Segull · handfang í fullri lengd", "Segull · handfang í fullri lengd"] },
  { label: "Stærð", values: ["Sjá vörusíðu", "Sjá vörusíðu", "H 1500–2000 · B 600–2000 mm", "H 1500–2000 · B 600–2000 mm"] },
  { label: "Gólf", values: ["—", "—", "Lágt límt gólfspor", "Lágt límt gólfspor"] },
  { label: "Litir", values: ["Nokkrir rammalitir", "Sjá vörusíðu", "Nokkrir rammalitir", "Efni: Black, Light Grey, Off White, Sky Blue"] },
];
export const comparisonHeads = [
  { label: "WINdoûr", href: localLinks.windourSingle999 },
  { label: "ROLdoûr Slimline", href: localLinks.roldourSlimH },
  { label: "NETdoûr", href: localLinks.netdour },
  { label: "BLINDdoûr", href: localLinks.blinddour },
];

export const homeOfficeFaqs = [
  { q: "Hver er munurinn á Single og DUO?", a: "Single er eitt lag — annaðhvort myrkvun eða net. DUO sameinar myrkvun og net í sama ramma svo þú getur valið eftir aðstæðum. DUO þýðir ekki að kerfið opnist frá báðum hliðum." },
  { q: "Er NETdoûr eða BLINDdoûr alveg án gólfbrautar?", a: "Nei. Kerfin eru með lágt gólfspor sem er límt niður. Það er lágt og lítt áberandi, en það er til staðar." },
  { q: "Hvaða stærðir eru í boði fyrir hurðakerfin?", a: "NETdoûr og BLINDdoûr eru smíðuð eftir máli, 1500–2000 mm á hæð og 600–2000 mm á breidd. Stærri op eru skoðuð eftir fyrirspurn." },
  { q: "Hversu margir rammalitir eru í boði?", a: "Það eru nokkrir rammalitir. Nákvæmt úrval sést á vörusíðunni þegar þú velur stærð." },
  { q: "Mæli ég gluggaopið eða ytri rammann?", a: "Það fer eftir kerfinu og þetta tvennt er ekki hægt að nota til skiptis. Á vörusíðunni kemur fram hvort málið eigi við um opið eða um ytri mál rammans. Ef þú ert í vafa, hafðu samband áður en þú pantar." },
  { q: "Get ég keypt sturtu- og baðhurðir hjá ykkur?", a: "Ekki sem lagervöru eins og er. Við sýnum FLEXdoûr, FOLdoûr og TAMdoûr sem upplýsingar frá framleiðanda. Sendu fyrirspurn og við athugum hvað er hægt." },
  { q: "Hvað nær ábyrgðin yfir?", a: "Gardínulausnir veita 5 ára ábyrgð á búnaði og brautum." },
];
