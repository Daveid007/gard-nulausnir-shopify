import { useEffect, useState } from "react";
import { products as verifiedProducts, type Product } from "./data.ts";
import {
  categoryLabel,
  resolveProductCategory,
  type CollectionCategoryKey,
} from "./collectionCategories.ts";
import { isCurtainProductId } from "./curtains.ts";

type ShopifyImage = { url: string; altText: string | null };
type ShopifyMoney = { amount: string; currencyCode: string };
type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  productType?: string;
  tags?: string[];
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
const apiOrigin = (import.meta.env?.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, "") ?? "";

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
  const category = resolveProductCategory({
    id: "",
    collectionHandles: [collection.handle],
    collectionTitles: [collection.title],
  });
  return category ? categoryLabel(category) : null;
}

function mergeLiveProduct(live: ShopifyProduct, fallback: Product, category: CollectionCategoryKey, collection?: ShopifyCollection): Product {
  const images = live.images?.nodes ?? [];
  return {
    ...fallback,
    id: fallback.id,
    shopifyHandle: live.handle,
    title: fallback.title,
    subtitle: fallback.subtitle,
    category: categoryLabel(category),
    productType: live.productType,
    tags: live.tags,
    collectionHandles: collection ? [collection.handle] : fallback.collectionHandles,
    collectionTitles: collection ? [collection.title] : fallback.collectionTitles,
    // The curtain showcase has no supplied price. Keep its editorial inquiry
    // state even if a connected catalogue happens to expose a numeric amount.
    price: isCurtainProductId(fallback.id)
      ? fallback.price
      : formatPrice(live.priceRange?.minVariantPrice, fallback.price),
    image: live.featuredImage?.url || images[0]?.url || fallback.image,
    secondary: images[1]?.url || fallback.secondary,
    fallbackImage: fallback.image,
    fallbackSecondary: fallback.secondary,
  };
}

export function mergeCatalog(catalog: ShopifyCatalogResponse): { products: Product[]; liveCount: number } {
  const result = new Map(verifiedProducts.map((product) => [product.id, product]));
  const byHandle = new Map(
    verifiedProducts.map((product) => [product.shopifyHandle ?? product.id, product]),
  );
  let liveCount = 0;

  const merge = (live: ShopifyProduct, collection?: ShopifyCollection) => {
    const fallback = byHandle.get(live.handle);
    if (!fallback) return;

    const category = resolveProductCategory({
      id: fallback.id,
      category: collection ? collectionCategory(collection) ?? undefined : fallback.category,
      productType: live.productType,
      tags: live.tags,
      collectionHandles: collection ? [collection.handle] : undefined,
      collectionTitles: collection ? [collection.title] : undefined,
    });
    if (!category) return;

    result.set(fallback.id, mergeLiveProduct(live, fallback, category, collection));
    liveCount += 1;
  };

  for (const live of catalog.products?.nodes ?? []) merge(live);
  for (const collection of catalog.collections?.nodes ?? []) {
    if (!collectionCategory(collection)) continue;
    for (const live of collection.products.nodes) merge(live, collection);
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