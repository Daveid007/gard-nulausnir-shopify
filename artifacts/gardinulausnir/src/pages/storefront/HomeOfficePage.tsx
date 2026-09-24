import { ArrowRight, ArrowUpRight, Check, Info, Plus, Ruler } from "lucide-react";
import { Link } from "wouter";
import "./_group.css";
import "./home-office.css";
import { Footer, Header } from "./_shared/Storefront";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { BusinessInquiryButton } from "@/components/BusinessInquiryButton";
import { comparisonHeads, comparisonRows, homeOfficeFaqs, homeOfficeGroups, thedourUrl, type HomeOfficeGroup } from "./_shared/homeOffice";
import { useReveal } from "./_shared/useReveal";

const ink = "text-[#24313b]";
const muted = "text-[#43515a]";
const kicker = "sol-kicker text-[9px] uppercase tracking-[.26em]";

function SupplierLink({ suffix, label = "Skoða hjá Thedoûr" }: { suffix: string; label?: string }) {
  return (
    <a href={thedourUrl(suffix)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border-b border-[#6892b8] pb-0.5 text-[10px] uppercase tracking-[.15em] text-[#24313b] transition-colors hover:text-[#6892b8]">
      {label} <ArrowUpRight size={13} aria-hidden /><span className="sr-only">(opnast á vef framleiðanda)</span>
    </a>
  );
}

function GroupSection({ group, flip }: { group: HomeOfficeGroup; flip: boolean }) {
  const local = group.availability === "local";
  return (
    <section id={group.id} aria-labelledby={`${group.id}-h`} className="ho-reveal scroll-mt-32 border-t border-[#24313b]/10 py-14 md:py-20">
      <div className={`grid gap-10 md:grid-cols-[1fr_1.05fr] md:gap-16 ${flip ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="group relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-[#dce9ee]">
          {group.image ? (
            <ResponsiveImage src={group.image} alt={`${group.families.join(" og ")} — dæmi um uppsetningu`} loading="lazy" sizes="(min-width: 768px) 45vw, 100vw" className="ho-img h-full w-full object-cover" />
          ) : (
            <div aria-hidden className="grid h-full w-full grid-cols-6 gap-[3px] bg-[#c9dbe4] p-10">
              {Array.from({ length: 6 }).map((_, i) => <span key={i} className="bg-[#eef4f6]" style={{ opacity: 1 - i * 0.08 }} />)}
            </div>
          )}
          <span className={`absolute left-4 top-4 px-3 py-1.5 text-[9px] uppercase tracking-[.16em] ${local ? "bg-[#24313b] text-[#f3f7f8]" : "bg-[#f7f9fa] text-[#24313b]"}`}>
            {local ? "Fáanlegt hjá okkur" : "Upplýsingar frá framleiðanda"}
          </span>
        </div>
        <div className="flex flex-col justify-center">
          <p className={`${kicker} text-[#6892b8]`}>{group.index} · {group.families.join(" / ")}</p>
          <h2 id={`${group.id}-h`} className={`mt-3 font-serif text-4xl leading-[.98] tracking-[-.05em] md:text-5xl ${ink}`}>{group.title}</h2>
          <p className={`mt-4 max-w-lg text-[15px] leading-7 ${muted}`}>{group.lede}</p>
          <ul className="mt-6 space-y-2.5">
            {group.points.map((p) => <li key={p} className={`flex gap-3 text-sm leading-6 ${muted}`}><Check size={16} className="mt-1 shrink-0 text-[#6892b8]" aria-hidden />{p}</li>)}
          </ul>
          {local && group.local && (
            <div className="mt-8">
              <p className={`${kicker} ${muted}`}>Stilla og senda fyrirspurn</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.local.map((l) => <Link key={l.href} href={l.href} className="inline-flex items-center gap-2 bg-[#dce9ee] px-3 py-2 text-xs text-[#24313b] transition-colors hover:bg-[#a2c2e2]">{l.label}<ArrowRight size={12} aria-hidden /></Link>)}
              </div>
            </div>
          )}
          {!local && (
            <p className={`mt-7 flex gap-3 border-l-2 border-[#a2c2e2] bg-[#edf3f8] px-4 py-3 text-sm leading-6 ${muted}`}>
              <Info size={16} className="mt-1 shrink-0 text-[#6892b8]" aria-hidden />
              Þessi vara er ekki til sölu í vefversluninni okkar. Upplýsingarnar koma frá framleiðanda — sendu fyrirspurn og við athugum hvað er hægt.
            </p>
          )}
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
            {local && group.collection && <Link href={group.collection.href} className="sol-action inline-flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-[.17em]">{group.collection.label}<ArrowRight size={14} aria-hidden /></Link>}
            {!local && <BusinessInquiryButton productContext={`Heimili og skrifstofur: ${group.title} (${group.families.join(", ")})`} label="Senda fyrirspurn" className="sol-action inline-flex items-center px-5 py-3 text-[10px] uppercase tracking-[.17em]" />}
            <SupplierLink suffix={group.sourceSuffix} />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeOfficePage() {
  useReveal();
  return (
    <div className="solmyrkvun-grid min-h-[100dvh] bg-[#f3f7f8]">
      <Header showCart={false} businessContext="Heimili og skrifstofur" />
      <main>
        <section className="border-b border-[#24313b]/10 bg-[#ccdee7]">
          <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-14 md:grid-cols-[1.1fr_.9fr] md:px-10 md:py-20">
            <div className="ho-reveal">
              <p className={`${kicker} ${muted}`}>Heimili og skrifstofur</p>
              <h1 className={`mt-5 max-w-3xl font-serif text-5xl leading-[.94] tracking-[-.06em] md:text-7xl ${ink}`}>Rétta lausnin fyrir hvern glugga og hverja hurð.</h1>
              <p className={`mt-6 max-w-xl text-[15px] leading-7 ${muted}`}>Þrír flokkar af Thedoûr-kerfum — hér sérðu hvað hvert kerfi gerir, hvaða mál skipta máli og hvaða lausnir þú getur stillt hér og sent í fyrirspurn.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#yfirlit" className="sol-action inline-flex items-center gap-3 px-5 py-3.5 text-[10px] uppercase tracking-[.17em]">Finna lausn <ArrowRight size={14} aria-hidden /></a>
                <a href="#maelingar" className="inline-flex items-center gap-2 border border-[#24313b]/25 px-5 py-3.5 text-[10px] uppercase tracking-[.17em] text-[#24313b] transition-colors hover:bg-[#f7f9fa]"><Ruler size={14} aria-hidden />Hvernig á að mæla</a>
              </div>
            </div>
            <nav id="yfirlit" aria-label="Flokkar á síðunni" className="ho-reveal scroll-mt-32 self-end bg-[#f7f9fa]/85 p-2">
              {homeOfficeGroups.map((g) => (
                <a key={g.id} href={`#${g.id}`} className="group flex items-baseline gap-4 border-b border-[#24313b]/10 px-4 py-4 last:border-0 transition-colors hover:bg-[#edf3f8]">
                  <span className="font-mono text-[11px] text-[#6892b8]">{g.index}</span>
                  <span className="flex-1">
                    <span className={`block font-serif text-xl tracking-[-.03em] ${ink}`}>{g.title}</span>
                    <span className={`text-xs ${muted}`}>{g.families.join(" · ")} — {g.availability === "local" ? "skoða og stilla" : "fyrirspurn"}</span>
                  </span>
                  <ArrowRight size={14} className="text-[#6892b8] transition-transform group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden />
                </a>
              ))}
            </nav>
          </div>
        </section>

        <div className="mx-auto max-w-[1280px] px-5 md:px-10">
          {homeOfficeGroups.map((g, i) => <GroupSection key={g.id} group={g} flip={i % 2 === 1} />)}
        </div>

        <section aria-labelledby="samanburdur-h" className="ho-reveal border-y border-[#24313b]/10 bg-[#edf3f8] py-14 md:py-20">
          <div className="mx-auto max-w-[1280px] px-5 md:px-10">
            <p className={`${kicker} text-[#6892b8]`}>Samanburður</p>
            <h2 id="samanburdur-h" className={`mt-3 font-serif text-4xl tracking-[-.05em] md:text-5xl ${ink}`}>Berðu saman kerfin.</h2>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <caption className="sr-only">Samanburður á WINdoûr, ROLdoûr Slimline, NETdoûr og BLINDdoûr</caption>
                <thead>
                  <tr>
                    <th scope="col" className="w-[16%] py-3" />
                    {comparisonHeads.map((h) => <th key={h.label} scope="col" className="py-3 pr-4 align-bottom"><Link href={h.href} className={`font-serif text-xl tracking-[-.03em] underline-offset-4 hover:underline ${ink}`}>{h.label}</Link></th>)}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((r) => (
                    <tr key={r.label} className="border-t border-[#24313b]/10">
                      <th scope="row" className={`py-4 pr-4 text-[10px] font-medium uppercase tracking-[.14em] ${muted}`}>{r.label}</th>
                      {r.values.map((v, i) => <td key={i} className={`py-4 pr-4 leading-6 ${ink}`}>{v}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className={`mt-5 text-xs leading-5 ${muted}`}>Nákvæm stærðarbil, rammalitir og verð eru á hverri vörusíðu. Rúllugardínur fást einnig með hliðarlistum — sjá <Link href="/collection#roller" className="underline underline-offset-2">rúllugardínur</Link>.</p>
          </div>
        </section>

        <section id="maelingar" aria-labelledby="maelingar-h" className="ho-reveal scroll-mt-32 py-14 md:py-20">
          <div className="mx-auto grid max-w-[1280px] gap-12 px-5 md:grid-cols-[.9fr_1.1fr] md:px-10">
            <div>
              <p className={`${kicker} text-[#6892b8]`}>Mælingar</p>
              <h2 id="maelingar-h" className={`mt-3 font-serif text-4xl tracking-[-.05em] md:text-5xl ${ink}`}>Mældu þrisvar. Pantaðu einu sinni.</h2>
              <p className={`mt-4 text-[15px] leading-7 ${muted}`}>Op og ytri rammamál eru ekki sami hluturinn og ekki hægt að nota til skiptis. Vörusíðan segir hvort málið á við.</p>
              <Link href="/maelingar" className="sol-action mt-8 inline-flex items-center gap-3 px-5 py-3 text-[10px] uppercase tracking-[.17em]">Ítarlegar mælingaleiðbeiningar <ArrowRight size={14} aria-hidden /></Link>
            </div>
            <ol className="grid gap-3 sm:grid-cols-2">
              {[
                ["Breidd — þrjár mælingar", "Mældu breiddina efst, í miðju og neðst. Skráðu öll þrjú málin."],
                ["Hæð — þrjár mælingar", "Mældu hæðina vinstra megin, í miðju og hægra megin. Skráðu öll þrjú málin."],
                ["Op eða ytri rammi", "Kannaðu á vörusíðunni hvort beðið er um mál opsins eða ytri mál fullbúins ramma."],
                ["Engir eigin frádrættir", "Sláðu inn málin eins og þau mælast. Ef þú ert í vafa, hafðu samband áður en þú pantar."],
              ].map(([t, d], i) => (
                <li key={t} className="bg-[#dce9ee] p-6">
                  <span className="font-mono text-[11px] text-[#6892b8]">0{i + 1}</span>
                  <h3 className={`mt-3 font-serif text-2xl tracking-[-.03em] ${ink}`}>{t}</h3>
                  <p className={`mt-2 text-sm leading-6 ${muted}`}>{d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section aria-labelledby="faq-h" className="ho-reveal border-t border-[#24313b]/10 bg-[#f7f9fa] py-14 md:py-20">
          <div className="mx-auto grid max-w-[1280px] gap-10 px-5 md:grid-cols-[.8fr_1.2fr] md:px-10">
            <div>
              <p className={`${kicker} text-[#6892b8]`}>Spurt og svarað</p>
              <h2 id="faq-h" className={`mt-3 font-serif text-4xl tracking-[-.05em] md:text-5xl ${ink}`}>Það sem fólk spyr oftast um.</h2>
            </div>
            <div>
              {homeOfficeFaqs.map((f) => (
                <details key={f.q} className="ho-faq border-b border-[#24313b]/10">
                  <summary className={`flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-serif text-xl tracking-[-.02em] outline-none focus-visible:ring-2 focus-visible:ring-[#6892b8] ${ink}`}>
                    {f.q}<Plus size={18} className="ho-plus shrink-0 text-[#6892b8]" aria-hidden />
                  </summary>
                  <p className={`pb-6 pr-10 text-sm leading-7 ${muted}`}>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#24313b] py-14 text-[#f3f7f8] md:py-16">
          <div className="mx-auto flex max-w-[1280px] flex-col gap-8 px-5 md:flex-row md:items-end md:justify-between md:px-10">
            <div>
              <p className="sol-kicker text-[9px] uppercase tracking-[.26em] text-[#a2c2e2]">Ekki viss?</p>
              <h2 className="mt-3 max-w-xl font-serif text-4xl tracking-[-.05em] md:text-5xl">Sendu okkur málin og við hjálpum þér að velja.</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#ccdee7]">Frí mæling á höfuðborgarsvæðinu. 5 ára ábyrgð á búnaði og brautum.</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <BusinessInquiryButton productContext="Heimili og skrifstofur" label="Senda fyrirspurn" className="inline-flex items-center bg-[#a2c2e2] px-5 py-3.5 text-[10px] uppercase tracking-[.17em] text-[#24313b]" />
              <a href={thedourUrl()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[.15em] text-[#ccdee7] hover:text-[#f3f7f8]">Yfirlit framleiðanda <ArrowUpRight size={13} aria-hidden /><span className="sr-only">(opnast á vef framleiðanda)</span></a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HomeOfficePage;
