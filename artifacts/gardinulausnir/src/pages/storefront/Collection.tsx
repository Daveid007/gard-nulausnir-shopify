import "./_group.css";
import { useEffect } from "react";
import { Footer, Header, ProductGrid } from "./_shared/Storefront";
import { type Product } from "./_shared/data";
import { useStorefrontCatalog } from "./_shared/catalog";

function CategorySection({ id, title, english, description, products: items, emptyMessage }: {
  id: string;
  title: string;
  english: string;
  description: string;
  products: Product[];
  emptyMessage?: string;
}) {
  return <section id={id} className="scroll-mt-28 border-t border-[#24313b]/15 pt-10 md:pt-14">
    <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
      <div className="max-w-2xl">
        <p className="text-[9px] uppercase tracking-[.24em] text-[#6892b8]">{english}</p>
        <h2 className="mt-2 font-serif text-4xl tracking-[-.045em] md:text-5xl">{title}</h2>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[#596872]">{description}</p>
      </div>
      <p className="text-[9px] uppercase tracking-[.18em] text-[#71808a]">{items.length} kerfi</p>
    </div>
    {items.length > 0 ? <ProductGrid items={items} accentBadges /> : <div className="border border-[#a2c2e2] bg-[#eaf1f5] px-6 py-10 text-sm leading-6 text-[#596872]">{emptyMessage ?? "Engar vörur fundust."}</div>}
  </section>;
}

export function Collection() {
  const { products } = useStorefrontCatalog();
  const honeycomb = products.filter(product => product.category === "Hunangskambsgardínur");
  const roller = products.filter(product => product.category === "Rúllugardínur");
  const windourSingle = products.filter(product => product.category === "WINdoûr Single");
  const windourDuo = products.filter(product => product.category === "WINdoûr Duo");
  const thedourDoors = products.filter(product => product.category === "Thedoûr - Hurðir & Net");

  useEffect(() => {
    const scrollToSelectedCategory = () => {
      const categoryId = window.location.hash.slice(1);
      if (!categoryId || categoryId === "all-products") return;
      window.requestAnimationFrame(() => {
        document.getElementById(categoryId === "thedour-windows" ? "windour-single" : categoryId)?.scrollIntoView({ block: "start" });
      });
    };

    scrollToSelectedCategory();
    window.addEventListener("hashchange", scrollToSelectedCategory);
    return () => window.removeEventListener("hashchange", scrollToSelectedCategory);
  }, [products.length]);

  return <div className="solmyrkvun-grid min-h-screen bg-[#f7f9fa]">
    <Header cartCount={0} categoryNav />
    <main id="all-products" className="mx-auto max-w-[1480px] px-5 py-14 md:px-10 md:py-24">
      <div className="flex flex-col justify-between gap-8 border-b border-[#24313b]/15 pb-10 md:flex-row md:items-end">
        <div><p className="text-[10px] uppercase tracking-[.25em] text-[#6892b8]">Gardínulausnir.is / Allt safnið</p><h1 className="mt-4 font-serif text-5xl tracking-[-.055em] md:text-7xl">Fimm aðalflokkar. Rétta lausnin.</h1><p className="mt-5 max-w-xl text-sm leading-6 text-[#596872]">HANDE- og THEdoûr-kerfi með raunverulegum Shopify Media-myndum.</p></div>
        <p className="text-[10px] uppercase tracking-[.17em] text-[#71808a]">{products.length} kerfi · Ísland</p>
      </div>
      <nav aria-label="Vöruflokkar" className="grid grid-cols-2 border-b border-[#24313b]/10 xl:grid-cols-5">
        <a href="#honeycomb" className="border-b border-[#24313b]/10 px-3 py-5 text-center font-serif text-lg transition-colors hover:bg-[#eaf1f5] sm:border-b-0 sm:border-r sm:py-7 md:text-2xl">Hunangskambsgardínur</a>
        <a href="#roller" className="border-b border-[#24313b]/10 px-3 py-5 text-center font-serif text-lg transition-colors hover:bg-[#eaf1f5] lg:border-r lg:py-7 md:text-2xl">Rúllugardínur</a>
        <a href="#windour-single" className="border-r border-[#24313b]/10 px-3 py-5 text-center font-serif text-lg transition-colors hover:bg-[#eaf1f5] lg:py-7 md:text-2xl">WINdoûr Single</a>
        <a href="#windour-duo" className="border-r border-[#24313b]/10 px-3 py-5 text-center font-serif text-lg transition-colors hover:bg-[#eaf1f5] lg:py-7 md:text-2xl">WINdoûr Duo</a>
        <a href="#thedour-doors" className="px-3 py-5 text-center font-serif text-lg transition-colors hover:bg-[#eaf1f5] lg:py-7 md:text-2xl">Thedoûr - Hurðir & Net</a>
      </nav>
      <div className="space-y-24 pt-14 md:space-y-32 md:pt-20">
        <CategorySection id="honeycomb" title="Hunangskambsgardínur" english="HANDE / CELLULAR" description="Cellular, brautalausar og álfilmu-einangraðar myrkvunargardínur." products={honeycomb} />
        <CategorySection id="roller" title="Rúllugardínur" english="HANDE / ROLLER" description="Blackout, ljósdreifing, kassettur og tvöföld rúllukerfi." products={roller} />
        <CategorySection id="windour-single" title="WINdoûr Single" english="THEdoûr / SINGLE" description="Myrkvun eða net. Veldu á milli WINdoûr Single 999 og 2000." products={windourSingle} />
        <CategorySection id="windour-duo" title="WINdoûr Duo" english="THEdoûr / DUO" description="Myrkvun og net saman í einu kerfi. Veldu á milli WINdoûr Duo 999 og 2000." products={windourDuo} />
        <CategorySection id="thedour-doors" title="Thedoûr - Hurðir & Net" english="THEdoûr / BLINDdoûr / NETdoûr" description="Hurðakerfi, brautalaus net og mý-/skordýravörn úr Shopify-vörulistanum." products={thedourDoors} />
      </div>
       <section className="mt-28 border-t border-[#24313b]/10 pt-10"><p className="max-w-2xl font-serif text-3xl leading-tight tracking-[-.03em] md:text-4xl">„Góð gardína hverfur inn í daglegt líf — en munurinn finnst strax.“</p><p className="mt-5 text-[10px] uppercase tracking-[.2em] text-[#71808a]">Gardínulausnir.is, Reykjavík</p></section>
    </main><Footer />
  </div>;
}

export default Collection;