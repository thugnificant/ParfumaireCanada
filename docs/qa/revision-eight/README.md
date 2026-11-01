# La Tour reception, mobile browsing and quote flow

Replaced the red-sofa editorial with a front-facing Higgsfield business reception. The La Tour in the featured collection now descends into the wall-side alcove beside the oak cabinetry, with a continuous reversible pose, floor shadow and live mist. The room gently zooms around the same floor anchor. The phone layout separates the heading from the photograph to keep the reception visible. La Tour occupies the final mobile grid position and descends along a clear right-side path before turning into the room. The approved CozyAir Max hero remains in place.

The room uses an unused native 2752×1536 Higgsfield plate commissioned in revision seven, with a new matching Three.js La Tour resting render. No new generation or credit charge was made in this revision. Static service-page compositions also use these commercial scenes in place of the earlier sofa/lounge composites. [Asset and Mobbin notes](design-notes.md).

## Mobile and controls

- Native scrolling on phones and commerce pages; Lenis remains on the desktop homepage.
- High-resolution responsive product posters on phone grids. The Three.js engine loads only for homepage choreography or desktop hover/focus; idle product cards stop rendering. This avoids initializing 21 continuous GPU views while browsing.
- Gallery images decode before swapping, with stale requests discarded; high-resolution zoom images load only when opened. Horizontal phone swipes browse the gallery while vertical touch scrolling remains native.
- Rounded finish/size selection cards, framed quantity steppers, consistent buttons and collapsible specifications. A mobile quote action follows the exact selected variant and quantity after the main button scrolls away, including fast flings.
- A readable selected-product card accompanies the quote form. Framed 16px inputs avoid iOS input zoom. Review/edit and completion states preserve context, show the preview status clearly and clear personal details after completing a preview. Delivery configuration is unchanged: no enquiry is sent in the current preview mode.
- Breathing white product dots on lifestyle photography and product galleries. Hover, tap and keyboard open the label; Escape/outside interaction dismisses it. The label links to the identified product. Reduced motion stops the breathing animation.

## Validation

- Build: 101 routes. Astro/build checks: 0 errors, 0 warnings; one pre-existing Lighthouse script hint.
- Enquiry and reversible-flight unit checks pass.
- Full browser suite: all 21 products, 59 variants, 93 gallery selections, collection/search/menu flows and 14 accessibility scans; no browser errors, failed requests or accessibility violations.
- New business/commerce suite: 1440, 1024, 768, 390 and 360px; one persistent tower canvas; downward motion, reverse/fast scroll, exact floor contact, pause and static/no-JavaScript parity. Hover/tap/keyboard labels stay within the viewport. Phone swipe, persistent quote action, selection context and review/edit/complete pass.
- Existing hero regression: four viewport floor-anchor checks, caption clearance, static/no-JavaScript parity; desktop/phone continuous motion, reduced motion, short phone and 4× CPU throttling.
- Real desktop wheel test: 120 sampled frames, median and p95 16.7ms, no sampled frame over 50ms. All 21 desktop previews activate on hover without context loss.
- The same 390px touch scrolling scenario at 4× CPU throttling went from three long tasks (155/100/54ms) to none. Resource transfer fell from 866,204 to 205,646 bytes (76% less). This is a local emulated-browser measurement, not a claim about every physical phone.

Evidence: [business checks](business-commerce.json), [browser checks](../browser-results.json), [hero regression](hero/results.json), [wheel cadence](scroll-feel.json), [before performance](performance-before.json), [after performance](performance-after.json), [product comparison](product-comparison.html), [phone quote review](quote-review-mobile.webp), [desktop scene](showcase/business-landed-1440.webp), [phone scene](showcase/business-landed-390.webp).

The comparison embeds its screenshots and links to the inspected Apple and lululemon Mobbin screens. Deel supplied the structural quote-summary reference; the local design notes identify which changes are implementation decisions rather than reference-derived.
