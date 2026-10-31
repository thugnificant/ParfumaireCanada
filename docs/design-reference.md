# Design reference — 2026-10-31

Primary evidence: supplied recording frames 00, 11, 13–14, 16–20, 22–24 and 26. The dark player surround is excluded. The page scrolls normally.

Mobbin’s [matching hero](https://mobbin.com/sites/sections/1a1af3a8-4165-4918-a511-71e3745b0886) and [alternate state](https://mobbin.com/sites/sections/3270520a-f028-4fee-8af2-fafe90e7dd46) were inspected through the plugin. Supporting [catalog](https://mobbin.com/sites/sections/baadd923-6b1f-4a12-9637-19612e1c36d3), [editorial](https://mobbin.com/sites/sections/ba861a37-aed8-4324-8724-74b09bb15f68) and [footer](https://mobbin.com/sites/sections/646c059f-1aab-4d53-ad35-32f56dee854f) captures are retained in `docs/reference/`.

The implementation preserves an inset white rounded sticky navigation, cream canvas, 72:28 hero split, generous gutters, lower-left oversized wordmark, narrow product feature, lifestyle section, four open product columns, large editorial panel with two stacked panels, open four-column testimonials, wide enquiry banner and compact footer.

The original’s saturated sky blue/red hero becomes authentic domestic photography beside muted terracotta. This is a deliberate brand adaptation; the geometry and warm/cool panel relationships remain. Blue and sand are retained in editorial panels. The product is never recoloured, stretched or synthesized. Contained product photography is used on cream; white image backgrounds visually blend using CSS multiply. Lifestyle photos use cover.

DM Sans is locally hosted under the SIL Open Font License in `font-license.txt`. The longer Parfumaire wordmark has explicit viewport-dependent sizing. Motion is limited to a short hero settle and subtle image/button hover movement, with reduced-motion overrides.

Mobile layouts, product detail, gallery, finder and enquiry templates are inferred from this system; the recording does not establish them. Mobile stacks the hero and uses two product columns. At 390px, the first visual pass found a maximum-height overlap between hero and lifestyle; the mobile max-height was removed. Full-page screenshots load all lazy imagery before capture.

Testimonials retain attribution to the original shop; they are not represented as Canadian customer reviews. No bella branding, appliance assets, press logos or claims are published.
