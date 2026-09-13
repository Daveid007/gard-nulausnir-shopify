// Shared 45mm fabric catalog — KT (translucent), KB (blackout), KS (sheer), KN (dual-deck blackout).
// Used by Standard, Day & Night, TDBU and Vertical calculators. Pricing varies by product
// and lives next to each calculator (it depends on the supplier sheet for that product).

import ks401 from "@assets/_0106_KS401_1780347970542.jpg";
import ks402 from "@assets/_0103_KS402_1780347970542.jpg";
import ks404 from "@assets/_0104_KS404_1780347970542.jpg";
import ks406 from "@assets/_0094_KS406_1780347970541.jpg";
import ks407 from "@assets/_0093_KS407_1780347970541.jpg";
import ks408 from "@assets/_0092_kS408_1780347970533.jpg";
import ks414 from "@assets/_0102_KS414_1780347970541.jpg";

import kt401 from "@assets/KT401_1779922959507.jpg";
import kt402 from "@assets/KT402_1779922959522.jpg";
import kt403 from "@assets/KT403_1779922959522.jpg";
import kt404 from "@assets/KT404_1779922959522.jpg";
import kt405 from "@assets/KT405_1779922959523.jpg";
import kt406 from "@assets/KT406_1779922959523.jpg";
import kt407 from "@assets/KT407_1779922959523.jpg";
import kt408 from "@assets/KT408_1779922959524.jpg";
import kt409 from "@assets/KT409_1779922959524.jpg";
import kt410 from "@assets/KT410_1779922959525.jpg";
import kt411 from "@assets/KT411_1779922959525.jpg";
import kt412 from "@assets/KT412_1779922959525.jpg";
import kt413 from "@assets/KT413_1779922959526.jpg";
import kt414 from "@assets/KT414_1779922959526.jpg";
import kt415 from "@assets/KT415_1779922959526.jpg";
import kt428 from "@assets/_0101_KT428_1780347441737.jpg";
import kt431 from "@assets/_0077_KT431_1780347441732.jpg";
import kt432 from "@assets/_0076_KT432_1780347441731.jpg";
import kt433 from "@assets/_0075_KT433_1780347441731.jpg";
import kt434 from "@assets/_0074_KT434_1780347441724.jpg";
import kt435 from "@assets/_0073_KT435_1780347863523.jpg";

import kb401 from "@assets/_0072_KB401_1780356203729.jpg";
import kb402 from "@assets/_0071_KB402_1780356203729.jpg";
import kb403 from "@assets/_0070_KB403_1780356203729.jpg";
import kb404 from "@assets/_0069_KB404_1780356203729.jpg";
import kb405 from "@assets/_0068_KB405_1780356203728.jpg";
import kb406 from "@assets/_0067_KB406_1780356203728.jpg";
import kb420 from "@assets/_0088_KB420_1780356203731.jpg";
import kb422 from "@assets/_0087_KB422_1780356203731.jpg";
import kb426 from "@assets/_0086_KB426_1780356203731.jpg";
import kb428 from "@assets/_0061_KB428_1780356203722.jpg";
import kb431 from "@assets/_0066_KB431_1780356203728.jpg";
import kb432 from "@assets/_0065_KB432_1780356203727.jpg";
import kb433 from "@assets/_0064_KB433_1780356203727.jpg";
import kb434 from "@assets/_0063_KB434_1780356203726.jpg";
import kb435 from "@assets/_0062_KB435_1780356203726.jpg";

import kn405 from "@assets/_0085_KN405_1780356832984.jpg";
import kn406 from "@assets/_0084_KN406_1780356859689.jpg";
import kn407 from "@assets/_0083_KN407_1780356839147.jpg";

import sb2522 from "@assets/SKU__0000_25965.22_1780690635949.jpg";
import sb2521 from "@assets/SKU__0001_25965.21_1780690635951.jpg";
import sb2519 from "@assets/SKU__0002_25965.19_1780690635951.jpg";
import sb2515 from "@assets/SKU__0004_25965.15_1780690635951.jpg";
import sb2513 from "@assets/SKU__0005_25965.13_1780690635951.jpg";
import sb2512 from "@assets/SKU__0006_25965.12_1780690635952.jpg";
import sb2511 from "@assets/SKU__0007_25965.11_1780690635952.jpg";
import sb2510 from "@assets/SKU__0008_25965.10_1780690635952.jpg";
import sb2509 from "@assets/SKU__0009_25965.09_1780690635952.jpg";
import sb2508 from "@assets/SKU__0010_25965.08_1780690635952.jpg";
import sb2506 from "@assets/SKU__0011_25965.06_1780690635952.jpg";
import sb2505 from "@assets/SKU__0012_25965.05_1780690635953.jpg";
import sb2503 from "@assets/SKU__0013_25965.03_1780690635953.jpg";
import sb2502 from "@assets/SKU__0014_25965.02_1780690635953.jpg";

export type FabricFamily = "KS" | "KT" | "KB" | "KN" | "SB";

export type FabricInfo = {
  code: string;
  family: FabricFamily;
  name: string;
  is: string;
  image: string;
};

export const FABRICS: Record<string, FabricInfo> = {
  // Sheer (KS)
  KS401: { code: "KS401", family: "KS", name: "White Sheer",        is: "Hvítt slæðu",      image: ks401 },
  KS402: { code: "KS402", family: "KS", name: "Creamy Sheer",       is: "Rjómahvítt slæðu", image: ks402 },
  KS404: { code: "KS404", family: "KS", name: "Pink Sheer",         is: "Bleikt slæðu",     image: ks404 },
  KS406: { code: "KS406", family: "KS", name: "Lilac White Sheer",  is: "Lilluhvítt slæðu", image: ks406 },
  KS407: { code: "KS407", family: "KS", name: "Mocha Sheer",        is: "Mokka slæðu",      image: ks407 },
  KS408: { code: "KS408", family: "KS", name: "Dove Grey Sheer",    is: "Dúfugrátt slæðu",  image: ks408 },
  KS414: { code: "KS414", family: "KS", name: "Black Sheer",        is: "Svart slæðu",       image: ks414 },

  // Translucent (KT)
  KT401: { code: "KT401", family: "KT", name: "Simply White",   is: "Einfaldlega hvítt", image: kt401 },
  KT402: { code: "KT402", family: "KT", name: "Buckskin",       is: "Hjartleður",        image: kt402 },
  KT403: { code: "KT403", family: "KT", name: "Impatiens",      is: "Impatiens",         image: kt403 },
  KT404: { code: "KT404", family: "KT", name: "Lavender Lily",  is: "Lavender Lilja",    image: kt404 },
  KT405: { code: "KT405", family: "KT", name: "Spring Green",   is: "Vorgrænt",          image: kt405 },
  KT406: { code: "KT406", family: "KT", name: "Lime Light",     is: "Límónugult",        image: kt406 },
  KT407: { code: "KT407", family: "KT", name: "Papyrus",        is: "Papírus",           image: kt407 },
  KT408: { code: "KT408", family: "KT", name: "Café",           is: "Kaffi",             image: kt408 },
  KT409: { code: "KT409", family: "KT", name: "Indigo",         is: "Indigóblátt",       image: kt409 },
  KT410: { code: "KT410", family: "KT", name: "Chocolate",      is: "Súkkulaði",         image: kt410 },
  KT411: { code: "KT411", family: "KT", name: "Water Edge",     is: "Vatnsbrún",         image: kt411 },
  KT412: { code: "KT412", family: "KT", name: "Pottery Red",    is: "Leirrautt",         image: kt412 },
  KT413: { code: "KT413", family: "KT", name: "Cloud White",    is: "Skýjahvítt",        image: kt413 },
  KT414: { code: "KT414", family: "KT", name: "Palegoldenrod",  is: "Fölgyllt",          image: kt414 },
  KT415: { code: "KT415", family: "KT", name: "Sage",           is: "Salvíugrænt",       image: kt415 },
  KT428: { code: "KT428", family: "KT", name: "Linen",          is: "Línefni",           image: kt428 },
  KT431: { code: "KT431", family: "KT", name: "White",          is: "Hvítt",             image: kt431 },
  KT432: { code: "KT432", family: "KT", name: "Light Apricot",  is: "Ljóst apríkósu",   image: kt432 },
  KT433: { code: "KT433", family: "KT", name: "Camel",          is: "Kamellit",          image: kt433 },
  KT434: { code: "KT434", family: "KT", name: "Black",          is: "Svart hálfgegnsætt", image: kt434 },
  KT435: { code: "KT435", family: "KT", name: "Grey Blue",      is: "Gráblár",           image: kt435 },

  // Blackout (KB) — hvítir/ljósir fyrst, litaðir seinast
  KB401: { code: "KB401", family: "KB", name: "Liveingston",    is: "Hvítt",             image: kb401 },
  KB402: { code: "KB402", family: "KB", name: "Tan",            is: "Ljósgrátt",         image: kb402 },
  KB404: { code: "KB404", family: "KB", name: "Bisque",         is: "Krémhvítt",         image: kb404 },
  KB403: { code: "KB403", family: "KB", name: "Maize",          is: "Maísgult",          image: kb403 },
  KB406: { code: "KB406", family: "KB", name: "Indigo",         is: "Stálblátt",         image: kb406 },
  KB405: { code: "KB405", family: "KB", name: "Pottery Red",    is: "Rauðbrúnt",         image: kb405 },
  KB420: { code: "KB420", family: "KB", name: "White",          is: "Hvítt vefið",       image: kb420 },
  KB422: { code: "KB422", family: "KB", name: "Buckskin",       is: "Hjartleður",        image: kb422 },
  KB426: { code: "KB426", family: "KB", name: "Dove Grey",      is: "Dúfugrátt",         image: kb426 },
  KB428: { code: "KB428", family: "KB", name: "Linen",          is: "Línefni",           image: kb428 },
  KB431: { code: "KB431", family: "KB", name: "White",          is: "Hvítt",             image: kb431 },
  KB432: { code: "KB432", family: "KB", name: "Light Apricot",  is: "Ljóst apríkósu",   image: kb432 },
  KB433: { code: "KB433", family: "KB", name: "Camel",          is: "Kamellit",          image: kb433 },
  KB434: { code: "KB434", family: "KB", name: "Black",          is: "Svart",             image: kb434 },
  KB435: { code: "KB435", family: "KB", name: "Grey Blue",      is: "Gráblár",           image: kb435 },

  // Dual-Deck Blackout (KN) — Standard only
  KN405: { code: "KN405", family: "KN", name: "Cloud White Dual-Deck", is: "Skýjahvítt tvöfalt", image: kn405 },
  KN406: { code: "KN406", family: "KN", name: "Shell Dual-Deck",       is: "Skel tvöfalt",       image: kn406 },
  KN407: { code: "KN407", family: "KN", name: "Sage Dual-Deck",        is: "Salvía tvöfalt",     image: kn407 },

  // 90% Blackout Roller (SB / 25965-series) — verð TBD
  "25965.22": { code: "25965.22", family: "SB", name: "25965.22", is: "25965.22", image: sb2522 },
  "25965.21": { code: "25965.21", family: "SB", name: "25965.21", is: "25965.21", image: sb2521 },
  "25965.19": { code: "25965.19", family: "SB", name: "25965.19", is: "25965.19", image: sb2519 },
  "25965.15": { code: "25965.15", family: "SB", name: "25965.15", is: "25965.15", image: sb2515 },
  "25965.13": { code: "25965.13", family: "SB", name: "25965.13", is: "25965.13", image: sb2513 },
  "25965.12": { code: "25965.12", family: "SB", name: "25965.12", is: "25965.12", image: sb2512 },
  "25965.11": { code: "25965.11", family: "SB", name: "25965.11", is: "25965.11", image: sb2511 },
  "25965.10": { code: "25965.10", family: "SB", name: "25965.10", is: "25965.10", image: sb2510 },
  "25965.09": { code: "25965.09", family: "SB", name: "25965.09", is: "25965.09", image: sb2509 },
  "25965.08": { code: "25965.08", family: "SB", name: "25965.08", is: "25965.08", image: sb2508 },
  "25965.06": { code: "25965.06", family: "SB", name: "25965.06", is: "25965.06", image: sb2506 },
  "25965.05": { code: "25965.05", family: "SB", name: "25965.05", is: "25965.05", image: sb2505 },
  "25965.03": { code: "25965.03", family: "SB", name: "25965.03", is: "25965.03", image: sb2503 },
  "25965.02": { code: "25965.02", family: "SB", name: "25965.02", is: "25965.02", image: sb2502 },
};

export function fabricsByFamily(family: FabricFamily): FabricInfo[] {
  return Object.values(FABRICS).filter((f) => f.family === family);
}

export function getFabric(code: string): FabricInfo | undefined {
  return FABRICS[code];
}
