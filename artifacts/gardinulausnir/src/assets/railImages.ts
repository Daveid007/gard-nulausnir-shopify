import holderWhite from "@/assets/accessory-thumbs/拉坠-h_1783342729464.jpg";
import holderNavy from "@/assets/accessory-thumbs/diaozhui06_1783342729460.jpg";
import holderBlack from "@/assets/accessory-thumbs/拉坠-b_1783342729464.jpg";

import cassette1 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(1)_1780327800245.jpg";
import cassette2 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(2)_1780327800246.jpg";
import cassette3 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(3)_1780327800246.jpg";
import cassette4 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(4)_1780327800247.jpg";
import cassette5 from "@/assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(5)_1780327800247.jpg";

import motorized1 from "@/assets/accessory-thumbs/for_45mm_motorized_(1)_1780327800247.jpg";
import motorized2 from "@/assets/accessory-thumbs/for_45mm_motorized_(2)_1780327800247.jpg";
import motorized3 from "@/assets/accessory-thumbs/for_45mm_motorized_(3)_1780327800247.jpg";
import motorized4 from "@/assets/accessory-thumbs/for_45mm_motorized_(4)_1780327800247.jpg";
import motorized5 from "@/assets/accessory-thumbs/for_45mm_motorized_(5)_1780327800247.jpg";

import bottom1 from "@/assets/accessory-thumbs/16_(1)_1780327812498.jpg";
import bottom2 from "@/assets/accessory-thumbs/16_(2)_1780327812514.jpg";
import bottom3 from "@/assets/accessory-thumbs/16_(3)_1780327812514.jpg";
import bottom4 from "@/assets/accessory-thumbs/16_(4)_1780327812514.jpg";
import bottom5 from "@/assets/accessory-thumbs/16_(5)_1780327812515.jpg";

import hcBottom1 from "@/assets/accessory-thumbs/16_(1)_1781393187195.jpg";
import hcBottom2 from "@/assets/accessory-thumbs/16_(2)_1781393187197.jpg";
import hcBottom3 from "@/assets/accessory-thumbs/16_(3)_1781393187197.jpg";
import hcBottom4 from "@/assets/accessory-thumbs/16_(4)_1781393187198.jpg";
import hcBottom5 from "@/assets/accessory-thumbs/16_(5)_1781393187198.jpg";

export type RailColorEntry = {
  value: string;
  en: string;
  image: string;
};

// Cassette image order (visually confirmed): (1)=Sand/Beige, (2)=White, (3)=Black, (4)=Silver/Grey, (5)=Cream White
export const CASSETTE_RAIL_COLORS: RailColorEntry[] = [
  { value: "Svartur",        en: "Black",       image: cassette3 },
  { value: "Hvítur",         en: "White",        image: cassette2 },
  { value: "Silfur / Grár",  en: "Silver/Grey",  image: cassette4 },
  { value: "Sandur / Beige", en: "Sand/Beige",   image: cassette1 },
  { value: "Krémhvítur",     en: "Cream White",  image: cassette5 },
];

// Motorized image order (visually confirmed): (1)=Black, (2)=Silver/Grey, (3)=Cream White, (4)=Sand/Beige, (5)=White
export const MOTORIZED_RAIL_COLORS: RailColorEntry[] = [
  { value: "Svartur",        en: "Black",       image: motorized1 },
  { value: "Hvítur",         en: "White",        image: motorized5 },
  { value: "Silfur / Grár",  en: "Silver/Grey",  image: motorized2 },
  { value: "Sandur / Beige", en: "Sand/Beige",   image: motorized4 },
  { value: "Krémhvítur",     en: "Cream White",  image: motorized3 },
];

// Bottom image order (visually confirmed): (1)=Black, (2)=Silver/Grey, (3)=Cream White, (4)=Sand/Beige, (5)=White
export const BOTTOM_RAIL_COLORS: RailColorEntry[] = [
  { value: "Svartur",        en: "Black",       image: bottom1 },
  { value: "Hvítur",         en: "White",        image: bottom5 },
  { value: "Silfur / Grár",  en: "Silver/Grey",  image: bottom2 },
  { value: "Sandur / Beige", en: "Sand/Beige",   image: bottom4 },
  { value: "Krémhvítur",     en: "Cream White",  image: bottom3 },
];

// Honeycomb bottom rail colours — flat aluminium rail, 5 colour options.
// Image order: (1)=Black, (2)=Silver/Grey, (3)=Cream White, (4)=Sand/Beige, (5)=White
export const HONEYCOMB_BOTTOM_RAIL_COLORS: RailColorEntry[] = [
  { value: "Svartur",        en: "Black",       image: hcBottom1 },
  { value: "Hvítur",         en: "White",       image: hcBottom5 },
  { value: "Silfur / Grár",  en: "Silver/Grey", image: hcBottom2 },
  { value: "Sandur / Beige", en: "Sand/Beige",  image: hcBottom4 },
  { value: "Krémhvítur",     en: "Cream White", image: hcBottom3 },
];

export type HolderColorEntry = {
  value: "white" | "navy" | "black";
  is: string;
  en: string;
  image: string;
};

export const HOLDER_COLORS: HolderColorEntry[] = [
  { value: "white", is: "Hvítur", en: "White", image: holderWhite },
  { value: "navy",  is: "Marínublár", en: "Navy",  image: holderNavy },
  { value: "black", is: "Svartur",    en: "Black", image: holderBlack },
];

/**
 * Returns `color` if it exists in `list`, otherwise returns the first entry's value.
 * Use this whenever switching between cassette and motorized rail color lists to keep
 * the selection valid without a visible unstyled state.
 */
export function resolveRailColor(color: string, list: RailColorEntry[]): string {
  if (list.some((rc) => rc.value === color)) return color;
  return list[0]?.value ?? color;
}
