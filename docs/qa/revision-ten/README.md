# Phone motion rendering

This revision addresses the stuttering reported in Safari and the Google browser on iPhone. The supplied 20-second recording was inspected locally; it is not published in this repository.

## Changes

- Phone products render directly into their displayed WebGL canvases. The previous renderer copied each frame from a shared 2048 × 2048 WebGL surface into a second, 2D canvas. Desktop catalog previews still share one context to support all 21 products.
- Supported touch browsers run product translation, scene zoom and the office caption fade through native scroll timelines. JavaScript no longer rewrites those transforms during each scroll frame. Older browsers retain the same trajectory through the animation clock.
- Scroll input, scene progress and 3D drawing share one ordered animation clock. This avoids rendering a pose from the previous scroll update.
- The 36 mist billboards use one instanced drawing command on phones. Landed shadows are cached, and there is no floor-shadow pass while the product is airborne. Product geometry, textures, continuous mist and floor anchors are retained.
- Shaders compile before a model appears. La Tour is prepared during idle time after the hero is ready, before it enters the next scroll section.
- Photo loading and resizing update existing animation tracks. Recreating a track could briefly expose the unpositioned product in Safari; that case now has a frame-by-frame regression check.
- Pause/reduced motion, browser visibility handling, native touch scrolling and static product-page galleries remain available. Keyboard focus overrides the caption fade.

## Rendering comparison

Same 390 × 844 touch viewport, DPR 3, Chromium with 6× CPU throttling and ten native touch gestures:

| Measurement during gestures | Before | After |
| --- | ---: | ---: |
| WebGL-to-2D canvas copies | 486 | 0 |
| Pixels copied | 130,423,061 | 0 |
| GPU drawing commands | 29,203 | 7,192 |
| WebGL output | Detached 2048 × 2048 canvas | Visible 744 × 573 and 281 × 281 canvases |
| Long tasks during gestures | 0 | 0 |

Sources: [before](render-before.json), [after](render-after.json). Drawing commands fell approximately 75% in this test. These measurements identify removed rendering work; they are not a physical-iPhone frame-rate measurement.

## Verification

- [Chrome and WebKit motion tests](phone-motion/results.json): native and fallback trajectories match within 0.07px across forward/reverse samples. Zero main-thread transform writes on the native path; canvas dimensions remain unchanged during scrolling. Photo-load continuity, pause/resume, focused actions, prewarming and shader/page-error checks pass.
- [Phone flows](mobile/mobile-checks.json): Chromium and WebKit at 320 × 568, 390 × 844 and 430 × 932; menu/focus/scroll lock, rotation, tap labels, galleries, product options, quote review and filters pass.
- [Motion regression](motion/results.json): persistent model, continuous descent, exact reversal, landing, airflow, pause, no-JavaScript/reduced-motion fallback and 4× CPU short-phone checks pass.
- [Business placement](business/business-commerce.json) and office placement checks preserve floor contact across phone, tablet and desktop widths.
- [Desktop regression](desktop/scroll-feel.json): eased wheel input, reverse scrolling and all 21 hover previews pass without context loss.
- Production build: 101 pages. Type/build checks, flight/enquiry invariants and the browser suite pass; all 21 products, 59 variants and 93 gallery selections checked with no browser errors or accessibility violations.
- [Frames from the touch-scroll recording](showcase/mobile-recording-review.webp). Full local recording: `showcase/phone-tour.webm` (excluded from Git).

WebKit engine testing does not replace physical iPhone testing. The user's recording was used to inspect the reported behavior; no physical-device performance result is claimed.

Implementation references: [WebKit's scroll-driven animation guide](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/), [Safari 26 support](https://webkit.org/blog/17333/webkit-features-in-safari-26-0/), [Chrome's scroll-animation guidance](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), [Three.js asynchronous shader compilation](https://threejs.org/docs/pages/WebGLRenderer.html).
