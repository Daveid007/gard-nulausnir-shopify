type ShopifyGraphqlResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export class ShopifyCheckoutError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    readonly code: string,
    readonly userMessage: string,
  ) {
    super(message);
    this.name = "ShopifyCheckoutError";
  }
}

function connectorEnvironment(): { baseUrl: string; token: string } {
  const hostname = process.env["REPLIT_CONNECTORS_HOSTNAME"];
  const token = process.env["REPL_IDENTITY"]
    ? `repl ${process.env["REPL_IDENTITY"]}`
    : process.env["WEB_REPL_RENEWAL"]
      ? `depl ${process.env["WEB_REPL_RENEWAL"]}`
      : null;

  if (!hostname || !token) {
    throw new ShopifyCheckoutError(
      "Missing Replit connector environment",
      503,
      "SHOPIFY_UNAVAILABLE",
      "Shopify-tenging er ekki tiltæk eins og er. Reyndu aftur síðar.",
    );
  }

  const protocol = hostname.startsWith("localhost") ? "http" : "https";
  return { baseUrl: `${protocol}://${hostname}`, token };
}

async function shopifyAdminRequest<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const { baseUrl, token } = connectorEnvironment();
  const response = await fetch(`${baseUrl}/api/v2/proxy/admin/api/2026-04/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Replit-Token": token,
      "Connector-Name": "shopify-store",
    },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(30_000),
  });

  const text = await response.text();
  let payload: ShopifyGraphqlResponse<T>;
  try {
    payload = JSON.parse(text) as ShopifyGraphqlResponse<T>;
  } catch {
    throw new ShopifyCheckoutError(
      `Shopify returned a non-JSON response (${response.status})`,
      502,
      "SHOPIFY_INVALID_RESPONSE",
      "Shopify svaraði ekki rétt. Reyndu aftur eftir augnablik.",
    );
  }

  if (!response.ok || payload.errors?.length || !payload.data) {
    const details = payload.errors?.map((error) => error.message).join("; ") || text.slice(0, 500);
    throw new ShopifyCheckoutError(
      `Shopify Admin API request failed (${response.status}): ${details}`,
      502,
      "SHOPIFY_REQUEST_FAILED",
      "Ekki tókst að tengjast greiðslusíðu Shopify. Reyndu aftur.",
    );
  }

  return payload.data;
}

export type ShopifyDraftOrderLine = {
  productHandle: string | null;
  title: string;
  quantity: number;
  unitPriceIsk: number;
  requiresShipping: boolean;
  attributes: Array<{ key: string; value: string }>;
};

type CatalogResponse = {
  shop: { currencyCode: string };
  products: {
    nodes: Array<{
      handle: string;
      status: string;
      variants: { nodes: Array<{ id: string }> };
    }>;
  };
};

type DraftOrderCreateResponse = {
  draftOrderCreate: {
    draftOrder: {
      id: string;
      name: string;
      invoiceUrl: string | null;
      status: string;
      currencyCode: string;
    } | null;
    userErrors: Array<{ field: string[] | null; message: string }>;
  };
};

export async function createShopifyDraftOrder(
  lines: ShopifyDraftOrderLine[],
): Promise<{ id: string; name: string; url: string }> {
  const catalog = await shopifyAdminRequest<CatalogResponse>(
    `query CheckoutCatalog {
      shop { currencyCode }
      products(first: 100, query: "tag:solmyrkvun-migration") {
        nodes {
          handle
          status
          variants(first: 1) { nodes { id } }
        }
      }
    }`,
  );

  if (catalog.shop.currencyCode !== "ISK") {
    throw new ShopifyCheckoutError(
      `Shopify store currency is ${catalog.shop.currencyCode}, expected ISK`,
      409,
      "SHOPIFY_CURRENCY_NOT_ISK",
      "Shopify-verslunin er ekki enn stillt á íslenskar krónur (ISK). Greiðsla er lokuð þar til gjaldmiðillinn hefur verið leiðréttur.",
    );
  }

  const productsByHandle = new Map(catalog.products.nodes.map((product) => [product.handle, product]));
  const lineItems = lines.map((line) => {
    const price = { amount: String(line.unitPriceIsk), currencyCode: "ISK" };
    if (!line.productHandle) {
      return {
        title: line.title,
        quantity: line.quantity,
        originalUnitPriceWithCurrency: price,
        customAttributes: line.attributes,
        requiresShipping: line.requiresShipping,
        taxable: true,
      };
    }

    const product = productsByHandle.get(line.productHandle);
    const variantId = product?.variants.nodes[0]?.id;
    if (!product || !variantId) {
      throw new ShopifyCheckoutError(
        `Missing Shopify product/variant for ${line.productHandle}`,
        503,
        "SHOPIFY_PRODUCT_MISSING",
        "Ein eða fleiri vörur eru ekki tilbúnar í Shopify. Hafðu samband áður en gengið er frá pöntun.",
      );
    }

    return {
      variantId,
      quantity: line.quantity,
      priceOverride: price,
      customAttributes: line.attributes,
      requiresShipping: line.requiresShipping,
      taxable: true,
    };
  });

  const data = await shopifyAdminRequest<DraftOrderCreateResponse>(
    `mutation CreateCalculatorDraftOrder($input: DraftOrderInput!) {
      draftOrderCreate(input: $input) {
        draftOrder { id name invoiceUrl status currencyCode }
        userErrors { field message }
      }
    }`,
    {
      input: {
        lineItems,
        customAttributes: [
          { key: "Uppruni", value: "Sólmyrkvun reiknivél" },
        ],
        metafields: [
          {
            namespace: "solmyrkvun",
            key: "checkout_source",
            type: "single_line_text_field",
            value: "replit-calculator",
          },
        ],
        note: "Sérsmíðuð pöntun frá Sólmyrkvun reiknivél. Verð og stillingar voru staðfest á bakenda.",
        tags: ["solmyrkvun-calculator", "made-to-measure"],
      },
    },
  );

  const result = data.draftOrderCreate;
  if (result.userErrors.length) {
    throw new ShopifyCheckoutError(
      result.userErrors.map((error) => `${error.field?.join(".") || "input"}: ${error.message}`).join("; "),
      422,
      "SHOPIFY_DRAFT_ORDER_REJECTED",
      "Shopify gat ekki búið til pöntunina. Farðu yfir körfuna og reyndu aftur.",
    );
  }

  if (!result.draftOrder?.invoiceUrl || result.draftOrder.currencyCode !== "ISK") {
    throw new ShopifyCheckoutError(
      "Shopify draft order was created without a valid ISK invoice URL",
      502,
      "SHOPIFY_CHECKOUT_URL_MISSING",
      "Pöntunin var búin til en greiðslulinkur fékkst ekki. Hafðu samband áður en reynt er aftur.",
    );
  }

  return {
    id: result.draftOrder.id,
    name: result.draftOrder.name,
    url: result.draftOrder.invoiceUrl,
  };
}