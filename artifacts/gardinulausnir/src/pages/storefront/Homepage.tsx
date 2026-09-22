import { useState } from "react";
import { ArrowRight, Menu, Ruler, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import "./_group.css";
import { BrandLogo } from "./_shared/BrandLogo";
import { HelpDrawer } from "./_shared/HelpDrawer";
import { Footer } from "./_shared/Storefront";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { WarrantyButton } from "@/components/WarrantyButton";
import homepageFamily from "@/assets/homepage-family.jpg";
import { curtainProductCoverImage } from "./_shared/curtains-assets";
import { BusinessInquiryButton } from "@/components/BusinessInquiryButton";

const collectionHref = "/collection";

const collections = [
  { id: "curtains", href: `${collectionHref}#curtains`, title: "Gluggatjöld", description: "1000, 2828 og 2883 · 14 + 17 + 6 litasýnishorn.", image: curtainProductCoverImage("curtains-1000") },
  { id: "honeycomb", href: `${collectionHref}#honeycomb`, title: "Myrkvunargardínur", description: "Gardínur eftir máli sem loka birtuna úti.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-honeycomb-45mm.png?v=1787921250" },
  { id: "roller", href: `${collectionHref}#roller`, title: "Rúllugardínur", description: "Rúllugardínur eftir máli — hægt að velja með hliðarlistum eða án.", image: "https://cdn.shopify.com/s/files/1/0678/4974/8567/files/01-primary-square-cassette.png?v=1787921305" },
  { id: "sheer-shades", href: `${collectionHref}#sheer-shades`, title: "Sheer Shades", description: "Láréttar Sheer Shades fyrir stillanlega dagsbirtu og næði.", image: "" },
  { id: "butterfly", href: `${collectionHref}#butterfly`, title: "Fiðrildagardínur", description: "Lárétt Butterfly-kerfi með mjúkri ljósstýringu.", image: "" },
  { id: "vertical-sheer", href: `${collectionHref}#vertical-sheer-shades`, title: "Lóðréttar vefgardínur", description: "Vertical Sheer Shades / Dream Shades · 17 efni.", image: new URL("../../assets/vertical-sheer-shades/cases/Vertical sheer shades (2).jpg", import.meta.url).href },
  { id: "windour", href: `${collectionHref}#windour`, title: "WINdoûr — Rammagardínur", description: "Meira en gardína — eins og húsgagn í rýminu. Skoðaðu öll single- og duo-kerfin.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_pg9wzppg9wzppg9w.png?v=1768448444" },
  { id: "roldour", href: `${collectionHref}#roldour`, title: "ROLdoûr — Rúllukerfi í ramma", description: "Sérsmíðuð rúllukerfi í ramma fyrir glugga og hurðir.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/Gemini_Generated_Image_y9o0pcy9o0pcy9o0.png?v=1769688460" },
  { id: "thedour-doors", href: `${collectionHref}#thedour-doors`, title: "Flugnanet og rammar", description: "Flugnanet fyrir hurðir sem halda skordýrum úti.", image: "https://cdn.shopify.com/s/files/1/0513/7589/8773/files/e6f45daa-cfd5-408a-88fe-c5eafba3034b.jpg?v=1769688238" },
] as const;

function HomepageHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-[#24313b]/10 bg-[#f7f9fa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[76px] max-w-[1480px] items-center justify-between gap-4 px-5 md:px-10">
        <BrandLogo className="h-10 w-[202px] sm:h-11 sm:w-[222px]" />
        <nav className="hidden items-center gap-6 text-[10px] uppercase tracking-[.16em] text-[#43515a] lg:flex" aria-label="Aðalleiðsögn">
           <Link href={collectionHref} className="transition-colors hover:text-[#6892b8]">Gardínur</Link>
           <Link href={`${collectionHref}#curtains`} className="transition-colors hover:text-[#6892b8]">Gluggatjöld</Link>
           <Link href={`${collectionHref}#windour`} className="transition-colors hover:text-[#6892b8]">WINdoûr</Link>
           <Link href={`${collectionHref}#roldour`} className="transition-colors hover:text-[#6892b8]">ROLdoûr</Link>
          <Link href="/maelingar" className="inline-flex items-center gap-2 transition-colors hover:text-[#6892b8]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
          <HelpDrawer />
           <BusinessInquiryButton />
        </nav>
        <div className="flex items-center gap-4">
           <Link href={collectionHref} className="hidden text-[10px] uppercase tracking-[.16em] text-[#43515a] sm:inline">Vöruflokkar</Link>
          <Link href={collectionHref} aria-label="Opna körfu" className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em]"><ShoppingBag size={18} strokeWidth={1.25} /><span className="hidden sm:inline">Karfa</span></Link>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} className="grid h-9 w-9 place-items-center lg:hidden" aria-label={menuOpen ? "Loka valmynd" : "Opna valmynd"}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && <nav className="border-t border-[#24313b]/10 bg-[#f7f9fa] px-5 py-4 lg:hidden" aria-label="Farsímaleiðsögn">
         <Link href={collectionHref} onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">Gardínur</Link>
         <Link href={`${collectionHref}#curtains`} onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">Gluggatjöld</Link>
         <Link href={`${collectionHref}#windour`} onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">WINdoûr — Rammagardínur</Link>
         <Link href={`${collectionHref}#roldour`} onClick={() => setMenuOpen(false)} className="block py-3 text-[10px] uppercase tracking-[.16em]">ROLdoûr — Rúllukerfi í ramma</Link>
        <Link href="/maelingar" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-3 text-[10px] uppercase tracking-[.16em]"><Ruler size={15} strokeWidth={1.5} />Mælingar</Link>
        <HelpDrawer />
         <BusinessInquiryButton className="block py-3 text-left" />
      </nav>}
      <div className="flex justify-center border-t border-[#d8e1e5] bg-[#edf3f8] px-5 py-1">
        <WarrantyButton />
      </div>
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
          <p className="mt-6 max-w-sm text-sm leading-6 text-[#43515a]">Veldu vandaðar gardínur eftir máli fyrir þitt heimili. Fjölbreytt efni og fallegir litir.</p>
          <a href="#collections" className="sol-action mt-8 inline-flex w-fit items-center gap-3 px-5 py-3.5 text-[10px] uppercase tracking-[.17em]">Skoða gardínur <ArrowRight size={14} /></a>
        </div>
        <div className="flex min-h-[330px] flex-col items-center justify-center gap-4 bg-[#edf2f4] p-5 md:min-h-[520px] md:p-10">
          <ResponsiveImage src={homepageFamily} alt="Fjölskylda við glugga með myrkvunargardínu" fetchPriority="high" sizes="(min-width: 768px) 55vw, 100vw" className="max-h-[380px] max-w-full object-contain" />
          <div className="w-full max-w-lg bg-[#f7f9fa]/90 px-4 py-3 text-[#24313b]">
            <h2 className="text-base font-semibold">Frí mæling á höfuðborgarsvæðinu</h2>
            <p className="mt-1 text-sm leading-6 text-[#43515a]">Við komum og aðstoðum við nákvæmar mælingar svo gardínurnar passi fullkomlega í gluggann.</p>
          </div>
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

export function Homepage() {
  return <div id="top" className="solmyrkvun-grid min-h-screen bg-[#f3f7f8]">
    <HomepageHeader />
    <main><HeroBanner /><CategoryTilesGrid /></main>
    <Footer />
  </div>;
}

export default Homepage;