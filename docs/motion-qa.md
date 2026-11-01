# Motion revision two — 2026-10-31

The 7:51 PM feedback recording and the original 4:21 PM Bella recording were the visual references for this correction. The temporary feedback file was preserved locally at `archive/revision-two/feedback.mov`.

## Changes

- Replaced the 144-frame hero film with original-resolution 2688 × 1520 room photographs and a separate live diffuser. Scroll drives a single opaque reveal between office, event, hotel and home; it never blends multiple rooms or waits for intermediate video frames.
- Added textured, solid WebGL models for CozyAir, CozyAir Max and La Tour. Their proportions and front artwork come from the accepted product renders. These are presentation models, not manufacturer CAD. The original product photographs remain available in the galleries.
- Added continuous product rotation, pointer response and fine animated mist anchored to each nozzle. Product cards remain visible on entry. The hero product settles onto the room's console, including mobile cover cropping.
- Rebuilt Explore as the reference's wide, shallow dropdown with five outline icons. It supports hover, click, keyboard arrows, Escape and outside-click dismissal.
- Retained sharp image fallbacks, reduced-motion support and a global pause control. Rendering stops offscreen or when the tab is hidden. Removed the 24 MB obsolete video-frame sequence.

## Validation

- Build, Astro checks, all 101 generated routes and enquiry safeguards passed.
- Functional browser checks passed for all 21 products, 59 variants and 93 gallery selections.
- Layouts at 1440, 1024, 768 and 390 px passed overflow checks; 14 accessibility scans reported no WCAG A/AA violations.
- A separate 375 × 667 check found and removed an inherited minimum height that cropped the hero on shorter phones. Room asset URLs are versioned so cached lower-resolution images are not reused.
- Motion tests at 1440 and 390 px checked retina rendering, idle movement, five sharp room layers, reverse navigation, rapid scroll, pause/resume, reduced motion and no-JavaScript fallbacks. No browser exceptions or failed asset requests.
- Captured and reviewed desktop/mobile screenshots and continuous scroll recordings. Paused images allow only negligible GPU color rounding (mean channel difference below 0.001, maximum 2), not animation.

Results: [functional checks](qa/browser-results.json), [motion checks](qa/revision-two/results.json). Review images: [hero](qa/revision-two/review/hero-1440.webp), [menu](qa/revision-two/review/dropdown-desktop.webp), [office](qa/revision-two/review/scene-1440-1.webp), [event](qa/revision-two/review/scene-1440-2.webp), [mobile](qa/revision-two/review/scene-390-1.webp), [products](qa/revision-two/review/products-1440.webp).

Local full-resolution screenshots are in `docs/qa/revision-two/`; recordings are `desktop-scroll.webm` and `mobile-scroll.webm` in that directory. Raw recordings and images are ignored by Git; compact review images are versioned.

No additional Higgsfield credits were used for this correction. The accepted high-resolution Higgsfield sources from the preceding revision were reused.
