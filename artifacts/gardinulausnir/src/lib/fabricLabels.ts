/** Display translations only: supplier codes and pricing data stay unchanged. */
const COLORS: Record<string, string> = {
  White: "Hvítur", Black: "Svartur", Grey: "Grár", Gray: "Grár",
  Cream: "Rjómahvítur", Sand: "Sandlitur", Linen: "Línlitur",
  "Dark Grey": "Dökkgrár", "Light Grey": "Ljósgrár", "Light Gray": "Ljósgrár",
  Pearl: "Perlulitur", Bronze: "Bronslitur", Brown: "Brúnn",
  "Light Brown": "Ljósbrúnn", "Black Brown": "Svartbrúnn",
  "Grey Brown": "Grábrúnn", "Ash-Gray Brown": "Öskugrábrúnn",
  "Steel Grey": "Stálgrár", "Charcoal Grey": "Kolgrár",
  "Off-White": "Brothvítur", "Frost White": "Frosthvítur",
  Ivory: "Fílabeinshvítur", Beige: "Drapplitaður",
  "Light Blue": "Ljósblár", "Lake Blue": "Vatnsblár", "Cobalt Blue": "Kóbaltblár",
  Apricot: "Apríkósulitur", Camel: "Úlfaldabrúnn", Coffee: "Kaffibrúnn",
  Chalk: "Krítarhvítur", Chrome: "Krómgrár", Concrete: "Steypugrár",
  Coral: "Kórallitur", Cotton: "Bómullarhvítur", Mica: "Glimmergrár",
  Mint: "Mintugrænn", Oyster: "Ostrulitur", Parchment: "Bókfellslitur",
  Pebble: "Steingrár", Pewter: "Tinngrár", Sail: "Seglhvítur",
  Shell: "Skeljalitur", Smoke: "Reykgrár", Taupe: "Grábrúnn",
  Tortilla: "Ljós drapplitur",
};

export function fabricColorLabel(value: string): string {
  if (!value || value === "/") return "Litur samkvæmt efniskóða";
  return value.split(/[/*]/)
    .map((part) => COLORS[part] ?? part).join(" / ");
}

export function fabricLightLabel(value: string): string {
  const screen = value.match(/^suns?creen\s*(\d+)%$/i);
  if (screen) return `Sólarvörn · ${screen[1]}% opnunarhlutfall`;
  return ({
    Blackout: "Myrkvun", Blockout: "Myrkvun",
    Translucent: "Ljósdempandi", "Room darkening": "Myrkvandi",
    "Room-Darkening": "Myrkvandi", Lace: "Blúnda",
    Panorama: "Víðsýnisvefnaður", Slub: "Áferðarvefnaður",
    "/": "Ljósgerð ekki tilgreind",
  } as Record<string, string>)[value] ?? value;
}

export const SCREEN_EXPLANATION = "Sólarvörn (Sunscreen) er netofið efni sem dregur úr sól og glampa en er ekki myrkvunarefni. Prósentan er opnunarhlutfall vefnaðarins, ekki hlutfall ljóss sem er stöðvað. 1% er þéttast, 3% og 5% opnara og 10% opnast: hærra hlutfall gefur almennt meira útsýni en minni skjólun. Litur hefur líka áhrif á birtu og útsýni. Efnið tryggir ekki næði að kvöldi þegar bjartara er inni en úti.";
