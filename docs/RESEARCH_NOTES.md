# Research supporting the Codex prompt

Prepared October 31, 2026. This is a prompt-writing preflight, not a completed website migration or SEO audit.

## Confirmed project decisions

The user confirmed that their GitHub Pages account is for a client demo. The demo hostname is `parfumairecanada.sugiweb.com`, with DNS managed through their Cloudflare account. Permanent hosting, the client's GitHub account, the GoDaddy-managed domain, Canadian contact information, and the eventual Shopify move are later decisions. No repository, deployment, DNS, email recipient, or live site was changed during this research.

## Source content findings

The public [shop product endpoint](https://shop.parfumaire.com/products.json?limit=250) returned 21 products; a second page was empty. There were 59 variant records and 72 image references, not necessarily 72 unique files. The shop's product sitemap also listed those 21 product routes plus the homepage. These counts exclude assets and pages outside that product endpoint. The exact preflight summary is in `reference/source-preflight.json`.

The [shop homepage](https://shop.parfumaire.com/) declares `Shopify.currency` as USD, corroborated by its payment configuration. Canadian display prices must not be inferred from the dollar symbol or the proposed site's name.

The shop's sitemaps expose product and collection pages, About and Contact, policy pages, old sitemap-generator pages, a subscription-management page, a news index, and Spanish sitemap variants. The `Bois Tibet` product uses the source handle `boix-tibet`, so automatic spelling normalization would change its URL. Public sitemaps alone do not prove complete discovery.

The linked [business website](https://www.parfumaire.com/) has separate service content, including business scenting, scent branding, odor elimination, custom fragrances, and fragrance finder. It also displays US contact information. The Canadian website needs supplied Canadian details, rather than inherited US contact data. Its `/sitemap_index.xml` returned 404 in preflight; a later crawler should use navigation, robots declarations, and other legitimate discovery methods.

## Visual evidence

The 30.4-second recording is 1852 × 1274 pixels. Frames were extracted at 0, 4, 8, 11, 12, 13, 14, 16, 20, 22, 24, 26, and 29 seconds. They show **bella kitchenware**.

The inspected [Mobbin hero](https://mobbin.com/sites/sections/1a1af3a8-4165-4918-a511-71e3745b0886) matches the recording. Its main structure is a cream canvas, white rounded navigation, roughly 72:28 hero panels, large imagery and brand lettering, and a pill CTA. [The alternate hero state](https://mobbin.com/sites/sections/3270520a-f028-4fee-8af2-fafe90e7dd46) confirms changing product imagery. The dark surround in the recording is outside the website viewport.

The recording also establishes a broad lifestyle panel, four unboxed product columns, a large editorial panel beside two smaller panels, open testimonial columns, and a wide banner above the footer. The [catalog header](https://mobbin.com/sites/sections/baadd923-6b1f-4a12-9637-19612e1c36d3), [editorial cards](https://mobbin.com/sites/sections/ba861a37-aed8-4324-8724-74b09bb15f68), and [footer](https://mobbin.com/sites/sections/646c059f-1aab-4d53-ad35-32f56dee854f) provide additional inspected evidence. Editorial cards are not evidence of the product listing layout; frames 13–14 are the product-row reference.

Mobbin's web-screen search for bella product details returned unrelated products. Those results were excluded. No bella product-detail or mobile screen is claimed as verified. Those templates will require a considered extension of the observed design system.

High-resolution reference images were downloaded from the returned Mobbin image URLs. Their local filenames and canonical citation links are recorded in `reference/mobbin-references.json`. These are design references, not production website assets.

## SEO priorities and evidence

These are implementation recommendations based on the project and the documentation, not guarantees of higher rankings.

| Priority | Recommendation | Evidence |
| --- | --- | --- |
| Before public indexing | Build complete, useful pages with clear titles, headings, links, and real product detail. Preserve factual source information and add verified Canadian context. | [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| During client review | Apply `noindex`; allow crawlers to read it. A robots disallow alone does not reliably prevent indexing, and noindex is not privacy protection. | [Google indexing controls](https://developers.google.com/search/docs/crawling-indexing/block-indexing) |
| URL consistency | Generate canonical URLs from the chosen public hostname and prevent parameter/default-host duplicates. Copying source content does not itself create a spam violation, but differentiation and correct URL signals still matter. | [Google canonicalization](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) |
| Product discovery | Use descriptive alt text, appropriate image context, crawlable image URLs, and responsive assets. | [Google image guidance](https://developers.google.com/search/docs/appearance/google-images) |
| Product schema | Do not invent offers or ratings. Product snippet eligibility requires qualifying offers or review data; merchant listings require purchasable pages. An enquiry-only catalog cannot assume all shopping enhancements. | [Product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) |
| Current search features | Google retired FAQ rich results starting May 7, 2026. Its June update also states that `llms.txt` does not affect Google Search visibility or rankings. Visible FAQs can still serve customers. | [Google documentation updates](https://developers.google.com/search/updates) |
| Performance | Aim for LCP ≤2.5 s, INP ≤200 ms, and CLS ≤0.1 at the 75th percentile, segmented by device. Lab testing does not establish actual field results. | [Web Vitals](https://web.dev/articles/vitals) |
| Canadian presence | Once genuine details exist, keep business information complete and accurate; pursue an eligible Business Profile and authentic reviews/citations. Local ranking involves relevance, distance, and prominence. | [Google local ranking guidance](https://support.google.com/business/answer/7091) |
| Languages and regions | Publish real language versions before adding reciprocal hreflang. A new Canada site cannot set the original site's annotations without access. | [Google localized pages](https://developers.google.com/search/docs/specialty/international/localized-versions) |
| Future cutover | Map URLs, apply permanent redirects on domains actually being migrated, monitor indexing, and retain redirects generally for at least a year. | [Google site migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes) |

Search samples showed Canadian-facing category vocabulary such as waterless diffusers and compatible fragrance oils on [Homedics Canada](https://www.homedics.com/en-ca/collections/waterless-diffusers) and [OC Beauty](https://www.oc-beauty.ca/collections/fragrance-oil). These observations help form keyword hypotheses; they establish no search-volume or keyword-difficulty numbers. Parfumaire's own services support investigating scent marketing, business scenting, custom fragrances, and scent branding as separate intents. Canadian commercial SERP coverage was limited in this preflight, so the implementation prompt asks for deeper validation before selecting final targets.

## Hosting and portability evidence

[GitHub's Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) restrict using Pages to run an online business or a site primarily facilitating commercial transactions. After this was raised, the user clarified the immediate deployment is a demo for client review and explicitly retained their GitHub Pages choice. The prompt follows that choice and leaves permanent business hosting for the later handoff.

[GitHub's custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) support setting the Pages domain before DNS and pointing a subdomain CNAME to the account's `github.io` hostname. Actual owner and zone settings must be inspected during implementation; no target account was guessed here.

If production hosting later changes, [Cloudflare's Astro guide](https://developers.cloudflare.com/pages/framework-guides/deploy-an-astro-site/) documents static Astro deployment. [Cloudflare's custom-domain guide](https://developers.cloudflare.com/pages/configuration/custom-domains/) distinguishes external-DNS subdomains from apex domains that require a Cloudflare zone. Cloudflare Pages is an evaluated alternative, not the selected demo host.

For Shopify portability, use the [current product CSV documentation](https://help.shopify.com/en/manual/products/import-export/using-csv), preserving variants and images and checking supported column names at export time. A static website's catalog can be exported; its front end is not automatically a Shopify theme.
