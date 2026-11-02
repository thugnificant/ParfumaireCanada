import sharp from 'sharp';
const root = 'docs/qa/revision-nine';
const columns = [
  ['business', 'Business scene'],
  ['menu', 'Navigation'],
  ['product', 'Product page'],
  ['quote', 'Quote flow'],
];
const width = 260,
  height = 563,
  gap = 18,
  title = 38;
const tiles = [];
for (const [row, phase] of ['before', 'after'].entries()) {
  for (const [column, [name, label]] of columns.entries()) {
    const path = `${root}/${phase}/${name}-390.webp`;
    const source = await sharp(path).metadata();
    const input = await sharp(path)
      .extract({ left: 0, top: 0, width: source.width, height: Math.min(1688, source.height) })
      .resize(width, height)
      .webp({ quality: 85 })
      .toBuffer();
    const left = gap + column * (width + gap),
      top = gap + title + row * (height + title + gap);
    tiles.push({ input, left, top });
    tiles.push({
      input: Buffer.from(
        `<svg width="260" height="32"><text x="0" y="23" font-family="Arial" font-size="16" fill="#24352a">${phase === 'before' ? 'Before' : 'After'} · ${label}</text></svg>`,
      ),
      left,
      top: top - title,
    });
  }
}
await sharp({
  create: {
    width: (width + gap) * 4 + gap,
    height: (height + title + gap) * 2 + gap,
    channels: 3,
    background: '#ebeadf',
  },
})
  .composite(tiles)
  .webp({ quality: 88 })
  .toFile(`${root}/mobile-comparison.webp`);
console.log(`${root}/mobile-comparison.webp`);
