# Floor-standing Max and continuous scroll — revision four, 2026-11-01

The previous desk placement was wrong for the unit the user described. The hero now uses **white CozyAir Max**, with a 15⅛ × 9 × 18⅜ inch cabinet (38.4 × 22.9 × 46.7 cm) based on the imported Parfumaire catalog. The smaller CozyAir remains a separate product. The Max descends from the sky and stands on the rug beside the sofa. Its links preselect the matching white variant.

## Motion and presentation

- One persistent canvas travels through a continuous, reversible path. It does not switch images at the frame boundary. The room caption fades in after the descending cabinet clears it. The product settles in position, orientation and scale; its floor contact follows the photograph's cover crop on desktop and mobile.
- Lenis 1.3.27 uses 0.1 interpolation, matching the default Lenis setup observed on [Bella](https://bellakitchenware.com/). Touch scroll remains native. No pinned room carousel, setting selector, scene dissolve, delayed image swap or scroll snapping.
- The hero, dropdown, 71/29 split, orange feature panel, cream surface, centered product row and 71/29 editorial pairing follow the supplied Bella recording. Font sizes and weights were checked against its published CSS. The dropdown expands the header and pushes the hero down instead of covering it. Parfumaire branding and product content are retained.
- Typography uses Fontshare's **Supreme**, via its official hosted API, with the existing local DM Sans fallback. This is a licensed free alternative, **not Bella's separate Supreme LL TT font**. No proprietary Bella font or product assets have been copied into the project.
- All 21 products now have live 3D presentation geometry and transparent **1536 × 2048** studio renders. The three diffusers use catalog proportions; the 18 scent bottles use a lathed 120 ml bottle profile, ribbed cap, reflective dark glass and the original Parfumaire mark. Larger fragrance sizes remain available through the original product galleries. These are presentation models, not manufacturer CAD.
- Airflow originates at each diffuser nozzle and continues while the product moves or rests. Bottles and diffusers rotate gently and respond to pointer movement. Airflow is an illustrative animation, not a fluid simulation.
- A shared WebGL renderer draws the visible product views into individual canvases. Scrolling through 21 products cannot create 21 WebGL contexts. Offscreen, hidden-tab and paused animation is idle; context loss returns to sharp image fallbacks.
- Reduced-motion, explicit pause and no-JavaScript modes retain static compositions. Mobile copy sits below the photograph to leave the travel path clear.

The original Higgsfield textures and accepted studio assets remain in use. This turn checked the connected Higgsfield account: **4.25 credits available**, versus **18 credits** quoted for one detailed Tripo image-to-3D generation. No new paid generation was submitted. The new geometry and 2K renderings were generated locally with Three.js. The per-product render manifest is [models.json](../src/data/models.json); regenerate with `scripts/render-product-studios.mjs` against the Astro dev server.

## Photographs

Full-resolution source downloads are under `archive/revision-four/`. WebP derivatives are self-hosted. These stock interiors illustrate placement; they do not depict Parfumaire clients or premises. Photography is credited alongside the images.

| Use              | Photographer / source                                                 | Native resolution | Web delivery        |
| ---------------- | --------------------------------------------------------------------- | ----------------- | ------------------- |
| Sky              | [Brett Sayles / Pexels](https://www.pexels.com/photo/4610805/)        | 5058 × 3372       | 1600 / 3200 px wide |
| Floor landing    | [Kampus Production / Pexels](https://www.pexels.com/photo/7556566/)   | 5616 × 3749       | 1600 / 3200 px wide |
| Editorial lounge | [Gustavo Galeano Maz / Pexels](https://www.pexels.com/photo/8477454/) | 4724 × 3151       | 3200 px wide        |

[Photo licence](https://www.pexels.com/license/). [Fontshare usage](https://www.fontshare.com/about). No images from another diffuser manufacturer were substituted for Parfumaire products.

## Reference and skills

The sole design reference remains the user's original Bella recording, preserved frame by frame under `archive/motion-reference/`, and Bella's live implementation. The new screenshot supplied by the user identified the incorrect desk scale. The four requested skill repositories were already installed and are applied: [taste-skill](https://github.com/leonxlnx/taste-skill), [scroll-world](https://github.com/oso95/scroll-world), [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill), [impeccable](https://github.com/pbakaus/impeccable). The user's requested continuous descent takes precedence over any generic multi-scene flythrough recipe.

The motion plan has one focal event: Max descends and settles on the floor. Continuity comes from the same canvas, geometry and scroll position. Secondary rotation and airflow remain subtle. One shared renderer, visible-only animation and static fallbacks bound the rendering work.

## Verification

- Build: 101 routes, internal links, assets, metadata, JSON-LD, headings and image dimensions pass.
- Type check: zero errors/warnings; one pre-existing Lighthouse script hint.
- Browser regression: 21 products, 59 variants, 93 gallery selections, search, filters, enquiries and 404 behavior pass. Four responsive widths checked. No JavaScript errors, failed requests or accessibility violations across the 14 checked page states.
- Motion: desktop/phone descent, persistent retina canvas, stable floor contact, reverse/fast scrolling, idle airflow, pause/resume, no-JS/reduced-motion and short touch viewport with 4× CPU throttling pass.
- Real wheel input: continuous easing and a return to the same origin. The local 2-second desktop sample contains 121 frames, 16.7 ms median / 16.8 ms p95 callback intervals, no intervals above 50 ms. This is headless Chrome on this Mac, not a physical-device FPS guarantee.
- All 21 live models load and remain available after scrolling through the entire collection; no context-loss warnings. Phone overflow is checked at multiple positions throughout descent.
- White Max deep link selects White, shows USD 599 and retains that variant in the enquiry.
- With WebGL explicitly unavailable, the hero falls back to its 1536 × 2048 image.

Results: [browser](qa/browser-results.json), [motion](qa/revision-four/results.json), [wheel and full catalog](qa/revision-four/scroll-feel.json), [fallback](qa/revision-four/fallback.json).

Clean wheel-scroll showcase recordings are saved under `docs/qa/revision-four/showcase/`. Automated desktop and phone recordings are saved locally as `docs/qa/revision-four/desktop-scroll.webm` and `mobile-scroll.webm`. Review frames and screenshots are in the same directory. The sequence reproduces the reference's downward handoff with Parfumaire geometry and a floor-level placement; it is not a pixel-identical recreation of Bella's bespoke kitchen scene.
