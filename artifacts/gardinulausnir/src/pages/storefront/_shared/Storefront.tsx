import { useState } from "react";
import { ArrowRight, Menu, ShoppingBag, X } from "lucide-react";
import { Link } from "wouter";
import type { Product } from "./data";
import { BrandLogo } from "./BrandLogo";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { HelpDrawer } from "./HelpDrawer";
import { collectionHref } from "./collectionCategories";

const categoryLinks = [
  ["Hunangskambur", collectionHref("honeycomb")],
  ["Rúllugardínur", collectionHref("roller")],
  ["WINdoûr Single", collectionHref("windour-single")],
  ["WINdoûr Duo", collectionHref("windour-duo")],
  ["Thedoûr Hurðir & Net", collectionHref("thedour-doors")],
] as const;

export function Header({ cartCount = 0, categoryNav = false, onCartClick }: { cartCount?: number; categoryNav?: boolean; onCartClick?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-[#24313b]/10 bg-[#f7f9fa]/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 md:px-10">
        <BrandLogo className="h-9 w-[182px] sm:h-10 sm:w-[202px]" />
        <nav className="hidden flex-1 justify-center gap-8 text-[10px] uppercase tracking-[.2em] text-[#43515a] md:flex">
          {categoryNav ? <>{categoryLinks.map(([label, href]) => <Link key={label} href={href} className="transition-colors hover:text-[#6892b8]">{label}</Link>)}<Link href="/maelingar" className="transition-colors hover:text-[#6892b8]">Mælingar</Link></> : <><Link href="/collection" className="transition-colors hover:text-[#6892b8]">Safnið</Link><Link href={collectionHref("honeycomb")} className="transition-colors hover:text-[#6892b8]">Myrkvun</Link><Link href={collectionHref("thedour-doors")} className="transition-colors hover:text-[#6892b8]">Sérlausnir</Link><Link href="/maelingar" className="transition-colors hover:text-[#6892b8]">Mælingar</Link></>}
        </nav>
        <div className="flex items-center justify-end gap-4 md:min-w-[202px]">
          <HelpDrawer />
          <button onClick={onCartClick} className="relative flex items-center gap-2 text-[10px] uppercase tracking-[.16em]" aria-label="Opna körfu">
            <ShoppingBag size={18} strokeWidth={1.25} /><span className="hidden sm:inline">Karfa</span>
            <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#a2c2e2] px-1 text-[9px]">{cartCount}</span>
          </button>
          <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Opna valmynd">{open ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {open && <nav className="border-t border-[#24313b]/10 px-5 py-5 md:hidden">
        {(categoryNav ? [...categoryLinks, ["Mælingar", "/maelingar"] as const] : [["Safnið", "/collection"], ["Myrkvun", collectionHref("honeycomb")], ["Sérlausnir", collectionHref("thedour-doors")], ["Mælingar", "/maelingar"]] as const).map(([label, href]) => <Link key={label} href={href} onClick={() => setOpen(false)} className="block py-2 text-[11px] uppercase tracking-[.18em]">{label}</Link>)}
      </nav>}
    </header>
  );
}

export function ProductCard({ product, accentBadge = false }: { product: Product; accentBadge?: boolean }) {
  const actionHref = `/products/${encodeURIComponent(product.id)}`;
  const recoverImage = (event: React.SyntheticEvent<HTMLImageElement>, fallback?: string) => {
    const image = event.currentTarget;
    if (fallback && image.src !== fallback) {
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      image.src = fallback;
      return;
    }
    image.style.display = "none";
  };

  return <article className="group relative">
    <div className="relative aspect-[4/3] overflow-hidden bg-[#e8eef1]">
      <ResponsiveImage src={product.image} alt={product.title} loading="lazy" decoding="async" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" onError={(event) => recoverImage(event, product.fallbackImage ?? product.secondary)} className="absolute inset-0 h-full w-full object-contain p-3 transition-opacity duration-500 group-hover:opacity-0" />
      <ResponsiveImage src={product.secondary} alt="" loading="lazy" decoding="async" sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" onError={(event) => recoverImage(event, product.fallbackSecondary ?? product.image)} className="absolute inset-0 h-full w-full object-contain p-3 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      {product.note && <span className={`absolute left-3 top-3 px-2 py-1 text-[9px] uppercase tracking-[.16em] ${accentBadge ? "bg-[#a2c2e2] text-[#24313b]" : "bg-[#f7f9fa]/90"}`}>{product.note}</span>}
       <Link href={actionHref} className="absolute bottom-0 left-0 right-0 translate-y-0 bg-[#a2c2e2] px-3 py-3 text-left text-[9px] font-medium uppercase tracking-[.14em] transition-transform duration-300 sm:translate-y-full sm:px-4 sm:py-4 sm:text-[10px] sm:tracking-[.18em] sm:group-hover:translate-y-0">Velja stærð <ArrowRight size={14} className="float-right" /></Link>
    </div>
    <div className="flex flex-col items-start gap-1 pt-4 sm:flex-row sm:justify-between sm:gap-3">
      <div className="min-w-0"><p className="text-[8px] uppercase tracking-[.14em] text-[#71808a] sm:text-[9px] sm:tracking-[.17em]">{product.category}</p><h3 className="mt-1 font-serif text-[16px] leading-tight text-[#24313b] sm:text-[18px]">{product.title}</h3><p className="mt-1 text-[10px] leading-snug text-[#71808a] sm:text-[11px]">{product.subtitle}</p></div>
      <p className="whitespace-nowrap text-[10px] text-[#43515a] sm:pt-1 sm:text-[11px]">{product.price}</p>
    </div>
    <div className="mt-3 flex gap-1.5">{product.colors.map(color => <span key={color} className="h-3 w-3 rounded-full border border-[#24313b]/15" style={{ backgroundColor: color }} />)}</div>
  </article>;
}

export function ProductGrid({ items, accentBadges = false, testId }: { items: Product[]; accentBadges?: boolean; testId?: string }) {
  return <div data-testid={testId} className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-16">{items.map(p => <ProductCard key={p.id} product={p} accentBadge={accentBadges} />)}</div>;
}

export function Footer() {
  return <footer className="mt-16 border-t border-[#24313b]/10 bg-[#eaf1f5] px-5 py-12 md:px-10"><div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-10 md:flex-row"><div><p className="font-serif text-2xl">Gardínulausnir.is</p><p className="mt-3 max-w-xs text-xs leading-relaxed text-[#596872]">Gæða gardínur í þinn glugga. Vandaðar gardínur eftir máli og ráðgjöf við val, mælingar og uppsetningu.</p></div><div className="grid grid-cols-2 gap-x-16 gap-y-3 text-[10px] uppercase tracking-[.15em] text-[#43515a]"><Link href="/collection">Gardínur</Link><Link href="/um-okkur">Um okkur</Link><a href="mailto:hallo@gardinulausnir.is">Hafa samband</a><a href="#top">Upp á topp</a></div></div></footer>;
}