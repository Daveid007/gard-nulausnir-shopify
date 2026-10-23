# Gardínulausnir on Vercel

The repository-level `vercel.json` contains the build, output, and SPA route
settings for the Gardínulausnir storefront.

## Import

1. Import this GitHub repository into Vercel.
2. Keep the Vercel project root at the repository root.
3. Vercel reads the build settings from `vercel.json`.

## Automatic price release checks

Use Node 22.22.0 (see `.node-version`); the root `engines.node` setting selects
Node 22 on Vercel. Tests import TypeScript with `--experimental-strip-types`.

The existing Vercel build command runs the storefront's `build` script, which
first runs `test:release`. It stops immediately on either failure, before Vite
can generate a release:

```sh
pnpm --filter @workspace/gardinulausnir run test:release
```

This runs `test:retail` (25% retail uplift, supplier baselines, quantities,
Honeycomb, all 338 workbook fabrics and WINdoûr) followed by `test:catalog`
(uplifted Shopify display prices and unchanged inquiry-only prices).
Existing calculator, color and browser test commands remain unchanged.

The Honeycomb KT401 45 mm supplier baseline is 12.82 USD, as confirmed by the
later REV 4 import and `test-supplier-rev4.mjs`, not the original 12.50 USD.
The retail test checks that baseline without changing product or pricing data.

## Shopify API

The storefront is static on Vercel. Shopify catalog and Draft Order checkout
must remain on the separately published API server so Shopify credentials never
reach the browser.

After the API server has a stable public production URL, add this Vercel
environment variable:

```text
VITE_API_ORIGIN=https://your-api-production-domain
```

Do not add Shopify Admin credentials as `VITE_*` variables. Every `VITE_*`
variable is public in the browser bundle.

## Verify

After deployment, verify:

- `/`
- `/collection`
- `/products/square-cassette`
- the live catalog request to `/api/sol/catalog` through `VITE_API_ORIGIN`
- Shopify checkout redirect after the API deployment is connected