# Diffuser descent and integrated photography — revision five, 2026-11-01

The hero now follows a release, drop, turn and settle sequence guided by the supplied Bella recording. Sixteen additional reference frames were extracted from 7.4–8.9 seconds, covering the appliance's handoff into the kitchen. Parfumaire's cabinet stays upright and lands on the floor, with its nozzle operating.

## Motion

- One persistent retina canvas crosses the gap between the sky and the room. A continuous Hermite path replaces the single smoothstep used for every transform. Vertical acceleration, lateral movement, depth, three-axis rotation and contact lighting have distinct timing. All stages reverse with scroll.
- The landing moves from 76.5% to 62% of the source photograph's width, reducing the excessive sideways travel. The model recedes as it descends and reaches the floor while the contact point remains in view.
- The airborne and resting orientations share the same final pose. This removes the old pitch change applied on the final frame. Angular velocity reaches zero at contact; no subsequent idle bob moves the feet.
- The key light moves to the photograph's window side, exposure softens and the contact shadow tightens during landing. A more pronounced three-quarter resting angle shows the cabinet's depth.
- The Max keeps the catalog proportions: 38.4 × 22.9 × 46.7 cm. Its links still select the white variant. The site retains all 21 live product models and 1536 × 2048 studio fallbacks.
- Lenis, native touch scrolling, the expanding dropdown, 71/29 panels, pause, reduced-motion and no-JavaScript compositions remain available. There are no room selectors or scene crossfades.

These are presentation meshes with illustrative airflow, not manufacturer CAD or a fluid simulation. The movement is adapted to a floor-standing diffuser, not claimed to be a pixel-identical reconstruction of Bella's hinged kitchen appliance.

## Higgsfield images

The user's screenshot and the authenticated subscription page confirmed seven active unlimited image models, including **Nano Banana Pro at 2K**. The connector's `free_trial.unlim_available: false` only described its trial entitlement; it did not describe those website subscriptions. Higgsfield's standard website generator was used with the included Unlimited mode. Four image generations completed; three were accepted, and one home draft was rejected because the cabinet looked too tall. The before/after balance check confirmed no credit spend for these generations.

The product-photoshoot backend supplied composition prompts, refined for the actual product name, reference proportions and website framing. Product references and stock photographs were uploaded together. The accepted output files are all **2528 × 1696**, delivered as 1280/2528 px WebP alternatives without enlargement.

| Placement                           | Product           | Stock photograph                                                      | Higgsfield job                         |
| ----------------------------------- | ----------------- | --------------------------------------------------------------------- | -------------------------------------- |
| Homepage editorial / scent branding | La Tour           | [Gustavo Galeano Maz / Pexels](https://www.pexels.com/photo/8477454/) | `5fb5c381-a748-4fde-9016-7d44907cf02a` |
| Home scenting                       | White CozyAir Max | [Kampus Production / Pexels](https://www.pexels.com/photo/7556566/)   | `5c15ad0e-d13b-4383-9086-74be7a0eaf7a` |
| Business scenting                   | Black CozyAir Max | [DOAN THANH BINH / Pexels](https://www.pexels.com/photo/36631639/)    | `1fb7c0c1-68eb-41b0-9784-7ab7a493d621` |

The images show illustrative product placements, not customer installations. The original stock files, prompt outputs, generated PNGs and rejected draft are archived locally under `archive/revision-five/`. The delivery manifest is [lifestyle.json](../src/data/lifestyle.json). Existing source catalog photographs are retained.

## Verification

- Build and content checks: 101 pages; internal links, assets, metadata, headings and image dimensions.
- Type check: zero errors or warnings, with the existing Lighthouse-script hint.
- Flight regression checks: continuous angles, identical animated/resting endpoint, zero-velocity contact, monotonic travel, no floor overshoot and exact reversibility.
- Browser checks: 21 products, 59 variants, 93 gallery selections, search, filters, safe preview enquiries and 404 behavior; four responsive widths. The check exposed a marginal contrast issue in the orange banner wordmark, which was darkened and rechecked.
- Motion checks: desktop and phone descent, stable floor placement, the same retina canvas throughout, reverse/fast scrolling, idle airflow, pause/resume, reduced motion, no JavaScript, short touch viewport and 4× CPU throttling.

Results and visual evidence: [motion](qa/revision-five/results.json), [browser](qa/browser-results.json), [descent frames](qa/revision-five/descent-stages.webp), [photography](qa/revision-five/lifestyle-review.webp), [wheel performance](qa/revision-five/scroll-feel.json). Clean scroll recordings are saved locally under `docs/qa/revision-five/showcase/`.

## Published verification

The main update was published as `a2b4785` through a successful [GitHub Pages run](https://github.com/thugnificant/ParfumaireCanada/actions/runs/41346270513). The deployed desktop/phone motion suite passed, including stable floor contact, reverse scrolling, the expanding dropdown and reduced-motion fallbacks. Eight live routes, product variant/enquiry behavior, all homepage images, responsive overflow and 404 behavior passed with no browser errors: [live motion](qa/revision-five/live-results.json), [live routes](qa/deployed-results.json).

A final editorial crop check kept La Tour's entire base in the desktop photograph and moved the phone caption below the image. The phone crop is centered on the diffuser instead of cutting it off at the right edge. Both widths passed accessibility and overflow checks: [editorial checks](qa/revision-five/editorial-check.json), [phone composition](qa/revision-five/editorial-390.webp).
