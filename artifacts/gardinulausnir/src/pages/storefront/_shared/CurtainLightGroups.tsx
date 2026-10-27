import type { Product } from "./data";
import { ProductCard } from "./Storefront";
import { getCurtainProductDefinition } from "./curtains";

type GroupKey = "blackout-90" | "blackout-100" | "sheer" | "other";

const GROUPS: readonly { key: GroupKey; label: string }[] = [
  { key: "blackout-90", label: "90% myrkvun" },
  { key: "blackout-100", label: "100% myrkvun" },
  { key: "sheer", label: "Ljósgegnsæ efni" },
  { key: "other", label: "Önnur efni" },
];

/** Grouping uses only local CURTAIN_PRODUCT_DEFINITIONS; unknown products go to "other". */
function groupFor(product: Product): GroupKey {
  const definition = getCurtainProductDefinition(product.id);
  if (!definition) return "other";
  if (definition.lightControl === "90% myrkvun") return "blackout-90";
  if (definition.lightControl === "100% myrkvun") return "blackout-100";
  if (!definition.lightControl && definition.productCode === "Textile Sheer") return "sheer";
  return "other";
}

export function CurtainLightGroups({ items, accentBadges = false, testId }: { items: Product[]; accentBadges?: boolean; testId?: string }) {
  if (items.length === 0) return null;
  const grouped = GROUPS.map((group) => ({ ...group, products: items.filter((p) => groupFor(p) === group.key) }));
  const visible = grouped.filter((g) => g.key !== "other" || g.products.length > 0);
  const desktopCols = visible.length > 3 ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3";

  return <div data-testid={testId} className={`grid min-w-0 grid-cols-1 gap-14 md:gap-6 lg:gap-8 ${desktopCols}`}>
    {visible.map((group) => (
      <section key={group.key} data-testid={`curtain-group-${group.key}`} aria-labelledby={`curtain-group-${group.key}-heading`} className="min-w-0">
        <div className="mb-6 flex items-baseline justify-between gap-3 border-b border-[#24313b]/15 pb-3">
          <div className="min-w-0">
            <h3 id={`curtain-group-${group.key}-heading`} className="mt-1 font-serif text-2xl tracking-[-.03em] text-[#24313b]">{group.label}</h3>
          </div>
          <p className="whitespace-nowrap text-[9px] uppercase tracking-[.18em] text-[#71808a]">{group.products.length} kerfi</p>
        </div>
        {group.products.length > 0
          ? <div className="flex flex-col gap-12">{group.products.map((p) => <ProductCard key={p.id} product={p} accentBadge={accentBadges} />)}</div>
          : <p className="text-sm text-[#71808a]">Engar vörur í þessum flokki.</p>}
      </section>
    ))}
  </div>;
}
