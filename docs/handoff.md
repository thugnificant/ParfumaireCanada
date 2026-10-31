# Demo and client handoff

## Current configuration

The demo hostname is `parfumairecanada.sugiweb.com`. The authenticated GitHub owner is `thugnificant`. Hosting is a GitHub Actions-built Pages artifact. Cloudflare is authoritative for `sugiweb.com`; the demo requires only a DNS-only CNAME to `thugnificant.github.io`. The Pages custom domain is configured in repository settings before DNS is pointed at it. `public/CNAME` is supplementary and must not be mistaken for the persistent Pages setting.

GitHub’s [custom-domain instructions](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site) recommend account-level verification and require correct custom-domain configuration. Verify certificate issuance and enable HTTPS enforcement. Verify the default GitHub URL redirects to the configured hostname, product deep links work, local assets load and unknown paths return an actual 404.

The Sugiweb zone was inspected before changes: no existing record for the requested hostname. Other DNS records, including email, must remain unchanged.

## Inputs still required for a real Canadian launch

- Approved business identity, Canadian address, telephone display/E.164 values, email and quote recipient.
- Confirmed Canadian pricing, availability, fulfilment/service scope, business hours and approved policies.
- Client GitHub account, production domain and permanent hosting decision.
- Evidence resolving scent-note/narrative contradictions, health/purity/performance claims, current instructions, coverage and model specifications.
- A real enquiry endpoint if email-draft delivery is insufficient. No browser credentials or automatic newsletter enrolment.

All these settings are centralized in `src/data/site.mjs`. Unknown values remain null. `scripts/validate.mjs` blocks production mode with missing identity, pricing approval or preview-only enquiries. Before accepting real enquiries, also review the Canadian privacy policy and retention/access rules for the chosen service.

## Content completeness and limitations

21 current shop products, 59 variants and 72 image associations are reconciled. The asset library deduplicates binary files by SHA-256 while retaining product/variant/source associations. 154 discovered public URLs are explained in `docs/migration/source-to-canada.json`.

The 34 discovered Spanish snapshots are preserved in `source-data/translations.json`; no French is fabricated. The English demo does not pretend that these are approved Canadian translations. Genuine source content and older pages remain in `source-data/`, with full HTML and original media in the local `archive/` (approximately 55 MB, not deployed). Back up this folder and transfer it securely with the repository; it is excluded from Git to keep the build source compact.

The source reports 56 reviews in total. 22 rendered reviews were preserved. Additional app-pagination pages could not be retrieved: the public endpoint returned 404 and a browser pagination attempt produced no response. `docs/migration/review-pagination.json` records the affected products and expected page counts. The homepage shows attributed excerpts only from actual retrieved reviews, never invented Canadian reviews. The remaining 34 require a source export or a functioning public review endpoint.

Two malformed cookie-policy links and four legacy staging-image URLs returned errors; all are recorded in `unavailable.json`. No product gallery images are missing. No product manuals/PDFs or video assets were found in the retrieved product records; do not invent them. Old Sensorie products, empty author archives, obsolete sitemap-generator pages, cart/account/subscription and old thank-you flows are explicitly consolidated, archived or retired. Standalone service posts contained lorem ipsum; substantive service content came from the main business-scenting page. Original US commerce/legal promises are archived, not Canadian policy.

## Repository and DNS transfer

Transfer the repository to the supplied client account, update access/branch protection and verify Actions permissions and the `github-pages` environment. No deployment secret is required for the built-in Pages token. Repository transfer does not automatically migrate every hosting or domain dependency. Recheck Pages and the custom domain; if the owner changes and Pages remains the host, update the DNS target to the new owner’s `github.io` hostname.

The client’s future domain is registered with GoDaddy, but registration does not establish the authoritative DNS provider. Inspect nameservers before changing records. Keep registrar, DNS, hosting, repository ownership and email separate. Preserve MX, SPF, DKIM and DMARC. Do not transfer the Sugiweb zone to the client.

GitHub Pages is intentionally used for this client demo. Its [usage limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) restrict hosting an online business or a site primarily facilitating commercial transactions. Review appropriate permanent hosting before enabling real business operations. This does not change the requested demo host.

## URL and SEO cutover

There are two separate maps: original Parfumaire URLs → Canadian routes, and demo routes → future production routes. The US source domains remain outside this project’s control. Do not redirect them without authorization.

Change the production origin in the central config, regenerate metadata and sitemap, update contact/delivery settings and re-run checks. Enable indexing only for the approved production deployment. Keep the demo noindex. When moving a domain actually owned by the client, implement path-preserving HTTP 301s in the new host/edge layer and retain them for at least a year where practical. Pages cannot provide arbitrary HTTP redirect rules. The legacy navigation pages here are honest 200 HTML links with destination canonicals, not a substitute for real migration redirects.

## Shopify phase

The exporter uses Shopify’s [CSV specification](https://help.shopify.com/en/manual/products/import-export/using-csv), checked 2026-10-31. All proposed products are draft and unpublished. It requires `--store-currency=USD` because the source prices must not silently become CAD. Approve a separate Canadian price list before importing into a CAD store.

Columns map title, URL handle, description, vendor/type/tags, options, SKU, price/compare-at, weight/shipping, image URL/position/alt, variant image and SEO fields. `exports/shopify-source-metafields.json` preserves source IDs, source availability, currency and notes for later defined metafields. Shopify variant metafields are not supported by product CSV and need an API/bulk-editor follow-up. Missing source SKUs remain blank rather than being invented.

CSV image paths must be publicly reachable HTTPS URLs. The current draft export uses demo WebP URLs; upload archived originals to Shopify Files or a staging asset host for the final migration and regenerate URLs. Recheck CSV columns at import time and validate a draft subset first. Do not publish products for sale automatically.

Astro’s content/data can migrate; its presentation is not automatically a Shopify theme. Theme/storefront development, purchase flows, redirects and domain cutover are later work.
