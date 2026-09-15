import { useState } from "react";
import { ArrowRight, Menu, Ruler, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import "./_group.css";
import { BrandLogo } from "./_shared/BrandLogo";
import { HelpDrawer } from "./_shared/HelpDrawer";
import { ResponsiveImage } from "@/components/ResponsiveImage";

const collectionHref = "/collection";

const collections = [
  { id: "honeycomb", href: `${collectionHref}#honeycomb`, title: "Hunangskambsgardínur", description: "Gardínur eftir máli sem einangra og mýkja birtuna.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250" },
  { id: "roller", href: `${collectionHref}#roller`, title: "Rúllugardínur", description: "Vandaðar rúllugardínur eftir máli, fyrir næði og myrkvun.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-square-cassette.png?v=1787921305" },
  { id: "windour-single", href: `${collectionHref}#windour-single`, title: "WINdoûr Single", description: "Myrkvun eða net · 999 og 2000.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_pg9wzppg9wzppg9w.png?v=1768448444" },
  { id: "windour-duo", href: `${collectionHref}#windour-duo`, title: "WINdoûr Duo", description: "Myrkvun og net saman · 999 og 2000.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/7953253b-19aa-4e2d-8210-5909e63fb0f0.jpg?v=1768840303" },
  { id: "thedour-doors", href: `${collectionHref}#thedour-doors`, title: "Thedoûr - Hurðir & Net", description: "Flugnanet fyrir hurðir sem halda skordýrum úti.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238" },
] as const;

function HomepageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-[#24313b]/10 bg-[#f7f9fa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-5 md:px-10">
        <BrandLogo className="h-10 w-[202px] sm:h-11 sm:w-[222px]" />
        <nav className="hidden items-center gap-6 text-[10px] uppercase tracking-[.16em] text-[#43515a] lg:flex" aria-label="Aðalleiðsögn">
           <Link href={collectionHref} className="transition-colors hover:text-[#6892b8]">Gardínur</Link>
          <Link href="/maelingar" className="inline-flex items-center gap-2 transition-colors hover:text-[#6892b8]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
          <HelpDrawer />
        </nav>
        <div className="flex items-center gap-4">
           <Link href={collectionHref} className="hidden text-[10px] uppercase tracking-[.16em] text-[#43515a] sm:inline">Vöruflokkar</Link>
          <Link href={collectionHref} aria-label="Opna körfu" className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em]"><ShoppingBag size={18} strokeWidth={1.25} /><span className="hidden sm:inline">Karfa</span></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center lg:hidden" aria-label={menuOpen ? "Loka valmynd" : "Opna valmynd"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="border-t border-[#24313b]/10 bg-[#f7f9fa] px-5 py-4 lg:hidden" aria-label="Farsímaleiðsögn">
         <Link href={collectionHref} onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">Gardínur</Link>
        <Link href="/maelingar" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 text-[10px] uppercase tracking-[.16em]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
        <HelpDrawer />
      </nav>}
    </header>
  );
}

function HeroBanner() {
  return (
    <section className="border-b border-[#24313b]/10 bg-[#ccdee7]">
      <div className="mx-auto grid max-w-[1480px] overflow-hidden md:grid-cols-[.88fr_1.12fr]">
        <div className="flex min-h-[350px] flex-col justify-center px-5 py-12 md:min-h-[520px] md:px-10">
          <p className="sol-kicker text-[9px] uppercase tracking-[.27em] text-[#43515a]">Vandaðar gardínur eftir máli</p>
          <h1 className="mt-5 max-w-lg font-serif text-5xl leading-[.94] tracking-[-.06em] text-[#24313b] md:text-7xl">Gæða gardínur í þinn glugga</h1>
          <p className="mt-6 max-w-sm text-sm leading-6 text-[#43515a]">Veldu vandaðar gardínur eftir máli fyrir þitt heimili. Fjölbreytt efni, fallegir litir og ráðgjöf við val og mælingar.</p>
          <a href="#collections" className="sol-action mt-8 inline-flex w-fit items-center gap-3 px-5 py-3.5 text-[10px] uppercase tracking-[.17em]">Skoða gardínur <ArrowRight size={14} /></a>
        </div>
        <div className="relative flex min-h-[330px] items-center justify-center bg-[#edf2f4] p-5 md:min-h-[520px] md:p-10">
          <ResponsiveImage src="https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250" alt="Hunangskambsgardína í ljósu rými" fetchPriority="high" sizes="(min-width: 768px) 55vw, 100vw" className="max-h-[460px] max-w-full object-contain" />
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
          <div><p className="sol-kicker text-[9px] uppercase tracking-[.24em] text-[#6892b8]">Finndu þínar gardínur</p><h2 className="mt-3 font-serif text-4xl tracking-[-.05em] text-[#24313b] md:text-5xl">Gardínur eftir þínum málum.</h2></div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {collections.map((collection) => <Link key={collection.id} href={collection.href} aria-label={`Skoða ${collection.title}`} className="group relative flex min-h-[310px] cursor-pointer touch-manipulation flex-col overflow-hidden bg-[#dce9ee] p-6 outline-none transition-[box-shadow] duration-300 ease-out hover:ring-1 hover:ring-[#a2c2e2] hover:shadow-[0_14px_28px_rgba(67,81,90,0.14)] focus-visible:ring-2 focus-visible:ring-[#6892b8] md:min-h-[390px]">
             <div className="relative -mx-6 -mt-6 mb-6 flex aspect-[4/3] max-h-[250px] items-center justify-center overflow-hidden bg-[#e8eef1]">
               <ResponsiveImage src={collection.image} alt="" loading="lazy" sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw" className="max-h-full max-w-full object-contain p-4 opacity-65 mix-blend-multiply" />
             </div>
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
    ["Um okkur", [{ label: "Saga Gardínulausna", href: "/um-okkur" }, { label: "Vandaðar gardínur eftir máli", href: "/um-okkur" }]],
    ["Þjónusta", [{ label: "Heimaráðgjöf", href: "/maelingar" }, { label: "Mæling og uppsetning", href: "/maelingar" }]],
    ["Flokkar", [{ label: "Hunangskambsgardínur", href: `${collectionHref}#honeycomb` }, { label: "Rúllugardínur", href: `${collectionHref}#roller` }, { label: "WINdoûr Single", href: `${collectionHref}#windour-single` }, { label: "WINdoûr Duo", href: `${collectionHref}#windour-duo` }, { label: "Thedoûr Hurðir & Net", href: `${collectionHref}#thedour-doors` }]],
    ["Hafa samband", [{ label: "hallo@gardinulausnir.is", href: "mailto:hallo@gardinulausnir.is" }, { label: "Fá ráðgjöf", href: "/maelingar" }]],
  ] as const;
  return <footer className="border-t border-[#24313b]/10 bg-[#eaf1f5] px-5 py-12 md:px-10 md:py-16">
    <div className="mx-auto grid max-w-[1480px] gap-10 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map(([title, links]) => <div key={title}><p className="text-[9px] uppercase tracking-[.2em] text-[#71808a]">{title}</p><div className="mt-4 grid gap-3 text-[10px] uppercase tracking-[.13em] text-[#43515a]">{links.map((link) => <Link key={link.label} href={link.href} className="hover:text-[#6892b8] transition-colors">{link.label}</Link>)}</div></div>)}
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