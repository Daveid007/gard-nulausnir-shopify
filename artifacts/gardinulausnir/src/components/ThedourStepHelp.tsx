import { THEDOUR_WINDOUR_SOURCES, THEDOUR_ROLDOUR_SOURCES } from "@/lib/thedourProductOptions";
import type { WindourMeasurementMode } from "@/lib/windourOrderOptions";

type Props = {
  step: number;
  family: "windour" | "roldour";
  fitting: "recessed" | "overlap";
  measurementMode?: WindourMeasurementMode;
};

/** A schematic of the opening, not a manufacturing or frame-profile drawing. */
function MeasurementDiagram() {
  return (
    <figure className="my-4 rounded border border-[#ccd9df] bg-white p-3">
      <svg viewBox="0 0 360 235" role="img" aria-label="Mælið þrjár breiddir: efst, í miðju og neðst. Mælið þrjár hæðir: vinstra megin, í miðju og hægra megin." className="mx-auto w-full max-w-sm">
        <rect x="48" y="25" width="264" height="180" fill="#f4f7f8" stroke="#667984" strokeWidth="7" />
        {[55, 115, 175].map((y, i) => <g key={y}>
          <path d={`M55 ${y} H305 M62 ${y - 5} L55 ${y} L62 ${y + 5} M298 ${y - 5} L305 ${y} L298 ${y + 5}`} stroke="#356582" fill="none" strokeWidth="2" />
          <rect x="153" y={y - 10} width="54" height="20" fill="white" />
          <text x="180" y={y + 4} textAnchor="middle" fontSize="12" fill="#24313b">B{i + 1}</text>
        </g>)}
        {[85, 180, 275].map((x, i) => <g key={x}>
          <path d={`M${x} 32 V198 M${x - 5} 39 L${x} 32 L${x + 5} 39 M${x - 5} 191 L${x} 198 L${x + 5} 191`} stroke="#667984" strokeDasharray="3 3" fill="none" />
          <text x={x} y="225" textAnchor="middle" fontSize="12" fill="#24313b">H{i + 1}</text>
        </g>)}
      </svg>
      <figcaption className="text-xs leading-5">B1–B3: breidd efst, í miðju og neðst. H1–H3: hæð vinstra megin, í miðju og hægra megin. Teikningin sýnir opið, ekki ytri mál fullbúins ramma.</figcaption>
    </figure>
  );
}

function OuterFrameDiagram() {
  return (
    <figure className="my-4 rounded border border-[#ccd9df] bg-white p-3">
      <svg viewBox="0 0 360 235" role="img" aria-label="Ytri breidd og ytri hæð fullbúins ramma, mælt frá ytri brún til ytri brúnar." className="mx-auto w-full max-w-sm">
        <rect x="70" y="35" width="220" height="155" fill="#eaf3f8" stroke="#24313b" strokeWidth="10" />
        <path d="M70 20 H290 M78 14 L70 20 L78 26 M282 14 L290 20 L282 26" stroke="#356582" fill="none" strokeWidth="2" />
        <text x="180" y="14" textAnchor="middle" fontSize="12" fill="#24313b">Ytri breidd</text>
        <path d="M52 35 V190 M46 43 L52 35 L58 43 M46 182 L52 190 L58 182" stroke="#356582" fill="none" strokeWidth="2" />
        <text x="25" y="115" textAnchor="middle" fontSize="12" fill="#24313b" transform="rotate(-90 25 115)">Ytri hæð</text>
      </svg>
      <figcaption className="text-xs leading-5">Mældu frá ytri brún til ytri brúnar fullbúins ramma. Ekki slá inn gluggaopið í þessa reiti.</figcaption>
    </figure>
  );
}

export function ThedourStepHelp({ step, family, fitting, measurementMode = "opening" }: Props) {
  const copy = [
    {
      title: family === "windour" ? "Fellt efni í sérsmíðuðum ramma" : "Dúkur eða net sem rúllast í kassettu",
      text: family === "windour" ? "WINdoûr er rammagardína með felldu efni. Meira en gardína — eins og húsgagn í rýminu." : "ROLdoûr er inndraganlegt rúllukerfi í ramma. Efnið rúllast inn í kassettu þegar kerfið er opnað.",
      tips: ["Hægt er að velja einfalda lausn (Single): aðeins myrkvunargardínu eða aðeins flugnanet. Þú þarft ekki að velja DUO.", family === "windour" ? "Myrkvunarefnið er honeycomb-efni sem fellur saman inni í rammanum." : "Athuga þarf pláss fyrir kassettuna við uppsetningu. Efnið er rúlludúkur eða net, ekki honeycomb."],
    },
    {
      title: "Stefnan lýsir hreyfingunni",
      text: "Horft er beint framan á opið. Lóðrétt þýðir upp og niður; lárétt þýðir til hliðanna.",
      tips: ["Veldu hreyfingu sem er auðvelt að ná til og nota.", "Athugaðu hvort handfang, gluggakista eða opnanlegur gluggi geti rekist í ramma eða hreyfanlega hluta."],
    },
    {
      title: family === "windour" ? "Einn efnisflötur (Single) eða tveir (DUO)" : "Einföld lausn (Single) eða gardína og net (DUO)",
      text: family === "windour"
        ? "Single er einn honeycomb- eða netflötur. DUO er tveggja flata kerfi. Honeycomb + fellt flugnanet er staðlaða samsetningin sem núverandi verðlíkan styður; annað tveggja flata sérval er sent í fyrirspurn."
        : "Þú getur valið einfalda myrkvunargardínu án flugnanets eða aðeins flugnanet án gardínu. Veldu Single fyrir annan hvorn kostinn. DUO sameinar myrkvun og flugnanet í sama kerfi.",
      tips: family === "windour"
        ? ["Veldu Single fyrir einn flöt.", "Veldu DUO fyrir tvo ólíka fleti; hver efnisvalkostur er valinn í mesta lagi einu sinni.", "DUO segir ekki til um einfalda eða tvöfalda opnun. Það val kemur síðar."]
        : ["Viltu aðeins myrkvun eða aðeins net? Veldu Single.", "Viltu bæði myrkvun og net? Veldu DUO.", "DUO segir ekki til um einfalda eða tvöfalda opnun. Það val kemur síðar."],
    },
    {
      title: "Hvað á efnið að gera?",
      text: family === "windour" ? "Honeycomb-myrkvunarefnið er fellt efni með frumubyggingu. Flugnanet er annar valkostur, ekki myrkvunarefni." : "ROLdoûr notar inndraganlegan dúk eða net. Ekki rugla rúlludúknum saman við honeycomb-efni WINdoûr.",
      tips: ["Myrkvun: til að draga úr birtu og auka næði.", "Flugnanet: til að halda skordýrum úti með opnum glugga; netið myrkvar ekki.", family === "windour" ? "Í DUO velurðu tvo ólíka fleti í litaskrefinu. Aðeins honeycomb + net hefur staðfest verðlíkan." : "Þegar DUO er valið fylgja báðir kostir. Þú þarft ekki að velja á milli þeirra."],
    },
    {
      title: "Opnun er annað en DUO",
      text: "Hér velurðu fyrirkomulag opnunarinnar, ekki fjölda efnisgerða. Endanleg útfærsla er staðfest fyrir valið kerfi og op.",
      tips: ["Skráðu í fyrirspurn ef þú vilt ákveðna lokunarhlið eða staðsetningu samskeyta.", ...(family === "windour" ? ["Verðáætlun miðast að lágmarki við 1 m² fyrir einfalda opnun og 1,2 m² fyrir tvöfalda opnun. Það breytir ekki raunverulegum málum rammans."] : ["Fyrir ROLdoûr er verð og fyrirkomulag staðfest í tilboði."])],
    },
    {
      title: fitting === "recessed" ? "Inn í opið — innfelld festing" : "Framan á opið — utanáliggjandi festing",
      text: fitting === "recessed" ? "Ramminn situr innan í glugga- eða dyraopinu. Mældu innanmál þar sem ramminn á að sitja, ekki aðeins glerið." : "Ramminn situr framan á opinu og þarf festiflöt í kringum það. Mál opsins og ytri mál rammans eru því ekki þau sömu.",
      tips: ["Athugaðu dýpt, sléttan festiflöt og pláss við handföng og lamir.", "Ekki draga frá eða bæta við millimetrum sjálf/ur í þessu formi. Skráðu óbreytt mál opsins.", "Sendu mynd af opinu ef þú ert óviss. Við staðfestum prófíl, festipláss og lokamál áður en framleiðsla er samþykkt."],
    },
    {
      title: measurementMode === "outer-frame" ? "Ytri mál fullbúins ramma" : "Svona mælirðu opið rétt",
      text: measurementMode === "outer-frame"
        ? "Veldu þessa leið aðeins þegar þú veist nákvæma heildarstærð rammans. Skráðu ytri breidd og ytri hæð í heilum millimetrum."
        : "Notaðu málband og skráðu allar sex mælingarnar í heilum millimetrum. Haltu málbandinu beinu og mældu hverja vegalengd aftur til öryggis.",
      tips: measurementMode === "outer-frame"
        ? ["Mældu frá ytri brún til ytri brúnar rammans.", "Þetta eru ekki opnunarmál og formið reiknar hvorki frádrátt né viðbót.", "Stærðarflokkar eru sjálfkrafa valdir út frá nákvæmu málunum.", "Lokamál eru staðfest áður en framleiðsla hefst."]
        : ["1. Mældu breidd opsins efst, í miðju og neðst.", "2. Mældu hæð opsins vinstra megin, í miðju og hægra megin.", "3. Skráðu hvert mál í réttan reit. Dæmi: 85 cm = 850 mm.", "4. Formið notar minnstu breidd og minnstu hæð sem viðmiðun. Þetta eru ekki staðfest framleiðslumál.", ...(fitting === "overlap" ? ["Utanáliggjandi festing: mældu samt opið hér. Við staðfestum skörun og ytri rammamál sérstaklega."] : ["Innfelld festing: mældu á þeim stað í opinu þar sem ramminn á að sitja."])],
    },
    {
      title: "Rammi og efni eru valin hvort í sínu lagi",
      text: "Veldu fyrst lit rammans og síðan lit efnis þegar það á við. Valinn litur birtist með nafni og fylgir fyrirspurninni.",
      tips: ["Net er ekki það sama og litaður myrkvunardúkur.", "Litir á skjá geta litið öðruvísi út en í dagsbirtu. Óskaðu eftir staðfestingu á lit ef nákvæm samsvörun skiptir máli."],
    },
    {
      title: "Farðu yfir áður en þú sendir",
      text: "Berðu samantektina saman við opið sem þú mældir. Notaðu Til baka til að leiðrétta valið án þess að byrja upp á nýtt.",
      tips: ["Athugaðu kerfi, stefnu, efni og opnun.", "Staðfestu festingu, allar sex mælingar og liti.", "Mál ops, ytri rammamál og framleiðslumál geta verið ólík. Lokamál og útfærsla eru staðfest áður en pantað er í framleiðslu."],
    },
  ][step];
  if (!copy) return null;
  const source = family === "windour" ? THEDOUR_WINDOUR_SOURCES["windour-single-999"] : THEDOUR_ROLDOUR_SOURCES["roldour-duo-horizontal"];
  return (
    <aside aria-label="Leiðbeiningar fyrir þetta skref" className="mb-5 rounded border border-[#ccd9df] bg-[#f4f7f8] p-4 text-sm leading-6 text-[#344b59]">
      <h3 className="font-medium text-[#24313b]">{copy.title}</h3>
      <p className="mt-2">{copy.text}</p>
      {step === 6 && (measurementMode === "outer-frame" ? <OuterFrameDiagram /> : <MeasurementDiagram />)}
      <ul className="mt-3 list-disc space-y-2 pl-5">{copy.tips.map(tip => <li key={tip}>{tip}</li>)}</ul>
      <details className="mt-4 border-t border-[#ccd9df] pt-3">
        <summary className="cursor-pointer text-xs font-medium">Leiðbeiningar og myndbönd frá Thedoûr</summary>
        <p className="mt-2 text-xs">Á vörusíðu framleiðanda eru mælingaleiðbeiningar fyrir innfellda og utanáliggjandi festingu undir „Support Information“. Upplýsingar þar eru á ensku; staðfesta þarf að þær eigi við valda útfærslu.</p>
        <a href={source} target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs underline underline-offset-4">Skoða {family === "windour" ? "WINdoûr" : "ROLdoûr"} hjá framleiðanda (nýr flipi)</a>
        {family === "windour" && <a href="https://youtu.be/d6I079lmTIc" target="_blank" rel="noopener noreferrer" className="mt-2 block text-xs underline underline-offset-4">Horfa á útskýringu á WINdoûr (enska, nýr flipi)</a>}
      </details>
    </aside>
  );
}