import { useEffect, useState } from "react";
import { products as verifiedProducts, type Product } from "./data";

type ShopifyImage = { url: string; altText: string | null };
type ShopifyMoney = { amount: string; currencyCode: string };
type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: ShopifyImage | null;
  images?: { nodes: ShopifyImage[] };
  priceRange: { minVariantPrice: ShopifyMoney };
};
type ShopifyCollection = {
  title: string;
  handle: string;
  products: { nodes: ShopifyProduct[] };
};
type ShopifyCatalogResponse = {
  connected: boolean;
  products?: { nodes: ShopifyProduct[] };
  collections?: { nodes: ShopifyCollection[] };
};

export type CatalogStatus = "loading" | "live" | "fallback";
const apiOrigin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";

const isk = new Intl.NumberFormat("is-IS", {
  style: "currency",
  currency: "ISK",
  maximumFractionDigits: 0,
});

function formatPrice(money: ShopifyMoney | undefined, fallback: string) {
  if (!money || money.currencyCode !== "ISK") return fallback;
  const amount = Number(money.amount);
  return Number.isFinite(amount) ? isk.format(amount) : fallback;
}

function collectionCategory(collection: ShopifyCollection): string | null {
  const value = `${collection.handle} ${collection.title}`.toLocaleLowerCase("is");
  if (/honeycomb|hunangskamb|cellular/.test(value)) return "Hunangskambsgardínur";
  if (/roller|rúllu|rullu/.test(value)) return "Rúllugardínur";
  if (/windour|gluggalausn/.test(value)) return "Thedoûr - Gluggalausnir";
  if (/bath|bað|badlausn|flexdour/.test(value)) return "Thedoûr - Baðlausnir";
  if (/blinddour|netdour|roldour|hurð|hurd|insect|screen/.test(value)) return "Thedoûr - Hurðir & Net";
  return null;
}

function mergeLiveProduct(live: ShopifyProduct, fallback: Product, category = fallback.category): Product {
  const images = live.images?.nodes ?? [];
  return {
    ...fallback,
    id: fallback.id,
    shopifyHandle: live.handle,
    title: live.title || fallback.title,
    subtitle: live.description?.trim() || fallback.subtitle,
    category: fallback.id.startsWith("windour-") ? fallback.category : category,
    price: formatPrice(live.priceRange?.minVariantPrice, fallback.price),
    image: live.featuredImage?.url || images[0]?.url || fallback.image,
    secondary: images[1]?.url || fallback.secondary,
    fallbackImage: fallback.image,
    fallbackSecondary: fallback.secondary,
  };
}

function mergeCatalog(catalog: ShopifyCatalogResponse): { products: Product[]; liveCount: number } {
  const result = new Map(verifiedProducts.map((product) => [product.id, product]));
  const byHandle = new Map(
    verifiedProducts.map((product) => [product.shopifyHandle ?? product.id, product]),
  );
  let liveCount = 0;

  const merge = (live: ShopifyProduct, category?: string) => {
    const fallback = byHandle.get(live.handle);
    if (!fallback || category === "Thedoûr - Baðlausnir") return;
    result.set(fallback.id, mergeLiveProduct(live, fallback, category));
    liveCount += 1;
  };

  for (const live of catalog.products?.nodes ?? []) merge(live);
  for (const collection of catalog.collections?.nodes ?? []) {
    const category = collectionCategory(collection);
    if (!category) continue;
    for (const live of collection.products.nodes) merge(live, category);
  }

  return { products: [...result.values()], liveCount };
}

export function useStorefrontCatalog() {
  const [items, setItems] = useState<Product[]>(verifiedProducts);
  const [status, setStatus] = useState<CatalogStatus>("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`${apiOrigin}/api/sol/catalog`, {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
        const catalog = (await response.json()) as ShopifyCatalogResponse;
        const merged = mergeCatalog(catalog);
        setItems(merged.products);
        setStatus(merged.liveCount > 0 ? "live" : "fallback");
      } catch (error) {
        if ((error as Error).name === "AbortError") return;
        setItems(verifiedProducts);
        setStatus("fallback");
      }
    }

    void load();
    return () => controller.abort();
  }, []);

  return { products: items, status };
}