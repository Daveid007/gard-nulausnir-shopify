import { useState } from "react";
import { ArrowRight, CircleHelp, Menu, Ruler, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import "./_group.css";
import { BrandLogo } from "./_shared/BrandLogo";

const collectionHref = "/collection";

const collections = [
  { id: "honeycomb", href: `${collectionHref}#honeycomb`, title: "Hunangskambsgardínur", description: "Einangrandi og myrkvandi cellular lausnir.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250" },
  { id: "roller", href: `${collectionHref}#roller`, title: "Rúllugardínur", description: "Ljósstýring, myrkvun og hreinar línur.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-square-cassette.png?v=1787921305" },
  { id: "windour-single", href: `${collectionHref}#windour-single`, title: "WINdoûr Single", description: "Myrkvun eða net · 999 og 2000.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_pg9wzppg9wzppg9w.png?v=1768448444" },
  { id: "windour-duo", href: `${collectionHref}#windour-duo`, title: "WINdoûr Duo", description: "Myrkvun og net saman · 999 og 2000.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/7953253b-19aa-4e2d-8210-5909e63fb0f0.jpg?v=1768840303" },
  { id: "thedour-doors", href: `${collectionHref}#thedour-doors`, title: "Thedoûr - Hurðir & Net", description: "Hurðakerfi og vörn gegn mýi og skordýrum.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238" },
] as const;

function HomepageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-[#24313b]/10 bg-[#f7f9fa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-5 md:px-10">
        <BrandLogo className="h-10 w-[202px] sm:h-11 sm:w-[222px]" />
        <nav className="hidden items-center gap-6 text-[10px] uppercase tracking-[.16em] text-[#43515a] lg:flex" aria-label="Aðalleiðsögn">
          <a href="#collections" className="transition-colors hover:text-[#6892b8]">Lausnir</a>
          <Link href={`${collectionHref}#all-products`} className="inline-flex items-center gap-2 transition-colors hover:text-[#6892b8]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
          <a href="mailto:hallo@gardinulausnir.is" className="inline-flex items-center gap-2 transition-colors hover:text-[#6892b8]"><CircleHelp size={15} strokeWidth={1.5} />Hjálp</a>
        </nav>
        <div className="flex items-center gap-4">
          <a href="#collections" className="hidden text-[10px] uppercase tracking-[.16em] text-[#43515a] sm:inline">Vöruflokkar</a>
          <Link href={collectionHref} aria-label="Opna körfu" className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em]"><ShoppingBag size={18} strokeWidth={1.25} /><span className="hidden sm:inline">Karfa</span></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center lg:hidden" aria-label={menuOpen ? "Loka valmynd" : "Opna valmynd"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="border-t border-[#24313b]/10 bg-[#f7f9fa] px-5 py-4 lg:hidden" aria-label="Farsímaleiðsögn">
        <a href="#collections" onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">Lausnir</a>
        <Link href={`${collectionHref}#all-products`} onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 text-[10px] uppercase tracking-[.16em]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
        <a href="mailto:hallo@gardinulausnir.is" className="flex items-center gap-2 py-3 text-[10px] uppercase tracking-[.16em]"><CircleHelp size={15} strokeWidth={1.5} />Hjálp</a>
      </nav>}
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="border-b border-[#24313b]/10 bg-[#ccdee7]">
      <div className="mx-auto grid max-w-[1480px] overflow-hidden md:grid-cols-[.88fr_1.12fr]">
        <div className="flex min-h-[350px] flex-col justify-center px-5 py-12 md:min-h-[520px] md:px-10">
          <p className="sol-kicker text-[9px] uppercase tracking-[.27em] text-[#43515a]">Mælt. Hannað. Sett upp.</p>
          <h1 className="mt-5 max-w-lg font-serif text-5xl leading-[.94] tracking-[-.06em] text-[#24313b] md:text-7xl">Góð gæði og 5 ára ábyrgð</h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-[#43515a]">Þú finnur gæði og vönduð vinnubrögð í gardínulausnum.</p>
          <a href="#collections" className="sol-action mt-8 inline-flex w-fit items-center gap-3 px-5 py-3.5 text-[10px] uppercase tracking-[.17em]">Skoða vöruflokka <ArrowRight size={14} /></a>
        </div>
        <div className="relative min-h-[330px] bg-[#edf2f4] md:min-h-[520px]">
          <img src="https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250" alt="Hunangskambsgardína í ljósu rými" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
          <p className="absolute bottom-5 left-5 bg-[#f7f9fa]/90 px-3 py-2 text-[9px] uppercase tracking-[.17em] text-[#24313b] md:bottom-7 md:left-7">Ráðgjöf heima hjá þér</p>
        </div>
      </div>
    </section>
  );
}

function CategoryTilesGrid() {
  return (
    <section id="collections" aria-label="Vöruflokkar" className="bg-[#f3f7f8] px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
          <div><p className="sol-kicker text-[9px] uppercase tracking-[.24em] text-[#6892b8]">Veldu vöruflokk</p><h2 className="mt-3 font-serif text-4xl tracking-[-.05em] text-[#24313b] md:text-5xl">Gluggalausnir eftir þínu rými.</h2></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => <Link key={collection.id} href={collection.href} aria-label={`Skoða ${collection.title}`} className="group relative flex min-h-[310px] cursor-pointer touch-manipulation flex-col justify-end overflow-hidden bg-[#dce9ee] p-6 outline-none transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:ring-1 hover:ring-[#a2c2e2] hover:shadow-[0_14px_28px_rgba(67,81,90,0.14)] focus-visible:-translate-y-1 focus-visible:ring-2 focus-visible:ring-[#6892b8] active:scale-[.99] md:min-h-[390px]">
            <img src={collection.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-35 mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
            <div className="relative">
              <h3 lang="is" className="font-serif text-[1.85rem] leading-[.98] tracking-[-.045em] text-[#24313b]">{collection.title}</h3>
              <p className="mt-3 text-sm leading-5 text-[#43515a]">{collection.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 bg-[#a2c2e2] px-3 py-2 text-[9px] uppercase tracking-[.14em] text-[#24313b] transition-transform duration-300 group-hover:translate-x-1">Skoða vöruflokk <ArrowRight size={14} /></span>
            </div>
          </Link>)}
        </div>
      </div>
    </section>
  );
}

function InformationalFooter() {
  const columns = [
    ["Um okkur", ["Saga Gardínulausna", "Mæld. Hannað. Sett upp."]],
    ["Þjónusta", ["Heimaráðgjöf", "Mæling og uppsetning"]],
    ["Flokkar", ["Hunangskambsgardínur", "Rúllugardínur", "WINdoûr Single", "WINdoûr Duo", "Thedoûr Hurðir & Net"]],
    ["Hafa samband", ["hallo@gardinulausnir.is", "Fá ráðgjöf"]],
  ] as const;
  return <footer className="border-t border-[#24313b]/10 bg-[#eaf1f5] px-5 py-12 md:px-10 md:py-16">
    <div className="mx-auto grid max-w-[1480px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map(([title, links]) => <div key={title}><p className="text-[9px] uppercase tracking-[.2em] text-[#71808a]">{title}</p><div className="mt-4 grid gap-3 text-[10px] uppercase tracking-[.13em] text-[#43515a]">{links.map((link) => <span key={link}>{link}</span>)}</div></div>)}
    </div>
    <p className="mx-auto mt-12 max-w-[1480px] border-t border-[#24313b]/10 pt-5 font-serif text-2xl text-[#24313b]">Gardínulausnir.is</p>
  </footer>;
}

export function Homepage() {
  return <div id="top" className="solmyrkvun-grid min-h-screen bg-[#f3f7f8]">
    <HomepageHeader />
    <main><HeroBanner /><CategoryTilesGrid /></main>
    <InformationalFooter />
  </div>;
}

export default Homepage;