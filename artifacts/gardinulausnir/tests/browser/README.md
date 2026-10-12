# Roller workbook browser regressions

These Playwright tests render the **production components**, real workbook
catalog, swatch resolver, stylesheet, layout and cart provider in a test-only
Vite entry. They do not mount the storefront's Shopify client, change product
data, submit orders or press an add-to-cart button. Network guards reject
commerce/backend requests and writes; every calculator test asserts an empty
cart. The tiny replacement PNG is a test fixture, never a supplier photo.

## Run from the repository root

Use Node 22 and pnpm 10:

```sh
pnpm --filter @workspace/gardinulausnir... install --frozen-lockfile
pnpm --dir artifacts/gardinulausnir/tests/browser install --ignore-workspace --frozen-lockfile
pnpm --dir artifacts/gardinulausnir/tests/browser exec playwright install chromium
pnpm --filter @workspace/gardinulausnir run test:roller-colors
pnpm --filter @workspace/gardinulausnir run test:roller-colors:browser
```

On Linux CI, use `playwright install --with-deps chromium`. For an existing
system Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to its executable.
Port 4179 must be free; Playwright starts and stops the isolated server itself.
No production URL, credentials or running storefront is required.

The test runner has its own small lockfile so adding browser tooling does not
re-resolve unrelated legacy workspace packages or alter the storefront build.
The harness is outside `src/` and is not included in the production entry.

## Coverage

Each case runs at 1440×1000 desktop and 390×844 touch-enabled phone sizes:

- All 139 roller, 168 zebra, 22 sheer and 9 butterfly supplier codes render as
  enabled cards; a real no-photo card and another card can be selected.
- A selected non-default fabric survives both a search matching another code
  and a search with no results. The select and visible summary retain it;
  clearing the search restores the pressed card.
- An intercepted real swatch URL fails in the browser; the card and its
  placeholder remain visible and clickable, with all 139 options intact.
- Updating the image prop on the same mounted swatch after a failed request
  loads a new URL with positive natural width and keeps selection.

Failures exit non-zero and retain traces/screenshots under
`generated-artifacts/roller-browser/` (excluded from Git and deployment).
The existing source/asset checks remain complementary, not replaced.

## Optional GitHub Actions integration

`github-actions.example.yml` is a ready-to-copy workflow. It is **not active**:
the connected GitHub account can write repository contents but cannot update
`.github/workflows`. With a login that has workflow-write permission, copy it
to `.github/workflows/roller-colors-browser.yml` to run the source and browser
checks on pull requests and main-branch pushes.
