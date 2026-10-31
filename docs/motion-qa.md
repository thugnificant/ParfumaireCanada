# Motion revision validation

Validated 2026-10-31 against the local static build.

- Production build and Astro type check passed; 101 generated routes passed internal-link, image, heading and metadata validation.
- Enquiry safeguards passed.
- Desktop/tablet/mobile layouts at 1440, 1024, 768 and 390px have no horizontal overflow.
- All 21 products, 59 variants and 93 gallery images passed interaction checks.
- Fourteen desktop/mobile accessibility scans found zero WCAG A/AA violations.
- Five visually distinct hero scenes at desktop and mobile; reverse navigation restores the same office frame.
- Pause, resume and scene buttons work. Reduced-motion loads no animation frames until the visitor requests a single still.
- JavaScript-disabled rendering keeps a single-screen hero with working collection links.
- No browser exceptions or failed requests in the functional or motion suites.

The scroll film is encoded as 144 frames each at 1920px desktop and 1280px mobile. Only nearby frames and a sparse preview set are requested, and decoded image references are capped at 32. Product images have 640px, 1440px and 2048px versions.

Screenshots and motion reports: [motion evidence](qa/motion/results.json). Local recordings: `docs/qa/motion/desktop-scroll.webm` and `docs/qa/motion/mobile-scroll.webm`. Original capture and generation files stay in the ignored `archive/` directory.

The new images are AI-assisted product visualizations; original photographs remain in the galleries for comparison. Product specifications and prices were not inferred from generated imagery.
