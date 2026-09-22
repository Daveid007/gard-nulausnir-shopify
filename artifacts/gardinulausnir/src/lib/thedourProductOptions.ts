export type ThedourColourOption = {
  name: string;
  image: string;
};

export const THEDOUR_FRAME_COLOURS: readonly ThedourColourOption[] = [
  { name: "Gloss White", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_1_1691111611919-1691507603.jpg" },
  { name: "Gloss Black", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_2_1691112074653-1691507597.jpg" },
  { name: "Dark Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_3_1691112131085-1691507586.jpg" },
  { name: "Flash Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_4_1691112925062-1691507522.jpg" },
  { name: "Gloss Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_5_1691112943586-1691507528.jpg" },
  { name: "Apple Gold", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_6_1691112972685-1691507536.jpg" },
  { name: "Red Brown", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_9_1691507765794-1691507771.jpg" },
  { name: "Light Brown", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_10_1691507825256-1691507830.jpg" },
  { name: "Dark Brown", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-1_11_1691507893172-1691507898.jpg" },
] as const;

export const THEDOUR_HONEYCOMB_COLOURS: readonly ThedourColourOption[] = [
  { name: "Black", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_1_1691112218897-1741185725.jpg" },
  { name: "Light Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_2_1704965160635-1741185737.jpg" },
  { name: "Off White", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_3_1712566347921-1741185755.jpg" },
  { name: "Sky Blue", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_4_1741182156526-1741185776.jpg" },
] as const;

export const THEDOUR_ROLDOUR_FABRIC_COLOURS: readonly ThedourColourOption[] = [
  { name: "Beige", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_1_1691112218897-1749825208.jpg" },
  { name: "Dark Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_2_1704965160635-1749825212.jpg" },
  { name: "Light Grey", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_3_1712566347921-1749825220.jpg" },
  { name: "PET Net (Not Blackout)", image: "https://option.nyc3.digitaloceanspaces.com/files/34108/image-swatches-2_4_1737736998183-1749825247.jpg" },
] as const;

export function isThedourFrameColour(value: unknown): value is string {
  return typeof value === "string" && THEDOUR_FRAME_COLOURS.some((option) => option.name === value);
}

export function isThedourHoneycombColour(value: unknown): value is string {
  return typeof value === "string" && THEDOUR_HONEYCOMB_COLOURS.some((option) => option.name === value);
}

export const THEDOUR_NETDOUR_SOURCE = "https://www.thedour.com/products/netdour-bespoke-made-measure-retractable";
export const THEDOUR_BLINDDOUR_SOURCE = "https://www.thedour.com/products/netdour-trackless-blind-or-net-door-screen-up-to-2000mm-tall-x-up-to-2000mm-wide-copy";

export const THEDOUR_WINDOUR_SOURCES = {
  "windour-single-999": "https://www.thedour.com/products/windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-mosquito-fly-net",
  "windour-single-2000": "https://www.thedour.com/products/windour-custom-made-pleated-honeycomb-insulated-blackout-blind-or-net-up-to-2000mm-tall-x-up-to-2000mm-wide",
  "windour-duo-999": "https://www.thedour.com/products/windour-duo-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net",
  "windour-duo-2000": "https://www.thedour.com/products/windour-duo-custom-made-to-measure-honeycomb-insulated-blackout-blind-or-mosquito-fly-net",
} as const;

export const THEDOUR_ROLDOUR_SOURCES = {
  "roldour-duo-horizontal": "https://www.thedour.com/products/roldour-made-to-measure-retractable-blackout-blind-or-mosquito-fly-net",
  "roldour-slimline-horizontal": "https://www.thedour.com/products/roldour-slimline-horizontal-retractable-roller-blackout-privacy-waterproof-door-screen-made-to-the-mm-height-range-from-400mm-up-to-2000mm-tall",
  "roldour-single-vertical": "https://www.thedour.com/products/roldour-custom-made-1600mm-2000mm-wide-x-500mm-1000mm-tall-space-saving-vertical-door-screen-waterproof-blackout-aluminium-frame",
  "roldour-slimline-duo-vertical": "https://www.thedour.com/products/roldour-slimline-blind-medium-size-double-slide-made-to-measure-complete-blackout-blind-net-screen-copy",
  "roldour-duo-vertical-small": "https://www.thedour.com/products/roldour-slimline-blind-small-size-double-slide-made-to-measure-complete-blackout-blind-net-screen-copy",
  "roldour-duo-vertical-large": "https://www.thedour.com/products/roldour-bespoke-large-double-vertical-slide-made-to-measure-complete-blackout-blind-net-screen",
} as const;

export function isThedourRoldourProductId(value: string): value is keyof typeof THEDOUR_ROLDOUR_SOURCES {
  return value in THEDOUR_ROLDOUR_SOURCES;
}

export function getThedourRoldourSource(value: string): string | undefined {
  return isThedourRoldourProductId(value) ? THEDOUR_ROLDOUR_SOURCES[value] : undefined;
}
