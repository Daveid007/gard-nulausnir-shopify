import holderWhite from "../../../assets/accessory-thumbs/拉坠-h_1783342729464.jpg";
import holderNavy from "../../../assets/accessory-thumbs/diaozhui06_1783342729460.jpg";
import holderBlack from "../../../assets/accessory-thumbs/拉坠-b_1783342729464.jpg";

import wrappedRail from "../../../assets/accessory-thumbs/Fabric_wrapped_1779913347334.png";
import squareRail from "../../../assets/accessory-thumbs/Square_1779913347335.png";

import cassette1 from "../../../assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(1)_1780327800245.jpg";
import cassette2 from "../../../assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(2)_1780327800246.jpg";
import cassette3 from "../../../assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(3)_1780327800246.jpg";
import cassette4 from "../../../assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(4)_1780327800247.jpg";
import cassette5 from "../../../assets/accessory-thumbs/25&38_manual_and_motorized_+_45mm_manual_(5)_1780327800247.jpg";

import motor1 from "../../../assets/accessory-thumbs/for_45mm_motorized_(1)_1780327800247.jpg";
import motor2 from "../../../assets/accessory-thumbs/for_45mm_motorized_(2)_1780327800247.jpg";
import motor3 from "../../../assets/accessory-thumbs/for_45mm_motorized_(3)_1780327800247.jpg";
import motor4 from "../../../assets/accessory-thumbs/for_45mm_motorized_(4)_1780327800247.jpg";
import motor5 from "../../../assets/accessory-thumbs/for_45mm_motorized_(5)_1780327800247.jpg";

import rollerBottom1 from "../../../assets/accessory-thumbs/16_(1)_1780327812498.jpg";
import rollerBottom2 from "../../../assets/accessory-thumbs/16_(2)_1780327812514.jpg";
import rollerBottom3 from "../../../assets/accessory-thumbs/16_(3)_1780327812514.jpg";
import rollerBottom4 from "../../../assets/accessory-thumbs/16_(4)_1780327812514.jpg";
import rollerBottom5 from "../../../assets/accessory-thumbs/16_(5)_1780327812515.jpg";

import hcBottom1 from "../../../assets/accessory-thumbs/16_(1)_1781393187195.jpg";
import hcBottom2 from "../../../assets/accessory-thumbs/16_(2)_1781393187197.jpg";
import hcBottom3 from "../../../assets/accessory-thumbs/16_(3)_1781393187197.jpg";
import hcBottom4 from "../../../assets/accessory-thumbs/16_(4)_1781393187198.jpg";
import hcBottom5 from "../../../assets/accessory-thumbs/16_(5)_1781393187198.jpg";

export const finishes = [
  { name: "Svartur", id: "black" },
  { name: "Hvítur", id: "white" },
  { name: "Silfur / Grár", id: "silver" },
  { name: "Sandur / Beige", id: "sand" },
  { name: "Krémhvítur", id: "cream" },
] as const;

export type FinishId = typeof finishes[number]["id"];

export const cassetteFinishImages: Record<FinishId, string> = {
  black: cassette3,
  white: cassette2,
  silver: cassette4,
  sand: cassette1,
  cream: cassette5,
};

export const motorFinishImages: Record<FinishId, string> = {
  black: motor1,
  white: motor5,
  silver: motor2,
  sand: motor4,
  cream: motor3,
};

export const rollerBottomFinishImages: Record<FinishId, string> = {
  black: rollerBottom1,
  white: rollerBottom5,
  silver: rollerBottom2,
  sand: rollerBottom4,
  cream: rollerBottom3,
};

export const honeycombBottomFinishImages: Record<FinishId, string> = {
  black: hcBottom1,
  white: hcBottom5,
  silver: hcBottom2,
  sand: hcBottom4,
  cream: hcBottom3,
};

export const bottomRailTypeImages = {
  "Hulinn botnlisti": wrappedRail,
  "Álbotnlisti": squareRail,
};

export const holderImages = [null, holderWhite, holderNavy, holderBlack];

export const accessories = [
  { name: "Enginn aukahlutur", detail: "Staðlað handtak", price: 0 },
  { name: "Snúrulaus stýring", detail: "Örugg og hrein hreyfing", price: 4500 },
  { name: "Hliðarteinar", detail: "Minni ljósleki til hliðanna", price: 8900 },
  { name: "Mótor · app-stýring", detail: "Stýrðu með síma eða rofa", price: 24900 },
];

export const mounts = ["Smellifesting", "Veggfesting", "Loftfesting", "Klemma án borunar"];
export const mechanisms = ["Keðja", "Þráðlaus stýring", "Mótor · app-stýring"];
export const holders = ["Enginn", "Hvítur", "Marínublár", "Svartur"];
