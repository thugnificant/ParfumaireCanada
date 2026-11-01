# Downward scroll handoff — revision three, 2026-11-01

The current homepage follows the original Bella recording's **normal page scroll**: a single product leaves the sky panel, crosses the gap between sections, and settles onto the surface in the photograph below. The previous pinned five-room treatment misread that reference and has been removed, along with its scene buttons, chapter changes and room assets.

## What changed

- One persistent, retina WebGL CozyAir canvas travels down a continuous, reversible path. Its orientation and scale settle as its feet reach the photographed desk. Scroll does not replace the canvas or resize its drawing buffer.
- The desk and sky are independent, high-resolution photographs. They scroll with the document. There are no video seeks, room dissolves, horizontal wipes or multi-screen pinned spacer.
- Nozzle-anchored mist remains animated at rest, in transit and after landing. Its lighting adjusts for the brighter room. The existing CozyAir Max and La Tour presentation models remain live in the product cards.
- Mobile landing text sits below the photograph, keeping the product's path clear. Tablet product size is limited by available width. The five-icon Explore dropdown and existing product routes remain intact.
- Reduced-motion and no-JavaScript modes show static product compositions. Pause stops continuous motion; Play can explicitly enable it. Product images remain available if WebGL cannot initialize.

The three diffuser models are textured presentation geometry based on the accepted Higgsfield product renders, not manufacturer CAD or a claim of physically simulated aerosol. All original product photographs remain in the product galleries. No additional Higgsfield credits were spent for this correction.

## Photo sources

Full-resolution originals are saved locally under `archive/revision-three/stock/`. Responsive WebP files are self-hosted; none are hotlinked. Credits appear alongside the photographs on the page. These are illustrative stock interiors, not claims about Parfumaire premises or customers.

| Image | Photographer and source | Native resolution | Delivered resolution | Licence |
| --- | --- | --- | --- | --- |
| Sky | [ITT CU](https://unsplash.com/photos/Ir1-0Dvpn8A) | 2974 × 4461 | 1600 / 2974 px wide | [Unsplash](https://unsplash.com/license) |
| Desk landing | [Minh Pham](https://unsplash.com/photos/IisDPFNUS4k) | 6000 × 4000 | 1600 / 3000 px wide | [Unsplash](https://unsplash.com/license) |
| Editorial interior | [Alex Tyson](https://www.pexels.com/photo/19966784/) | 5999 × 4000 | 1600 / 3000 px wide | [Pexels](https://www.pexels.com/license/) |

## Reference and installed skills

The new feedback recording is preserved at `archive/revision-three/feedback.mov`. The original Bella sequence is preserved as frames under `archive/motion-reference/`; frames 015, 017 and 018 show the sky, cross-section handoff and landing respectively.

Installed the four requested repositories using the skill installer:

- [taste-skill](https://github.com/leonxlnx/taste-skill) → `~/.codex/skills/taste-skill`
- [scroll-world](https://github.com/oso95/scroll-world) → `~/.codex/skills/scroll-world`
- [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) → `~/.codex/skills/ui-ux-pro-max`
- [impeccable](https://github.com/pbakaus/impeccable) → `~/.codex/skills/impeccable`

Applied their continuity, shared-element, image provenance, responsive inspection and reduced-motion guidance. The supplied Bella direction takes precedence over generic palette/layout recommendations. Scroll-world's default chained flythrough video pipeline would recreate the unwanted scene-switching behavior, so its continuity guidance was applied to a real-time shared product instead.

## Verification

- Build and type checks pass; all 101 generated routes pass links, assets, headings, metadata, JSON-LD, noindex and image-dimension checks.
- Browser regression checks cover all 21 products, 59 variants, 93 gallery selections, navigation, filters, search, enquiry previews and real 404 behavior. No browser errors, broken requests or accessibility violations were reported.
- Motion checks at 1440 × 1000 and 390 × 844 verify the same canvas survives the entire descent, continuous document-space movement, a stable landing, reverse and rapid scrolling, idle airflow, retina buffers, pause/resume and always-visible cards.
- Checked reduced-motion/no-JS states, 390 × 667 touch layout and 4× CPU throttling. This is a functional stress check, not a claim of a particular FPS on physical phones.
- Reviewed screenshots at desktop, tablet and mobile sizes, plus frames decoded from actual desktop/mobile scroll recordings. Fixed the mobile copy overlap and oversized tablet product found during that review.

Results: [functional](qa/browser-results.json), [motion](qa/revision-three/results.json), [design inspection](qa/revision-three/design-inspection.json).

Visual evidence: [desktop handoff](qa/revision-three/review/handoff-1440.webp), [mobile handoff](qa/revision-three/review/handoff-390.webp), [landed](qa/revision-three/review/landed-1440.webp), [dropdown](qa/revision-three/review/dropdown-desktop.webp), [desktop recording frames](qa/revision-three/desktop-recording-review.webp), [mobile recording frames](qa/revision-three/mobile-recording-review.webp).

Full local recordings: `docs/qa/revision-three/desktop-scroll.webm` and `mobile-scroll.webm`. Run `node scripts/motion-qa.mjs` against the preview, then `node scripts/review-motion-video.mjs` to reproduce the motion evidence.

## Visual review

The shared product now crosses the actual frame boundary and makes contact with the desk; the broad handoff behavior matches the reference. The main remaining difference is art direction: the stock workspace and Parfumaire box silhouette are different from Bella's purpose-built kitchen/appliance composition. The white product artwork is sharp, but the presentation geometry should not be mistaken for an engineering-accurate model.

The taste inspector reports no overflow, broken images or covered headlines after correction. Its remaining generic typography, palette, footage and motion-count suggestions conflict with the pinned reference or the user's request to remove popping section entrances. The remaining eyebrow result is a false positive connecting a customer review attribution with the later decorative “bonjour” word; the attribution is retained. No false claim of a completely green design-lint report is made.
