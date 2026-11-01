# Office landing revision

Request: replace the blue-sofa hero landing with an office where CozyAir Max looks naturally placed on the floor.

## Scene and product

- Replaced the living-room background with FlippingBook's real office photograph, 3239 × 2422 source. Responsive WebP exports are 1600 and 3200 pixels wide.
- Source: https://unsplash.com/photos/modern-office-space-with-plants-and-desk-_XbcXekBecY — free under the Unsplash License. Photographer is credited below the scene.
- The 46.7 × 38.4 × 22.9 cm cabinet lands beside the desk's outside right leg, with its top below the worktop. The full feet and floor remain visible.
- The final 3D angle follows the desk perspective. The left window drives the key light; warm floor bounce, matte white metal, a real shadow receiver and perspective-aligned ambient contact shadow ground the cabinet.
- One persistent model follows the scroll in both directions. No photographic product swaps or duplicated diffusers. Airflow continues after landing.
- Caption follows the photograph in normal layout. The static fallback uses a matching 2048 × 1576 transparent render of the same pose, lighting and shadows.

## Higgsfield review

Used the product-photoshoot backend to prepare the office/product brief, then submitted Nano Banana Pro 2K through the website's Unlimited option. Job `8b8f7cf1-28c7-4cea-8c01-c1d1f140f834` completed. It moved the product to the wrong side of the desk and changed the framing, so it was rejected as the final scene. The shipped photograph preserves the real office and uses the calibrated live model. Original approved Higgsfield branding textures remain on the model. Balance after generation: 4.25 credits, unchanged.

Source images, enhanced prompt, generated candidate and metadata are archived locally under `archive/revision-six/`.

## Verification

Results and review images are saved beside this file. Continuous desktop and mobile scroll recordings are under `showcase/` (local artifacts, ignored by Git).

Verified locally:

- Production build: 101 pages; Astro check: 0 errors, 0 warnings (one existing Lighthouse hint).
- Enquiry and flight checks pass; full browser suite passes all 21 products, 59 variants and 93 gallery selections, with no accessibility violations, browser errors or failed requests.
- Motion checks pass desktop, phone, reduced-motion, no-JavaScript and throttled CPU modes.
- Real wheel input: 121 sampled frames; median and 95th percentile 16.7 ms, no sampled frame above 50 ms on this test machine.
- Reviewed desktop/mobile recording contact sheets and full office screenshots. Checked source image pixels separately from density-corrected `naturalWidth`; desktop loads the 3200px asset and phone loads the 1600px asset.
