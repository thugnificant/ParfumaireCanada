# Motion revision — 2026-10-31

This revision uses only the supplied `Screen Recording 2026-10-31 at 4.21.30 PM.mov` and the deployed Parfumaire Canada site as visual references. The original recording was sampled every half-second through its opening fifteen seconds; those frames and a before-update site recording are retained locally in `archive/motion-reference/`.

The recording establishes a cream page, inset rounded navigation, bright blue floating-product hero, orange feature panel, oversized lower-left wordmark, an interior transition, four open product columns, asymmetric editorial panels and subtle product motion. The revised homepage preserves that composition and color relationship, using Parfumaire products.

A Higgsfield-generated 1080p product film places the CozyAir diffuser into an office and transforms the surrounding space into an event reception, hotel lobby and home. The site scrubs 144 extracted WebP frames with the user's scroll position. The opening split hero expands into a full-width interior; copy, chapter controls and progress change with it. Reversing scroll reverses the sequence. Image loading uses a bounded decoded-frame cache, prioritizes the requested frame and uses separate desktop/mobile encodes. No autoplay video download is needed.

All 21 products have a new 2K studio visualization made from the actual source product photograph. A first photoshoot attempt changed controls and branding and was rejected; the accepted images explicitly reference the original photographs. The catalog and initial product galleries use the accepted renders. All 72 original gallery images remain available, and original variant associations, USD reference prices and enquiry behavior remain intact. The default finish on CozyAir Max is black to match its featured render.

Transparent Higgsfield cutouts appear in the orange hero feature and the blue/sand editorial panels. Product hover tilts, staggered catalog reveals, interior overlays and button transitions extend the reference's motion vocabulary throughout the site. These are rendered images and a scroll-controlled film, not downloadable interactive 3D meshes.

Reduced-motion and data-saving preferences use a one-screen static hero and do not preload the frame sequence. Visitors can choose individual scene stills or explicitly enable motion. The pause control freezes the current scene without losing the visible hero. Without JavaScript, the hero remains a normal static section and collection links work.

Verified captures are in `docs/qa/motion/`. Desktop/mobile scroll recordings are retained locally as `desktop-scroll.webm` and `mobile-scroll.webm`. The completed film and original 2K outputs are retained in `archive/higgsfield/`; deployment contains optimized derivatives only.
