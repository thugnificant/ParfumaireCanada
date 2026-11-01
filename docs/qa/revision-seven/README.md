# Commercial reception and floor-bay landing

Replaced the home-office photo with a newly generated, front-facing commercial reception. The diffuser now rests against the rear wall in the narrow space between the credenza and tall oak cabinetry, outside the circulation area. A glass conference room, reception counter and guest seating establish the office setting.

## Image and motion

- Higgsfield Nano Banana Pro 2K generated the office plate at **2752 × 1536**. A second pass replaced an oversized empty recess with a credenza and a smaller floor bay. Responsive WebP exports retain the native resolution (468 KB for the largest image); no enlargement or blurred stock-photo composite is used.
- The browser editor stopped responding during setup. Both images were generated through the Higgsfield CLI/API using the user's approved credit usage: **4 credits total**, balance **0.25** afterward. Prompts, job metadata and original PNGs are archived locally under `archive/revision-seven/`.
- One persistent live 3D CozyAir Max moves from the hero into the room. The photo contains no baked-in diffuser. Its final front-facing angle, warm lighting and contact shadow match the scene. The 46.7 cm cabinet is approximately half the height of the pictured credenza, with clear space above the nozzle.
- The room eases from 108% to 100% around the exact floor-contact point. Model position and scale use the same zoom value. The arrival is reversible, has no scene switch, and continues the airflow after settling.
- Shared source-image coordinates drive responsive cropping, the animated landing and the static fallback. The fallback poster is a fresh transparent 2048 × 1576 render of the same pose and lighting.
- The headline and CTA occupy the open wall above the cabinetry, with a scroll-linked fade and a keyboard-focus override. Reduced motion and no JavaScript retain the readable static composition.

## Verification

- Production build: 101 pages. Astro/build checks: 0 errors, 0 warnings; one existing Lighthouse script hint.
- Enquiry and continuous/reversible flight tests pass.
- Full browser suite: all 21 products, 59 variants and 93 gallery selections; no browser errors, failed requests or accessibility violations.
- Motion suite: desktop, phone, reverse/fast scrolling, pause, reduced motion, no JavaScript and throttled CPU checks pass.
- New office-placement checks at 1440, 1024, 768 and 390 pixels verify source-image resolution, exact floor anchor, live/static parity, caption clearance and overflow. The no-JavaScript floor anchor agrees with the animated endpoint.
- Wheel test: 121 sampled frames, median 16.7 ms, 95th percentile 16.8 ms, no sampled frame over 50 ms on this machine.
- Visually reviewed the full room at desktop and phone sizes, six descent stages, and frames from the desktop/mobile continuous scroll recordings. Recordings are local artifacts under `showcase/`; compact review images are tracked here.

Evidence: [floor placement](office-placement.json), [motion](results.json), [wheel performance](scroll-feel.json), [descent](descent-stages.webp), [desktop](office-1440.webp), [phone](office-390.webp), [no JavaScript](office-no-js.webp).
