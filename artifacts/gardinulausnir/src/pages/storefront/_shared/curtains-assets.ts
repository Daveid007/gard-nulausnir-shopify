import swatch100024 from "@/assets/curtains/SKU__0070_1000.24_1789585604366.jpg";
import swatch100025 from "@/assets/curtains/SKU__0071_1000.25_1789585604367.jpg";
import swatch100013 from "@/assets/curtains/SKU__0072_1000.13_1789585604367.jpg";
import swatch100019 from "@/assets/curtains/SKU__0073_1000.19_1789585604367.jpg";
import swatch100020 from "@/assets/curtains/SKU__0074_1000.20_1789585604367.jpg";
import swatch100001 from "@/assets/curtains/SKU__0075_1000.01_1789585604368.jpg";
import swatch100009 from "@/assets/curtains/SKU__0076_1000.09_1789585604368.jpg";
import swatch100030 from "@/assets/curtains/SKU__0077_1000.30_1789585604368.jpg";
import swatch100008 from "@/assets/curtains/SKU__0078_1000.08_1789585604368.jpg";
import swatch100007 from "@/assets/curtains/SKU__0079_1000.07_1789585604369.jpg";
import swatch100011 from "@/assets/curtains/SKU__0080_1000.11_1789585604370.jpg";
import swatch100006 from "@/assets/curtains/SKU__0081_1000.06_1789585604370.jpg";
import swatch100031 from "@/assets/curtains/SKU__0082_1000.31_1789585604370.jpg";
import swatch100004 from "@/assets/curtains/SKU__0083_1000.04_1789585604371.jpg";
import swatch282807 from "@/assets/curtains/SKU__0053_2828.07_1789592952571.jpg";
import swatch282808 from "@/assets/curtains/SKU__0054_2828.08_1789592952589.jpg";
import swatch282803 from "@/assets/curtains/SKU__0055_2828.03_1789592952589.jpg";
import swatch282809 from "@/assets/curtains/SKU__0056_2828.09_1789592952590.jpg";
import swatch282823 from "@/assets/curtains/SKU__0057_2828.23_1789592952590.jpg";
import swatch282806 from "@/assets/curtains/SKU__0058_2828.06_1789592952591.jpg";
import swatch282822 from "@/assets/curtains/SKU__0059_2828.22_1789592952591.jpg";
import swatch282821 from "@/assets/curtains/SKU__0060_2828.21_1789592952591.jpg";
import swatch282812 from "@/assets/curtains/SKU__0061_2828.12_1789592952591.jpg";
import swatch282802 from "@/assets/curtains/SKU__0062_2828.02_1789592952592.jpg";
import swatch282820 from "@/assets/curtains/SKU__0063_2828.20_1789592952592.jpg";
import swatch282819 from "@/assets/curtains/SKU__0064_2828.19_1789592952592.jpg";
import swatch282818 from "@/assets/curtains/SKU__0065_2828.18_1789592952592.jpg";
import swatch282817 from "@/assets/curtains/SKU__0066_2828.17_1789592952593.jpg";
import swatch282813 from "@/assets/curtains/SKU__0067_2828.13_1789592952593.jpg";
import swatch282816 from "@/assets/curtains/SKU__0068_2828.16_1789592952593.jpg";
import swatch282815 from "@/assets/curtains/SKU__0069_2828.15_1789592952594.jpg";
import swatch288303 from "@/assets/curtains/SKU__0047_2883.03_1789593007101.jpg";
import swatch288311 from "@/assets/curtains/SKU__0048_2883.11_1789593007103.jpg";
import swatch288310 from "@/assets/curtains/SKU__0049_2883.10_1789593007104.jpg";
import swatch288307 from "@/assets/curtains/SKU__0050_2883.07_1789593007104.jpg";
import swatch288302 from "@/assets/curtains/SKU__0051_2883.02_1789593007105.jpg";
import swatch288301 from "@/assets/curtains/SKU__0052_2883.01_1789593007105.jpg";
import {
  CURTAIN_PRODUCT_DEFINITIONS,
  type CurtainProductId,
  type CurtainSwatchCode,
} from "./curtains";

const imagesByCode: Record<CurtainProductId, Record<string, string>> = {
  "curtains-1000": {
    "1000.24": swatch100024,
    "1000.25": swatch100025,
    "1000.13": swatch100013,
    "1000.19": swatch100019,
    "1000.20": swatch100020,
    "1000.01": swatch100001,
    "1000.09": swatch100009,
    "1000.30": swatch100030,
    "1000.08": swatch100008,
    "1000.07": swatch100007,
    "1000.11": swatch100011,
    "1000.06": swatch100006,
    "1000.31": swatch100031,
    "1000.04": swatch100004,
  },
  "curtains-2828": {
    "2828.07": swatch282807,
    "2828.08": swatch282808,
    "2828.03": swatch282803,
    "2828.09": swatch282809,
    "2828.23": swatch282823,
    "2828.06": swatch282806,
    "2828.22": swatch282822,
    "2828.21": swatch282821,
    "2828.12": swatch282812,
    "2828.02": swatch282802,
    "2828.20": swatch282820,
    "2828.19": swatch282819,
    "2828.18": swatch282818,
    "2828.17": swatch282817,
    "2828.13": swatch282813,
    "2828.16": swatch282816,
    "2828.15": swatch282815,
  } as Record<CurtainSwatchCode, string>,
  "curtains-2883": {
    "2883.03": swatch288303,
    "2883.11": swatch288311,
    "2883.10": swatch288310,
    "2883.07": swatch288307,
    "2883.02": swatch288302,
    "2883.01": swatch288301,
  } as Record<CurtainSwatchCode, string>,
};

export const CURTAIN_SWATCH_ASSETS = Object.fromEntries(
  CURTAIN_PRODUCT_DEFINITIONS.map((product) => [
    product.id,
    product.swatches.map((swatch) => ({
      ...swatch,
      image: imagesByCode[product.id][swatch.code],
    })),
  ]),
) as {
  [K in CurtainProductId]: Array<
    { code: string; fileName: string; image: string }
  >;
};

export const GLUGGATJOLD_1000_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-1000"];
export const GLUGGATJOLD_2828_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-2828"];
export const GLUGGATJOLD_2883_SWATCH_ASSETS = CURTAIN_SWATCH_ASSETS["curtains-2883"];

export function curtainSwatchImage(productId: CurtainProductId, code: CurtainSwatchCode): string {
  return imagesByCode[productId][code];
}

export function curtainProductCoverImage(productId: CurtainProductId): string {
  const firstSwatch = CURTAIN_PRODUCT_DEFINITIONS.find((product) => product.id === productId)!.swatches[0];
  return imagesByCode[productId][firstSwatch.code];
}

export function curtainProductSwatchImage(productId: CurtainProductId, index: number): string {
  const swatch = CURTAIN_PRODUCT_DEFINITIONS.find((product) => product.id === productId)!.swatches[index];
  return imagesByCode[productId][swatch.code];
}
