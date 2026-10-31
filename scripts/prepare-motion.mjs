import fs from 'node:fs/promises';
import sharp from 'sharp';
const files = (await fs.readdir('archive/higgsfield/frames'))
  .filter((f) => f.endsWith('.jpg'))
  .sort();
if (files.length !== 144) throw new Error('Expected 144 animation frames');
for (const [variant, width, quality] of [
  ['desktop', 1920, 85],
  ['mobile', 1280, 85],
]) {
  await fs.mkdir(`public/motion/${variant}`, { recursive: true });
  // Four concurrent encodes bound memory while keeping image preparation fast.
  for (let i = 0; i < files.length; i += 4)
    await Promise.all(
      files.slice(i, i + 4).map((file) =>
        sharp(`archive/higgsfield/frames/${file}`)
          .resize({ width })
          .webp({ quality })
          .toFile(`public/motion/${variant}/${file.replace('.jpg', '.webp')}`),
      ),
    );
}
await sharp('archive/higgsfield/frames/000.jpg')
  .resize({ width: 1920 })
  .webp({ quality: 91 })
  .toFile('public/motion/hero-poster.webp');
console.log('Prepared 144 frames in desktop and mobile resolutions.');
