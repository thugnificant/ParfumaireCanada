# Generated media provenance

Authorized by the user on 2026-10-31: use Higgsfield credits to improve the Parfumaire website, using the provided recording and existing website as the only references.

- Product render mapping, source image/variant association, original output dimensions and generation IDs: `src/data/renders.json`.
- Accepted image jobs and original PNGs: local `archive/higgsfield/approved-products.json` and `approved-*.png`.
- Opening sky: Higgsfield job `5a060bc1-7cf7-4933-8d10-9f947794af8f`.
- Scroll film: Seedance 2.5 job `42d4ab41-7494-40c1-ab88-78ef388fc65b`, six seconds, 1080p, no audio. Source file: local `archive/higgsfield/atmosphere-journey.mp4`.
- Office environment: `77f25ead-c0ed-4839-9f89-86d343732757`.
- Event environment: `7b9c0561-4769-433f-b496-c9a5b7db79e1`.
- Hotel environment: `923bc586-c6bf-43f0-8a09-1cc5051738b2`.
- Home environment: `1bbbb1d2-6206-4751-8477-58868b9d4b17`.
- Transparent cutouts: `cd21e17e-0ad2-47f5-8624-df02d5f6483d`, `1c2907d7-7407-4b12-858b-6b844263b2ab`, `ca09abe9-87d4-476e-a7a0-195a399f374b`, `7ba9a169-c7f4-48ca-8408-2d600ae69815`.

The first photoshoot outputs altered the package design and were excluded from the deployed asset set. No third-party visual references were added to this revision.

`node scripts/prepare-renders.mjs` regenerates the responsive product derivatives from the saved accepted jobs. `node scripts/prepare-motion.mjs` regenerates 144 desktop and 144 mobile frames from the archived extracted frames. Neither command starts paid generation. Back up `archive/` before handing off the project.
