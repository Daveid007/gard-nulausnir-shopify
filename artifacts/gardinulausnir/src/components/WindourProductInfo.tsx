import { Magnet, Ruler, Layers, Shield, Palette, Frame } from "lucide-react";
import { Link } from "wouter";

const features = [
  { icon: Magnet, title: "Segullokun", detail: "Segullokun heldur gardínu eða neti lokuðu og auðveldar daglega notkun." },
  { icon: Ruler, title: "Sérsmíðað eftir máli", detail: "Ramminn er gerður eftir staðfestum lokamálum. Nákvæm ytri rammamál eru ekki það sama og innanmál gluggaops." },
  { icon: Layers, title: "Fellt honeycomb-efni", detail: "Frumubygging myrkvunarefnisins hjálpar til við einangrun. Efnið fellur saman inni í rammanum." },
  { icon: Shield, title: "Myrkvun eða flugnanet", detail: "Veldu einfalda lausn (Single) eða DUO. Myrkvun veitir næði; flugnanet hleypir lofti í gegn án þess að myrkva." },
  { icon: Palette, title: "Litir sem passa við rýmið", detail: "Níu rammalitir og fjórir litir á honeycomb-efni: svartur, ljósgrár, beinhvítur og himinblár. Fellt flugnanet er sérstakur efniskostur." },
  { icon: Frame, title: "Álrammi", detail: "Léttur og traustur álrammi gefur glugganum afmarkað, heildstætt útlit — eins og húsgagn í rýminu." },
];

export function WindourProductInfo({ tier }: { tier: "999" | "2000" }) {
  return (
    <section aria-labelledby="windour-product-info" className="my-6 border-y border-[#ccd9df] py-6 text-[#344b59]">
      <p className="text-[10px] uppercase tracking-[.18em] text-[#667984]">Um WINdoûr</p>
      <h2 id="windour-product-info" className="mt-2 font-serif text-2xl text-[#24313b]">Rammagardínur — meira en gardína</h2>
      <p className="mt-3 text-sm leading-6">
        WINdoûr sameinar sérsmíðaðan álramma, segullokun og val um fellda honeycomb-myrkvun eða flugnanet.
        Lausnin hentar meðal annars heimilum, húsbílum og ferðabílum þar sem næði, birtustýring og vörn gegn skordýrum skipta máli.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        <Link href="/products/blinddour-trackless-door" className="border border-[#9ebbd0] bg-[#eaf3f8] px-4 py-3 text-sm font-medium text-[#24313b] transition-colors hover:bg-[#dcecf4]">
          BLINDdoûr — myrkvunarhurð
          <span className="mt-1 block text-xs font-normal leading-5 text-[#667984]">Sérstakt brautalaust hurðakerfi fyrir myrkvun.</span>
        </Link>
        <Link href="/products/netdour-trackless-door" className="border border-[#9ebbd0] bg-[#eaf3f8] px-4 py-3 text-sm font-medium text-[#24313b] transition-colors hover:bg-[#dcecf4]">
          NETdoûr — flugnanet fyrir hurð
          <span className="mt-1 block text-xs font-normal leading-5 text-[#667984]">Sérstakt brautalaust hurðakerfi sem heldur skordýrum úti.</span>
        </Link>
      </div>
      <div className="mt-4 rounded border border-[#9ebbd0] bg-[#eaf3f8] p-4 text-sm leading-6">
        <strong className="text-[#24313b]">Hvað merkir {tier}?</strong>
        <p>{tier === "999"
          ? "999 er stærðarflokkur fyrir mál allt að 999 mm (99,9 cm). Það þýðir ekki að ramminn verði 999 × 999 mm."
          : "2000 er stærðarflokkur fyrir mál allt að 2000 mm (200 cm). Það þýðir ekki að ramminn verði 2000 × 2000 mm."}</p>
        <p className="mt-2">Sláðu inn nákvæma breidd og hæð. Lokamál og festing eru staðfest fyrir framleiðslu.</p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {features.map(({ icon: Icon, title, detail }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon size={19} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-[#587c94]" />
            <div><h3 className="text-sm font-medium text-[#24313b]">{title}</h3><p className="mt-1 text-xs leading-5">{detail}</p></div>
          </div>
        ))}
      </div>
      <h3 className="mt-5 text-sm font-medium text-[#24313b]">Af hverju WINdoûr?</h3>
      <p className="mt-2 text-sm leading-6">Sérsmíðuð lausn sem sameinar útlit og notagildi: auðveld segullokun, val um myrkvun og net og litir sem falla að innréttingunni. Þú velur útfærsluna eftir þörfum rýmisins.</p>
    </section>
  );
}