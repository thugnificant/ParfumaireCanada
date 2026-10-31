import fs from 'node:fs/promises';
import sharp from 'sharp';
const products = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const jobs = JSON.parse(await fs.readFile('archive/higgsfield/approved-products.json', 'utf8'));
const manifest = {};
const existing = JSON.parse(await fs.readFile('src/data/renders.json', 'utf8'));
await fs.mkdir('public/images/renders', { recursive: true });
await Promise.all(
  jobs.map(async (job) => {
    if (job.status !== 'completed' || !job.result_url)
      throw new Error(`Incomplete render ${job.index}`);
    const product = products[job.index];
    const original = product.images[product.category === 'scents' ? 2 : 0];
    const path = `archive/higgsfield/approved-${product.handle}.png`;
    let buffer;
    try {
      buffer = await fs.readFile(path);
    } catch {
      const response = await fetch(job.result_url);
      if (!response.ok) throw new Error(`Download failed: ${product.handle}`);
      buffer = Buffer.from(await response.arrayBuffer());
      await fs.writeFile(path, buffer);
    }
    const meta = await sharp(buffer).metadata();
    for (const [suffix, size, quality] of [
      ['', 1440, 90],
      ['-640', 640, 86],
      ['-2k', 2048, 94],
    ]) {
      await sharp(buffer)
        .resize(size, size, { fit: 'contain', background: '#efeee6' })
        .webp({ quality })
        .toFile(`public/images/renders/${product.handle}${suffix}.webp`);
    }
    manifest[product.handle] = {
      path: `/images/renders/${product.handle}.webp`,
      small: `/images/renders/${product.handle}-640.webp`,
      full: `/images/renders/${product.handle}-2k.webp`,
      width: 1440,
      height: 1440,
      alt: `${product.title} — studio product visualization`,
      sourceImageId: original.sourceImageId,
      variantIds: original.variantIds,
      ...(existing[product.handle]?.cutout ? { cutout: existing[product.handle].cutout } : {}),
      jobId: job.job_id,
      model: job.model,
      originalWidth: meta.width,
      originalHeight: meta.height,
    };
  }),
);
await fs.writeFile('src/data/renders.json', JSON.stringify(manifest, null, 2) + '\n');
console.log(`Prepared ${Object.keys(manifest).length} product renders in three responsive sizes.`);
