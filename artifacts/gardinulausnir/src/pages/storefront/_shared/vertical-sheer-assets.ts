import apricot from "@/assets/vertical-sheer-shades/fabrics/Apricot MC-B-100103.jpg";
import beigeA from "@/assets/vertical-sheer-shades/fabrics/Beige MC-A-100602.jpg";
import beigeB from "@/assets/vertical-sheer-shades/fabrics/Beige MC-B-100102.jpg";
import beigeE from "@/assets/vertical-sheer-shades/fabrics/Beige MC-E-103102.jpg";
import beigeRoomDarkening from "@/assets/vertical-sheer-shades/fabrics/Beige MC-RD-6001-2ss.jpg";
import camelA from "@/assets/vertical-sheer-shades/fabrics/Camel MC-A-100605.jpg";
import camelB from "@/assets/vertical-sheer-shades/fabrics/Camel MC-B-100105.jpg";
import coffeeB from "@/assets/vertical-sheer-shades/fabrics/Coffee MC-B-100111.jpg";
import coffeeE from "@/assets/vertical-sheer-shades/fabrics/Coffee MC-E-103111.jpg";
import grayRoomDarkening from "@/assets/vertical-sheer-shades/fabrics/Gray MC-RD-6001-13.jpg";
import smoky from "@/assets/vertical-sheer-shades/fabrics/Smoky MC-B-100113.jpg";
import whiteA from "@/assets/vertical-sheer-shades/fabrics/White MC-A-100601.jpg";
import whiteB from "@/assets/vertical-sheer-shades/fabrics/White MC-B-100101.jpg";
import whiteC from "@/assets/vertical-sheer-shades/fabrics/White MC-C-101101.jpg";
import whiteD from "@/assets/vertical-sheer-shades/fabrics/White MC-D-101601.jpg";
import whiteE from "@/assets/vertical-sheer-shades/fabrics/White MC-E-103101.jpg";
import whiteRoomDarkening from "@/assets/vertical-sheer-shades/fabrics/White MC-RD-6001-1.jpg";
import caseOne from "@/assets/vertical-sheer-shades/cases/Vertical sheer shades (1).jpg";
import caseTwo from "@/assets/vertical-sheer-shades/cases/Vertical sheer shades (2).jpg";

import type {
  VerticalSheerFabricType,
} from "@/lib/verticalSheerPricing";

export type VerticalSheerFabricAsset = {
  code: string;
  name: string;
  type: VerticalSheerFabricType;
  image: string;
};

/**
 * The complete 17-image supplier swatch set: 14 translucent and 3
 * room-darkening fabrics. The room-darkening beige filename has a supplier
 * "ss" suffix, while the workbook code is MC-RD-6001-2.
 */
export const VERTICAL_SHEER_FABRICS: readonly VerticalSheerFabricAsset[] = [
  { code: "MC-A-100601", name: "White · A", type: "translucent", image: whiteA },
  { code: "MC-A-100602", name: "Beige · A", type: "translucent", image: beigeA },
  { code: "MC-A-100605", name: "Camel · A", type: "translucent", image: camelA },
  { code: "MC-B-100101", name: "White · B", type: "translucent", image: whiteB },
  { code: "MC-B-100102", name: "Beige · B", type: "translucent", image: beigeB },
  { code: "MC-B-100103", name: "Apricot · B", type: "translucent", image: apricot },
  { code: "MC-B-100105", name: "Camel · B", type: "translucent", image: camelB },
  { code: "MC-B-100111", name: "Coffee · B", type: "translucent", image: coffeeB },
  { code: "MC-B-100113", name: "Smoky · B", type: "translucent", image: smoky },
  { code: "MC-C-101101", name: "White · C", type: "translucent", image: whiteC },
  { code: "MC-D-101601", name: "White · D", type: "translucent", image: whiteD },
  { code: "MC-E-103101", name: "White · E", type: "translucent", image: whiteE },
  { code: "MC-E-103102", name: "Beige · E", type: "translucent", image: beigeE },
  { code: "MC-E-103111", name: "Coffee · E", type: "translucent", image: coffeeE },
  { code: "MC-RD-6001-1", name: "White · room-darkening", type: "room-darkening", image: whiteRoomDarkening },
  { code: "MC-RD-6001-2", name: "Beige · room-darkening", type: "room-darkening", image: beigeRoomDarkening },
  { code: "MC-RD-6001-13", name: "Gray · room-darkening", type: "room-darkening", image: grayRoomDarkening },
];

export const VERTICAL_SHEER_CASE_IMAGES = {
  primary: caseTwo,
  secondary: caseOne,
} as const;