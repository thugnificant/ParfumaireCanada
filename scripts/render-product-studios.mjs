// Start `npm run dev -- --port 4322` first. These are actual geometry renders,
// not enlarged thumbnails. Export a matching 2K transparent poster for every SKU.
import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
import sharp from 'sharp';
const origin = process.env.QA_URL || 'http://127.0.0.1:4322';
const source = await (await fetch(`${origin}/src/scripts/product-view.ts`)).text();
const three = source.match(/from "([^"]*\/three.js[^\"]*)"/)[1];
const room = source.match(/from "([^"]*RoomEnvironment[^\"]*)"/)[1];
const catalog = JSON.parse(await fs.readFile('src/data/catalog.json', 'utf8'));
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage();
await page.route('**/__studio__', (route) =>
  route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>Product studio</title>' }),
);
await page.goto(`${origin}/__studio__`);
await page.evaluate(
  async ({ three, room }) => {
    const THREE = await import(three);
    const { RoomEnvironment } = await import(room);
    const { buildProduct } = await import('/src/scripts/product-model.ts');
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(1536, 2048);
    renderer.setClearColor(0, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    const generator = new THREE.PMREMGenerator(renderer);
    const environment = generator.fromScene(new RoomEnvironment(), 0.04);
    window.renderProduct = async (handle, finish) => {
      const product = await buildProduct(handle, finish);
      const { model, half, center } = product;
      const scene = new THREE.Scene();
      scene.environment = environment.texture;
      scene.add(model);
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb1a69c, 1.7));
      const key = new THREE.DirectionalLight(0xffffff, 2.8);
      key.position.set(-3, 4, 6);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0xd5eaff, 1.8);
      rim.position.set(4, 2, -1);
      scene.add(rim);
      const camera = new THREE.OrthographicCamera(-half * 0.75, half * 0.75, half, -half, 0.1, 20);
      camera.position.set(0, center, 6);
      camera.lookAt(0, center, 0);
      model.rotation.set(0, -0.32, 0);
      renderer.render(scene, camera);
      const data = renderer.domElement.toDataURL('image/png');
      product.dispose();
      return data;
    };
  },
  { three, room },
);
const manifest = [];
for (const { handle, title, category } of [
  ...catalog,
  {
    handle: 'cozyair-max-scent-diffuser',
    title: 'CozyAir Max — White',
    category: 'diffusers',
    finish: 'white',
  },
]) {
  const white = title.endsWith('— White');
  const filename = `${handle}${white ? '-white' : ''}-studio.webp`;
  const data = await page.evaluate(
    async ({ handle, white }) => window.renderProduct(handle, white ? 'white' : undefined),
    { handle, white },
  );
  await sharp(Buffer.from(data.split(',')[1], 'base64'))
    .webp({ quality: 94, alphaQuality: 100 })
    .toFile(`public/images/models/${filename}`);
  manifest.push({
    handle,
    title,
    category,
    finish: white ? 'white' : undefined,
    path: `/images/models/${filename}`,
    width: 1536,
    height: 2048,
    renderer: 'Three.js physical geometry',
    source:
      category === 'diffusers'
        ? 'Catalog dimensions and approved Higgsfield face textures'
        : '120 ml catalog bottle profile and approved Parfumaire gold mark',
  });
  console.log(filename);
}
await fs.writeFile('src/data/models.json', JSON.stringify(manifest, null, 2) + '\n');
await browser.close();
