# SEO plan — researched 2026-10-31

This is a client preview. Every HTML page emits `noindex,follow`; robots permits crawling so the directive can be read. The demo sitemap contains no indexable entries and is not submitted to Search Console. [Google noindex documentation](https://developers.google.com/search/docs/crawling-indexing/block-indexing) distinguishes crawling from indexing.

## Search intent

Canadian-facing results include [ApeLite](https://apelite.ca/) using “waterless scent diffusers”, [OC Beauty](https://www.oc-beauty.ca/collections/fragrance-oil) distinguishing fragrance oils for waterless diffusers, and [Scent World Canada](https://www.scentworld.ca/) using scent marketing for hospitality and business. These are vocabulary observations, not keyword-volume, difficulty or ranking evidence. No forecasts are made.

| Route | Distinct intent |
|---|---|
| `/collections/scent-diffusers/` | Compare scent diffusers by physical size and capacity; discuss waterless diffusion only where verified for the model |
| `/collections/scents/` | Fragrance oils, scent notes and compatible bottle sizes |
| `/business-scenting/` | Commercial scenting consultation |
| `/scent-branding/` | Express a brand identity through fragrance |
| `/custom-fragrances/` | Develop a custom signature scent |
| `/odor-elimination/` | Discuss unwanted odours and suitability; no unverified elimination claims |
| `/home-scenting/` | Explore fragrance for domestic spaces |
| Product pages | Exact product name, scent notes, capacity, variant and enquiry |

## Implementation

Actual static HTML and crawlable links expose all products. Titles/descriptions are page-specific, with one main heading, breadcrumbs, descriptive links and structured headings. Descriptive local WebP images have dimensions; main imagery is prioritized and lower images lazy-loaded. Search/filter states do not create duplicate routes. Legacy paths provide real HTML navigation pages with the destination canonical; they are not presented as 301 redirects.

JSON-LD uses Organization, Product and BreadcrumbList with real visible facts. There are no Offers, fake stock/rating values, US business addresses or LocalBusiness markup. [Google product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet) require qualifying offers or reviews/ratings for eligibility; basic Product data does not establish a rich result. [Merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing) require purchase eligibility that this enquiry demo does not provide.

The source includes Spanish pages. Genuine translations are retained in the source snapshot but not published as an invented Canadian Spanish equivalent. No hreflang is emitted. French content is not fabricated. Follow [Google localized-page guidance](https://developers.google.com/search/docs/specialty/international/localized-versions) when equivalent approved translations are actually published.

Visible FAQs serve users. Google’s [documentation updates](https://developers.google.com/search/updates?hl=en) report the retirement of FAQ rich results in 2026. No FAQ enhancement, meta-keyword benefit, llms.txt ranking benefit or guaranteed ranking is promised.

## Performance and release

Target field thresholds are LCP ≤2.5s, INP ≤200ms and CLS ≤0.1 at the 75th percentile, following [Web Vitals guidance](https://web.dev/articles/vitals). Lighthouse is a lab check, not field compliance. Actual reports and limitations are in `qa-report.md`; there is no sufficient real-user data yet.

Before production: confirm Canadian identity/contact and pricing, choose eligible permanent hosting, enable working enquiries, set the one production origin, deliberately enable indexing, generate a sitemap containing only canonical indexable 200 pages, verify Search Console, submit it and monitor indexing. Configure an accurate Google Business Profile only if eligible. Develop genuine citations and links rather than city doorway pages or invented case studies. Configure enquiry analytics only with a real analytics destination, excluding names, emails, phones and messages.

When an owned domain actually moves, apply path-preserving HTTP 301 redirects at the hosting/edge layer, avoid chains and retain redirects for at least a year where possible. [Google site-move guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes). This demo neither controls nor redirects the US source sites.
