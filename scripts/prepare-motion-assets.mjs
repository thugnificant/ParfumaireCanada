// Derive web assets from the approved, original-resolution Higgsfield outputs.
// No video frames are used for either the backgrounds or the product surfaces.
import sharp from 'sharp';
import fs from 'node:fs/promises';
await fs.mkdir('public/images/models', { recursive: true });
for (const name of ['office', 'event', 'hotel', 'home']) {
  await sharp(`archive/higgsfield/room-${name}.png`)
    .webp({ quality: 94, effort: 6 })
    .toFile(`public/images/renders/space-${name}.webp`);
}
await sharp('archive/higgsfield/hero-corrected.png')
  .extract({ left: 0, top: 0, width: 1440, height: 1520 })
  .webp({ quality: 94 })
  .toFile('public/images/renders/sky.webp');
const faces = [
  ['cozyair-scent-diffuser', { left: 518, top: 303, width: 1030, height: 1390 }],
  ['cozyair-max-scent-diffuser', { left: 471, top: 322, width: 1023, height: 1415 }],
];
for (const [handle, rect] of faces) {
  await sharp(`archive/higgsfield/${handle}-cutout.png`)
    .extract(rect)
    .flatten({ background: handle.includes('max') ? '#151515' : '#eeeeec' })
    .webp({ quality: 98 })
    .toFile(`public/images/models/${handle}-front.webp`);
}
// Small gold mark on the front of La Tour, retained from its approved render.
const badge = await sharp('archive/higgsfield/la-tour-scent-diffuser-cutout.png')
  .extract({ left: 959, top: 137, width: 92, height: 53 })
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let i = 0; i < badge.data.length; i += 4) {
  const [r, g, b] = badge.data.subarray(i, i + 3);
  badge.data[i + 3] = Math.min(255, Math.max(0, Math.min(r - b, g - b) * 5));
}
await sharp(badge.data, { raw: badge.info })
  .webp({ quality: 98 })
  .toFile('public/images/models/la-tour-mark.webp');
