# Phone composition and flow

The phone version now has its own visual composition while retaining the approved desktop layout, photography and continuous 3D product handoffs.

- The hero fits the diffuser, headline, action and scroll cue together. The phone landing finishes with the product in the lower two-thirds of the viewport instead of close to its bottom edge.
- A shorter office frame shows more of the room. The business heading sits within the photograph, with its action below the landing area. The tower's flight leaves room for its visible width at the screen edge.
- Product cards have consistent frames and aligned labels. The blue feature is a compact horizontal composition. Reviews use a native swipe row with readable type.
- The mobile menu uses visual collection links, a contained scrolling panel, keyboard focus management, backdrop dismissal and a reachable close action.
- Product names precede their galleries. The persistent bottom action first takes visitors to their options, then carries their selection to the quote preview. Native image swipes and lightweight product pages remain in place.
- Collection filters align in two columns. Inputs use at least 16px text. Quote context is compact enough to show the first field in a typical 390 × 844 viewport. Safe-area spacing supports phone browser and device insets.
- Product labels open in the browser's top layer so photos and animated mist cannot cover them. Tap, hover, keyboard, outside dismissal and Escape work in both tested engines.

## Evidence

- [Before and after](mobile-comparison.webp)
- [Phone product screen](showcase/phone-product.webp)
- [Phone quote screen](showcase/phone-quote.webp)
- [Frames from the actual touch-scroll recording](showcase/mobile-recording-review.webp)
- Local recording: `showcase/phone-tour.webm` (excluded from Git).

## Verification

- Production build: 101 pages; internal links, image assets, metadata and structured data checked.
- Type check: zero errors or warnings; one existing informational hint in the Lighthouse utility.
- All 21 products, 59 variants and 93 gallery selections passed the existing browser suite, including exact quote context and preview privacy behavior. No accessibility violations in that suite.
- Chromium and WebKit, each at 320 × 568, 390 × 844 and 430 × 932: native scrolling, working 3D hero, rotation without page overflow, modal navigation/focus, tap labels, product ordering, options action, filters and quote review/edit/complete. No page errors or failed site requests. Reduced-motion placements checked in both engines.
- Motion tests: persistent canvas, continuous descent, stable floor contact, reverse/fast scrolling, idle airflow, pause/resume, short phone, reduced-motion and no-JavaScript fallback. Office placement checked at four widths; business placement at five.
- A 390px touch viewport under 4× CPU throttling: homepage and product page each recorded a 16.7ms 95th-percentile frame interval and zero long tasks during six native scroll gestures. The product route downloaded about 208KB and did not load the 3D engine. These are local browser measurements, not a physical-device or real-network guarantee.

The quote form remains a client preview. It does not send or store an enquiry.
