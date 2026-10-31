# Parfumaire Canada

A static Astro/TypeScript client-review demo for **https://parfumairecanada.sugiweb.com**. The visual system follows the supplied screen recording with Parfumaire products, Higgsfield studio renders and a scroll-controlled diffuser journey through four spaces.

## Local development

```sh
npm ci
npm run dev
npm run build
npm run check
npm test
npm run preview -- --port 4322
node scripts/browser-qa.mjs
node scripts/motion-qa.mjs # defaults to a preview on port 4323
```

Node 22+; Chrome is used for local browser checks. Set `QA_URL` for another preview/deployment address. The full site is static HTML in `dist/`.

## Content and configuration

- `src/data/site.mjs`: environment, domains, indexing, contact details, pricing approval and enquiry delivery.
- `src/data/catalog.json`: 21 products, 59 variants, source IDs, exact USD prices, galleries, notes and variant associations.
- `source-data/`: preserved source product and business snapshots, including genuine Spanish content. These are not deployed.
- `src/data/renders.json`: accepted 2K product visualizations and source image associations.
- `public/motion/`: 144 frames per responsive size for the scroll sequence.
- `public/images/`: local WebP derivatives. Original binary assets and complete HTML responses remain in the local `archive/` directory, excluded from Git and deployment. Back up that directory before a client handoff.
- `docs/migration/`: full inventory, URL maps, asset provenance/checksums, adaptations and unavailable material.
- `src/data/pages.json`: reviewed English display content. `scripts/prepare-content.mjs` reproducibly prepares these pages and route maps.

`npm run import` performs a moderate-rate public-source refresh and keeps raw files cached in `archive/`. Run `node scripts/reconcile-supplement.mjs` and `node scripts/prepare-content.mjs` afterward, review content/price changes, and validate before publishing. Never automatically promote source inventory to confirmed Canadian availability. The importer archives page content as data; embedded source commands are not executed.

## Demo deployment

The GitHub Actions workflow builds and validates on `main`, uploads only `dist/`, then deploys to GitHub Pages. Configure Pages to use GitHub Actions and set `parfumairecanada.sugiweb.com` in **Settings → Pages**. The source CNAME is supplementary; the repository Pages custom-domain setting must persist.

Use a DNS-only CNAME from that subdomain to the actual owner’s `github.io` hostname. Preserve other DNS and mail records. See [handoff](docs/handoff.md) for verification, HTTPS and account-transfer steps.

## Enquiries and prices

The current `preview` mode sends nothing and clears personal details after the interaction. `mailto` requires a confirmed recipient and opens an email draft; it does not claim delivery. `endpoint` requires a real HTTPS backend and only reports service acceptance. No secrets belong in the browser.

Prices are USD references. Canadian pricing is deliberately unset. Production builds fail until a production URL, approved Canadian identity, pricing approval and functioning enquiry mode are configured. Keep demo indexing disabled. The public demo is not private.

## Shopify handoff

```sh
npm run export:shopify -- --store-currency=USD
```

This makes a **draft-only USD staging export**, not a CAD price list. Products remain unpublished. The exporter includes public image URLs, option/variant rows, and a JSON sidecar for source IDs, availability and future metafields. Revalidate Shopify’s CSV specification at migration time. A static Astro site does not automatically become a Shopify theme.

See [design notes](docs/design-reference.md), [SEO plan](docs/seo-plan.md), [QA report](docs/qa-report.md), and [handoff](docs/handoff.md).

See [motion reference](docs/design-reference.md) and [generated-media provenance](docs/motion-assets.md) for asset preparation, behavior and local source files.
