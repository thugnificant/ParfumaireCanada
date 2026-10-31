# QA report — 2026-10-31

## Build and content

- Astro static output: **101 HTML pages**, including every current product, collection, service, utility page and mapped legacy route.
- **21 products / 59 variants / 72 gallery-image associations**, reconciled to the live source snapshot with no missing product gallery assets.
- **154 discovered source URLs**, each marked complete, adapted, archived, retired or inaccessible with a reason.
- **34 Spanish source snapshots** retained, not silently discarded or represented as fabricated Canadian translations.
- Type checking, production build and generated link/asset checks pass. Every generated page has one H1, title, description, an absolute canonical and demo `noindex`. JSON-LD parses and contains no fabricated Offers.
- Real `404.html`; robots permits crawling; demo sitemap contains no indexable URLs.

## Interaction and accessibility

`scripts/browser-qa.mjs` checks mobile navigation, collection search/filter/sort/reset, dedicated search, scent discovery, gallery controls, keyboard-close image dialog, every product/variant price and every gallery image. The exact selected variant and quantity survive into the enquiry.

Preview submission produces **zero POST requests**, clears personal fields and accurately says nothing was sent. `scripts/enquiry-check.mjs` verifies mailto encoding, missing-recipient rejection, endpoint acceptance wording and network/server failure handling with mocks. No real email recipient or server endpoint is configured or exercised. The form’s submit button is disabled until JavaScript has installed its handler, preventing a no-JavaScript fallback from putting personal details in a GET URL.

Screenshots were captured at **1440, 1024, 768 and 390px** in `docs/qa/screenshots/` (local review artifacts, not deployed). Source frames and Mobbin images were visually inspected. Corrections included a mobile hero-height overlap, gallery min-content overflow, and text contrast. Product images remain contained and complete; lifestyle images intentionally crop as editorial imagery.

The completed browser pass reports **0 page errors, 0 failed requests, 0 automated WCAG 2 A/AA, 2.1 AA or 2.2 AA violations** across seven representative routes at desktop and mobile widths. These automated results are not a claim of exhaustive WCAG certification or a screen-reader usability study. Focus styles, skip link, Escape handling, labels, live status, reduced motion and horizontal overflow are covered by implementation/review.

## Mobile Lighthouse lab results

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Home | 98 | 100 | 100 | 69 | 2.48 s | 0 | 0 ms |
| La Tour | 100 | 100 | 100 | 69 | 1.80 s | 0 | 0 ms |

Reports: `docs/qa/lighthouse-*.json`. These are local Chrome/mobile-simulation lab results, not field data or ranking claims. The intentionally unindexable demo lowers Lighthouse’s SEO score. Field INP and 75th-percentile Core Web Vitals are unavailable without sufficient real traffic.

## Source limitations

The shop reports 56 reviews; 22 rendered reviews were preserved. Further review pagination returned 404/no usable response and remains explicitly accounted for. Two malformed cookie links and four legacy staging-image URLs were unavailable. No current manuals or videos were found in the retrieved product records. Source scent-description contradictions and unverified health, purity and numerical performance claims are documented, not strengthened. See `docs/migration/` and `handoff.md`.

## Deployment verification

Repository: https://github.com/thugnificant/ParfumaireCanada

**Live and verified: https://parfumairecanada.sugiweb.com/**. GitHub Actions builds and deployment succeeded. Cloudflare’s DNS-only CNAME resolves to `thugnificant.github.io`. GitHub approved the domain certificate (expiry 2027-01-29), and HTTPS enforcement is enabled. HTTP and the default GitHub Pages address return 301 redirects to the HTTPS custom hostname.

The deployed HTTPS browser check passed on desktop and mobile: home, collections, product deep links, services, contact and finder return 200; all homepage images load; variant selection carries into the enquiry; unknown routes return an actual 404; the form is safely disabled without JavaScript. There were no browser errors. Deployed screenshots and `docs/qa/deployed-results.json` record the evidence. Certificate provisioning required GitHub’s documented remove/re-add-domain restart; it completed successfully.

Account-level Pages domain verification is a separate recommended protection. The browser access host was unavailable when the settings page was requested; no verification challenge was available through the connected tools. The custom hostname itself is assigned to this Pages repository. See `docs/deployment.json` for the final observed deployment state.
