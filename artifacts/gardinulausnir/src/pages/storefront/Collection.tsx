import { useEffect, useState } from "react";
import { Link } from "wouter";
import "./_group.css";
import { Footer, Header, ProductGrid } from "./_shared/Storefront";
import { useStorefrontCatalog } from "./_shared/catalog";
import {
  COLLECTION_CATEGORY_DEFINITIONS,
  collectionCategoryFromUrl,
  collectionHref,
  filterProductsByCategory,
  type CollectionCategorySelection,
} from "./_shared/collectionCategories";

const categoryDefinitions = COLLECTION_CATEGORY_DEFINITIONS;

function currentCategory(): CollectionCategorySelection {
  if (typeof window === "undefined") return "all";
  return collectionCategoryFromUrl(window.location);
}

export function Collection() {
  const { products } = useStorefrontCatalog();
  const [selectedCategory, setSelectedCategory] = useState<CollectionCategorySelection>(currentCategory);

  useEffect(() => {
    const syncCategory = () => setSelectedCategory(currentCategory());
    // Wouter emits these History API events for same-page navigation too.
    // Native hashchange/popstate alone miss header links using pushState.
    const events = ["hashchange", "popstate", "pushState", "replaceState"];
    events.forEach((event) => window.addEventListener(event, syncCategory));
    syncCategory();
    return () => {
      events.forEach((event) => window.removeEventListener(event, syncCategory));
    };
  }, []);

  const selectedDefinition = categoryDefinitions.find((definition) => definition.key === selectedCategory);
  const visibleProducts = filterProductsByCategory(products, selectedCategory);
  const isUnknownCategory = selectedCategory === "unknown";
  const heading = isUnknownCategory ? "Vöruflokkur fannst ekki" : selectedDefinition?.label ?? "Allt safnið";
  const description = isUnknownCategory
    ? "Þessi vöruflokkur er ekki til. Veldu flokk hér að ofan til að sjá réttar vörur."
     : selectedDefinition?.description ?? "Skoðaðu öll kerfin í vörulistanum.";

  return <div className="solmyrkvun-grid min-h-screen bg-[#f7f9fa]">
    <Header cartCount={0} categoryNav />
    <main className="mx-auto max-w-[1480px] px-5 py-14 md:px-10 md:py-24">
      <div className="flex flex-col justify-between gap-8 border-b border-[#24313b]/15 pb-10 md:flex-row md:items-end">
        <div>
          <p className="text-[10px] uppercase tracking-[.25em] text-[#6892b8]">Gardínulausnir.is / {selectedDefinition?.english ?? "Vöruflokkur"}</p>
          <h1 className="mt-4 font-serif text-5xl tracking-[-.055em] md:text-7xl">{heading}</h1>
          <p className="mt-5 max-w-xl text-sm leading-6 text-[#596872]">{description}</p>
        </div>
        <p data-testid="collection-count" className="text-[10px] uppercase tracking-[.17em] text-[#71808a]">{visibleProducts.length} kerfi · Ísland</p>
      </div>

      <nav data-testid="category-filter" aria-label="Vöruflokkar" className="flex flex-wrap gap-2 border-b border-[#24313b]/10 py-5">
        {categoryDefinitions.map((definition) => (
          <Link
            key={definition.key}
            data-testid={`category-tab-${definition.key}`}
            href={collectionHref(definition.key)}
            aria-current={selectedCategory === definition.key ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2 text-center text-sm leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6892b8] ${selectedCategory === definition.key ? "border-[#24313b] bg-[#24313b] text-white" : "border-[#24313b]/15 text-[#596872] hover:bg-[#eaf1f5]"}`}
          >
            {definition.key === "all" ? "Allt" : definition.label}
          </Link>
        ))}
      </nav>

      <section aria-labelledby="selected-category-heading" className="pt-14 md:pt-20">
        <div className="mb-8 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="text-[9px] uppercase tracking-[.24em] text-[#6892b8]">{selectedDefinition?.english ?? "VÖRUFLOKKUR"}</p>
            <h2 id="selected-category-heading" className="mt-2 font-serif text-4xl tracking-[-.045em] md:text-5xl">{heading}</h2>
          </div>
          <p className="text-[9px] uppercase tracking-[.18em] text-[#71808a]">{visibleProducts.length} kerfi</p>
        </div>

        <ProductGrid items={visibleProducts} accentBadges testId="collection-grid" />
        {visibleProducts.length === 0 && (
          <div data-testid="collection-empty" className="border border-[#a2c2e2] bg-[#eaf1f5] px-6 py-10 text-sm leading-6 text-[#596872]">
            {isUnknownCategory ? "Óþekktur vöruflokkur. Engar vörur voru sóttar fyrir þessa slóð." : "Engar vörur fundust í þessum flokki."}
          </div>
        )}
      </section>

      <section className="mt-28 border-t border-[#24313b]/10 pt-10">
        <p className="max-w-2xl font-serif text-3xl leading-tight tracking-[-.03em] md:text-4xl">„Góð gardína hverfur inn í daglegt líf — en munurinn finnst strax.“</p>
        <p className="mt-5 text-[10px] uppercase tracking-[.2em] text-[#71808a]">Gardínulausnir.is, Reykjavík</p>
      </section>
    </main>
    <Footer />
  </div>;
}

export default Collection;