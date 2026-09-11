# Gardínulausnir on Vercel

The repository-level `vercel.json` contains the build, output, and SPA route
settings for the Gardínulausnir storefront.

## Import

1. Import this GitHub repository into Vercel.
2. Keep the Vercel project root at the repository root.
3. Vercel reads the build settings from `vercel.json`.

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