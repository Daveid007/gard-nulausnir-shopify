import { Router, type IRouter } from "express";
import { shopifyStorefrontRequest } from "../lib/shopifyStorefrontClient";

const router: IRouter = Router();

type ShopifyImage = {
  url: string;
  altText: string | null;
  width: number | null;
  height: number | null;
};

type ShopifyMoney = {
  amount: string;
  currencyCode: string;
};

type ShopifyVariant = {
  id: string;
  title: string;
  image: ShopifyImage | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
};

type ShopifyCatalogResponse = {
  shop: {
    name: string;
  };
  products: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
      productType: string;
      tags: string[];
      featuredImage: ShopifyImage | null;
      images: {
        nodes: ShopifyImage[];
      };
      priceRange: {
        minVariantPrice: ShopifyMoney;
      };
      options: Array<{
        id: string;
        name: string;
        values: string[];
      }>;
      variants: {
        nodes: ShopifyVariant[];
      };
    }>;
  };
  collections: {
    nodes: Array<{
      id: string;
      title: string;
      handle: string;
      description: string;
      image: ShopifyImage | null;
      products: {
        nodes: Array<{
          id: string;
          title: string;
          handle: string;
          description: string;
          productType: string;
          tags: string[];
          featuredImage: ShopifyImage | null;
          images: {
            nodes: ShopifyImage[];
          };
          priceRange: {
            minVariantPrice: ShopifyMoney;
          };
          options: Array<{
            id: string;
            name: string;
            values: string[];
          }>;
          variants: {
            nodes: ShopifyVariant[];
          };
        }>;
      };
    }>;
  };
};

const CATALOG_QUERY = `
  query SolmyrkvunCatalog {
    shop {
      name
    }
    products(first: 50, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        productType
        tags
        featuredImage {
          url
          altText
          width
          height
        }
        images(first: 2) {
          nodes {
            url
            altText
            width
            height
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        options {
          id
          name
          values
        }
        variants(first: 100) {
          nodes {
            id
            title
            image {
              url
              altText
              width
              height
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
    collections(first: 20, sortKey: UPDATED_AT, reverse: true) {
      nodes {
        id
        title
        handle
        description
        image {
          url
          altText
          width
          height
        }
        products(first: 50) {
          nodes {
            id
            title
            handle
            description
            productType
            tags
            featuredImage {
              url
              altText
              width
              height
            }
            images(first: 2) {
              nodes {
                url
                altText
                width
                height
              }
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            options {
              id
              name
              values
            }
            variants(first: 100) {
              nodes {
                id
                title
                image {
                  url
                  altText
                  width
                  height
                }
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;

const CACHE_TTL_MS = 5 * 60_000;
let cache:
  | {
      value: ShopifyCatalogResponse;
      expiresAt: number;
    }
  | undefined;

router.get("/sol/catalog", async (req, res): Promise<void> => {
  if (cache && Date.now() < cache.expiresAt) {
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=240");
    res.json({ connected: true, ...cache.value });
    return;
  }

  try {
    const catalog = await shopifyStorefrontRequest<ShopifyCatalogResponse>(CATALOG_QUERY);
    cache = {
      value: catalog,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=240");
    res.json({ connected: true, ...catalog });
  } catch (error) {
    req.log.warn({ error }, "Shopify Storefront catalog unavailable");
    res.status(503).json({
      connected: false,
      products: { nodes: [] },
      collections: { nodes: [] },
      error: "Shopify-vörulistinn er ekki tiltækur í augnablikinu.",
    });
  }
});

export default router;